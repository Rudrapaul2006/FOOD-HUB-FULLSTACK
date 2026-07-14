import React, { useEffect, useState } from 'react'
import DelivaryBoyNav from '../Components/DelivaryBoyNav'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { setDelivaryData } from '@/Project_Pages_Service/Redux/delivarySlice'
import useGetDelivaryData from '@/Project_Pages_Service/Hooks/useGetDelivaryData'
import useGetCurrentUser from '@/Project_Pages_Service/Hooks/useGetCurrentUser'
import UseUpdateCurrentPosition from '@/Project_Pages_Service/Hooks/UseUpdateCurrentPosition'

const DelivaryBoyHomePage = () => {
    useGetDelivaryData()
    useGetCurrentUser()
    UseUpdateCurrentPosition()

    let navigate = useNavigate()
    let dispatch = useDispatch()

    let { delivaryData } = useSelector(state => state.delivary)

    
    let { socket } = useSelector(state => state.user)

    //Accept order :
    let acceptorder = async (orderId) => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_delivary_endpoint}/acceptorder/${orderId}`, { withCredentials: true })

            if (res.data.success) {
                toast.success(res.data.message)
                navigate(`/delivaryOrderDetails/${orderId}`)
            }

        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log(error)
        }
    }

    // All complete orders :
    let [allCompleateOrders, setAllCompleateOrder] = useState([])

    let fetchAllCompleateOrder = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_delivary_endpoint}/getallorders`, { withCredentials: true })
            if (res.data.success) {
                setAllCompleateOrder(res.data.orders)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchAllCompleateOrder()
    }, [])


    // Get Io event [ get order from shop ] :
    useEffect(() => {
        socket.on("delivaryOrder", (data) => {
            if(data){
                let audio = new Audio("/messageSound.mp3")
                audio.play().catch((err) => {console.log(err)})
            }
            dispatch(setDelivaryData([...data]))
        })

        return () => {
            socket.off("delivaryOrder")
        }

    }, [delivaryData.length , socket])

    return (
        <>
            <DelivaryBoyNav />

            <div className='lg:mx-20 lg:mt-9 flex flex-col lg:flex-row gap-2 lg:gap-0 '>
                {/* <button className=' px-4 py-2 border rounded-md border-[#ff4d2d] active:scale-98 cursor-pointer bg-[#ff4d2d] text-white font-semibold'>Prev Order's</button> */}
                <div className='ml-2 mt-3 lg:mt-0 mr-2 lg:mr-0 border border-[#ff4d2d] px-4 py-3 rounded-md'>Today's compleate order - <span>{allCompleateOrders.length || "0"}</span></div>
            </div>

            <div className='lg:mx-20 mt-5 lg:mt-9'>
                <div className='flex flex-col lg:border lg:border-[#ff4d2d] rounded-lg h-fit p-3 lg:p-3'>

                    <div className='px-3 mb-3 lg:mb-1 font-bold text-lg mt-1 lg:mt-0'>Available order's : </div>
                    {delivaryData.length > 0 ? <div className='flex flex-col lg:w-full h-fit lg:gap-7 rounded-md lg:p-2'>
                        {delivaryData.map((data) => (
                            <div key={data._id} className='lg:w-full flex flex-col lg:flex-row border border-gray-200 rounded-md  px-3 py-3 lg:px-3 lg:py-2 mb-5 lg:mb-0 shadow-md'>

                                {/* Left side resturent details */}
                                <div className='w-[99%] lg:w-[52%] lg:border-r-2'>
                                    <div className='flex flex-col lg:flex-row lg:gap-7 '>
                                        <div>
                                            <div className='ml-0 lg:ml-5 text-xl text-[#f03c1c] font-bold'>{data?.shopDetails?.shopname}</div>
                                            <div className='ml-0 lg:ml-5 flex flex-col mt-2 mb-5 lg:mb-1'>
                                                <div className='text-gray-600'>{data?.shopDetails?.email}</div>
                                                <div className='flex flex-col lg:flex-row lg:gap-2'>
                                                    {/* <div className='text-gray-600'>{data.shopDetails.city}</div> */}
                                                    <div className='text-gray-600'>{data?.shopDetails?.location}</div>
                                                </div>
                                                <div className='text-gray-600'>{data?.shopDetails?.phone}</div>

                                                <div className='font-semibold text-gray-700'>Lon : <span className='font-normal text-gray-600'>{data?.shopDetails?.shopGeoLocation?.coordinates?.[0]}</span></div>
                                                <div className='font-semibold text-gray-700'>Lat : <span className='font-normal text-gray-600'>{data?.shopDetails?.shopGeoLocation?.coordinates?.[1]}</span></div>

                                            </div>
                                        </div>
                                        <div className='mr-0 lg:mr-2 ml-0 lg:ml-5'>
                                            <div className='ml-0 lg:ml-5 text-xl text-[#f03c1c] font-bold'>FoodDetails</div>
                                            <div className='ml-0 lg:ml-5 flex flex-col mt-2 mb-5 lg:mb-1'>
                                                <div className='text-gray-700 font-semibold'>FoodItem : <span className='text-gray-600 font-normal'>{data?.foodDetails?.map(i => i?.foodname)?.join(", ")}</span></div>
                                                <div className='flex flex-col lg:flex-row lg:gap-2'>
                                                    <div className='text-gray-800 font-semibold'>Price - <span className='text-gray-600 font-normal'>{data?.foodDetails?.map(i => i?.price)?.join(", ")}</span></div>
                                                    {/* <div className='text-gray-600'>{data?.foodDetails?.map(i => i?.foodtype)?.join(", ")}</div> */}
                                                </div>
                                                {/* <div className='text-gray-600'>{data?.foodDetails?.map(i => i?.category)?.join(", ")}</div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right side */}
                                <div className='w-[99%] lg:w-[50%] border-t-2 lg:border-none'>
                                    <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center mt-3 lg:mt-0'>
                                        <div>
                                            <div className='ml-0 lg:ml-5 text-xl text-[#3630e0] font-bold'>Customer</div>
                                            <div className='ml-0 lg:ml-5 flex flex-col mt-2 mb-3 lg:mb-1'>
                                                <div className='text-gray-600'>{data?.orderedBy?.fullname || "Null"}</div>
                                                <div className='text-gray-600'>{data?.orderedBy?.email}</div>
                                                <div className='flex flex-col lg:flex-row lg:gap-2'>
                                                    <div className='text-gray-600'>{data?.orderedBy?.address || "Null"}</div>
                                                    <div className='text-gray-600'>{data?.orderedBy?.pincode || "Null"}</div>
                                                </div>
                                                <div className='text-gray-600'>{data?.orderedBy?.phone || "Null"}</div>
                                                <div className='flex flex-col lg:flex-row lg:gap-2'>
                                                    <div className='font-semibold text-gray-700'>Lon : <span className='font-normal text-gray-600'>{data?.orderedBy?.location?.coordinates?.[0] || "Null"}</span></div>
                                                    <div className='font-semibold text-gray-700'>Lat : <span className='font-normal text-gray-600'>{data?.orderedBy?.location?.coordinates?.[1] || "Null"}</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={() => acceptorder(data?._id)} className='mt-2 text-blue-500 lg:mt-0 mr-0 lg:mr-2 border h-fit px-4 py-2 rounded-md border-[#ff4d2d] active:scale-97 cursor-pointer duration-150'> Accept </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> : <div className='w-full flex justify-center items-center font-semibold'> No delivary's available yet </div>}

                </div>
            </div>
        </>
    )
}


export default DelivaryBoyHomePage