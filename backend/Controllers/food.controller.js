import mongoose from "mongoose";
import { FOOD } from "../Models/food.model.js";
import { SHOP } from "../Models/shop.model.js";
import { USER } from "../Models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'


//Add Food : [upload image by cloudinary]
export let registerFood = async (req, res) => {
    try {
        let { foodname, price, category, description, isAvailable, foodtype } = req.body;
        let owner = req.id;    //[basically this comes from auth.js and food model has "owner" : {ref : "User"}]

        if (!foodname || !price || !category || !description || !foodtype) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        //upload on cloudinay :
        let image = "";
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
            if (!image) {
                return res.status(500).json({
                    message: "Image upload failed",
                    success: false
                })
            }
        }

        //Find the shop of owner :
        let shop = await SHOP.findOne({ owner });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found for this owner",
                success: false
            })
        }

        let shopDetails = shop._id;  // [getting id from shop model (and it restored in food model as shopDetails {shopDetails : "ref" : "Shop"} )]
        let foodItem = await FOOD.create({
            foodname,
            price,
            category,
            image,
            description,
            isAvailable,
            foodtype,
            owner,
            shopDetails
        })

        foodItem = await foodItem.populate([
            { path: "owner", select: "fullname email phone" },
            { path: "shopDetails", select: "shopname email location phone city" }
        ]);

        return res.status(200).json({
            message: "FoodItem registered successfully",
            foodItem,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
}

// Get all Food items : [for admin] with backend [pagination and search by text] :
export let getAllfoods = async (req, res) => {
    try {
        let token = req.cookies.token
        let { page, limit, query } = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20

        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Please login first",
                success: false,
            })
        }

        let ownerId = new mongoose.Types.ObjectId(req.id)

        let commonMatch = {
            owner: ownerId,
            ...(query?.trim() && {
                $or: [
                    { foodname: { $regex: query.trim(), $options: "i" } },
                    { description: { $regex: query.trim(), $options: "i" } },
                    { foodtype: { $regex: `^${query.trim()}$`, $options: "i" } },
                    { category: { $regex: `^${query.trim()}$`, $options: "i" } }
                ]
            })
        }

        let [allFoodsCount, allFoods] = await Promise.all([
            FOOD.countDocuments(commonMatch),
            FOOD.countDocuments({ owner: ownerId })
        ])

        let totalPages = Math.ceil(allFoodsCount / limit)

        if (page > totalPages && totalPages > 0) {
            page = totalPages;
        }

        let skip = (page - 1) * limit

        let foods = await FOOD.find(commonMatch).sort({ createdAt: -1 }).skip(skip).limit(limit)
            .populate("shopDetails", "_id shopname email location phone city")
            .populate("owner", "fullname email phone")
            .lean();

        return res.status(200).json({
            allFoods,
            totalPages,
            page,
            foods,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            success: true,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false,
        })
    }
}

