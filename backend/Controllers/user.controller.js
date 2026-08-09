import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { USER } from "../Models/user.model.js";
import { SHOP } from "../Models/shop.model.js"
import { sendOtpMail } from "../utils/mail.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { signupQueue } from "../Bullmq/Queue.js";

//User Register :  
export let register = async (req, res) => {
    try {
        let { fullname, email, password, phone, role } = req.body

        if (!fullname || !email || !password || !phone || !role) {
            return res.status(400).json({
                message: "All field's are required ..",
                success: false
            })
        }

        if (phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Phone Number should be at least 10 characters"
            })
        }

        let userEmail = await USER.findOne({ email });
        if (userEmail) {
            return res.status(400).json({
                message: "This email already exists",
                success: false
            })
        }

        let hashedPass = await bcrypt.hash(password, 10);
        let user = await USER.create({ fullname, email, password: hashedPass, phone, role })

        // add user to signupQueue for sending welcome email:
        await signupQueue.add("signupQueue", { email: user?.email, fullname: user?.fullname })

        return res.status(200).json({
            message: "User created successfully",
            user: user,
            success: true
        })

    } catch (error) {
        console.error("Register Error : ", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        })
    }
}

//User Login :
export let login = async (req, res) => {
    try {
        let { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(404).json({
                meassage: "All fields are required",
                success: false
            })
        }

        let user = await USER.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (role !== user.role) {
            return res.status(404).json({
                message: "Current  role is invalid",
                success: false
            })
        }

        if (user?.available === "yes" && user?.socketId.length > 0) {
            return res.status(400).json({
                message: "Account is already logged in another tab or device",
                success: false
            })
        }

        let matchPass = await bcrypt.compare(password, user.password)
        if (!matchPass) {
            return res.status(404).json({
                message: "Password incorrect",
                success: false
            })
        }

        let shop = await SHOP.findOne({ owner: user._id })
        if (shop) {
            shop.open = "yes"
            await shop.save()

            let io = req.app.get("io")
            if (io) {
                io.emit("updateShopStatus", {
                    shopId: shop._id,
                    open: "yes",
                    shopname: shop.shopname
                })
            }
        }

        let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7D" });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        })

        return res.status(200).json({
            message: `${user.fullname} login succefully`,
            user: {
                id: user._id,
                name: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                // position : user.location
            },
            success: true
        })

    } catch (error) {
        console.error("Login Error : ", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        })
    }
}

//User logOut :
export let logout = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) {
            return res.status(400).json({
                message: "Token not found or token got expired .. Please log in again ..",
                success: false
            })
        }

        let decoded = await jwt.verify(token, process.env.JWT_SECRET);
        let user = await USER.findById(decoded.id) //in this decoded.(id) came from jwt.sign({id: (this)})
        if (!user) {
            return res.status(400).json({
                massage: "User Not Found ..",
                success: false
            })
        }

        if (user) {
            user.socketId = null
            user.available = "no"
            await user.save()
        }

        let shop = await SHOP.findOne({ owner: user?.id })
        if (shop) {
            shop.open = "no"
            shop.socketOpen = "no"
            await shop.save()

            if (user.role === "admin") {
                let io = req.app.get("io")
                if (io) {
                    io.emit("updateShopStatus", {
                        shopId: shop._id,
                        open: "no",
                        socoketOpen: "no",
                        shopname: shop.shopname
                    })
                }
            }
        }

        res.clearCookie("token")

        return res.status(200).json({
            message: `${user.fullname} logged out successfully`,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

//Google signUp : 
export let googleSignup = async (req, res) => {
    try {

        let { email, fullname, image, role, password, phone } = req.body

        if (!password || !phone) {
            return res.status(400).json({
                success: false,
                message: " Password and Phone Number are required "
            })
        }

        if (phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Phone Number should be at least 10 characters"
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password should be at least 6 characters long"
            })
        }

        let hasedPassWord = await bcrypt.hash(password, 10)
        let user = await USER.findOne({ email })

        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            })
        }

        user = await USER.create({
            fullname,
            email,
            password: hasedPassWord,
            phone,
            role,
            image
        })

        user.available = "yes"
        await user.save()

        // send welcome email to user using BullMQ queue:
        await signupQueue.add("signupQueue", { email: user?.email, fullname: user?.fullname })

        let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7D" })

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        })


        return res.status(201).json({
            success: true,
            message: "Google SignUp Success",
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                pincode: user.pincode,
                image: user.image
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "server error in google signup api"
        })
    }
}

//google login :
export let googleLogin = async (req, res) => {
    try {

        let { email, role } = req.body

        let user = await USER.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exists with this email"
            })
        }

        if (role !== user.role) {
            return res.status(400).json({
                success: false,
                message: "invalid role for this user"
            })
        }

        if (user?.available === "yes" && user?.socketId.length > 0) {
            return res.status(400).json({
                message: "Account is already logged in another tab or device",
                success: false
            })
        }

        let shop = await SHOP.findOne({ owner: user._id })
        if (shop) {
            shop.open = "yes"
            await shop.save()

            let io = req.app.get("io")
            if (io) {
                io.emit("updateShopStatus", {
                    shopId: shop._id,
                    open: "yes",
                    shopname: shop.shopname
                })
            }
        }

        let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7D" })

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        })


        return res.status(201).json({
            success: true,
            message: `${user.fullname} login successfully`,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                pincode: user.pincode,
                image: user.image
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "server error in google signup api"
        })
    }
}


