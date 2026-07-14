import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUserCancelOrderCurrentPage, setUserCancelOrderHasNext, setUserCancelOrderHasPrev, setUserCancelOrderLoading, setUserCancelOrders, setUserCancelOrderTotalPage } from '../Redux/orderSlice'

const getCancelAndCompleateOrders = () => {
    let dispatch = useDispatch()
    let { userData } = useSelector(state => state.user)
    let {userCancelOrderCurrentPage , searchUserOrderByText , sortUserCancelOrder} = useSelector(state => state.order)
    
    if (userData?.user?.role !== "user") return;
    
    useEffect(() => {
        let fetchCancelAndCompleateOrder = async () => {
            try {
                dispatch(setUserCancelOrderLoading(true))
                let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/usercancelandcompleateorderget?page=${userCancelOrderCurrentPage}&query=${searchUserOrderByText}&sort=${sortUserCancelOrder}` , {withCredentials : true})

                if(res.data.success){
                    dispatch(setUserCancelOrders(res.data.cancelorders))
                    dispatch(setUserCancelOrderTotalPage(res.data.totalCancelOrderpages))
                    dispatch(setUserCancelOrderHasPrev(res.data.hasPrev))
                    dispatch(setUserCancelOrderHasNext(res.data.hasNext))
                     
                    if(res.data.page !== userCancelOrderCurrentPage){
                        dispatch(setUserCancelOrderCurrentPage(res.data.page))
                    }
                }
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setUserCancelOrderLoading(false))
            }
        }

        fetchCancelAndCompleateOrder()

    }, [dispatch , userData , userCancelOrderCurrentPage , searchUserOrderByText , sortUserCancelOrder])
}

export default getCancelAndCompleateOrders
