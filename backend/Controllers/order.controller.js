import { USER } from "../Models/user.model.js";
import { SHOP } from '../Models/shop.model.js';
import { ORDER } from "../Models/order.model.js";
import { FOOD } from "../Models/food.model.js";
import { DELIVARY } from "../Models/delivary.model.js";
import { CART } from "../Models/cart.model.js";
import jwt, { decode } from 'jsonwebtoken'
import mongoose, { Query } from "mongoose";
import dotenv, { populate } from 'dotenv';
import Razorpay from "razorpay";
import { orderCancelationMessage, sendOrderPlaceMessage } from "../utils/mail.js";


dotenv.config()

// Crearte razorPay insteance :
let instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
})

//Create all order from cart [each shop food separate grouping and order creating] : (cod order)
export let allShopOrder = async (req, res) => {
    try {
        let userId = req.id

        let user = await USER.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let cartData = await CART.find({ userDetails: userId })
            .populate("foodDetails", "foodname price category description isAvailable foodtype shopDetails")
            .populate("userDetails", "fullname email phone location role address pincode _id")
            .populate("shopDetails", "shopGeoLocation shopname email description location phone city state open")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })

        if (!cartData || cartData.length < 1) {
            return res.status(400).json({
                message: "No food available for order",
                success: false
            })
        }

        let { paymentMethod, address, pincode } = req.body

        if (address) user.address = address
        if (pincode) user.pincode = pincode
        await user.save()

        if (!paymentMethod) {
            return res.status(400).json({
                message: "Payment method is required",
                success: false
            })
        }

        if (!address || !pincode) {
            if (!user.address || !user.pincode) {
                return res.status(400).json({
                    message: "Address and pincode required",
                    success: false
                })
            }
        }

        let isFoodAvailable = cartData.filter(item => item.foodDetails.isAvailable === "yes")

        if (isFoodAvailable.length === 0) {
            return res.status(400).json({
                message: "No available items to order",
                success: false
            })
        }


        //For online payment method : [razorpay order create]
        if (paymentMethod === "online") {
            let razorOrder = await instance.orders.create({
                amount: isFoodAvailable.reduce((total, item) => total + item.foodDetails.price * item.quantity, 0) * 100,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
            })

            return res.status(201).json({
                message: "Proceed to payment ...",
                razorOrderId: razorOrder.id,
                razorOrder,
                cartData: isFoodAvailable,
                address: address || user.address,
                pincode: pincode || user.pincode,
                success: true
            })
        }


        //For COD order [grouped] :
        let groupedByShop = {}
        isFoodAvailable.forEach(item => {
            let shopId = item.shopDetails._id.toString()
            if (!groupedByShop[shopId]) {
                groupedByShop[shopId] = []
            }
            groupedByShop[shopId].push(item)
        })

        let allOrders = []
        for (let shopId in groupedByShop) {
            let items = groupedByShop[shopId]

            let orderGroupId = new mongoose.Types.ObjectId()

            let createOrders = items.map(item => ({
                orderedBy: userId,
                foodDetails: item.foodDetails._id,
                shopDetails: item.shopDetails._id,
                quantity: item.quantity,
                paymentMethod,
                address: address || user.address,
                pincode: pincode || user.pincode,
                orderGroupId
            }))

            let createdOrders = await ORDER.create(createOrders)

            let orderDetails = await ORDER.populate(createdOrders, [
                { path: "foodDetails" },
                { path: "orderedBy" },
                {
                    path: "shopDetails",
                    populate: {
                        path: "owner",
                        select: "_id fullname socketId available"
                    }
                }
            ])

            allOrders.push(...orderDetails)
        }

        //order grouped by oder group id (for frontend) :
        let grouped = {}
        allOrders.forEach(order => {
            let gId = order.orderGroupId.toString()

            if (!grouped[gId]) {
                grouped[gId] = { items: [] }
            }

            grouped[gId].items.push(order)
        })


        let finalOrders = Object.values(grouped)
        let io = req.app.get("io")
        if (io) {
            let shopOwnerSocketId = allOrders?.map(i => i?.shopDetails?.owner?.socketId)[0]

            if (shopOwnerSocketId) {
                io.to(shopOwnerSocketId).emit("multipleshopOrder", finalOrders)
            }
        }

        //Order placed mail :
        let ordererEmail = allOrders?.map(i => i?.orderedBy?.email)[0]
        let shopName = allOrders?.map(i => i?.shopDetails?.shopname)[0]
        let ordererName = allOrders?.map(i => i?.orderedBy?.fullname)[0]
        let foodDetails = allOrders?.map(i => i?.foodDetails?.foodname).join(", ")
        let payment = allOrders?.map(i => i?.payment)[0]
        let paymentMod = allOrders?.map(i => i?.paymentMethod)[0]
        let totalPrice = allOrders?.reduce((total, item) => total + item?.foodDetails?.price * item?.quantity, 0)

        await sendOrderPlaceMessage(ordererEmail, shopName, ordererName, foodDetails, payment, paymentMod, totalPrice)

        return res.status(201).json({
            message: "Order registered successfully",
            totalOrders: finalOrders.length,
            allOrders: finalOrders,
            success: true
        })

    } catch (error) {
        console.log("Error in allShopOrder : ", error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Verify razor pay [then create order for online payment method] : and send socket event to shop owner : ((online order))
export let verifyPayment = async (req, res) => {
    try {
        let { razorpay_order_id, razorpay_payment_id, address, pincode } = req.body
        let userId = req.id

        let user = await USER.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        if (!razorpay_payment_id) {
            return res.status(400).json({
                message: "Invalid payment data",
                success: false
            })
        }

        let payment = await instance.payments.fetch(razorpay_payment_id)

        if (!payment || payment?.status !== "captured") {
            return res.status(400).json({
                message: "Payment not captured",
                success: false
            })
        }

        let cartData = await CART.find({ userDetails: userId })
            .populate("foodDetails", "foodname price category description isAvailable foodtype shopDetails")
            .populate("userDetails", "fullname email phone location role address pincode")
            .populate("shopDetails", "shopGeoLocation shopname email description location phone city state open")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })

        if (!cartData || cartData?.length < 1) {
            return res.status(400).json({
                message: "No food available for order",
                success: false
            })
        }

        let isFoodAvailable = cartData?.filter(item => item?.foodDetails?.isAvailable === "yes")

        if (isFoodAvailable?.length === 0) {
            return res.status(400).json({
                message: "No available items to order",
                success: false
            })
        }

        let groupedByShop = {}

        isFoodAvailable?.forEach(item => {
            let shopId = item.shopDetails._id.toString()
            if (!groupedByShop[shopId]) {
                groupedByShop[shopId] = []
            }
            groupedByShop[shopId].push(item)
        })

        let allOrders = []

        for (let shopId in groupedByShop) {
            let items = groupedByShop[shopId]

            let orderGroupId = new mongoose.Types.ObjectId()

            let createOrders = items.map(item => ({
                orderedBy: userId,
                foodDetails: item.foodDetails._id,
                shopDetails: item.shopDetails._id,
                quantity: item.quantity,
                paymentMethod: "online",
                address: address || user.address,
                pincode: pincode || user.pincode,
                orderGroupId,
                razorpayPaymentId: razorpay_payment_id,
                razorpayOrderId: razorpay_order_id,
                payment: true
            }))

            let createdOrders = await ORDER.create(createOrders)

            let orderDetails = await ORDER.populate(createdOrders, [
                { path: "foodDetails" },
                { path: "orderedBy" },
                {
                    path: "shopDetails",
                    populate: {
                        path: "owner",
                        select: "_id fullname socketId available"
                    }
                }
            ])

            allOrders.push(...orderDetails)
        }

        let grouped = {}

        allOrders.forEach(order => {
            let gId = order.orderGroupId.toString()

            if (!grouped[gId]) {
                grouped[gId] = { items: [] }
            }

            grouped[gId].items.push(order)
        })

        let finalOrders = Object.values(grouped)

        let io = req.app.get("io")
        if (io) {
            let ownerSocketId = allOrders.map(i => i?.shopDetails?.owner?.socketId)[0]

            if (ownerSocketId) {
                io.to(ownerSocketId).emit("multipleshopOrder", allOrders)
            }
        }

        //Online payment done Orders placed mail:
        let ordererName = allOrders?.map(i => i?.orderedBy?.fullname)[0]
        let ordererEmail = allOrders?.map(i => i?.orderedBy?.email)[0]
        let shopName = allOrders?.map(i => i?.shopDetails?.shopname)[0]
        let foodDetails = allOrders?.map(i => i?.foodDetails?.foodname).join(", ")
        let paymentDone = allOrders?.map(i => i?.payment)[0]
        let paymentMethod = allOrders?.map(i => i?.paymentMethod)[0]
        let totalPrice = allOrders?.reduce((total, item) => total + item?.foodDetails?.price * item?.quantity, 0)

        await sendOrderPlaceMessage(ordererEmail, shopName, ordererName, foodDetails, paymentDone, paymentMethod, totalPrice)

        return res.status(201).json({
            message: "Order registered successfully",
            totalOrders: finalOrders.length,
            allOrders: finalOrders,
            success: true
        })

    } catch (error) {
        console.log("VERIFY ERROR:", error)

        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}


// Get single food item from cart :
export let singleFoodGet = async (req, res) => {
    try {
        let userId = req.id
        let foodId = req.params.id

        let user = await USER.findById(userId)
        if (!user) { return res.status(400).json({ message: "User not found", success: false }) }

        let cartItem = await CART.find({ userDetails: userId, foodDetails: foodId }).populate("shopDetails").populate("userDetails").populate("foodDetails")
        if (!cartItem || !cartItem.length) { return res.status(400).json({ message: "Cart item not found", success: false }) }

        let availableFood = cartItem.filter(i => i?.foodDetails?.isAvailable === "yes")

        return res.status(200).json({
            availableFood,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error in single cod order api", success: false })
    }
}

// cart to checkout page single food order : [cod order] : and send socket event to shop owner :
export let singleFoodOrder = async (req, res) => {
    try {
        let userId = req.id
        let foodId = req.params.id

        let user = await USER.findById(userId)
        if (!user) { return res.status(400).json({ message: "user not found", success: false }) }

        let cartItem = await CART.find({ foodDetails: foodId, userDetails: userId }).populate("shopDetails").populate("userDetails").populate("foodDetails")
        let availableFood = cartItem?.filter(i => i?.foodDetails?.isAvailable === "yes")



        let { paymentMethod, address, pincode } = req.body

        if (address) user.address = address
        if (pincode) user.pincode = pincode
        await user.save()

        if (!paymentMethod) {
            return res.status(400).json({ message: "Payment method is required", success: false })
        }

        if (!address || !pincode) {
            if (!user.address || !user.pincode) { return res.status(400).json({ message: "Address and pincode required", success: false }) }
        }

        if (!cartItem || !cartItem.length || !availableFood.length) { return res.status(400).json({ message: "No available food found ", success: false }) }


        if (paymentMethod === "online") {
            let razorOrder = await instance.orders.create({
                amount: availableFood?.reduce((total, item) => total + item?.foodDetails?.price * item?.quantity, 0) * 100,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
            })

            return res.status(200).json({
                message: "Proceed to payment ...",
                razorOrderId: razorOrder.id,
                razorOrder,
                cartData: availableFood,
                success: true
            })
        }

        //order groued by shopId :
        let shopOrder = {}
        availableFood.forEach(i => {
            let shopId = i?.foodDetails?._id

            if (!shopOrder[shopId]) {
                shopOrder[shopId] = []
            }

            shopOrder[shopId].push(i)
        })

        // single order store on DB :
        let allSingleOrder = []

        for (let shopId in shopOrder) {
            let items = shopOrder[shopId]

            let singleOrder = items.map(i => ({
                shopDetails: i?.shopDetails?._id,
                foodDetails: i?.foodDetails?._id,
                orderedBy: userId,
                address: user?.address || address,
                pincode: user?.pincode || pincode,
                quantity: i?.quantity,
                paymentMethod: paymentMethod,
                orderGroupId: new mongoose.Types.ObjectId(),
                payment: false
            }))

            let order = await ORDER.create(singleOrder)
            let orderDetals = await ORDER.populate(order, [
                { path: "foodDetails" },
                { path: "orderedBy" },
                {
                    path: "shopDetails",
                    populate: {
                        path: "owner",
                        select: "fullname phone email socketId available"
                    }
                }
            ])

            allSingleOrder.push(...orderDetals)
        }

        //group the order by groupId : [for frontend] :
        let finalCodSingleOrder = {}
        allSingleOrder.forEach(i => {
            let groupId = i?.orderGroupId

            if (!finalCodSingleOrder[groupId]) {
                finalCodSingleOrder[groupId] = { items: [] }
            }

            finalCodSingleOrder[groupId].items.push(i)
        })

        let valueOfSingleCodOrder = Object.values(finalCodSingleOrder)

        //send socket event to shop owner :
        let io = req.app.get("io")
        if (io) {
            let shopOwnerSocketId = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.shopDetails?.owner?.socketId)[0])[0]

            if (shopOwnerSocketId) {
                io.to(shopOwnerSocketId).emit("multipleshopOrder", valueOfSingleCodOrder[0])
            }
        }

        // send order place success email to user :
        let ordererEmail = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.orderedBy?.email)[0])[0]
        let shopName = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.shopDetails?.shopname)[0])[0]
        let ordererName = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.orderedBy?.fullname)[0])[0]
        let foodDetails = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.foodDetails?.foodname)[0])[0]
        let payment = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.payment)[0])[0]
        let paymentMod = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.paymentMethod)[0])[0]
        let totalPrice = valueOfSingleCodOrder?.map(i => i?.items?.map(j => j?.foodDetails?.price * j?.quantity)[0])[0]

        await sendOrderPlaceMessage(ordererEmail, shopName, ordererName, foodDetails, payment, paymentMod, totalPrice)

        return res.status(200).json({
            message: "Order placed succcesfully",
            codSingleOrder: Object.values(finalCodSingleOrder),
            success: true
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "server error in single food order api" })
    }
}

