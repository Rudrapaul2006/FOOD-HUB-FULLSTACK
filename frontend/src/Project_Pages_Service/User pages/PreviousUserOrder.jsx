import React, { useEffect, useState } from 'react'
import getAllUserOrder from '../User Hooks/getAllUserOrder'
import { useDispatch, useSelector } from 'react-redux';
import UserNav from '../Component/UserNav';
import { HiDotsHorizontal } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { setSearchUserOrderByText, setSortUserCancelOrder, setUserCancelOrderCurrentPage } from '../Redux/orderSlice';
import getCancelAndCompleateOrders from '../User Hooks/getCancelAndCompleateOrders';
import { Loader2 } from 'lucide-react';
import { IoSearch } from 'react-icons/io5';

const PreviousUserOrder = () => {
  getCancelAndCompleateOrders()

  let navigate = useNavigate()
  let dispatch = useDispatch()

  //search functionality :
  let [search, setSearch] = useState("")

  //search handeler function :
  let handleSearchValue = () => {
    dispatch(setUserCancelOrderCurrentPage(1))
    dispatch(setSearchUserOrderByText(search))
    dispatch(setSortUserCancelOrder(""))
  }

  let { userCancelOrders, userCancelOrderCurrentPage, userCancelOrderHasPrev, userCancelOrderHasNext, userCancelOrderLoading,
    searchUserOrderByText, userCancelOrderTotalPage, sortUserCancelOrder } = useSelector(state => state.order)

  //Handel query :
  useEffect(() => {
    navigate(`/previoususerorder?page=${userCancelOrderCurrentPage}&query=${search || null}&sort=${sortUserCancelOrder || null}`, { replace: true })
  }, [userCancelOrderCurrentPage, searchUserOrderByText, sortUserCancelOrder])

  let totalPages = Array.from({ length: userCancelOrderTotalPage }, (_, i) => i + 1)

  //Clean up:
  useEffect(() => {
    return () => {
      dispatch(setSearchUserOrderByText(""))
      dispatch(setSortUserCancelOrder(""))
      dispatch(setUserCancelOrderCurrentPage(1))
    }
  }, [])


  return (
    <>
      <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>

      <div className='mx-2 lg:mx-0 sticky top-18 lg:top-20'>

        <div className=' lg:mx-20 mt-3 lg:px-0 py-5 bg-white z-99 '>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='w-full flex items-center gap-3 lg:justify-between'>
              <button
                className='p-1.5 rounded-xl border bg-gray-100 hover:bg-gray-200 duration-200 cursor-pointer '
                onClick={() => {
                  navigate(-1)
                }}
              >
                <IoIosArrowBack size={22} />
              </button>

              <div className='flex gap-3 flex-1 lg:flex-none lg:w-1/3'>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='w-full border py-2 px-3 rounded-md focus:outline-none focus:ring focus:ring-orange-500'
                  type="text"
                  placeholder="Search orders..."
                />

                <button
                  onClick={() => {
                    handleSearchValue()
                  }}
                  className='border rounded-md px-2.5 hover:bg-gray-100 hover:shadow-sm active:scale-95 cursor-pointer duration-200 flex-shrink-0'
                >
                  <IoSearch />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className='mx-2 lg:mx-20'>
        <div className="flex items-center justify-end gap-3">
          <label className="font-medium">Sort By :</label>

          <select
            value={sortUserCancelOrder}
            onChange={(e) => {
              dispatch(setSearchUserOrderByText(""))
              setSearch("")
              dispatch(setUserCancelOrderCurrentPage(1))
              dispatch(setSortUserCancelOrder(e.target.value))
            }}
            className="border rounded-lg px-3 py-2 outline-none"
          >
            <option value="">
              Select Sort Option
            </option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="htl">Price: High to Low</option>
            <option value="lth">Price: Low to High</option>
            <option value="cod">COD orders</option>
            <option value="online">ONLINE orders</option>
          </select>
        </div>
      </div>

      <div className='lg:mx-20 mt-6 lg:mt-9 mb-5 lg:mb-10 pb-15'>
        <div className="ml-3 lg:ml-0 mr-3 lg:mr-0 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">Date</th>
                <th className="border px-4 py-2 text-left">Customer</th>
                {/* <th className="border px-4 py-2 text-left">Address</th> */}
                <th className="border px-2 py-2 text-left">Food Item</th>
                <th className="border px-2 py-2 text-left">Quantity</th>
                <th className="border px-2 py-2 text-left ">Total Price</th>
                <th className="border px-1 py-2 text-left">Pay MOD</th>
                <th className="border px-1 py-2 text-left">Pay Status</th>
                <th className="border px-1 py-2 text-left">Order Status</th>
                <th className="border px-2 py-2 text-left">View Details</th>
              </tr>
            </thead>

            <tbody>
              {userCancelOrders.length > 0 ?
                userCancelOrders?.map((order, index) => {

                  return (
                    <tr key={index}>
                      <td className="border px-4 py-2"> {new Date(order.items[0]?.updatedAt || order.createdAt || "Null").toLocaleDateString()} </td>

                      <td className="border px-4 py-2"> {order.items[0]?.orderedBy?.fullname || "Null"} </td>
                      {/* <td className="border px-4 py-2"> {order.items[0]?.orderedBy.address} </td> */}

                      <td className="border px-4 py-2">
                        {order.items?.map((item, i) => (
                          <div key={i}>
                            {item?.foodDetails?.foodname || "Null"}
                          </div>
                        ))}
                      </td>

                      <td className="border px-1 py-2">
                        {order.items?.map((item, i) => (
                          <div key={i}>
                            qty : {item?.quantity || "Null"} x {item?.foodDetails?.price || "Null"} =  {item?.quantity * item?.foodDetails?.price || "Null"}
                          </div>
                        ))}
                      </td>

                      <td className="border px-5 py-2">
                        <div className="flex gap-1 font-medium text-gray-700">
                          <span className="font-semibold">₹</span>
                          <span> {order?.items?.reduce((total, item) => total + (item?.foodDetails?.price * item?.quantity), 0) || "Null"}
                          </span>
                        </div>
                      </td>

                      <td className="border px-2 py-2 "> {order?.items[0]?.paymentMethod || "Null"} </td>

                      <td className="p-2 text-center border">
                        <span className={`flex items-center justify-center px-2 py-1 rounded-xl text-xs font-medium border ${order?.items?.some(
                          j => j?.assignment?.paymentStatus === "paid" || j?.payment === true)
                          ? "bg-green-200 text-green-600 border-green-500"
                          : "bg-yellow-200 text-[brown] border-yellow-500"}`} >
                          {order?.items?.some(
                            j => j?.assignment?.paymentStatus === "paid" || j?.payment === true
                          ) ? "Paid" : "Pending"}
                        </span>
                      </td>

                      <td className="p-2 text-center border">
                        <span className={`flex items-center justify-center px-2 py-1 rounded-xl text-xs font-medium border ${order?.items?.[0]?.orderStatus === "compleate"
                          ? "bg-green-200 text-green-600 border-green-500"
                          : "bg-red-200 text-red-600 border-red-500"}`}>
                          {order?.items?.[0]?.orderStatus || "pending"}
                        </span>
                      </td>

                      <td className="border px-2 py-2 text-center align-middle">
                        <div className="flex justify-center items-center">
                          <button
                            onClick={() => navigate(`/previosuserorderdetails/${order?.items[0]?.orderGroupId}`)}
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
      {userCancelOrderTotalPage > 1 &&
        <>
          <div className='fixed bottom-1 border-t border-t-[black]/50 bg-white  left-0 right-0 mx-2 lg:mx-20 flex items-center justify-center gap-2 z-50'>

            <button
              disabled={userCancelOrderLoading || !userCancelOrderHasPrev}
              onClick={() => {
                dispatch(setUserCancelOrderCurrentPage(userCancelOrderCurrentPage - 1))
              }}
              className={`px-2 py-3 border border-red-300 bg-white shadow-sm rounded-xl transition-all duration-200 ${!userCancelOrderHasPrev ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:shadow-md"}`}
            >
              <FaAngleLeft />
            </button>

            <div className='flex gap-2  backdrop-blur-sm px-2 py-2 rounded-2xl overflow-x-auto'>
              {totalPages.map(i => (
                <button
                  disabled={userCancelOrderLoading && userCancelOrderCurrentPage === i}
                  onClick={() => {
                    dispatch(setUserCancelOrderCurrentPage(i))
                  }}
                  className={`px-3 py-2 border rounded-xl transition-all duration-200 cursor-pointer ${userCancelOrderCurrentPage === i ? "bg-orange-500 text-white border-orange-400" : "bg-white border-red-300 hover:bg-orange-50"}`}
                  key={i}
                >
                  {userCancelOrderLoading && userCancelOrderCurrentPage === i ? <Loader2 className='w-2 h-6 animate-spin' /> : i}
                </button>
              ))}
            </div>

            <button
              disabled={!userCancelOrderHasNext}
              onClick={() => {
                dispatch(setUserCancelOrderCurrentPage(userCancelOrderCurrentPage + 1))
              }}
              className={`px-2 py-3 border border-red-300 bg-white shadow-sm rounded-xl transition-all duration-200 ${!userCancelOrderHasNext ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:shadow-md"}`}
            >
              <FaAngleRight />
            </button>

          </div>
        </>
      }

    </>
  )
}

export default PreviousUserOrder
