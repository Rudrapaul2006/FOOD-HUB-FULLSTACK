import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import useGetPendingOrders from '../Hooks/useGetOrders'
import { getSocket } from './connetSocket'

const SingleOrderSocket = () => {
    let dispatch = useDispatch()

    let socket = getSocket()
    let { userData} = useSelector(state => state.user)
    let { currentPage } = useSelector(state => state.order)

    let getPendingOrders = useGetPendingOrders()

    useEffect(() => {
        if (!socket) return
        
        if(userData?.user?.role !== "admin") return

        let handleNewOrder = async (data) => {
            if (data) {
                let audio = new Audio("/fahhh_KcgAXfs.mp3")
                audio.play().catch(() => { })

                toast.success("New Order Arrived 🚀", {
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
            }

            // Refetch API
            // Refetch pending orders + pagination data
            await getPendingOrders(dispatch, currentPage)
        }

        socket.on("newOrder", handleNewOrder)

        return () => {
            socket.off("newOrder", handleNewOrder)
        }

    }, [socket, currentPage, dispatch])

    return null
}

export default SingleOrderSocket