//User Profile : 
export let userProfile = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) {
            return res.json({
                message: "Token not found or token got expired",
                success: false
            })
        }

        let decoded = await jwt.verify(token, process.env.JWT_SECRET);
        let user = await USER.findById(decoded.id)

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "User profile fetched",
            user: {
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                address: user.address,
                pincode: user.pincode,
                available: user.available,
                image: user.image
            },
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(501).json({
            message: "Internal server error",
            success: true
        })
    }
}

//Get Current User :
export let currentUser = async (req, res) => {
    try {

        let userID = req.id;
        let token = req.cookies.token;

        let decoded = await jwt.verify(token, process.env.JWT_SECRET)
        let user = await USER.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "User details",
            user,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(404).json({
            message: "Server error",
            success: false
        })
    }
}

//User profile Update :
export let userUpdate = async (req, res) => {
    try {
        let user = await USER.findById(req.id)
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (req.file) {
            let image = await uploadOnCloudinary(req.file.path)

            if (!image) {
                return res.status(400).json({
                    message: "Image not provided",
                    success: false
                })
            }

            if (image) user.image = image
        }

        let { fullname, phone } = req.body

        if (!fullname && !phone && !req.file) {
            return res.status(400).json({
                message: "Update atleast one",
                success: false
            })
        }

        if (phone && phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Phone Number should be at least 10 characters"
            })
        }

        if (user.phone === phone) {
            return res.status(400).json({
                success: false,
                message: "Your phone number remain same"
            })
        }

        if (fullname) user.fullname = fullname
        if (phone) user.phone = phone
        await user.save()

        return res.status(200).json({
            message: "User updated successfully",
            updateduser: user,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(501).json({
            message: "Internal server error",
            success: false
        })
    }
}



//update user order Address : [user first time give order address in order page : 
export let userOrderAddressUpdate = async (req, res) => {

    try {
        let userId = req.id;
        let user = await USER.findById(userId);
        if (!user) {
            return res.status(404).jsn({
                message: "User not found",
                success: false
            })
        }

        let { address, pincode } = req.body;
        if (!address && !pincode) {
            return res.status(400).json({
                message: "Address and pincode is required",
                success: false
            })
        }

        if (pincode && pincode.length !== 6) {
            return res.status(400).json({
                success: false,
                message: "Pincode should be at least 6 characters"
            })
        }

        if (address) user.address = address;
        if (pincode) user.pincode = pincode;
        await user.save()

        return res.status(200).json({
            message: "User order address updated successfully",
            newAddress: { address, pincode },
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(501).json({
            message: "Internal server error",
            success: false
        })
    }
}

//User order Location update :
export let updatePosition = async (req, res) => {
    try {
        let userId = req.id;
        let { lon, lat } = req.body;

        let user = await USER.findByIdAndUpdate(userId, { location: { type: "Point", coordinates: [lon, lat] } }, { new: true })

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Location updated successfully",
            location: [{ longitude: user.location.coordinates[0] }, { latitude: user.location.coordinates[1] }],
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Delivary Boys Update availability :
export let updateDelivaryBoysAvailability = async (req, res) => {
    try {
        let delivaryBoyId = req.id
        let { available } = req.body;

        if (!delivaryBoyId) {
            return res.status(400).json({
                message: "Delivary boy id not provided",
                success: false
            })
        }

        let delivaryBoy = await USER.findByIdAndUpdate({ _id: delivaryBoyId }, { available: available }, { new: true });
        if (!delivaryBoy) {
            return res.status(400).json({
                message: "Delivary boy not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Availability update successfully",
            delivaryBoy,
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}



// Reset Password field :
//Send otp : 
export let sendOtp = async (req, res) => {
    try {
        let { email } = req.body;
        let user = await USER.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        let otp = await Math.floor(1000 + Math.random() * 9000).toString();

        user.resetOtp = otp;
        user.expiresOtp = Date.now() + 5 * 60 * 1000;
        user.verifyOtp = false;

        await user.save();
        await sendOtpMail(email, otp);

        return res.status(201).json({
            message: "OTP send successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(501).json({
            message: "Internal server error",
            success: true
        })
    }
}

//Verify OTP :
export let verifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body;
        let user = await USER.findOne({ email })
        if (!user || user.resetOtp !== otp || user.expiresOtp < Date.now()) {
            return res.status(404).json({
                message: "User not found / OTP Undefined or expires",
                success: false
            })
        }

        user.resetOtp = undefined;
        user.expiresOtp = undefined;
        user.verifyOtp = true;

        await user.save();

        return res.status(201).json({
            message: "OTP verify successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(501).json({
            message: "Internal server error",
            success: true
        })
    }
}

// Reset password : 
export let resetPassword = async (req, res) => {
    try {
        let { email, newpassword } = req.body;
        let user = await USER.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (!user.verifyOtp) {
            return res.status(400).json({
                message: "OTP not verified",
                success: false
            })
        }

        let hashnewpassword = await bcrypt.hash(newpassword, 10)
        user.password = hashnewpassword;
        user.expiresOtp = null

        await user.save()

        return res.status(201).json({
            message: "Password reset successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(501).json({
            message: "Internal server error",
            success: true
        })
    }
} 