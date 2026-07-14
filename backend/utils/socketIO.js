import { USER } from "../Models/user.model.js"
import { SHOP } from "../Models/shop.model.js"

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
        });

    })
}   