import jwt from "jsonwebtoken"
import { USER } from "../Models/user.model.js"
import { SHOP } from "../Models/shop.model.js"
import { ORDER } from "../Models/order.model.js"
import { DELIVARY } from "../Models/delivary.model.js"
import chalk from "chalk"

export let socketIO = (io) => {

    // JWT auth middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            let token = socket.handshake.auth?.token

            if (!token && socket.handshake.headers?.cookie) {
                let cookieHeader = socket.handshake.headers.cookie;
                let match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/)
                if (match) token = match[1]
            }

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            let decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.id) {
                return next(new Error("Authentication error: Invalid token"));
            }

            let user = await USER.findById(decoded.id)
            // if (!user) {
            //     return next(new Error("Authentication error: User not found"));
            // }
            // console.log(chalk.greenBright(`Socket connected: ${user.fullname} (ID: ${user._id}, Role: ${user.role})`))

            socket.data.userId = decoded.id
            socket.data.role = user.role
            socket.data.fullname = user.fullname
            socket.data.socketId = user.socketId

            next()

        } catch (error) {
            console.error("Socket authentication failed : ", error.message);
            return next(new Error("Authentication error"));
        }
    })


    io.on("connection", (socket) => {

        socket.on("identity", async () => {
            try {
                let userId = socket.data.userId;
                if (!userId) return;

                let user = await USER.findOne({ _id: userId })
                if (!user) return;

                user.socketId = socket.id
                user.available = "yes"  //// => {user login then user available = yes } {user login api}
                await user.save()

                let shop = await SHOP.findOne({ owner: user._id })

                if (shop) {
                    shop.socketOpen = "yes"
                    await shop.save()

                    io.emit("updateShopStatus", {
                        shopId: shop._id,
                        socketOpen: "yes",
                        shopname: shop.shopname
                    })
                }

                // console.log("connected user name : ", user.fullname, "\n", "available : ", user.available, "\n", "SocketID :", user.socketId, "\n", "userRole :", user.role)

            } catch (error) {
                console.log(error)
            }
        })

        // Connect the specific user and delivery boy to the same Socket.IO room using their shared assignment ID
        socket.on("joinAssignmentRoom", async (assignmentId) => {
            if (!assignmentId) return;

            try {
                let userId = socket.data.userId;
                if (!userId) return;

                // Authorization check: verify userId's matches order's user/shop/deliveryBoy
                let isAuthorized = false;

                let assignment = await DELIVARY.findById(assignmentId).populate("shopDetails")
                if (assignment) {
                    let isCustomer = assignment?.orderedBy?.toString() === userId.toString()
                    let isDeliveryBoy = assignment?.assignto?.toString() === userId.toString()
                    let isShopOwner = assignment?.shopDetails?.owner?.toString() === userId.toString()
                    if (isCustomer || isDeliveryBoy || isShopOwner) {
                        isAuthorized = true;
                    }
                }

                if (!isAuthorized) {
                    let order = await ORDER.findOne({ $or: [{ _id: assignmentId }, { assignment: assignmentId }] }).populate("shopDetails")

                    if (order) {
                        let isCustomer = order?.orderedBy?.toString() === userId.toString();
                        let isDeliveryBoy = order?.assignedDelivaryBoy?.toString() === userId.toString();
                        let isShopOwner = order?.owner?.toString() === userId.toString() || order?.shopDetails?.owner?.toString() === userId.toString();
                        if (isCustomer || isDeliveryBoy || isShopOwner) {
                            isAuthorized = true;
                        }
                    }
                }

                if (isAuthorized) {
                    socket.join(assignmentId)
                    // console.log(`Socket ${socket.id} (user ${userId}) authorized and joined room: ${assignmentId}`)
                } else {
                    console.warn(`Unauthorized room join attempt by user ${userId} for room ${assignmentId}`)
                }
            } catch (error) {
                console.error("Error verifying room authorization:", error)
            }
        })

        // Delivery Boy live location fetch and send to room user with status gate & 2s server-side throttling:
        socket.on("delivaryBoyLiveLocation", async (data) => {
            if (!data?.assignmentId) return;

            try {
                let delivaryBoyId = socket.data.userId;
                if (!delivaryBoyId) return;

                // Server-side throttle: drop updates <2s apart per socket
                let now = Date.now();
                if (socket.data.lastLocationTime && (now - socket.data.lastLocationTime < 2000)) {
                    return;
                }
                socket.data.lastLocationTime = now;

                // Fetch order status and assigned order status (brodcasted or assigned) from DB :
                let order = await ORDER.findOne({ $or: [{ assignment: data.assignmentId }, { _id: data.assignmentId }] })
                let assignment = await DELIVARY.findById(data.assignmentId)

                if (!order || !assignment) return;

                // Status gate: only relay location if status is picked up / on the way
                let status = order?.orderStatus ? order.orderStatus.toLowerCase() : ""
                let isPickedUp = status === "picked up and on_the_way"

                //location data :
                let locationData = {
                    latitude: data?.latitude,
                    longitude: data?.longitude,

                    delivaryBoyId: delivaryBoyId, // Using verified token userId
                    assignmentId: data?.assignmentId,
                    delivaryBoyName: data?.delivaryBoyName,
                    delivaryBoyPhone: data?.delivaryBoyPhone
                } 

                // save delivary boy live location to DB :
                let delivaryBoy = await USER.findById(delivaryBoyId)
                if (delivaryBoy) {
                    delivaryBoy.location = {
                        type: "Point",
                        coordinates: [data?.longitude, data?.latitude]
                    }
                    await delivaryBoy.save()
                }   

                // Socket id of each member in the room (same orderId room) :
                let roomSockets = io.sockets.adapter.rooms.get(data.assignmentId)
                if (!roomSockets || roomSockets.size === 0) return;

                for (let socketId of roomSockets) {
                    let roomSocket = io.sockets.sockets.get(socketId) // Get rooms each member socket id (user/delivery boy/shop owner)

                    // console.log(chalk.green(roomSocket.data.fullname , "and socket id : ", roomSocket.data.socketId, "and role : ", roomSocket.data.role, "and assignmentId : ", data.assignmentId));
                                        
                    if (roomSocket) {
                        // If order status is (out for delivary) and the assignment of that order is (asigned) then send location to shop owner :
                        if (!isPickedUp && assignment?.status === "asigned") {
                            if (roomSocket.data.role === "admin") {
                                roomSocket.emit("delivaryBoyLocation", locationData)
                            }
                        }
                        // If order status is (picked up and on the way) then send location to customer and shop owner :
                        else if (isPickedUp && order?.orderStatus !== "compleate") {
                            roomSocket.emit("delivaryBoyLocation", locationData)
                        }
                    }
                }

            } catch (error) {
                console.error("Error in delivaryBoyLiveLocation handler:", error);
            }
        })

        socket.on("disconnect", async () => {
            try {
                setTimeout(async () => {
                    let user = await USER.findOne({ socketId: socket.id })
                    if (!user) return

                    user.socketId = null
                    user.available = "no"
                    await user.save()

                    let shop = await SHOP.findOne({ owner: user._id })

                    if (shop) {
                        shop.socketOpen = "no"
                        await shop.save()

                        io.emit("updateShopStatus", {
                            shopId: shop._id,
                            socketOpen: "no",
                            shopname: shop.shopname
                        })
                    }

                }, 2000)

            } catch (error) {
                console.log(error);
            }
        })

    })
}   