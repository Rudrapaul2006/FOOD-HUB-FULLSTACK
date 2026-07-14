import { DELIVARY } from '../Models/delivary.model.js';
import { ORDER } from '../Models/order.model.js';
import { USER } from '../Models/user.model.js'
import jwt from 'jsonwebtoken'
import { orderDelivaryMessage, sendOtpDelivary } from '../utils/mail.js';
import { updateUserOrderStatus } from './order.controller.js';

// Available delivary boys get all orders from shop :
export let getAllOrdersFromShop = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) {
            return res.status(400).json({
                message: "Token not found ..",
                success: false
            })
        }

        let decoded = await jwt.verify(token, process.env.JWT_SECRET)
        let delivaryboy = await USER.findById(decoded.id)

        if (delivaryboy.role === "delivaryboy") {
            let shopOrder = await DELIVARY.find({ status: "brodcasted", brodcasted: delivaryboy._id }).sort({ createdAt: -1 })
                .populate("orderedBy", "fullname email phone role address pincode location socketId image")
                .populate("shopDetails", "shopname email location phone city shopGeoLocation owner").populate("foodDetails", "foodname price category description isAvailable foodtype")
                .populate("order", "quantity paymentMethod orderStatus paymentMethod").populate({
                    path: "shopDetails",
                    populate: {
                        path: "owner",
                        select: "fullname available socketId phone"
                    }
                })

            if (!shopOrder) {
                return res.status(400).json({
                    message: "Shop's order not found",
                    success: false
                })
            }

            return res.status(200).json({
                message: "All order's get successfuly",
                shopOrder,
                success: true
            })
        }

        return res.status(400).json({
            message: "You are not a delivary boy",
            success: false
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Accept order by one available guy :
export let acceptShopOrder = async (req, res) => {
    try {
        let userId = req.id;
        let assignmentId = req.params.id;

        let assignment = await DELIVARY.findById(assignmentId);
        if (!assignment || assignment.status !== "brodcasted") {
            return res.status(400).json({
                message: "Oops! This order has already been taken by another delivery partner .. [ or might be this order is not available for delivery / or canceled by shop_owner ]",
                success: false
            })
        }

        let activeOrder = await DELIVARY.findOne({ assignto: userId, status: "asigned" })

        if (activeOrder) {
            return res.status(400).json({
                message: "Complete current order before accepting a new one",
                success: false
            })
        }

        assignment.assignto = userId;
        assignment.status = "asigned";
        assignment.acceptedate = new Date();
        await assignment.save();

        let shopOrder = await ORDER.findById(assignment.order)
            .populate("orderedBy", "fullname email phone role address pincode location socketId image")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })

        if (!shopOrder) {
            return res.status(400).json({
                message: "Order not found",
                success: false
            })
        }

        shopOrder.assignedDelivaryBoy = userId;
        shopOrder.assignment = assignment._id;
        await shopOrder.save()

        let delivaryBoyAvailable = await USER.findById(userId)

        // Intigrate socket event :
        let io = req.app.get("io")
        if (io) {
            let shopOwnerSocketId = shopOrder?.shopDetails?.owner?.socketId
            let userSocketId = shopOrder?.orderedBy?.socketId
            if (userSocketId) {
                io.to(userSocketId).emit("delivaryBoyDetails", {
                    deliveryBoyId: userId,
                    fullname: delivaryBoyAvailable.fullname,
                    role: delivaryBoyAvailable.role,
                    available: delivaryBoyAvailable.available,
                    phone: delivaryBoyAvailable.phone,
                    location: delivaryBoyAvailable.location
                })
            }

            if (shopOwnerSocketId) {
                io.to(shopOwnerSocketId).emit("delivaryPartnerDetails", {
                    deliveryBoyId: userId,
                    fullname: delivaryBoyAvailable.fullname,
                    role: delivaryBoyAvailable.role,
                    available: delivaryBoyAvailable.available,
                    phone: delivaryBoyAvailable.phone,
                    location: delivaryBoyAvailable.location
                })
            }
        }

        delivaryBoyAvailable.available = "no"
        await delivaryBoyAvailable.save()

        return res.status(200).json({
            message: "Order accepted successfully",
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

// get accepted order by delivary boy :
export let acceptedOrderByDelivaryBoy = async (req, res) => {
    try {
        let userId = req.id;
        let assignmentId = req.params.id;

        if (!assignmentId) {
            return res.status(400).json({
                message: "Invalid assignmentId",
                success: false
            })
        }

        let acceptedOrder = await DELIVARY.findOne({ _id: assignmentId, assignto: userId })
            .populate("orderedBy", "fullname email phone role address pincode location socketId available image")
            .populate("shopDetails", "shopname email location phone city shopGeoLocation owner")
            .populate("foodDetails", "foodname price category description quantity paymentMethod isAvailable foodtype")
            .populate("order", "quantity paymentMethod orderStatus orderGroupId")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })

        if (!acceptedOrder) {
            return res.status(400).json({
                message: "No accepted order found",
                success: false
            })
        }


        return res.status(200).json({
            message: "Accepted order fetched successfully",
            acceptedOrder,
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

//Delivary order status update [for cod order's payment status update] :
export let delivayPaymentStatus = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.status(400).json({ message: "Token not found, pls login again", success: false })

        let decoded = await jwt.verify(token, process.env.JWT_SECRET)
        let user = await USER.findById(decoded.id)

        let assignmentId = req.params.id
        let { paymentStatus } = req.body

        if (!assignmentId) return res.status(400).json({ message: "Order not found", success: false })

        if (user.role !== "delivaryboy") {
            return res.status(400).json({ message: "You are not a delivaryboy", success: false })
        }

        // Fetch order
        let order = await DELIVARY.findById(assignmentId)
            .populate("orderedBy", "fullname email phone address location socketId available image")
            .populate("shopDetails", "shopname email city phone location state shopGeoLocation owner")
            .populate("foodDetails", "foodname price category description foodtype")
            .populate("order", "quantity paymentMethod orderStatus orderGroupId")
            .populate({ path: "shopDetails", populate: { path: "owner", select: "_id fullname socketId available" } })

        if (!order) return res.status(400).json({ message: "Order not found", success: false })

        order.paymentStatus = paymentStatus
        order.status = "compleate"

        await order.save() 

        // Order delivary message to user email :
        let ordererName = order?.orderedBy?.fullname
        let ordererEmail = order?.orderedBy?.email
        let shopName = order?.shopDetails?.shopname
        let foodDetails = (order?.foodDetails?.map(i => i?.foodname).join(", "))
        let payment = order?.order?.[0]?.paymentMethod === "online" ? true : false
        let paymentMethod = order?.order?.[0]?.paymentMethod
        let totalPrice = order?.foodDetails?.reduce((acc, item) => acc + item.price, 0)
        let groupId = order?.orderGroupId

        //Shop Order compleate and order payment status updated true :
        let shopOrder = await ORDER.updateMany(
            {orderGroupId : groupId},
            {$set: {
                orderStatus: "compleate",
                payment: true
            }}
        )

        await orderDelivaryMessage(ordererEmail, shopName , ordererName, foodDetails, payment, paymentMethod, totalPrice)

        // Emit socket events
        let io = req.app.get("io")
        let orderGroupId = order?.order?.[0]?.orderGroupId?.toString()
        if (io) {
            let shopOwnerSocketId = order?.shopDetails?.owner?.socketId
            let userSocketId = order?.orderedBy?.socketId

            //to shop owner :
            if (shopOwnerSocketId) {
                io.to(shopOwnerSocketId).emit("orderStatus", {
                    orderGroupId: orderGroupId,
                    _id: order.id,
                    orderStatus: "compleate",
                    paymentStatus: true
                })
            }

            // to user :
            if (userSocketId) {
                io.to(userSocketId).emit("userOrderStatus", {
                    orderGroupId,
                    _id: order.id,
                    orderStatus: "compleate",
                    paymentStatus: true,
                })
            }
        }

        // Make delivery boy available
        user.available = "yes"
        await user.save()

        return res.status(200).json({
            message: "Order's payment status updated successfully",
            updateOrderPaymentStatus: order,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false })
    }
}

// delivary status update for online payment order :
export let delivaryStatusUpdate = async (req, res) => {
    try {
        let userId = req.id
        let { orderStatus } = req.body
        let assignmentId = req.params.id

        if (!userId) {
            return res.status(400).json({
                message: "User id not get",
                success: false
            })
        }

        let user = await USER.findById(userId)
        if (!user) { return res.status(400).json({ message: "User not found", success: false }) }

        if (user.role === "delivaryboy") {
            let order = await DELIVARY.findById(assignmentId)
            if (order.paymentStatus === "paid") {
                order.status = orderStatus
                await order.save()
                user.available = "yes"
                await user.save()
            }

            await order.populate("orderedBy", "fullname email phone address location socketId available")
            await order.populate("shopDetails", "shopname email city phone location state shopGeoLocation owner")
            await order.populate("foodDetails", "foodname price category description foodtype")
            await order.populate("order", "quantity paymentMethod orderStatus orderGroupId")
            await order.populate({ path: "shopDetails", populate: { path: "owner", select: "_id fullname socketId available" } })

            let io = req.app.get("io")
            let orderGroupId = order?.order?.[0]?.orderGroupId?.toString()
            if (io) {
                let shopOwnerSocketId = order?.shopDetails?.owner?.socketId
                let userSocketId = order?.orderedBy?.socketId

                if (shopOwnerSocketId) {
                    io.to(shopOwnerSocketId).emit("orderStatus", {
                        orderGroupId: orderGroupId,
                        _id: order.id,
                        orderStatus: order.status,
                        paymentStatus: order.paymentStatus,
                    })
                }
                if (userSocketId) {
                    io.to(userSocketId).emit("userOrderStatus", {
                        orderGroupId,
                        _id: order.id,
                        orderStatus: order.status,
                        paymentStatus: order.paymentStatus,
                    })
                }
            }

            let ordererName = order?.orderedBy?.fullname
            let ordererEmail = order?.orderedBy?.email
            let shopName = order?.shopDetails?.shopname
            let foodDetails = (order?.foodDetails?.map(i => i?.foodname).join(", "))
            let totalPrice = order?.foodDetails?.reduce((acc, item) => acc + item?.price, 0)
            let payment = order?.order?.[0]?.paymentMethod === "online" ? true : false
            let paymentMethod = order?.order?.[0]?.paymentMethod
            let groupId = order?.order?.[0]?.orderGroupId

            await ORDER.updateMany(
                {orderGroupId : groupId},
                {$set: {
                    orderStatus: "compleate",
                    payment: true
                }}
            )
            
            await orderDelivaryMessage(ordererEmail, shopName , ordererName, foodDetails, payment, paymentMethod, totalPrice)


            return res.status(200).json({
                message: "Order status updated successfully",
                order,
                success: true
            })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}

// Send Delivary OTP to user :
export let sendDelivaryOtpToUser = async (req, res) => {
    try {
        let groupId = req.params.id;
        let order = await ORDER.find({ orderGroupId: groupId.toString() }).populate("orderedBy", "fullname email phone address location")
        if (!order) {
            return res.status(400).json({
                message: "Order not found",
                success: false
            })
        }

        let userId = (order?.map(i => i?.orderedBy?._id.toString())[0])

        let user = await USER.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        // //Generate otp and expire time :
        let delivaryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        let expireTime = new Date(Date.now() + 5 * 60 * 1000); //5 minutes

        for (let i of order) {
            i.expireOtp = expireTime
            i.sendDelivaryOtp = delivaryOtp
            await i.save()
        }

        await sendOtpDelivary(user.email, delivaryOtp);

        return res.status(200).json({
            message: "Delivary OTP sent to user successfully",
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

// verify the delivary otp :
export let verifyDelivaryOtp = async (req, res) => {
    try {
        let groupId = req.params.id;
        let { delivaryOtp } = req.body;

        let order = await ORDER.find({ orderGroupId: groupId.toString() }).populate("orderedBy", "fullname email phone address location");

        if (!order || order.length === 0) {
            return res.status(400).json({
                message: "Order not found",
                success: false
            })
        }

        if (order.map(i => i.sendDelivaryOtp)[0] !== delivaryOtp.toString() || !order.map(i => i.expireOtp)[0] || order.map(i => i.expireOtp)[0] < new Date()) {
            return res.status(400).json({
                message: "OTP expired or OTP is incorrect",
                success: false
            })
        }

        for (let i of order) {
            i.sendDelivaryOtp = null
            i.expireOtp = null
            await i.save()
        }

        return res.status(200).json({
            message: "Delivery OTP verified successfully",
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



//Found how many order this delivary guy delivered : [reset after one day]
export let howManyDelivaryCompleate = async (req, res) => {
    try {
        let userId = req.id;
        if (!userId) {
            return res.status(400).json({
                message: "Delivery boy not found",
                success: false
            })
        }

        let startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        let endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        let completedOrders = await DELIVARY.find({
            assignto: userId,
            status: "compleate",
            updatedAt: { $gte: startOfDay, $lte: endOfDay }
        })
            // .populate("assignto").populate("order", "quantity paymentMethod orderStatus paymentMethod")
            .populate("foodDetails", "foodname price category description foodtype")
            .populate("shopDetails", "shopname email city phone location state shopGeoLocation")
        // .populate("orderedBy", "fullname email phone address location")

        return res.status(200).json({
            message: "Today's completed orders fetched",
            count: completedOrders.length,
            orders: completedOrders,
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