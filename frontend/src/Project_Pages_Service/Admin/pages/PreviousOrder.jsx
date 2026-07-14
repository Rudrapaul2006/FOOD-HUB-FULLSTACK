import React, { useEffect, useState } from 'react'
import AdminNav from '../AdminNav'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import useGetFoodData from '@/Project_Pages_Service/Hooks/useGetFoodItem'
import { IoEllipsisHorizontalOutline } from 'react-icons/io5'
import { IoIosArrowBack } from 'react-icons/io'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import useGetCancelOrders from '@/Project_Pages_Service/Hooks/useGetCancelOrders'
import { setCancelOrderCurrentPage, setSearchCancelOrderQuery } from '@/Project_Pages_Service/Redux/orderSlice'
import { Loader2 } from 'lucide-react'
import { CiSearch } from 'react-icons/ci'
import useGetPendingOrders from '@/Project_Pages_Service/Hooks/useGetOrders'
import useGetShop from '@/Project_Pages_Service/Hooks/useGetShop'
import SingleOrderSocket from '@/Project_Pages_Service/WebSocketHooks/singleOrderSocket'
import multipleOrderSocket from '@/Project_Pages_Service/WebSocketHooks/multipleOrderSocket'

const PreviousOrder = () => {
    useGetFoodData()
    useGetCancelOrders()  //[all cancel and compleate order calll from here]

    useGetPendingOrders()
    useGetShop()

    //socket function for the [for the single order]
    SingleOrderSocket()
    //socket function for the [for the multiple order]
    multipleOrderSocket()

    let navigate = useNavigate()
    let dispatch = useDispatch()
    let { cancelOrder, cancelOrderLoading, cancelOrderCurrentPage, cancelOrderTotalPage, cancelOrderHasPrev, cancelOrderHasNext, cancelOrderQuery } = useSelector(state => state.order)

    let pages = Array.from({ length: cancelOrderTotalPage }, (_, i) => i + 1)

    //search for the cancel or compleate order :
    let [query, setSearchQuery] = useState("")
    let queryHandler = () => {
        dispatch(setSearchCancelOrderQuery(query))
    }

    useEffect(() => {
        navigate(`/previousorders?page=${cancelOrderCurrentPage}&query=${cancelOrderQuery || null}`, { replace: true })
    }, [cancelOrderCurrentPage, cancelOrderQuery])

    useEffect(() => {
        return () => {
            dispatch(setSearchCancelOrderQuery(""))
        }
    }, [navigate])

    return (
        <>
            <AdminNav />

            <div className='lg:mx-20 flex flex-col justify-center mt-3 pb-7 lg:pb-5'>

                <div className='flex flex-col w-full pb-10'>

                    <div className='sticky top-19 z-99 bg-white py-5 flex items-center gap-3 px-2.5 lg:px-0 '>
                        <button className="p-2.5 rounded-xl border bg-gray-100 hover:bg-gray-200 duration-200 cursor-pointer"
                            onClick={() => {
                                dispatch(setSearchCancelOrderQuery(""))
                                navigate(-1)
                            }}
                        >
                            <IoIosArrowBack size={22} />
                        </button>

                        <div className='flex justify-start items-center w-full'>
                            <input
                                type="text"
                                value={query}
                                onChange={e => setSearchQuery(e.target.value)}
                                // value={cancelOrderQuery}
                                // onChange={e => dispatch(setSearchCancelOrderQuery(e.target.value))}
                                placeholder="Search orders... by customer name, phone, address, pincode"
                                className="ml-5 w-full border lg:w-1/3 px-4 py-2.5 rounded-md outline-none focus:ring focus:ring-orange-400"
                            />

                            <button
                                onClick={() => queryHandler()}
                                className='ml-3 px-3 py-2.5 border border-gray-300 rounded-md bg-gray-200 cursor-pointer hover:bg-gray-300 active:scale-97 duration-300'>
                                <CiSearch size={23} className='' />
                            </button>
                        </div>
                    </div>

                    <div className=' ml-3 lg:ml-0 mb-7 font-semibold text-2xl lg:text-3xl text-[#ff4d2d]'>
                        Compleate Order Details :
                    </div>

                    <div className="ml-3 lg:ml-0 mr-3 lg:mr-0 overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2 text-left">Date</th>
                                    <th className="border px-4 py-2 text-left">Customer</th>
                                    <th className="border px-4 py-2 text-left">Contact</th>
                                    <th className="border px-4 py-2 text-left">Pincode</th>
                                    <th className="border px-4 py-2 text-left">Address</th>
                                    <th className="border px-7 py-2 text-left">Food Item</th>
                                    <th className="border px-4 py-2 text-left">Quantity & Price</th>
                                    <th className="border px-4 py-2 text-left">Pay MOD</th>
                                    <th className="border px-4 py-2 text-left flex flex-col">Pay Status <span className='text-[10px]'>(From-DelivayBoy)</span></th>
                                    <th className="border px-4 py-2 text-left">Order Status</th>
                                    <th className="border px-4 py-2 text-left">Details</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cancelOrder?.length > 0 ? (
                                    cancelOrder?.map((group, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition">

                                            <td className="border px-4 py-2"> {new Date(group?.items?.[0]?.createdAt).toLocaleDateString() || "Null"} </td>
                                            <td className="border px-4 py-2"> {group?.items?.[0]?.orderedBy?.fullname || "Null"} </td>
                                            <td className="border px-4 py-2"> {group?.items?.[0]?.orderedBy?.phone || "Null"} </td>
                                            <td className="border px-4 py-2"> {group?.items?.[0]?.orderedBy?.pincode || "Null"} </td>
                                            <td className="border px-4 py-2"> {group?.items?.[0]?.orderedBy?.address || "Null"} </td>
                                            <td className="border px-7 py-2"> {group?.items?.map(i => i?.foodDetails?.foodname).join(", ") || "Null"} </td>

                                            <td className="border px-4 py-2">
                                                <div className="flex flex-col gap-1">
                                                    <span>{group?.items?.map(i => `( ${i?.quantity} * ${i?.foodDetails?.price} )` || 0).join(" + ")} </span>
                                                    <span>Total = <span className='font-semibold'>₹{group?.items?.map(i => (i?.foodDetails?.price || 0) * (i?.quantity || 0)).reduce((a, b) => a + b, 0)}</span> </span>
                                                </div>
                                            </td>

                                            <td className="border px-4 py-2"> {group?.items?.[0]?.paymentMethod || "Null"} </td>

                                            <td className="border px-4 py-2">
                                                <span className={`px-2 py-1 rounded-xl text-xs font-medium ${group?.items?.some(j => j?.assignment?.paymentStatus === "paid" || j?.payment === true)
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"}`} >
                                                    {group?.items?.some(j => j?.assignment?.paymentStatus === "paid" || j?.payment === true)
                                                        ? "Paid" : "Pending"}
                                                </span>
                                            </td>

                                            <td className="border px-4 py-2">
                                                <span className={`px-2 py-1 rounded-xl text-xs font-medium ${group?.items?.[0]?.orderStatus === "compleate" ? "bg-green-100 text-green-700" : group?.items?.[0]?.orderStatus === "cancel" ? "bg-red-100 text-red-700" : group?.items?.[0]?.orderStatus === "out for delivary"
                                                    ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-[#a11f1f]"}`}>
                                                    {group?.items?.[0]?.orderStatus || "pending"}
                                                </span>
                                            </td>

                                            <td className="border px-4 py-2">
                                                <IoEllipsisHorizontalOutline
                                                    size={28}
                                                    onClick={() => navigate(`/previousorderdetails/${group?.items?.[0]?.orderGroupId}`)}
                                                    className='ml-2 lg:ml-3 hover:bg-gray-200 rounded-full p-1 duration-200 hover:cursor-pointer'
                                                />
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-6 text-gray-500">
                                            No order available
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {cancelOrderTotalPage > 1 &&
                <div className='mt-2 fixed bottom-0 left-0 right-0 mx-0 lg:mx-20 border-t border-black  py-1 px-2 bg-white z-50'>
                    <div className='flex items-center justify-center gap-2'>
                        <button
                            disabled={cancelOrderLoading || !cancelOrderHasPrev}
                            onClick={() => dispatch(setCancelOrderCurrentPage(cancelOrderCurrentPage - 1))}
                            className={`border border-gray-400 px-1 py-2 rounded-md  ${cancelOrderLoading || !cancelOrderHasPrev ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        >
                            <FaAngleLeft size={22} />
                        </button>

                        {/* Total page */}
                        <div className='flex gap-2 overflow-x-auto whitespace-nowrap'>
                            {pages.map(i => (
                                <div className='shrink-0' key={i}>
                                    <button
                                        disabled={cancelOrderLoading}
                                        onClick={() => dispatch(setCancelOrderCurrentPage(i))}
                                        className={`border  px-3 py-2 rounded-md cursor-pointer ${cancelOrderCurrentPage === i ? "bg-orange-600" : "bg-white"}`}
                                    >
                                        {cancelOrderLoading && cancelOrderCurrentPage === i ? <Loader2 className='flex items-center justify-center h-6 w-2 animate-spin' /> : i}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            disabled={cancelOrderLoading || !cancelOrderHasNext}
                            onClick={() => dispatch(setCancelOrderCurrentPage(cancelOrderCurrentPage + 1))}
                            className={`border border-gray-400 px-1 py-2 rounded-md  ${cancelOrderLoading || !cancelOrderHasNext ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        >
                            <FaAngleRight size={22} />
                        </button>
                    </div>
                </div>
            }
        </>
    )
}

export default PreviousOrder