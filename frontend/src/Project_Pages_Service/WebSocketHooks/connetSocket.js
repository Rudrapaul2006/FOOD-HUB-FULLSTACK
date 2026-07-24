import { io } from 'socket.io-client'

let socket = null

export let connectSocket = (userId) => {
    if (!socket) {
        socket = io(import.meta.env.VITE_serverUrl, { withCredentials : true })

        socket.on("connect", () => {
            socket.emit("identity", { userId })
        })
    }

    return socket
}

export let getSocket = () => socket

export let disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null
  }
}