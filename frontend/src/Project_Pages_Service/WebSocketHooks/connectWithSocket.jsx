import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { setSocket } from '../Redux/userSlice'

const connectWithSocket = () => {

    let { userData, socket } = useSelector(state => state.user)
    let dispatch = useDispatch()

    useEffect(() => {
    if (!userData) return;

    let socketInstance = io(import.meta.env.VITE_serverUrl, { withCredentials: true })

    dispatch(setSocket(socketInstance))

    socketInstance.on("connect", () => {
        socketInstance.emit("identity", { userId: userData?.user?._id })
    })

    return () => {
        socketInstance.disconnect();
    }
}, [userData?.user?._id])
}

export default connectWithSocket
