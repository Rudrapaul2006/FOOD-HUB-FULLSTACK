import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { getPendingOrders } from '../Hooks/useGetOrders'

const multipleOrderSocket = () => {
    let dispatch = useDispatch()
    let {  socket } = useSelector(state => state.user)
    let { currentPage } = useSelector(state => state.order)

    useEffect(() => {
        if (!socket) return

        let handleMultipleOrders = async (data) => {

            let audio = new Audio("/fahhh_KcgAXfs.mp3")
            audio.play().catch(() => {})

            toast.success("New Orders Arrived 🚀", {
                position: "top-right",
                style: {
                    background: "#333",
                    border: "1px solid orange",
                    color: "#fff",
                    fontWeight: "bold",
                    borderRadius: "8px",
                    padding: "10px"
                }
            })

            await getPendingOrders(dispatch, currentPage)
        }

        socket.on("multipleshopOrder", handleMultipleOrders)

        return () => {
            socket.off("multipleshopOrder", handleMultipleOrders)
        }

    }, [socket, dispatch, currentPage])

    return null
}

export default multipleOrderSocket