// cart to checkout page single food order : [online order] : and send socket event to shop owner :
export let singleOnlineOrder = async (req, res) => {
    try {
        let userId = req.id
        let foodId = req.params.id

        let user = await USER.findOne({ _id: userId })
        if (!user) { return res.status(400).json({ message: "User not found" }) }

        let { paymentMethod, razorpay_payment_id, razorpay_order_id, address, pincode } = req.body

        if (!razorpay_payment_id || !razorpay_order_id) { return res.status(400).json({ message: "RazorPayment id or order_id not provided .." }) }

        // fetch the payment details from Razorpay to verify if the payment is captured or not :
        let order = await instance.payments.fetch(razorpay_payment_id)

        if (order?.captured !== true) {
            return res.status(400).json({ message: "Payment not captured " })
        }

        // check if the food item is available in cart or not : [cart to checkout page] 
        let cartItem = await CART.find({ userDetails: userId, foodDetails: foodId }).populate("foodDetails").populate("userDetails")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "fullname email phone socketId available"
                }
            })

        if (!paymentMethod) {
            return res.status(400).json({ message: "Payment method is required", success: false })
        }

        if (!cartItem || !cartItem.length) {
            return res.status(400).json({ message: "Item not found ", success: false })
        }


        if (paymentMethod === "online") {
            let availableFood = cartItem?.filter(i => i?.foodDetails?.isAvailable === "yes")

            //grouped by shopId :
            let groupedByShopId = {}
            availableFood.forEach(i => {
                let shopId = i?.shopDetails?._id;

                if (!groupedByShopId[shopId]) {
                    groupedByShopId[shopId] = []
                }

                groupedByShopId[shopId].push(i)
            })

            //create order in DB :
            let allOnlineOrder = []  //all online payment order stored here :

            for (let shopId in groupedByShopId) {
                let items = groupedByShopId[shopId]

                let order = items.map(i => ({
                    shopDetails: i?.shopDetails?._id,
                    foodDetails: i?.foodDetails?._id,
                    orderedBy: userId,
                    address: address || user?.address,
                    pincode: pincode || user?.pincode,
                    quantity: i?.quantity,
                    orderGroupId: new mongoose.Types.ObjectId(),
                    paymentMethod: paymentMethod,
                    payment: true,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpayOrderId: razorpay_order_id
                }))

                let orderCreate = await ORDER.create(order)
                let orderDetails = await ORDER.populate(orderCreate, [
                    { path: "foodDetails" },
                    { path: "orderedBy" },
                    {
                        path: "shopDetails", populate: {
                            path: "owner",
                            select: "fullname email phone socketId available"
                        }
                    }
                ])

                allOnlineOrder.push(...orderDetails)
            }

            //group the order by groupId : [for frontend] :
            let groupedOrder = {}
            allOnlineOrder.forEach(i => {
                let groupId = i?.orderGroupId?.toString()

                if (!groupedOrder[groupId]) {
                    groupedOrder[groupId] = { items: [] }
                }

                groupedOrder[groupId].items.push(i)
            })

            let io = req.app.get("io")
            if (io) {
                let ownerSocketId = allOnlineOrder?.map(i => i?.shopDetails?.owner?.socketId)[0]

                if (ownerSocketId) {
                    io.to(ownerSocketId).emit("multipleshopOrder", allOnlineOrder)
                }
            }

            // send order place success email to user :
            let ordererEmail = allOnlineOrder?.map(i => i?.orderedBy?.email)[0]
            let shopName = allOnlineOrder?.map(i => i?.shopDetails?.shopname)[0]
            let ordererName = allOnlineOrder?.map(i => i?.orderedBy?.fullname)[0]
            let foodDetails = allOnlineOrder?.map(i => i?.foodDetails?.foodname)[0]
            let payment = allOnlineOrder?.map(i => i?.payment)[0]
            let paymentMod = allOnlineOrder?.map(i => i?.paymentMethod)[0]
            let totalPrice = allOnlineOrder?.map(i => i?.quantity * i?.foodDetails?.price)[0]

            await sendOrderPlaceMessage(ordererEmail, shopName, ordererName, foodDetails, payment, paymentMod, totalPrice)

            return res.status(200).json({
                message: "Payment done and order registerd",
                finalOrder: Object.values(groupedOrder),
                success: true
            })

        } else {
            return res.status(400).json({ message: "Invalid payment method", success: false })
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "server error in single online order api", success: false })
    }
}

