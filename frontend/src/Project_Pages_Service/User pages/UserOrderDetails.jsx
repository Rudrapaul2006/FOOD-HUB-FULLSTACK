import React, { useEffect, useState } from 'react'
import UserNav from '../Component/UserNav'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const UserOrderDetails = () => {
    let params = useParams()
    let groupId = params.id
    let navigate = useNavigate()

    let [orderData, setOrderData] = useState([])
    let { socket } = useSelector(state => state.user)
    let [userOrderStatus, setUserOrderStatus] = useState([]) // socket data
    let [delivaryBoyData, setDelivaryBoyData] = useState(null) 

    let userOrder = useSelector(state => state.order)
    let status = orderData.map(i => i?.orderStatus)[0] || userOrder?.userOrderData?.map(i => i?.order?.map(j => j?.orderStatus)[0])

    let socketOrderStatus = userOrderStatus?.orderStatus
    let cancelReason = orderData?.map(i => i?.cancelReason)[0]
    let canceledBy = orderData?.map(i => i?.cancelBy)[0]


    //Let option for user to cancel the order :
    let cancelReasonOptions = [
        "Change of mind",
        "Found a better price elsewhere",
        "Want to change items or quantity",
        "Ordered by mistake",
        "Other Reason"
    ]

    let [showCancelReasonOptions, setShowCancelReasonOptions] = useState(false)
    let [selectedCancelReason, setSelectedCancelReason] = useState("")

    let singleOrderData = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/userorder/${groupId}`, { withCredentials: true })
            if (res.data.success) {
                setOrderData(res.data.orderDetails)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        singleOrderData()
    }, [])

    //let cancel the order :
    let cancelOrder = async (orderstatus) => {
        try {
            let res = await axios.put(`${import.meta.env.VITE_order_endpoint}/ordercancel/${groupId}`, { orderStatus: orderstatus, cancelReason: selectedCancelReason }, { withCredentials: true })
            if (res.data.success) {
                setOrderData(res.data.order)
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    //Io geting user order status or groupId :
    useEffect(() => {
        socket.on("userOrderData", data => {
            setUserOrderStatus(data)
        })

        //fromDelivary boy
        socket.on("userOrderStatus", data1 => {
            setUserOrderStatus(data1) 
        })

    }, [socket])

    //socket event for the delivary boy data : [assigned delivary boy]
    useEffect(() => {
        socket.on("delivaryBoyDetails", data => {
            setDelivaryBoyData(data)
        })

        return () => {
            socket.off("delivaryBoyDetails")
        }
    }, [socket])

    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>
            <div className='mt-8 lg:mx-20 lg:h-fit border rounded-lg flex flex-col md:flex lg:flex-row mb-5'>

                {/* Right Side */}
                <div className='flex flex-col p-5 gap-5 lg:w-[35%] lg:border-r-2'>
                    <div className='flex gap-5'>
                        <button onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-9 h-9 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                        >
                            <IoChevronBack size={20} />
                        </button>
                    </div>

                    <div className='flex flex-col lg:pb-0'>
                        <div className='text-2xl font-bold'>Shop Details</div>
                        <div className='mt-4 text-gray-800 font-semibold text-[16px] '>Shop Name</div>
                        <span className='font-normal text-sm text-gray-600'> {orderData?.[0]?.shopDetails?.shopname || "null"} </span>

                        <div className='mt-4 text-gray-800 font-semibold text-[16px] '>Phone</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'> {orderData?.[0]?.shopDetails?.phone || "null"} </span>

                        <div className='text-gray-800 font-semibold text-[16px] '>Email</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.email || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>Location</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.location || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>City </div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.city || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>State</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.state || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>Order Id</div>
                        <span className='font-normal text-sm text-gray-600'>{orderData?.[0]?.orderGroupId?.slice(-6) || "null"}</span>
                    </div>

                    {/* user can cancel the order */}
                    <div className='flex gap-5 lg:gap-15 items-center  mt-5'>
                        <div className='font-bold'>Cancel the order : </div>
                        <div>
                            {["cancel"].map((i, index) => {
                                return (
                                    <>
                                        <button
                                            disabled={status === "cancel" || status === "out for delivary" || status === "compleate" || socketOrderStatus === "out for delivary" || socketOrderStatus === "cancel" || socketOrderStatus === "compleate" }
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${status === "cancel" || status === "out for delivary" || status === "compleate" || socketOrderStatus === "out for delivary"
                                                || socketOrderStatus === "cancel"|| socketOrderStatus === "compleate" ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                                : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"}`} key={index}

                                            onClick={() => {
                                                setShowCancelReasonOptions(true)
                                                if (!selectedCancelReason) {
                                                    toast.message("Please choose one cancel reason")
                                                    return
                                                }
                                                cancelOrder(i, selectedCancelReason)
                                            }}>

                                            {i}
                                        </button>

                                        <div>
                                            {showCancelReasonOptions && (status !== "cancel") && (
                                                <select value={selectedCancelReason} onChange={(e) => setSelectedCancelReason(e.target.value)}
                                                    className="mt-2 px-1 py-1 border border-gray-300 rounded-sm shadow-sm text-sm cursor-pointer"
                                                >
                                                    <option value="">Cancel Reasons</option>
                                                    {cancelReasonOptions.map((op, index1) => {
                                                        return (
                                                            <>
                                                                <option key={index1} >{op}</option>
                                                            </>
                                                        )
                                                    })}
                                                </select>
                                            )}
                                        </div>

                                    </>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-1 rounded-xl text-sm font-medium shadow-sm">
                        You can cancel your order before the status changes to
                        <span className="font-semibold"> "Out for Delivery" </span>
                        or
                        <span className="font-semibold"> "Cancelled"</span>
                    </div>


                </div>

                {/* Left Side */}
                <div className='flex flex-col border-t-2 lg:border-none p-5 lg:px-8'>

                    <div className='text-3xl font-bold text-[#ff4d2d]'>{orderData?.[0]?.shopDetails?.shopname}</div>
                    <div className='mt-5 text-2xl font-bold'>Food Details</div>

                    <div className='mt-3 text-xl mb-5 font-semibold text-gray-800'>
                        Food Item
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm mb-7'>
                        {orderData?.length ? orderData.map((item, index) => (
                            <div key={index} className='bg-white border rounded-md p-3 lg:px-7 flex flex-col' >
                                <span className='text-md font-bold mb-2'><span>{item.foodDetails?.foodname || "null"}</span> <span>[{item.foodDetails?.category || "null"}]</span></span>
                                <span className='text-md font-normal text-gray-600'> Foodtype : <span className='text-red-500'>{item.foodDetails?.foodtype || "null"}</span> </span>
                                <span className='text-md font-normal text-gray-600'> Quantity : <span className='text-blue-500'>{item?.quantity || "null"}</span> items </span>
                                <span className='text-md font-normal text-gray-600'> Price : <span className='text-gray-800'>₹{item?.foodDetails?.price || "null"}</span> </span>
                            </div>)) : "null"}
                    </div>

                    <div className='flex flex-col lg:flex-row gap-5 lg:gap-25 mb-0 lg:mb-5 mt-0 lg:mt-3'>
                        <span className='text-md font-semibold'>Price : <span className='text-sm font-normal text-gray-800 '>{orderData?.map(i => (
                            <div className='mt-1 flex flex-col'>₹{i?.foodDetails?.price || "null"} * {i?.quantity || "null"} = {i?.foodDetails?.price * i?.quantity || "Null"} </div>
                        )) || "null"}  </span>
                        </span>

                        <div className='flex flex-col pb-3'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Total Price </div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>  ₹{orderData.map(i => (i?.quantity || 0) * (i?.foodDetails?.price || 0)).reduce((acc, curr) => acc + curr, 0)} </span>
                        </div>
                    </div>

                    <div className="border w-full lg:w-fit h-fit px-3 py-2 mb-7 lg:mb-5 mt-2 lg:mt-5">
                        <div className="text-sm lg:text-md font-semibold mb-2"> Assigned delivery boy </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-3 text-sm lg:text-base">
                            <span> <span className="font-medium">Name:</span>{" "} {delivaryBoyData?.fullname || orderData?.[0]?.assignment?.assignto?.fullname || "—"} </span>
                            <span> <span className="font-medium">Phone:</span>{" "} {delivaryBoyData?.phone || orderData?.[0]?.assignment?.assignto?.phone || "—"} </span>
                        </div>
                    </div>

                    <div className=''>
                        {(userOrderStatus.role === "admin" || canceledBy === "admin") && (userOrderStatus?.orderStatus === "cancel" || cancelReason) && (
                            <div className='lg:pb-0 mb-5 lg:mb-0 w-full flex flex-col sm:flex-row sm:gap-5 sm:mr-7'>
                                <div className='border border-red-200 px-4 py-1.5 bg-red-50 rounded-md shadow-sm text-sm flex items-start gap-2'>
                                    <span className='font-semibold text-red-700 whitespace-nowrap'>Cancel Reason ( By Shop Owner ) :</span>
                                    <span className='text-[#7a1c1c]'>{(userOrderStatus.role === "admin" || canceledBy === "admin") ? (userOrderStatus.cancelReason || cancelReason) : "Null"}</span>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className='mt-2 lg:mt-5 flex gap-5'>
                        <div className='border bg-gray-100 px-3 py-1 border-blue-300 rounded-md'>
                            <span className='font-semibold'>Payment mode -</span> <span className='text-blue-600 font-semibold'>{orderData[0]?.paymentMethod || "null"}</span>
                        </div>
                        <div className='border bg-gray-100 px-3 py-1 border-blue-300 rounded-md'>
                            <span className='font-semibold'>Order Status - </span> <span className='text-blue-600 font-semibold'>{userOrderStatus?.orderGroupId === orderData.map(i => i?.orderGroupId)[0] ? userOrderStatus?.orderStatus : orderData[0]?.orderStatus || "null"}</span>
                        </div>
                        <div className='border bg-gray-100 px-3 py-1 border-blue-300 rounded-md'>
                            <span className='font-semibold'>payment Status - </span> <span className='text-blue-600 font-semibold'>{(userOrderStatus?.paymentStatus === true || orderData?.map(i => i?.payment)[0] === true ? "paid" : "pending" )}</span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default UserOrderDetails