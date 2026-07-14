import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUserOrderData, setUserOrderLoading, setUserPendingOrderCurrentPage, setUserPendingOrderHasNext, setUserPendingOrderHasPrev, setUserPendingOrderTotalPages } from '../Redux/orderSlice';

const getAllUserOrder = () => {
    let dispatch = useDispatch()
    let { userData } = useSelector(state => state.user)
    let { userPendingOrderCurrentPage } = useSelector(state => state.order)

    useEffect(() => {
        if (userData?.user?.role !== "user") return;
        if (!userData) return;

        let fetchUserOrders = async () => {
            dispatch(setUserOrderLoading(true))
            try {
                let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/userpendingorderget?page= ${userPendingOrderCurrentPage}`, { withCredentials: true })
                if (res.data.success) {
                    dispatch(setUserOrderData(res.data.userOrder))
                    dispatch(setUserPendingOrderTotalPages(res.data.totalPendingPages))
                    dispatch(setUserPendingOrderHasPrev(res.data.hasPrev))
                    dispatch(setUserPendingOrderHasNext(res.data.hasNext))

                    if (res.data.page !== userPendingOrderCurrentPage) {
                        dispatch(setUserPendingOrderCurrentPage(res.data.page))
                    }
                }
            } catch (error) {
                dispatch(setUserOrderData([]))
            } finally {
                dispatch(setUserOrderLoading(false))
            }
        }

        fetchUserOrders()

    }, [dispatch, userData, userPendingOrderCurrentPage])
}

export default getAllUserOrder