//Get all cart item by user ID : [cart to cheakout page]
export let getAllCartItem = async (req, res) => {
    try {
        let userId = req.id
        let user = await USER.findById(userId)
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let cartItems = await CART.find({ userDetails: userId })
            .populate("foodDetails", "foodname price image category description isAvailable foodtype")
            .populate("userDetails", "fullname email phone location role address pincode _id")
            .populate("shopDetails", "shopGeoLocation shopname email description location phone city state")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })

        let isAvalableFoodItems = cartItems.filter(item => item.foodDetails.isAvailable === "yes")

        return res.status(200).json({
            message: "All items fetched successfully",
            isAvalableFoodItems,
            success: true
        })



    } catch (error) {
        console.log("Order error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Get all [ pending / preparing /out for delivary ] orders from user : [for admin]  [pagination]:
export let getAllPendingOrders = async (req, res) => {
    try {
        let adminId = req.id;
        let { page, limit } = req.query;

        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let skip = (page - 1) * limit

        if (!adminId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false
            })
        }

        let admin = await USER.findById(adminId)

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "You are not admin",
                success: false
            })
        }

        let shop = await SHOP.findOne({ owner: admin._id })

        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                success: false
            })
        }

        // Get unique order groups sorted by latest order first
        let orderGroupIds = await ORDER.aggregate([
            { $match: { shopDetails: shop._id, orderStatus: { $in: ["pending", "preparing", "out for delivary" , "picked up and on_the_way"] } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$orderGroupId", latestCreatedAt: { $first: "$createdAt" } } },
            { $sort: { latestCreatedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
        ])

        //only for order count :
        let countResult = await ORDER.aggregate([
            {
                $match: {
                    shopDetails: shop._id,
                    orderStatus: { $in: ["pending", "preparing", "out for delivary" , "picked up and on_the_way"] }
                }
            },
            {
                $group: {
                    _id: "$orderGroupId"
                }
            },
            {
                $count: "total"
            }
        ])

        let totalPendingOrders = countResult[0]?.total || 0
        let totalPages = Math.ceil(totalPendingOrders / limit)

        let paginatedGroupIds = orderGroupIds.map(i => i?._id)

        let allPendingOrders = await ORDER.find({
            orderGroupId: { $in: paginatedGroupIds }
        }).sort({ createdAt: -1 })
            .populate("orderedBy", "fullname email role address pincode phone")
            .populate("foodDetails", "foodname price category foodtype paymentMethod quantity description isAvailable")
            .populate("shopDetails", "_id shopname phone")
            .populate("assignment", "paymentStatus")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })
            .populate({
                path: "assignment",
                populate: {
                    path: "assignto",
                    select: "fullname email phone location"
                }
            })

        //find compleate order in admin order DB :
        let allCompleateOrders = await ORDER.aggregate([
            { $match: { shopDetails: shop._id, orderStatus: { $in: ["compleate"] } } },
            { $group: { _id: "$orderGroupId" } }
        ])
        allCompleateOrders = allCompleateOrders.map(i => i?._id)

        let totalRevenueData = await ORDER.find({
            orderGroupId: { $in: allCompleateOrders }
        }).populate("foodDetails", "price")

        let totalRevenue = totalRevenueData.reduce((sum, order) => sum + ((order?.foodDetails?.price || 0) * (order?.quantity || 0)),
            0
        )

        let allPendingOrdersCount = await ORDER.aggregate([
            { $match: { shopDetails: shop._id, orderStatus: { $in: ["pending"] } } },
            { $group: { _id: "$orderGroupId" } }
        ])

        // Order Grouped by orderGroupId :
        let grouped = {}
        allPendingOrders.forEach(order => {
            let gId = order.orderGroupId.toString()

            if (!grouped[gId]) {
                grouped[gId] = {
                    items: []
                }
            }
            grouped[gId].items.push(order)
        })

        return res.status(200).json({
            page,
            totalPages,
            totalPendingOrders: allCompleateOrders.length,
            shopPendingOrders: allPendingOrdersCount.length,
            totalRevenue,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            allPendingOrders: Object.values(grouped),
            success: true
        })

    } catch (error) {
        console.log("Get All Orders Error:", error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Get all [compleate and cancel] orders from user : [for admin]  [pagination / searching] :
export let getAllCanceledOrders = async (req, res) => {
    try {
        let adminId = req.id
        let { page, limit, query } = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let skip = (page - 1) * limit

        if (!adminId) {
            return res.status(400).json({
                message: "Unauthorized",
                success: false
            })
        }

        let admin = await USER.findById(adminId)
        if (!admin || admin.role !== "admin") {
            return res.status(404).json({
                message: "You are not admin",
                success: false
            })
        }

        let shop = await SHOP.findOne({ owner: admin._id })
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                success: false
            })
        }

        //Search functionality :
        let userIds = []
        let orderId = []
        let foodId = []

        if (query?.trim()) {
            let [USERs, FOODs, ORDERs] = await Promise.all([

                USER.find({
                    $or: [
                        { fullname: { $regex: query, $options: 'i' } },
                        { phone: { $regex: query, $options: 'i' } },
                        { address: { $regex: query, $options: 'i' } },
                        { pincode: { $regex: query, $options: 'i' } }
                    ]
                }).select('_id').lean(),

                FOOD.find({
                    foodname: { $regex: query, $options: 'i' }
                }).select('_id').lean(),

                ORDER.aggregate([
                    {
                        $match: {
                            $expr: {
                                $regexMatch: {
                                    input: { $toString: "$orderGroupId" },
                                    regex: query,
                                    options: "i"
                                }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$orderGroupId"
                        }
                    }
                ])
            ])

            userIds = USERs.map(i => i?._id)
            foodId = FOODs.map(i => i?._id)
            orderId = ORDERs.map(i => i?._id)
        }

        //common match for count all group orders and also query orders :
        let commonMatch = {
            shopDetails: shop._id,
            orderStatus: { $in: ["compleate", "cancel"] },

            ...(query?.trim() && {
                $or: [
                    { orderedBy: { $in: userIds } },
                    { orderGroupId: { $in: orderId } },
                    { foodDetails: { $in: foodId } }
                ]
            })
        }

        //for count all grouped order :
        let orderCount = await ORDER.aggregate([
            {
                $match: commonMatch
            },
            {
                $group: {
                    _id: "$orderGroupId"
                }
            },
            {
                $count: "total"
            }
        ])

        let cancelOrders = orderCount[0]?.total || 0
        let totalPages = Math.ceil(cancelOrders / limit)

        // Get unique order groups sorted by latest order first
        let orderGroupIds = await ORDER.aggregate([
            {
                $match: commonMatch
            },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$orderGroupId", latestCreatedAt: { $first: "$createdAt" } } },
            { $sort: { latestCreatedAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])

        let paginatedGroupIds = orderGroupIds.map(i => i?._id)

        let cancelTotalOrders = await ORDER.find({
            orderGroupId: { $in: paginatedGroupIds }
        }).populate("orderedBy", "location fullname email phone role available address pincode")
            .populate("shopDetails", "shopGeoLocation shopname email location image phone city state")
            .populate("foodDetails", "foodname price category description isAvailable foodtype")
            .populate({
                path: "foodDetails",
                populate: ({
                    path: "owner",
                    select: "fullname email phone socketId available"
                })
            })
            .populate({
                path: "assignment",
                populate: ({
                    path: "assignto",
                    select: "fullname email phone socketId available"
                })
            })

        let grouped = {}
        cancelTotalOrders.forEach(o => {
            let orderId = o.orderGroupId.toHexString();

            if (!grouped[orderId]) {
                grouped[orderId] = {
                    items: []
                }
            }
            grouped[orderId].items.push(o)
        })

        return res.status(200).json({
            page,
            totalPages,
            cancelOrders,
            hasPrev: page > 1,
            hasNext: page < totalPages,
            cancelTotalOrders: Object.values(grouped),
            success: true
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Server error",
            success: false
        })
    }
}

//Get order by groupId : [for admin] by order id :
export let getOrderById = async (req, res) => {
    try {
        let groupId = req.params.id;

        if (!groupId) {
            return res.status(400).json({
                message: "Invalid Order Group ID",
                success: false
            })
        }

        let token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Unauthorized. Please log in first",
                success: false
            })
        }

        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        let admin = await USER.findById(decoded.id);

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({
                message: "You are not admin",
                success: false
            })
        }

        let shop = await SHOP.findOne({ owner: admin._id });
        if (!shop) {
            return res.status(404).json({
                message: "Shop not found",
                success: false
            })
        }

        let orders = await ORDER.find({ orderGroupId: groupId, shopDetails: shop._id })
            .sort({ createdAt: -1 })
            .populate("orderedBy", "fullname email role address pincode phone image")
            .populate("foodDetails", "foodname price category quantity paymentMethod foodtype description isAvailable")
            .populate("shopDetails", "_id shopname phone city state")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available role"
                }
            })
            .populate({
                path: "assignment",
                populate: {
                    path: "assignto",
                    select: "fullname email phone location socketId available"
                }
            })

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: "No orders found",
                success: false
            })
        }

        let grouped = {}
        orders.forEach(item => {
            let gId = item.orderGroupId.toString()
            if (!grouped[gId]) {
                grouped[gId] = { items: [] }
            }
            grouped[gId].items.push(item)
        })

        return res.status(200).json({
            message: "Orders fetched successfully",
            order: Object.values(grouped),
            success: true
        })

    } catch (error) {
        console.log("Order error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Update user order [pending => preparing => out for delivary => cancel ] or groupOrder status => [by admin] : and assign the delivary boy : [most imp]
export let updateUserOrderStatus = async (req, res) => {
    try {
        let groupId = req.params.id;
        let { orderStatus } = req.body;
        let adminId = req.id;
        let { cancelReason } = req.body

        let admin = await USER.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "You are not admin", success: false });
        }

        let shop = await SHOP.findOne({ owner: admin._id });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found", success: false })
        }

        let orders = await ORDER.find({ orderGroupId: groupId, shopDetails: shop._id }).populate("orderedBy", "fullname email").populate("shopDetails", "shopname").populate("foodDetails")
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found", success: false })
        }

        if (orderStatus === "out for delivary") {
            if (!shop.shopGeoLocation) {
                return res.status(404).json({
                    message: "Shop not found",
                    success: false
                })
            }

            let [longitude, latitude] = shop.shopGeoLocation.coordinates;

            //Free Delivary Boys under 7km :
            let nearByDeliveryBoys = await USER.find({
                role: "delivaryboy",
                available: "yes",
                socketId: { $ne: null },
                location: {
                    $geoWithin: {
                        $centerSphere: [
                            [longitude, latitude], 1000 / 6378100
                        ]
                    }
                }
            }).select("_id fullname email phone location role available socketId")

            if (!nearByDeliveryBoys || nearByDeliveryBoys.length === 0) {
                return res.status(400).json({
                    message: "Currently no delivery partner is available nearby. Please try again in a few minutes ..",
                    success: false
                })
            }

            //FindIng busy delivary boys :
            let busyDeliveryBoys = await DELIVARY.find({
                assignto: { $in: nearByDeliveryBoys.map(b => b._id) },
                status: { $nin: ["brodcasted", "compleate"] }
            }).distinct("assignto")

            //Filtering free delivary boys :
            let busySet = new Set(busyDeliveryBoys.map(id => String(id)))
            let freeDeliveryBoys = nearByDeliveryBoys.filter(b => !busySet.has(String(b._id)))

            if (freeDeliveryBoys.length === 0 || !freeDeliveryBoys) {
                return res.status(400).json({
                    message: "All delivery boys are busy . Status not updated.",
                    success: false
                })
            }

            await ORDER.updateMany(
                { orderGroupId: groupId, shopDetails: shop._id },
                { $set: { orderStatus: orderStatus } }
            )

            let paymentDone = (orders?.map(i => i?.payment)[0])

            let delivary = await DELIVARY.create({
                order: orders.map(i => i._id),
                orderedBy: orders.map(i => i.orderedBy)[0],
                shopDetails: shop._id,
                orderGroupId: orders.map(i => i?.orderGroupId)[0].toString(),
                foodDetails: orders.map(i => i.foodDetails),
                brodcasted: freeDeliveryBoys.map(i => i._id),
                status: "brodcasted",
                paymentStatus: paymentDone === false ? "pending" : "paid"
            })

            //Send io orderData event to the free delivary boys :
            let io = req.app.get("io")
            if (io) {
                for (let boy of freeDeliveryBoys) {

                    let shopOrder = await DELIVARY.find({
                        status: "brodcasted",
                        brodcasted: boy._id
                    })
                        .sort({ createdAt: -1 })
                        .populate("orderedBy", "fullname email phone role address pincode location socketId image")
                        .populate("shopDetails", "shopname email location phone city shopGeoLocation owner")
                        .populate("foodDetails", "foodname price category description isAvailable foodtype")
                        .populate("order", "quantity paymentMethod orderStatus paymentMethod")
                        .populate({
                            path: "shopDetails",
                            populate: {
                                path: "owner",
                                select: "fullname available socketId phone"
                            }
                        })

                    if (boy.socketId) {
                        io.to(boy.socketId).emit("delivaryOrder", shopOrder)
                    }
                }
            }

            await ORDER.updateMany(
                { orderGroupId: groupId, shopDetails: shop._id },
                { $set: { assignment: delivary._id, brodcastedTo: freeDeliveryBoys } }
            )
        }

        let currentStatus = orders?.map(i => i?.orderStatus)[0]

        let ordererName = orders?.map(i => i?.orderedBy?.fullname)[0]
        let ordererEmail = orders?.map(i => i?.orderedBy?.email)[0]
        let shopName = orders?.map(i => i?.shopDetails?.shopname)[0]
        let foodDetails = orders?.map(i => i?.foodDetails?.foodname).join(", ")
        let payment = (orders?.map(i => i?.payment)[0])
        let totalPrice = orders?.reduce((total, item) => total + item?.foodDetails?.price * item?.quantity, 0)
        let paymentMod = orders?.map(i => i?.paymentMethod)[0]


        if (currentStatus === "pending" && orderStatus === "preparing") {
            await ORDER.updateMany(
                { orderGroupId: groupId, shopDetails: shop._id },
                { $set: { orderStatus: orderStatus } }
            )
        } else if ((currentStatus === "pending" || currentStatus === "preparing") && orderStatus === "cancel") {
            await ORDER.updateMany(
                { orderGroupId: groupId, shopDetails: shop._id },
                { $set: { orderStatus: orderStatus, assignment: null, brodcastedTo: [], cancelReason: cancelReason, cancelBy: admin.role } }
            )
            await orderCancelationMessage(ordererEmail, shopName, ordererName, foodDetails, cancelReason, payment, paymentMod, totalPrice)
        } else if (currentStatus === "out for delivary" && orderStatus === "cancel") {
            await ORDER.updateMany(
                { orderGroupId: groupId, shopDetails: shop._id },
                { $set: { orderStatus: orderStatus, assignment: null, brodcastedTo: [], cancelReason: "No delivary partner available", cancelBy: admin.role } }
            )

            await DELIVARY.findOneAndDelete({ orderGroupId: groupId, shopDetails: shop._id })
            await orderCancelationMessage(ordererEmail, shopName, ordererName, foodDetails, "No delivary partner available", payment, paymentMod, totalPrice)
        }

        let updatedOrders = await ORDER.find({ orderGroupId: groupId, shopDetails: shop._id })
            .sort({ createdAt: -1 })
            .populate("orderedBy", "fullname email role address pincode phone socketId available image")
            .populate("foodDetails", "foodname price category foodtype paymentMethod quantity description isAvailable")
            .populate("shopDetails", "_id shopGeoLocation shopname email description location phone city state owner")
            .populate({
                path: "assignment",
                populate: { path: "assignto", select: "fullname email phone location socketId" }
            })
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available role"
                }
            })

        // IO data send :
        let io = req.app.get("io")
        if (io) {
            let orderst = updatedOrders?.map(i => i?.orderStatus)[0]
            let paymentst = updatedOrders?.map(i => i?.payment)[0]
            let orderGPid = updatedOrders?.map(i => i?.orderGroupId)[0]
            let updatedAt = updatedOrders?.map(i => i?.updatedAt)[0]

            let formattedTime = new Date(updatedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
            })
            let userSocketId = updatedOrders?.map(i => i?.orderedBy?.socketId?.toString())[0]
            if (userSocketId) {
                io.to(userSocketId).emit("userOrderData", {
                    orderStatus: orderst,
                    paymentStatus: paymentst,
                    role: admin.role,
                    cancelReason: cancelReason || "No delivary partner available",
                    updateTime: formattedTime,
                    orderGroupId: orderGPid
                })
            }
        }

        let grouped = {}
        updatedOrders.forEach(async (order) => {
            let gId = order.orderGroupId.toString()
            if (!grouped[gId]) grouped[gId] = { items: [] }
            grouped[gId].items.push(order)
        })

        return res.status(200).json({
            message: "Order status updated successfully",
            orders: Object.values(grouped),
            success: true
        })

    } catch (error) {
        console.log("Update Order Status Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//Delete Order : 
export let DeleteUserOrderById = async (req, res) => {
    try {
        let orderId = req.params.id

        let deleteOrder = await ORDER.findByIdAndDelete(orderId);
        if (!deleteOrder) {
            return res.status(400).json({
                message: "Order not found",
                success: false,
            })
        }

        return res.status(200).json({
            message: "order deleted successfully",
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

//update order address : [for user]
export let updateOrderAddress = async (req, res) => {
    try {
        let orderId = req.params.id;
        let userId = req.id;
        let { address, pincode } = req.body;

        let user = await USER.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let order = await ORDER.findById(orderId);
        if (!order) {
            return res.status(400).json({
                message: "Order not found",
                success: false
            })
        }

        if (address) {
            order.address = address,
                user.address = address
        }

        if (pincode) {
            order.pincode = pincode,
                user.pincode = pincode
        }

        await user.save();
        await order.save();

        return res.status(200).json({
            message: "Order address updated successfully",
            user: {
                address: user.address,
                pincode: user.pincode
            },
            order: {
                address: order.address,
                pincode: order.pincode
            },
            success: CSSPositionTryRule
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}




// user_side all order get : [pending / preparing / out for delivary / (picked up and on_the_way)  order]  [pagination]:
export let userOrders = async (req, res) => {
    try {
        let userId = req.id
        let { page, limit, query } = req.query
        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let skip = ((page - 1) * limit)


        let commonMatch = {
            $expr: {
                $eq: ["$orderedBy", { $toObjectId: req.id }]
            },
            payment: {
                $in: [true, false]
            },
            orderStatus: {
                $in: ["pending", "preparing", "out for delivary" , "picked up and on_the_way"]
            }
        }

        //order aggrigate pipeline : [get user pending / preparing / out for delivary / picked up and on_the_way : unique orders(same orderGroupId order's)]
        let uniqueOrders = await ORDER.aggregate([
            {
                $match: commonMatch
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$orderGroupId",
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])

        //unique order's groupIds :
        let totalOrderCount = await ORDER.aggregate([
            { $match: commonMatch },
            { $group: { _id: '$orderGroupId' } },
            { $count: "total" }
        ])

        let totalOrderLength = totalOrderCount[0]?.total || 0    //total (pending/preapring/out for delivary) food count 
        let totalPendingPages = Math.ceil(totalOrderLength / limit) //total pages

        let uniqueOrderIds = uniqueOrders?.map(i => i?._id)

        // page validation
        if (totalPendingPages > 0 && page > totalPendingPages) {
            page = totalPendingPages
        }


        let orders = await ORDER.find({
            orderGroupId: { $in: uniqueOrderIds }
        }).populate("foodDetails", "foodname price image category description isAvailable foodtype")
            .populate("orderedBy", "fullname email phone location role address pincode")
            .populate("assignment", "paymentStatus fullname email socketId available")
            .populate("shopDetails", "shopGeoLocation shopname email description location phone city state owner")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })
            .sort({ createdAt: -1 })

        let grouped = {}
        orders.forEach(order => {
            let groupId = order.orderGroupId.toString()
            if (!grouped[groupId]) {
                grouped[groupId] = {
                    orderGroupId: groupId,
                    items: []
                }
            }
            grouped[groupId].items.push(order)
        })

        return res.status(200).json({
            page,
            totalPendingPages,
            hasPrev: page > 1,
            hasNext: page < totalPendingPages,
            totalRestaurants: Object.keys(grouped).length,
            userOrder: Object.values(grouped),
            success: true
        })

    } catch (error) {
        console.log("Order error:", error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//user get [cancel and compleate order's]  [pagination / sorting / searching]
export let userCancelAndCompleateorder = async (req, res) => {
    try {
        let userId = req.id
        let { page, query, limit, sort } = req.query

        page = parseInt(page) || 1
        limit = parseInt(limit) || 20
        let skip = ((page - 1) * limit)

        // Search order functionality :
        let foodId = []
        let ordersIds = []  // [login user's (cancel or compleate order's) orderGroupId stored here] :

        if (query?.trim()) {

            let [FOODs, ORDERs] = await Promise.all([

                FOOD.find({
                    foodname: { $regex: query.trim().replace(/\s+/g, "\\s*"), $options: 'i' }
                }).select("_id").lean(),

                ORDER.find({
                    orderedBy: userId,
                    orderStatus: { $in: ["compleate", "cancel"] },
                    ...(query?.trim() && {
                        $or: [
                            { paymentMethod: { $regex: query, $options: 'i' } }
                        ]
                    })
                }).select("_id paymentMethod orderGroupId")

            ])

            foodId = FOODs.map(i => i?._id)
            ordersIds = ORDERs.map(i => i?.orderGroupId)
        }

        //common matches for paginatated orders and total order count :
        let commonMatch = {
            $expr: {
                $eq: ["$orderedBy", { $toObjectId: req.id }]
            },
            payment: { $in: [true, false] },
            orderStatus: { $in: ["cancel", "compleate"] },
            ...(query?.trim() && {
                $or: [
                    { foodDetails: { $in: foodId } },
                    { orderGroupId: { $in: ordersIds } }
                ]
            })
        }

        //same order's with unique groupId :
        let uniqueCancelOrders = await ORDER.aggregate([
            {
                $match: commonMatch
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$orderGroupId",
                    createdAt: {
                        $first: "$createdAt"
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])

        //let total cancel and compleate order count :
        let totalCancelOrders = await ORDER.aggregate([
            { $match: commonMatch },
            { $group: { _id: '$orderGroupId' } },
            { $count: 'total' }
        ])

        let cancelOrderCount = totalCancelOrders[0].total || 0
        let totalCancelOrderpages = await Math.ceil(cancelOrderCount / limit)

        //skiped order id [orderGroupId]
        let skipedOrderIds = uniqueCancelOrders?.map(i => i?._id)

        page = Math.min(page, totalCancelOrderpages || 1)

        let userCancelOrders = await ORDER.find({
            orderGroupId: { $in: skipedOrderIds },
        }).populate("foodDetails", "foodname price").populate("orderedBy", "fullname pincode phone")


        //order grouped by orderId :
        let grouped = {}
        userCancelOrders.forEach(i => {
            let groupId = i?.orderGroupId?.toString()

            if (!grouped[groupId]) {
                grouped[groupId] = {
                    items: [],
                    totalPrice: 0
                }
            }

            grouped[groupId].items.push(i)
            grouped[groupId].totalPrice += (i?.foodDetails?.price || 0) * (i?.quantity || 1)
        })

        //sorting functionality :
        let result = Object.values(grouped)

        if (sort === "lth") {
            result.sort((a, b) => a?.totalPrice - b?.totalPrice)
        } else if (sort === "lth") {
            result.sort((a, b) => b?.totalPrice - a?.totalPrice)
        } else if (sort === "oldest") {
            result.sort(
                (a, b) => new Date(a.items[0]?.createdAt) - new Date(b.items[0]?.createdAt)
            )
        } else if (sort === "newest") {
            result.sort(
                (a, b) => new Date(b.items[0]?.createdAt) - new Date(a.items[0]?.createdAt)
            )
        } else if (sort === "cod") {
            result = result.filter(
                i => i.items[0]?.paymentMethod?.toLowerCase() === "cod"
            )
        } else if (sort === "online") {
            result = result.filter(
                i => i.items[0]?.paymentMethod?.toLowerCase() === "online"
            )
        }


        return res.status(200).json({
            page,
            totalCancelOrderpages,
            hasPrev: page > 1,
            hasNext: page < totalCancelOrderpages,
            cancelorders: result,
            success: true
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error from user cancel and compleate order api" })
    }
}

// find userOrder By groupId [shop id se shop ke order get karne hai] 
export let getUserOrderById = async (req, res) => {
    try {
        let orderGroupId = req.params.id

        let orderDetails = await ORDER.find({ orderGroupId: orderGroupId })
            .populate("orderedBy", "fullname email phone pincode address location")
            .populate("shopDetails", "shopname email phone state location city owner")
            .populate("foodDetails", "foodname price description category image isAvailable foodtype")
            .populate("assignment", "paymentStatus")
            .populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })
            .populate({
                path: "assignment",
                select: "paymentStatus",
                populate: {
                    path: "assignto",
                    select: "fullname email phone socketId available"
                }
            })

        if (!orderDetails) {
            return res.status(400).json({
                message: "Order not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Order data fetched successfully",
            orderDetails,
            success: true
        })

    } catch (error) {
        console.log("Order error:", error)
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

//[Admins] can get orders from user [by food id] : [wrong api]
export let getUserOrders = async (req, res) => {
    try {
        let foodId = req.params.id

        let food = await FOOD.findById(foodId)
        if (!food) {
            return res.status(404).json({
                message: "Food not found",
                success: false
            })
        }

        let details = await ORDER.find({ foodDetails: foodId })
            .populate("orderedBy", "fullname email phone role")
            .populate("foodDetails", "foodname price category")

        //User order details in order model
        let userOrderDetails = details.map((data) => ({
            OrderedBy: data.orderedBy,
            quantity: data.quantity,
            orderStatus: data.orderStatus,
            paymentMethod: data.paymentMethod
        }))

        //Food Details in order model:
        let foodDetails = {
            name: food.foodname,
            price: food.price,
            description: food.description,
            category: food.category,
            foodType: food.foodtype,
            image: food.image
        }

        return res.status(200).json({
            message: "Order details",
            userOrderDetails,
            foodDetails,
            success: true
        })

    } catch (error) {
        console.log("Order error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
}

// user can cancel order [when orderStatus is pending and preparing] :
export let userCancelation = async (req, res) => {
    try {
        let orderGroupId = req.params.id
        let userId = req.id
        let { orderStatus } = req.body
        let { cancelReason } = req.body

        let user = await USER.findById(userId);
        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        let userOrder = await ORDER.find({ orderGroupId: orderGroupId, orderedBy: user._id })

        if ((userOrder?.[0]?.orderStatus === "pending" || userOrder?.[0]?.orderStatus === "preparing") && orderStatus === "cancel") {
            await ORDER.updateMany({ orderGroupId: orderGroupId, orderedBy: user._id },
                { $set: { orderStatus: orderStatus, cancelReason: cancelReason, cancelBy: user.role } })
        } else {
            return res.status(400).json({
                message: "You can't cancel this order now",
                success: false
            })
        }


        let order = await ORDER.find({ orderGroupId: orderGroupId, orderedBy: user._id })
            .populate("orderedBy").populate("shopDetails").populate("foodDetails").populate({
                path: "shopDetails",
                populate: {
                    path: "owner",
                    select: "_id fullname socketId available"
                }
            })

        let io = req.app.get("io")
        if (io) {
            let ownerSocketId = order.map(i => i?.shopDetails?.owner?.socketId);
            io.to(ownerSocketId).emit("orderCancelation", {
                paymentStatus: order?.map(i => i?.payment)[0],
                orderGroupId: orderGroupId,
                role: user.role || "user",
                cancelReason: cancelReason,
                orderStatus: orderStatus
            })
        }

        return res.status(200).json({
            message: "Order canceled successfully",
            order,
            success: true
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Problem in user cancel order api",
            success: false
        })
    }
} 