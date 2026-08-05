import { USER } from "../Models/user.model.js"
import { SHOP } from "../Models/shop.model.js"
import { ORDER } from "../Models/order.model.js"
import { DELIVARY } from "../Models/delivary.model.js"

export let socketIO = (io) => {
    io.on("connection", (socket) => {

        socket.on("identity", async ({ userId }) => {
            try {
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
        socket.on("joinAssignmentRoom", (assignmentId) => {
            if (!assignmentId) return

            socket.join(assignmentId)
            console.log(`Socket ${socket.id} joined room: ${assignmentId}`)
        })

        // Delivary Boy live location fetch and send to room user :
        socket.on("delivaryBoyLiveLocation", (data) => {
            if (!data?.assignmentId) return

            socket.to(data.assignmentId).emit("delivaryBoyLocation", {
                latitude: data?.latitude,
                longitude: data?.longitude,
                delivaryBoyId: data?.delivaryBoyId,
                assignmentId: data?.assignmentId,
                delivaryBoyName: data?.delivaryBoyName,
                delivaryBoyPhone: data?.delivaryBoyPhone
            })
        })

        socket.on("disconnect", async () => {
            try {
                setTimeout(async () => {
                    let user = await USER.findOne({ socketId: socket.id })
                    if (!user) return// Refresh ho gaya hoga aur naya socketId save ho chuka hoga

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