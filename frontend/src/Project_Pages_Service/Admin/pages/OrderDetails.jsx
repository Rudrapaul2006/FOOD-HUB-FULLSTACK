import React, { useState } from 'react'
import AdminNav from '../AdminNav'
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';
import { data, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { deleteOrderItem, updateorder } from '@/Project_Pages_Service/Redux/orderSlice';
import { toast } from 'sonner';
import { useEffect } from 'react';
import singleOrderSocket from '@/Project_Pages_Service/WebSocketHooks/singleOrderSocket';
import multipleOrderSocket from '@/Project_Pages_Service/WebSocketHooks/multipleOrderSocket';
import { getPendingOrders } from '@/Project_Pages_Service/Hooks/useGetOrders';

const OrderDetails = () => {
  //socket function for the [for the single order]
  singleOrderSocket()
  //socket function for the [for the multiple order]
  multipleOrderSocket()

  let navigate = useNavigate()
  let dispatch = useDispatch()
  let params = useParams()
  let groupId = params.id

  let { shopData } = useSelector(state => state.admin)
  let { socket } = useSelector(state => state.user)

  let [orderDetails, setOrderDetails] = useState([])
  let [OrderStatus, setIoOrderStatus] = useState([])  //[used in socketIo event on orderStatus update] 

  let cancelReason = orderDetails.map(i => i?.items.map(j => j?.cancelReason)[0])[0]

  // user cancel status : and it send to shop admin : 
  let [userCancelStatus, setUserCancelStatus] = useState("")

  let canceledBy = (orderDetails.map(i => i?.items?.map(j => j?.cancelBy)[0])[0])

  // cancel reason selection : [pending to out for delivary]
  let [selectReason, setSelectReason] = useState("")
  let [showReason, setShowReason] = useState(false)

  let cancelReasons = [
    "Admin cancelled",
    "Technical issue",
    "Bad weather",
    "Out of stock",
    "Restaurant closed",
    "No delivery partner available",
    "Bank issue from restaurant side",
  ]

  let currentStatus = orderDetails.map(i => i?.items?.map(j => j?.orderStatus)[0])[0]

  //Fetch Order details :
  let fetchOrderDetails = async () => {
    try {
      let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/getOrderbyid/${groupId}`, { withCredentials: true });
      if (res.data.success) {
        setOrderDetails(res.data.order)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (groupId) {
      fetchOrderDetails()
    }
  }, [groupId])

  //Order status update :
  let {currentPage} = useSelector(state => state.order)
  let updateOrderStatus = async (newStatus) => {
    try {
      let res = await axios.put(`${import.meta.env.VITE_order_endpoint}/updatestatus/${groupId}`, { orderStatus: newStatus, cancelReason: selectReason }, { withCredentials: true })
      if (res.data.success) {
        dispatch(updateorder(res.data.orders))
        setOrderDetails(res.data.orders)
        await fetchOrderDetails()
        await getPendingOrders(dispatch, currentPage)
        toast.success(res.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to update order status")
    }
  }


  //socket event for the delivary boy data :
  useEffect(() => {
    socket.on("delivaryPartnerDetails", data => {
      setOrderDetails(prev => prev.map(order => ({ ...order, deliveryBoy: data })))
    })

    return () => {
      socket.off("delivaryPartnerDetails")
    }
  }, [socket])

  //socket event for the update orderStatus : [for cod]
  useEffect(() => {
    let handleOrderStatus = (data) => {
      if (data) {
        setIoOrderStatus(data)
      }
    }

    socket.on("orderStatus", handleOrderStatus);

    // Cleanup on unmount
    return () => {
      socket.off("orderStatus", handleOrderStatus);
    }
  }, [socket])

  //cancel reason : [from user to shop admin] :
  useEffect(() => {
    socket.on("orderCancelation", data => {
      setUserCancelStatus(data)
    })
    return () => {
      socket.off("orderCancelation")
    }
  }, [socket])

  return (
    <>
      <AdminNav />

      <div className='mt-8 lg:mx-30 lg:h-fit border rounded-lg flex flex-col md:flex lg:flex-row justify-between gap-10 lg:gap-0 mb-5'>

        {/* Left Side */}
        <div className='mt-6 px-8 flex flex-col border-r lg:w-[25%]'>
          <button
            className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 "
            onClick={() => navigate(-1)}
          >
            <IoIosArrowBack size={22} />
          </button>

          <div className='text-3xl mt-3 text-gray-600 font-semibold pb-5'>
            Customer details
          </div>

          {orderDetails?.map((item, idx) => (
            <div key={idx} className='mt-3'>
              <div className='flex flex-col'>

                <div className='mb-2'>
                  <img src={item?.items?.[0]?.orderedBy?.image || "/default-avatar.png"} alt="User" className="w-16 h-16 rounded-full object-cover mb-3 p-1 border-2 border-orange-500" />
                </div>

                <div className='text-gray-800 font-semibold text-[16px] '>Name  </div>
                <span className='mb-3 font-normal text-sm text-gray-600'>
                  {item?.items?.[0]?.orderedBy?.fullname || "null"}
                </span>

                <div className='text-gray-800 font-semibold text-[16px] '>Email Address </div>
                <span className='mb-3 font-normal text-sm text-gray-600'>
                  {item?.items?.[0]?.orderedBy?.email || "null"}
                </span>

                <div className='text-gray-800 font-semibold text-[16px] '>Phone Number </div>
                <span className='mb-3 font-normal text-sm text-gray-600'>
                  {item?.items?.[0]?.orderedBy?.phone || "null"}
                </span>

                <div className='text-gray-800 font-semibold text-[16px] '>Role </div>
                <span className='mb-3 font-normal text-sm text-gray-600'>
                  {item?.items?.[0]?.orderedBy?.role || "null"}
                </span>

                <div className='text-gray-800 font-semibold text-[16px] '>Address </div>
                <span className='mb-3 font-normal text-sm text-gray-600'>
                  {item?.items?.[0]?.orderedBy?.address || "null"}
                </span>

                <div className='text-gray-800 font-semibold text-[16px] '>Pincode</div>
                <span className='mb-3 font-normal text-sm text-gray-600'>
                  {item?.items?.[0]?.orderedBy?.pincode || "null"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className='lg:w-[73.5%] flex flex-col px-9 lg:px-2 border-t lg:border-none py-5'>

          {/* Right side */}
          <span className=" flex items-center justify-between mb-6.5"> <div className=' text-4xl font-bold text-[#ff4d2d] '>{shopData?.shopname}</div> </span>
          <div className='text-3xl text-gray-600 font-semibold pb-7'>  Food details </div>

          {orderDetails.map((item, idx) => (
            <div key={idx} className=''>

              <div className='flex flex-col pb-3 '>

                <div className='text-gray-800 font-semibold text-[18px] mb-2 lg:ml-1'>Food Item</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {item?.items?.map((i, index) => (
                    <div key={index} className="border rounded-lg px-3 py-2 bg-gray-50">
                      <p className="font-semibold">{`${i?.foodDetails?.foodname} [${i?.foodDetails?.category || "N/A"}]` || "N/A"}</p>
                      <p className={`text-sm text-gray-700 mt-2 ${i?.foodDetails?.foodtype === "Veg" ? "text-green-600" : "text-red-600"}`}>
                        <span className="mr-1 text-gray-800">Foodtype :</span> {i?.foodDetails?.foodtype || "N/A"}
                      </p>
                      <p className="text-sm text-gray-700 mt-0.5"> Quantity - <span className="font-medium text-blue-500">{i?.quantity || 0}</span> items </p>
                      <p className="text-sm text-gray-700 mt-0.5"> Price - ₹{i?.foodDetails?.price || 0} </p>
                    </div>
                  ))}
                </div>

                <div className='flex flex-col lg:flex-row lg:gap-20 lg:mt-7 mb-2 lg:mb-3 pl-1 lg:pl-2'>

                  <div className='flex flex-col pb-3 mt-7 lg:mt-0'>
                    <div className='text-gray-800 font-semibold text-[16px] '>Price </div>
                    <span className='mb-3 font-normal text-sm text-gray-600'>
                      {item?.items?.map((i, index) => (
                        <div key={index}>
                          {`${i?.quantity} * ₹${i?.foodDetails?.price || 0} = ₹${(i?.quantity || 0) * (i?.foodDetails?.price || 0)}`}
                        </div>
                      ))}
                    </span>
                  </div>

                  <div className='flex flex-col pb-3'>
                    <div className='text-gray-800 font-semibold text-[16px] '>Total Price </div>
                    <span className='mb-3 font-normal text-sm text-gray-600'>  ₹{item?.items?.map(i => (i?.quantity || 0) * (i?.foodDetails?.price || 0)).reduce((acc, curr) => acc + curr, 0)} </span>
                  </div>

                </div>

                <div className='flex flex-col lg:flex-row gap-3 lg:gap-8'>

                  {/* Order status update */}
                  <div className='flex flex-col justify-between gap-20 lg:gap-0 py-2 px-3 h-fit border lg:w-[70%] mb-2 lg:mb-0'>

                    <div className='flex justify-between gap-20 lg:gap-0'>

                      <div className='flex flex-col'>
                        <div className='text-gray-800 font-semibold text-[17px]'>Order status</div>
                        <span className='font-normal text-sm text-blue-600 mt-2'>
                          {userCancelStatus?.orderStatus || OrderStatus?.orderStatus || item?.items?.[0]?.orderStatus || "null"}
                        </span>
                      </div>

                      <div className='flex flex-col'>
                        <span className='font-semibold ml-0 lg:ml-2.5'>Update status</span>

                        <div className="flex flex-wrap gap-3 mt-2">
                          {["preparing", "out for delivary", "cancel"].map(s => {
                            let isDisable = false
                            if (userCancelStatus) {
                              isDisable = true
                            }
                            if (s === currentStatus) { isDisable = true }
                            if (currentStatus === "compleate" || currentStatus === "cancel") { isDisable = true }
                            if (currentStatus === "pending" && (s === "out for delivary")) { isDisable = true }
                            if (s === "preparing" && currentStatus === "out for delivary") { isDisable = true }
                            if (s === "out for delivary" && currentStatus === "cancel") { isDisable = true }
                            if (orderDetails?.[0]?.items?.[0]?.assignment?.assignto?.fullname || orderDetails?.[0]?.deliveryBoy?.fullname) { isDisable = true }

                            return (
                              <div key={s} className="flex flex-col items-start">

                                <button
                                  onClick={() => {
                                    if (s === "cancel" && (currentStatus === "pending" || currentStatus === "preparing") && !showReason) {
                                      setShowReason(true)
                                      return;
                                    }

                                    if (s === "cancel") {
                                      if (currentStatus === "pending" || currentStatus === "preparing") {
                                        if (!selectReason) return alert("Select reason first ..")
                                        updateOrderStatus(s, selectReason)
                                      } else {
                                        updateOrderStatus(s)
                                      }
                                    } else {
                                      updateOrderStatus(s)
                                    }
                                  }}
                                  disabled={isDisable}
                                  className={`text-xs sm:text-sm px-4 py-1.5 rounded-md border whitespace-nowrap ${item?.items?.[0]?.orderStatus === s
                                    ? "bg-[#ff4d2d] text-white border-[#ff4d2d]"
                                    : "bg-gray-100 hover:bg-gray-200 text-black/70 hover:text-black border-gray-300"
                                    } ${isDisable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                  {s}
                                </button>

                                {/* Cancel reason dropdown */}
                                {showReason && (currentStatus === "pending" || currentStatus === "preparing") && s === "cancel" && (
                                  <select
                                    value={selectReason}
                                    onChange={(e) => setSelectReason(e.target.value)}
                                    className="mt-2 w-full border px-2 py-1 rounded-md text-sm"
                                  >
                                    <option value="">Select reason</option>
                                    {cancelReasons.map(r => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                )}

                              </div>
                            )
                          })}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
              
              {/* user cancel reason : */}
              { (userCancelStatus.role === "user" || canceledBy === "user") && (userCancelStatus || cancelReason) && (
                  <div className='lg:mt-3 flex flex-col sm:flex-row gap-3 sm:gap-5 sm:mr-7 pb-2 mt-5'>
                    <div className='border border-red-200 px-4 py-1.5 bg-red-50 rounded-md shadow-sm text-sm flex items-start gap-2'>
                      <span className='font-semibold text-red-700 whitespace-nowrap'>Cancel Reason ( by user ) :</span>
                      <span className='text-[#7a1c1c]'>{(userCancelStatus.role === "user" || canceledBy === "user") ? (cancelReason || userCancelStatus?.cancelReason) : "Null"}</span>
                    </div>
                  </div>
                )}
              
              {/* asigned delivary boy */}
              <div className="border w-full lg:w-[35%] h-fit p-3 mt-5 lg:mt-3 mb-6 rounded-md">
                <div className="text-sm lg:text-md font-semibold mb-2"> Assigned delivery boy </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-sm lg:text-base">
                  <span> <span className="font-medium">Name:</span> {" "} {item?.deliveryBoy?.fullname || item?.items?.[0]?.assignment?.assignto?.fullname || "—"} </span>
                  <span> <span className="font-medium">Phone:</span> {" "} {item?.deliveryBoy?.phone || item?.items?.[0]?.assignment?.assignto?.phone || "—"} </span>
                </div>
              </div>
              
              {/* available delivary partener's number */}
              <div className='lg:mt-1 flex flex-col sm:flex-row lg:flex gap-3 sm:gap-5 sm:mr-7 pb-9 mt-2'>
                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                  Available Delivary Boys - <span className='text-blue-600'> {item?.items?.[0]?.brodcastedTo?.length || 0} </span>
                </div>
              </div>

              <div className='lg:mt-1 flex flex-col sm:flex-row lg:flex gap-3 sm:gap-5 sm:mr-7'>
                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                  Quantity(all) - <span className='text-blue-600'> {item?.items?.map(i => i?.quantity || 0).reduce((a, b) => a + b, 0)} </span>
                </div>
                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                  Payment - <span className='text-blue-600'> {OrderStatus.paymentStatus === true || item?.items?.[0]?.payment === true || item?.items?.[0]?.payment === "paid" ? "paid" : item?.items?.payment === true || item?.items?.payment === "paid" ? "Paid" : OrderStatus?.paymentStatus || item?.items?.[0]?.assignment?.paymentStatus || "pending"}  </span>
                </div>
                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                  Method - <span className='text-blue-600'> {item?.items?.[0]?.paymentMethod || "N/A"} </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </>
  )
}

export default OrderDetails