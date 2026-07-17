import React, { useEffect, useEffectEvent, useState } from 'react'
import getAllUserOrder from '../User Hooks/getAllUserOrder'
import { useDispatch, useSelector } from 'react-redux';
import UserNav from '../Component/UserNav';
import { HiDotsHorizontal } from 'react-icons/hi';
import { replace, useNavigate } from 'react-router-dom';
import { Loader2, User } from 'lucide-react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { setSearchUserOrderByText, setUserOrderData, setUserPendingOrderCurrentPage } from '../Redux/orderSlice';

const UserAllOrders = () => {
    getAllUserOrder()

    let navigate = useNavigate()
    let dispatch = useDispatch()
    let { userOrderData, userOrderLoading, searchUserOrderByText, userPendingOrderTotalPages, userPendingOrderCurrentPage, userPendingOrderHasPrev, userPendingOrderHasNext } = useSelector(state => state.order)
    let { socket } = useSelector(state => state.user)


    //Io geting user order status or groupId :
    useEffect(() => {
        let handleOrderUpdate = (data) => {
            let updatedOrders = userOrderData.map(order =>
                order.orderGroupId === data.orderGroupId
                    ? { ...order, items: order.items.map(item => ({ ...item, payment: data.paymentStatus, orderStatus: data.orderStatus, cancelReason: data.cancelReason || "" })) }
                    : order)
            dispatch(setUserOrderData(updatedOrders))
        }

        //from shop admin to user : 
        socket.on("userOrderData", handleOrderUpdate)

        //From DelivaryBoy to user :
        socket.on("userOrderStatus", handleOrderUpdate)

        return () => {
            socket.off("userOrderData", handleOrderUpdate)
            socket.off("userOrderStatus", handleOrderUpdate)
        }

    }, [socket, userOrderData])

    //form array of totalpage :
    let totalPages = Array.from({ length: userPendingOrderTotalPages }, (_, i) => i + 1)

    //URL handling :
    useEffect(() => {
        navigate(`/userorders?page=${userPendingOrderCurrentPage}`), { replace: true }
    }, [userPendingOrderCurrentPage])

    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>

            <div className='lg:mx-20 sticky top-18 lg:top-18 mt-3 lg:mt-3 flex-col justify-between z-100 bg-white items-center mb-3 lg:mb-0 px-0 py-5 lg:px-0 lg:py-5'>
                <div className='flex items-center justify-between mb-3 lg:mb-0'>
                    <div className='text-2xl font-bold'><span className='ml-2 lg:ml-0'> Your Orders :</span></div>

                    <div
                        onClick={() => navigate("/previoususerorder")}
                        className="relative mr-3 lg:mr-0 overflow-hidden rounded-md border border-red-300 px-4 py-1 text-lg font-normal text-red-500 cursor-pointer transition-all duration-500 hover:bg-red-500 hover:text-white active:scale-93"
                    >
                        <span className="relative z-10">Previous Orders</span>
                    </div>
                </div>
            </div>

            <div className='lg:mx-20 mt-6 lg:mt-7  mb-5 lg:mb-10 pb-7'>
                <div className="ml-3 lg:ml-0 mr-3 lg:mr-0 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2 text-left">Date</th>
                                <th className="border px-4 py-2 text-left">Customer</th>
                                <th className="border px-2 py-2 text-left">Food_Item</th>
                                <th className="border px-2 py-2 text-left">Quantity</th>
                                <th className="border px-2 py-2 text-left ">Total_Price</th>
                                <th className="border px-1 py-2 text-left">Pay_MOD</th>
                                <th className="border px-1 py-2 text-left">Pay_status</th>
                                <th className="border px-1 py-2 text-left">Order_Status</th>
                                <th className="border px-2 py-2 text-left">View_Details</th>
                            </tr>
                        </thead>

                        <tbody>
                            {userOrderData.length > 0 ?
                                userOrderData?.map((order, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="border px-4 py-2"> {new Date(order.items[0]?.updatedAt || order.createdAt || "Null").toLocaleDateString()} </td>

                                            <td className="border px-4 py-2"> {order.items[0]?.orderedBy.fullname || "Null"} </td>
                                            {/* <td className="border px-4 py-2"> {order.items[0]?.orderedBy.address} </td> */}

                                            <td className="border px-4 py-2">
                                                {order.items?.map((item, i) => (
                                                    <div key={i}>
                                                        {item.foodDetails.foodname || "Null"}
                                                    </div>
                                                ))}
                                            </td>

                                            <td className="border px-1 py-2">
                                                {order.items?.map((item, i) => (
                                                    <div key={i}>
                                                        qty : {item.quantity || "Null"} x {item.foodDetails.price || "Null"} =  {item.quantity * item.foodDetails.price || "Null"}
                                                    </div>
                                                ))}
                                            </td>

                                            <td className="border px-5 py-2">
                                                <div className="flex gap-1 font-medium text-gray-700">
                                                    <span className="font-semibold">₹</span>
                                                    <span> {order.items?.reduce((total, item) => total + (item.foodDetails.price * item.quantity), 0) || "Null"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="border px-2 py-2 "> {order.items[0]?.paymentMethod || "Null"} </td>

                                            <td className="p-2 text-center border">
                                                <span
                                                    className={`flex items-center justify-center px-2 py-1 rounded-xl text-xs font-medium border ${order?.items?.[0]?.payment === true || order?.items?.[0]?.payment === "paid" ? "bg-green-200 text-green-700 border border-green-500" : "bg-yellow-200 text-[brown]/90 border-[brown]/70"}`}
                                                >
                                                    {order?.items?.[0]?.payment === true || order?.items?.[0]?.payment === "paid" ? "Paid" : "Pending"}
                                                </span>
                                            </td>

                                            <td className="p-2 text-center border">
                                                <span className={`flex items-center justify-center px-2 py-1 rounded-xl text-xs font-medium border ${order?.items?.[0]?.orderStatus === "pending"
                                                    ? "bg-yellow-200 text-[brown]/90 border-[brown]/70"
                                                    : order?.items?.[0]?.orderStatus === "cancel"
                                                        ? "text-red-600 bg-red-200 border border-red-400 "
                                                        : order?.items?.[0]?.orderStatus === "out for delivary"
                                                            ? "bg-blue-200 text-blue-600 border-blue-500"
                                                            : order?.items?.[0]?.orderStatus === "preparing"
                                                                ? "bg-purple-200 text-purple-600 border-purple-500"
                                                                : order?.items?.[0]?.orderStatus === "picked up and on_the_way"
                                                                    ? "bg-cyan-100 text-cyan-800 border border-cyan-500"
                                                                    : "bg-green-200 text-green-700 border border-green-500"}`}>
                                                    {order?.items?.[0]?.orderStatus}
                                                </span>
                                            </td>

                                            <td className="border px-2 py-2 text-center align-middle">
                                                <div className="flex justify-center items-center">
                                                    <button
                                                        onClick={() => navigate(`/userorderdetails/${order.items[0]?.orderGroupId}`)}
                                                        className="p-2 rounded-full hover:bg-red-50 active:scale-95 transition-all duration-200 cursor-pointer"
                                                    >
                                                        <HiDotsHorizontal size={20} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    )
                                }) : <tr><td colSpan="10" className="text-center py-4 border">No orders found</td></tr>}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Pagination */}
            {userPendingOrderTotalPages > 1 &&
                <div className='mx-2 lg:mx-20 fixed bottom-0 left-0 right-0 border-t border-black bg-white z-50 py-2'>
                    <div className='w-full flex gap-2 items-center justify-center px-2 lg:px-20'>

                        <button
                            disabled={userOrderLoading || !userPendingOrderHasPrev}
                            onClick={() => { dispatch(setUserPendingOrderCurrentPage(userPendingOrderCurrentPage - 1)) }}
                            className={`mr-1 lg:mr-0 px-2 py-3 border border-red-200 rounded-xl ${!userPendingOrderHasPrev ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
                        >
                            <FaAngleLeft />
                        </button>

                        <div className='flex gap-2 overflow-x-auto whitespace-nowrap'>
                            {totalPages.map(i => (
                                <div key={i} className='shrink-0'>
                                    <button
                                        disabled={userOrderLoading || userPendingOrderCurrentPage === i}
                                        onClick={() => dispatch(setUserPendingOrderCurrentPage(i))}
                                        className={`border border-red-200 px-3 py-2 rounded-xl cursor-pointer ${userPendingOrderCurrentPage === i ? "bg-orange-500 text-white" : "bg-white"}`}
                                    >
                                        {userOrderLoading && userPendingOrderCurrentPage === i ? <Loader2 className='h-6 w-2 animate-spin' /> : i}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={userOrderLoading || !userPendingOrderHasNext}
                            onClick={() => {
                                dispatch(setUserPendingOrderCurrentPage(userPendingOrderCurrentPage + 1))
                            }}
                            className={`ml-1 lg:ml-0 px-2 py-3 border border-red-200 rounded-xl ${!userPendingOrderHasNext ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                        >
                            <FaAngleRight />
                        </button>

                    </div>
                </div>
            }

        </>
    )
}

export default UserAllOrders
