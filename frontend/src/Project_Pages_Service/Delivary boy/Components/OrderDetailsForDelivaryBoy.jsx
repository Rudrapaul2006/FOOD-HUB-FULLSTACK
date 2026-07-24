import React, { use, useEffect, useRef, useState } from 'react'
import DelivaryBoyNav from './DelivaryBoyNav'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import useGetDelivaryData from '@/Project_Pages_Service/Hooks/useGetDelivaryData';
import { updateOrderPaymentStatus } from '@/Project_Pages_Service/Redux/delivarySlice';
import UseUpdateCurrentPosition from '@/Project_Pages_Service/Hooks/UseUpdateCurrentPosition';
import { FaMapMarkerAlt } from 'react-icons/fa';


let OrderDetailsForDelivaryBoy = () => {
    useGetDelivaryData()
    UseUpdateCurrentPosition()

    let params = useParams()
    let assignmentId = params.id

    let dispatch = useDispatch()
    let navigate = useNavigate()
    let [orderDetails, setOrderDetails] = useState([])
    let [otp, setOtp] = useState("")
    let [step, setStep] = useState(0)
    let groupId = orderDetails?.order?.map(i => i?.orderGroupId.toString())[0]

    let orderStatus = orderDetails?.order?.map(i => i?.orderStatus)[0]

    //fetch the order details :
    let fetchOrderDetails = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_delivary_endpoint}/acceptedorders/${assignmentId}`, { withCredentials: true })
            if (res.data.success) {
                setOrderDetails(res.data.acceptedOrder)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchOrderDetails()
    }, [assignmentId])


    // change order status [out for delivary to picked up and on_the_way] : [step = 0]
    let changeOrderStatus = async (orderGroupId) => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_delivary_endpoint}/acceptorderstatusupdate`, { groupOrderId: orderGroupId }, { withCredentials: true })

            if (res.data.success) {
                toast.success(res?.data?.message)
                setStep(1)
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.error || "Something error in change order status")
        }
    }

    //send deivaryOtp to customer email : [step = 1]
    let sendDelivaryotp = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_delivary_endpoint}/senddelivaryotp/${groupId}`, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message)
                setStep(2)
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Verify delivary OTP : [step = 2]:
    let verifyDelivaryotp = async () => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_delivary_endpoint}/verifydelivaryotp/${groupId}`, { delivaryOtp: otp }, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message)
                if (orderDetails?.paymentStatus === "paid") {
                    setStep(4)
                } else {
                    setStep(3)
                }
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message || "Something went wrong")
        }
    }

    //Update payment status : [step = 3]
    let updatePaymentStatus = async (newStatus) => {
        try {
            let res = await axios.put(`${import.meta.env.VITE_delivary_endpoint}/updatepaymentstatus/${assignmentId}`, { paymentStatus: newStatus }, { withCredentials: true });
            if (res.data.success) {
                dispatch(updateOrderPaymentStatus(res.data.updateOrderPaymentStatus))
                setOrderDetails(res.data.updateOrderPaymentStatus)
                if (res.data.updateOrderPaymentStatus?.paymentStatus === "paid" || orderDetails?.paymentStatus === "paid") {
                    navigate("/delivaryboyhome")
                }
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    //update delivary status to compleate : [step = 4]
    let updateDelivaryStatus = async (newStatus) => {
        try {
            let res = await axios.put(`${import.meta.env.VITE_delivary_endpoint}/updatedelivarystatus/${assignmentId}`, { orderStatus: newStatus }, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message)
                navigate("/delivaryboyhome")
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message || "Something went wrong")
        }
    }

    useEffect(() => {
        if (!orderStatus) return;

        if (orderStatus === "out for delivary") {
            setStep(0)
        } else if (orderStatus === "picked up and on_the_way") {
            setStep(1)
        }
    }, [orderStatus])

    return (
        <>
            <div style={{ pointerEvents: "none", opacity: 0.6 }}>
                <DelivaryBoyNav />
            </div>

            <div className='lg:mx-20 border mt-9 h-fit rounded-md px-3 py-3 flex flex-col lg:flex-row lg:gap-2 mb-5'>
                {/* Left side */}
                <div className='lg:border-r-2 h-full lg:w-[35%] flex flex-col'>

                    {/* OrderedBy */}
                    <div className='lg:px-5 flex flex-col'>
                        <h1 className='font-bold mb-5 text-2xl text-[#ff4d2d]'>Orderer's Detail</h1>

                        <div className='flex flex-col'>
                            <img src={orderDetails?.orderedBy?.image || "/default-avatar.png"} alt="User" className="w-16 h-16 rounded-full object-cover mb-3 p-1 border-2 border-orange-500" />
                        </div>

                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Name </div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.fullname || "null"}</span>
                        </div>
                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Email </div>
                            <span className='mb-3  font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.email || "null"}</span>
                        </div>

                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Phone </div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.phone || "null"}</span>
                        </div>
                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Address</div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.address || "null"}</span>
                        </div>

                        <div className='flex flex-row gap-10'>
                            <div className='flex flex-col'>
                                <div className='text-gray-800 font-semibold text-[16px] '>Longitude</div>
                                <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.location.coordinates[0] || "null"}</span>
                            </div>
                            <div className='flex flex-col'>
                                <div className='text-gray-800 font-semibold text-[16px] '>Latitude</div>
                                <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.location.coordinates[1] || "null"}</span>
                            </div>
                        </div>



                    </div>

                    {/* Shop Details */}
                    <div className='lg:px-5 flex flex-col mt-5'>
                        <h1 className='font-bold mb-5 text-2xl text-[#ff4d2d]'>Shop Detail's</h1>

                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Shop Name</div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.shopDetails?.shopname || "null"}</span>
                        </div>
                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Email</div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.shopDetails?.email || "null"}</span>
                        </div>
                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>phone</div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.shopDetails?.phone || "null"}</span>
                        </div>
                        <div className='flex flex-col'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Location</div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.shopDetails?.location || "null"}</span>
                        </div>
                        <div className='flex gap-10'>
                            <div className='flex flex-col'>
                                <div className='text-gray-800 font-semibold text-[16px] '>Longitude</div>
                                <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.location?.coordinates[0] || "null"}</span>
                            </div>
                            <div className='flex flex-col mb-5'>
                                <div className='text-gray-800 font-semibold text-[16px] '>Latitude</div>
                                <span className='mb-3 font-normal text-sm text-gray-600'>{orderDetails?.orderedBy?.location?.coordinates[1] || "null"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side */}
                <div className="h-full lg:w-fit flex flex-col border-t-2 lg:border-none">

                    <h1 className="lg:ml-3 ml-1 font-bold mb-3 text-4xl text-[#ff4d2d] mt-5 lg:mt-0">  {orderDetails?.shopDetails?.shopname || "null"} </h1>

                    <h1 className="lg:ml-4 font-bold mb-5 text-2xl text-black/60 ml-1"> Food Detail's </h1>

                    <div className="lg:px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {orderDetails?.foodDetails?.map((food, index) => (
                                <div key={index} className="flex flex-col border rounded-lg p-4 bg-gray-50">

                                    <div className="text-gray-800 font-semibold text-[17px]">
                                        {`${food?.foodname}` || "Null"} <span className='font-normal ml-1 text-sm'>[{food?.category}]</span>
                                    </div>

                                    <span className="mt-3 text-sm font-semibold  tracking-wide "> Quantity - <span className='text-blue-600 font-normal'>{orderDetails?.order?.[index]?.quantity || 0} items</span> </span>
                                    <span className="text-sm font-semibold  tracking-wide">  Foodtype - <span className='text-red-500 font-normal'>{food?.foodtype || "N/A"}</span> </span>
                                    <span className="text-sm font-semibold  tracking-wide">  Price - <span className=' font-normal'>₹{food?.price || "N/A"}</span> </span>

                                </div>
                            ))}
                        </div>

                        <div className='flex flex-col lg:flex-row lg:gap-10'>
                            <div className='flex flex-col pb-1 mt-7 ml-1.5 lg:ml-2'>
                                <div className='text-gray-800 font-semibold text-[16px]'>Items Price</div>
                                <div className='mb-3 mt-2 text-sm text-gray-700 space-y-1 lg:ml-0.5'>
                                    {orderDetails?.foodDetails?.map((food, i) => (
                                        <div key={i}>{orderDetails?.order?.[i]?.quantity || 0} × ₹{food?.price || 0} = ₹{(orderDetails?.order?.[i]?.quantity || 0) * (food?.price || 0)}</div>
                                    ))}
                                </div>
                            </div>

                            <div className='flex flex-col pb-3 ml-1.5 lg:ml-2 mt-2 lg:mt-7'>
                                <div className='text-gray-800 font-semibold text-[16px]'>Total Price</div>
                                <div className='mt-2 lg:mt-1.5'> ₹{orderDetails?.foodDetails?.reduce((total, food, i) => total + ((orderDetails?.order?.[i]?.quantity || 0) * (food?.price || 0)), 0)} </div>
                            </div>
                        </div>

                        <div className='flex flex-col lg:flex-row mt-7 lg:mt-9 gap-5 lg:gap-2 ml-1.5 lg:ml-2'>
                            <div className=' flex flex-col sm:flex-row lg:flex gap-3 sm:gap-5 sm:mr-7 '>
                                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                                    Total quantity - <span className='text-blue-600'> {orderDetails?.order?.reduce((total, item) => total + (item?.quantity || 0), 0)} </span>
                                </div>
                            </div>
                            <div className=' flex flex-col sm:flex-row lg:flex gap-3 sm:gap-5 sm:mr-7 '>
                                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                                    Payment - <span className='text-blue-600'> {orderDetails?.paymentStatus} </span>
                                </div>
                            </div>
                            <div className='flex flex-col sm:flex-row lg:flex gap-3 sm:gap-5 sm:mr-7'>
                                <div className='border px-5 lg:px-4 py-1 bg-gray-100 rounded-md '>
                                    Method - <span className='text-blue-600'> {orderDetails?.order?.map((item) => item?.paymentMethod)[0]} </span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Open map button */}
                        <button
                            onClick={() => navigate(`/delivarymap/${assignmentId}`) }
                            className='mt-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-98 transition-all duration-200 cursor-pointer'
                        >
                            <FaMapMarkerAlt size={17} />
                            Map
                        </button>

                        {/* Order status set to order picked up and on the way */}
                        {step === 0 &&
                            <div className="mt-10 ml-0 lg:ml-2 w-full lg:w-100 border p-4 rounded-lg">
                                <button onClick={() => {
                                    // setStep(1)
                                    changeOrderStatus(orderDetails?.orderGroupId)
                                }} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold active:scale-98 cursor-pointer">Order picked up and on the way</button>
                            </div>
                        }

                        {/* Send delivery OTP */}
                        {step === 1 && (
                            <div className="mt-10 ml-0 lg:ml-2 w-full lg:w-100 border p-4 rounded-lg">
                                <button onClick={sendDelivaryotp} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-md font-semibold active:scale-98 cursor-pointer">Send Delivery OTP</button>
                            </div>
                        )}

                        {/* verify the delivary otp */}
                        {step === 2 && (
                            <div className="mt-10 w-full lg:w-100 border py-2 px-3 rounded-lg flex flex-col lg:flex-row gap-3">
                                <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" placeholder="Enter Delivery OTP" className="w-full lg:w-75 border px-3 py-2.5 rounded-md focus:ring focus:ring-orange-500 outline-none" />
                                <button onClick={verifyDelivaryotp} className="w-full lg:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md font-semibold active:scale-98 cursor-pointer">Verify OTP</button>
                            </div>
                        )}

                        {/* Order payment status update to be paid for COD order */}
                        {step === 3 && orderDetails?.order?.map((item) => item?.paymentMethod)[0] === "cod" && orderDetails?.paymentStatus !== "paid" && (
                            <div className='flex flex-col w-full lg:w-100 mt-10 border p-4 rounded-lg'>
                                <span className='font-semibold pb-2'>Update customer payment status</span>
                                <div className="flex flex-wrap gap-3">
                                    {["paid"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => updatePaymentStatus(s)}
                                            className={`mt-2 text-xs sm:text-sm font-normal px-4 py-1 rounded-md border transition cursor-pointer ${orderDetails?.paymentStatus === s ? "bg-[#ff4d2d] text-white border-[#ff4d2d]" : "bg-gray-100 hover:bg-gray-200"}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Order status set to compleate for ONLINE order */}
                        {step === 4 && (
                            <div className='flex flex-col w-full lg:w-100 mt-10 border p-4 rounded-lg'>
                                <span className='font-semibold pb-2'>Update delivary status to complete</span>
                                <div className="flex flex-wrap gap-3">
                                    {["compleate"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => updateDelivaryStatus(s)}
                                            className={`mt-2 text-xs sm:text-sm font-normal px-4 py-1 rounded-md border transition cursor-pointer ${orderDetails?.delivaryStatus === s ? "bg-[#ff4d2d] text-white border-[#ff4d2d]" : "bg-gray-100 hover:bg-gray-200"}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>


                </div>
            </div>
        </>
    )
}

export default OrderDetailsForDelivaryBoy