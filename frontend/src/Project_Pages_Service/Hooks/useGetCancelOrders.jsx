import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCancelOrder, setCancelOrderHasNext, setCancelOrderHasPrev, setCancelOrderLoading, setCancelOrderTotalPage } from '../Redux/orderSlice'

const useGetCancelOrders = () => {
    let dispatch = useDispatch()
    let { userData } = useSelector(state => state.user)
    let { cancelOrderCurrentPage , cancelOrderQuery } = useSelector(state => state.order)
    let { shopData } = useSelector(state => state.admin)   

    useEffect(() => {
        if (userData?.user?.role !== "admin") return;

        let getCancelAndCompleateOrder = async () => {
            try {
                dispatch(setCancelOrderLoading(true))

                let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/getcancelorder?page=${cancelOrderCurrentPage}&&query=${cancelOrderQuery}`, { withCredentials: true })

                if (res.data.success) { 
                    dispatch(setCancelOrder(res.data.cancelTotalOrders)) //[all cancel and compleate order stored here]
                    dispatch(setCancelOrderTotalPage(res.data.totalPages)) //[admin side cancel and compleate order totalPage]
                    dispatch(setCancelOrderHasPrev(res.data.hasPrev)) //[admin side cancel and compleate order totalPage (has previous page ?)]
                    dispatch(setCancelOrderHasNext(res.data.hasNext)) //[admin side cancel and compleate order totalPage (has next page ?)]
                }

            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setCancelOrderLoading(false))
            }
        }

        getCancelAndCompleateOrder()

    }, [dispatch, userData , shopData , cancelOrderCurrentPage , cancelOrderQuery ])
    
}

export default useGetCancelOrders