//Get food by id :
export let getFoodById = async (req, res) => {
    try {
        let owner = req.id;
        let foodId = req.params.id;

        let foodItem = await FOOD.findById(foodId)
            .populate("shopDetails", "_id shopname email location phone city state phone email")
            .populate("owner", "fullname email phone")

        if (!foodItem) {
            return res.status(404).json({
                message: "FoodItem not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "FoodItem details",
            foodItem,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}

//Update foods by id : [update image]
export let updateFoodDetails = async (req, res) => {
    try {
        let foodId = req.params.id;
        let token = req.cookies.token;
        if (!token) {
            return res.status(404).json({
                message: "Token not found pls log in",
                success: false
            })
        }

        let decoded = await jwt.verify(token, process.env.JWT_SECRET)

        let user = await USER.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        if (user.role === "admin") {
            let { foodname, price, category, description, foodtype, isAvailable } = req.body;

            let foodItem = await FOOD.findById(foodId);
            if (!foodItem) {
                return res.status(404).json({
                    message: "FoodItem not found",
                    success: false,
                });
            }

            if (!foodname && !price && !category && !description && !foodtype && !isAvailable) {
                return res.status(404).json({
                    message: "Update atleast one",
                    success: false,
                });
            }

            if (foodname) foodItem.foodname = foodname;
            if (price) foodItem.price = price;
            if (category) foodItem.category = category;
            if (description) foodItem.description = description;
            if (foodtype) foodItem.foodtype = foodtype;
            if (isAvailable) foodItem.isAvailable = isAvailable;

            // Update image if uploaded
            if (req.file) {
                let image = await uploadOnCloudinary(req.file.path);
                if (!image) {
                    return res.status(500).json({
                        message: "Image upload failed",
                        success: false,
                    });
                }
                foodItem.image = image;
            }

            await foodItem.save();

            return res.status(200).json({
                message: "FoodItem details updated successfully",
                foodItem,
                success: true,
            });
        }

        return res.status(200).json({
            message: "You are not admin",
            success: false
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false,
        });
    }
}

//Delete Food by id : 
export let deleteFoodByID = async (req, res) => {
    try {
        let foodId = req.params.id;

        let foodItem = await FOOD.findByIdAndDelete(foodId)
        if (!foodItem) {
            return res.status(404).json({
                message: "FoodItem not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "FoodItem deleted successfully",
            foodItem: {
                name: foodItem.foodname,
                price: foodItem.price,
                foodtype: foodItem.foodtype
            },
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}




//Get foodItem For [login or authorized user] -
export let getFoodForLoginUser = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) {
            return res.status(404).json({
                message: "Unauthorized . Pls log in first"
            })
        }

        let { query, page, limit, sort } = req.query;
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let skip = ((page - 1) * limit)


        //finding shops location under user location's 7km : [user location 7km]
        let decoded = await jwt.verify(token, process.env.JWT_SECRET)
        let user = await USER.findById({ _id: decoded.id })
        if (!user) { return res.status(400).json({ message: "user not found", success: false }) }

        let coordinates = user?.location?.coordinates


        //user ke 7km range ke under wala shops :
        let shopsId = [] //7km under shops id stored here 
        let shops = await SHOP.find({
            shopGeoLocation: {
                $geoWithin: {
                    $centerSphere: [coordinates, 7 / 6378.1]
                }
            }
        }).select('_id shopname').lean()

        shopsId = shops.map(i => i?._id)


        // search functionality :
        let foods = await FOOD.find({
            shopDetails: { $in: shopsId }, //user ke 7 km ke under wala resturent ka foods find karega 
            ...(query?.trim() && {
                $or: [
                    { foodname: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { foodtype: { $regex: query, $options: 'i' } },
                    { category: { $regex: `^${query}$`, $options: 'i' } },
                ]
            })
        }).skip(skip).limit(limit).populate("shopDetails", "shopname")


        //user sort :
        if (sort === "hst") {
            foods.sort((a, b) => b?.price - a?.price)
        } else if (sort === "lst") {
            foods.sort((a, b) => a?.price - b?.price)
        }


        if (!foods) {
            return res.status(404).json({
                message: "No food found",
                success: false
            })
        }

        let totalFoods = await FOOD.find()
        let totalPages = Math.ceil(totalFoods.length / limit)

        return res.status(200).json({
            page,
            totalPages,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            foods,
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

//Get food item of each shop :
export let getFoodsFromShop = async (req, res) => {
    try {
        let shopId = req.params.id;
        if (!shopId) {
            return res.status(400).json({
                message: "shop not found",
                success: false
            })
        }

        let { page, limit, query, sort } = req.query

        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let skip = ((page * limit) - limit)

        let foods = await FOOD.find({
            shopDetails: shopId,
            ...(query?.trim() && {
                $or: [
                    { foodname: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { foodtype: { $regex: query, $options: 'i' } }
                ]
            })
        }).populate("shopDetails").skip(skip).limit(limit)

        if (sort === 'htl') {
            foods?.sort((a, b) => b?.price - a?.price)
        } else if (sort === 'lth') {
            foods?.sort((a, b) => a?.price - b?.price)
        } else if (sort === 'newest') {
            foods?.sort((a, b) => b?.createdAt - a?.createdAt)
        } else if (sort === 'oldest') {
            foods?.sort((a, b) => a?.createdAt - b?.createdAt)
            // foods?.sort((a, b) => a.foodname.localeCompare(b.foodname)) ////a to z named foods
        }

        if (!foods) {
            return res.status(400).json({
                message: "Foods not found",
                success: false
            })
        }

        let shopID = new mongoose.Types.ObjectId(shopId)

        let foodsOfShop = await FOOD.aggregate([
            {
                $match: {
                    shopDetails: shopID,
                    ...(query?.trim() && {
                        $or: [
                            { foodname: { $regex: query, $options: 'i' } },
                            { category: { $regex: query, $options: 'i' } },
                            { foodtype: { $regex: query, $options: 'i' } }
                        ]
                    })
                }
            },
            { $count: 'total' }
        ])

        let foodCount = foodsOfShop[0]?.total
        let totalPage = Math.ceil(foodCount / limit)

        return res.status(200).json({
            page,
            totalPage,
            hasPrev: page > 1,
            hasNext: page < totalPage,
            foods,
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
