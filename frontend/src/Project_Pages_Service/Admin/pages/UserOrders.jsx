import React, { useEffect, useRef, useState } from 'react'
import AdminNav from '../AdminNav'
import { replace, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { IoEllipsisHorizontalOutline } from 'react-icons/io5'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import axios from 'axios'
import { toast } from 'sonner'
import useGetShop from '@/Project_Pages_Service/Hooks/useGetShop'
import { setCurrentPage, setOrderData } from '@/Project_Pages_Service/Redux/orderSlice'
import singleOrderSocket from '@/Project_Pages_Service/WebSocketHooks/singleOrderSocket'
import multipleOrderSocket from '@/Project_Pages_Service/WebSocketHooks/multipleOrderSocket'
import useGetPendingOrders, { getPendingOrders } from '@/Project_Pages_Service/Hooks/useGetOrders'
import { Loader2 } from 'lucide-react'
import { updateShop } from '@/Project_Pages_Service/Redux/adminSlice'

const UserOrders = () => {
  // useGetPendingOrders()
  // useGetShop()

  //socket function for the [for the single order]
  singleOrderSocket()
  //socket function for the [for the multiple order]
  multipleOrderSocket()

  let navigate = useNavigate()
  let dispatch = useDispatch()
  let { orderData } = useSelector(state => state.order)
  let { shopData } = useSelector(state => state.admin)
  let { socket } = useSelector(state => state.user)


  //Update shop status [open or not open] :
  let [updateLoading, setUpdateLoading] = useState(false)

  let updateShopStatus = async (value) => {
    try {
      setUpdateLoading(true)
      let res = await axios.put(`${import.meta.env.VITE_shop_endpoint}/shopstatus`, { open: value }, { withCredentials: true })
      if (res.data.success) {
        toast.success(res.data.message)
        dispatch(updateShop(res.data.shop))
      }

    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || "Something went wrong" || error?.meaasage)
    } finally {
      setUpdateLoading(false)
    }
  }

  //Io event to get the order paymentStatus and  orderStatus :
  useEffect(() => {
    let handelData = (data) => {
      let handelDispatch = orderData.map(i => (
        i?.items?.[0]?.orderGroupId === data.orderGroupId ? {
          ...i, items: i?.items.map(item => ({ ...item, payment: data.paymentStatus, orderStatus: data.orderStatus }))
        } : i
      ))

      dispatch(setOrderData(handelDispatch))
    }

    socket.on("orderStatus", handelData)
    socket.on("orderCancelation", handelData)

    return () => {
      socket.off("orderStatus", handelData)
      socket.off("orderCancelation", handelData)
    }

  }, [socket, orderData])

  //Pagination : [backend] 
  let { totalPages, currentPage, hasNext, hasPrev, orderLoading } = useSelector(state => state.order)
  let pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  useEffect(() => {
    navigate(`/allorders?page=${currentPage}`), { replace: true }
  }, [currentPage])


  return (
    <>
      <AdminNav />

      <div className='lg:mx-20 flex flex-col mt-3 lg:mt-5 pb-7 lg:pb-5'>

        {shopData && <div className="sticky top-20 lg:top-21 h-16 py-3 pb-3 w-full bg-white z-50 flex justify-between items-center">
          <div className='px-2 lg:px-0'>
            <button
              onClick={() => navigate("/previousorders")}
              className=' border border-[#ff4d2d] text-[#ff4d2d] px-4 py-2 rounded-md cursor-pointer active:scale-95 duration-200 hover:bg-[#ff4d2d] hover:text-white '>
              Previous Order's
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-6 px-3 lg:px-0">
            <button
              onClick={() => {
                updateShopStatus(shopData?.open === "yes" ? "no" : "yes")
              }}
              disabled={updateLoading}
              className={`w-32 h-11 px-5 py-2.5 rounded-sm font-semibold text-sm cursor-pointer ${shopData?.open === "yes" ? "bg-green-300 text-green-700" : "bg-red-300 text-red-700"}`}
            >
              {updateLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : shopData?.open === "yes" ? "Open" : "Close"}
            </button>
          </div>

        </div>}

        <div className='mt-5 flex flex-col w-full pb-10'>
          <div className=' ml-3 lg:ml-0 mb-5 font-semibold text-2xl lg:text-3xl text-[#ff4d2d]'>
            Order Details :
          </div>

          <div className="ml-3 mr-3 lg:ml-0 lg:mr-0 overflow-x-auto rounded-xl border border-gray-100 bg-white">

            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border px-4 py-2 text-left">Date</th>
                  <th className="border px-4 py-2 text-left">Customer</th>
                  <th className="border px-4 py-2 text-left">Address</th>
                  <th className="border px-7 py-2 text-left">Food Item</th>
                  <th className="border px-4 py-2 text-left">Quantity & Price</th>
                  <th className="border px-4 py-2 text-left">Pay MOD</th>
                  <th className="border px-4 py-2 text-left flex flex-col">
                    Pay Status <span className="text-[10px]">(From-DelivayBoy)</span>
                  </th>
                  <th className="border px-4 py-2 text-left">Order Status</th>
                  <th className="border px-4 py-2 text-left">Details</th>
                </tr>
              </thead>

              <tbody>
                {orderLoading ? (
                  <tr>
                    <td colSpan={9} className="h-72">
                      <div className="flex h-full flex-col items-center justify-center gap-3">
                        <Loader2 size={38} className="animate-spin text-orange-500" />
                        <p className="text-sm text-gray-500 font-medium">
                          Loading orders...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : shopData && orderData?.length > 0 ? (
                  orderData.map((group, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="border px-4 py-2">{new Date(group?.items?.[0]?.createdAt).toLocaleDateString()}</td>
                      <td className="border px-4 py-2">{group?.items?.[0]?.orderedBy?.fullname || "Null"}</td>
                      <td className="border px-4 py-2">{group?.items?.[0]?.orderedBy?.address || "Null"}</td>
                      <td className="border px-7 py-2">{group?.items?.map(i => i?.foodDetails?.foodname).join(", ")}</td>

                      <td className="border px-4 py-2">
                        <div className="flex flex-col gap-1">
                          <span>{group?.items?.map(i => `( ${i?.quantity} × ${i?.foodDetails?.price} )`).join(" + ")}</span>
                          <span>Total = <span className="font-semibold">₹{group?.items?.map(i => (i?.foodDetails?.price || 0) * (i?.quantity || 0)).reduce((a, b) => a + b, 0)}</span></span>
                        </div>
                      </td>

                      <td className="border px-4 py-2">{group?.items?.[0]?.paymentMethod}</td>

                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded-xl text-xs font-medium ${group?.items?.every(item => item?.payment)
                          ? "bg-green-200 text-green-800 border border-green-600"
                          : "bg-yellow-200 text-[brown] border border-[brown]"
                          }`}>
                          {group?.items?.every(item => item?.payment) ? "Paid" : "Pending"}
                        </span>
                      </td>

                      <td className="border px-4 py-2">
                        <span className={`px-2 py-1 rounded-xl text-xs font-medium ${group?.items?.[0]?.orderStatus === "pending"
                          ? "bg-yellow-200 text-[brown] border border-[brown]"
                          : group?.items?.[0]?.orderStatus === "preparing"
                            ? "bg-purple-200 text-purple-700 border border-purple-600"
                            : group?.items?.[0]?.orderStatus === "out for delivary"
                              ? "bg-blue-200 text-blue-700 border border-blue-600"
                              : group?.items?.[0]?.orderStatus === "picked up and on_the_way"
                                ? "bg-cyan-100 text-cyan-800 border border-cyan-500"
                                : group?.items?.[0]?.orderStatus === "cancel"
                                  ? "bg-red-200 text-red-700 border border-red-600"
                                  : "bg-green-200 text-green-700 border border-green-600"
                          }`}>
                          {group?.items?.[0]?.orderStatus}
                        </span>
                      </td>

                      <td className="border px-4 py-2">
                        <IoEllipsisHorizontalOutline
                          size={28}
                          onClick={() => navigate(`/ordersdetail/${group?.items?.[0]?.orderGroupId}`)}
                          className="ml-2 lg:ml-3 rounded-full p-1 hover:bg-gray-200 cursor-pointer duration-200"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="h-60 text-center text-gray-500 font-medium">
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
      {(totalPages > 1) &&
        <div className='fixed bottom-0 left-0 right-0 mx-0 lg:mx-20 border-t border-black px-2 bg-white z-50'>
          <div className='flex justify-center items-center py-1 gap-2 '>
            {/* Prev Button */}
            <button
              disabled={!hasPrev || orderLoading || currentPage === 1}
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
              className={`border px-1 py-2 rounded-md flex items-center ${!hasPrev || orderLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            >
              <FaAngleLeft size={22} />
            </button>

            <div className='flex gap-2 overflow-x-auto whitespace-nowrap'>
              {pages.map(i => (
                <div className='shrink-0' key={i}>
                  <button
                    disabled={orderLoading}
                    onClick={() => {
                      dispatch(setCurrentPage(i))
                    }} className={`border px-3 py-2 rounded-md cursor-pointer ${currentPage === i ? "bg-orange-600 text-white" : "bg-white"} 
                               ${orderLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                  >
                    {i}
                  </button>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button
              disabled={!hasNext || orderLoading}
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
              className={`border px-1 py-2 rounded-md flex items-center ${!hasNext || orderLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            >
              <FaAngleRight size={22} />
            </button>

          </div>
        </div>
      }
    </>
  )
}

export default UserOrders