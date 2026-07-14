import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import axios from 'axios';
import { toast } from 'sonner';
import { addFoodInCart, setResturentFoodCurrentPage } from '../Redux/foodSlice';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import { Loader2 } from 'lucide-react';

const UserFoodItem = () => {
    useGetAllCartItems()
    let dispatch = useDispatch()

    //Ecah resturent foods store here {userFooddata : []}
    let { userFoodData } = useSelector(state => state.food)
    let { userFoodLoading, searchUserFoodByText, userFoodSorting, resturentFoodCurrentPage, resturentFoodTotalPage, resturentFoodHasNext, resturentFoodHasPrev } = useSelector(state => state.food) //Search from userFoodData : [] => redux 

    //Add to cart :
    let addFoodToCart = async (foodId) => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_cart_endpoint}/add/${foodId}`, {}, { withCredentials: true })
            if (res.data.success) {
                dispatch(addFoodInCart(res.data.cartData))
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message)
        }
    }

    //Cart Data :
    let { cartData } = useSelector(state => state.food)

    // Total Page's :
    let totalPaegs = Array.from({ length: resturentFoodTotalPage }, (_, i) => i + 1)

    return (
        <>
            {/* Food card  */}
            <div className='relative'>
                <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 lg:gap-15 lg:h-fit ml-2 mr-2 lg:mr-0 lg:ml-0 mb-25 ${userFoodLoading ? "blur-sm opacity-50 pointer-events-none" : ""}`}>
                    {userFoodData.length > 0 ? userFoodData?.map((item) => {

                        let isInCart = cartData.some(i => i?.foodDetails?._id === item?._id || i?.foodDetails === item?._id)

                        return (
                            <div key={item._id} className='border border-gray-200 rounded-lg flex flex-col'>
                                <div className='relative'>
                                    <img
                                        src={item?.image}
                                        alt={item?.foodname}
                                        className="w-full h-40 object-cover rounded-t-md"
                                    />

                                    <div className='flex justify-between'>
                                        <div className='mt-1 ml-2'>
                                            <button
                                                onClick={() => addFoodToCart(item?._id)}
                                                className={`flex items-center justify-center gap-2 px-3 py-1 rounded-lg border transition-all duration-200 ${isInCart
                                                    ? "bg-gray-200 text-gray-600 border-gray-300 cursor-not-allowed"
                                                    : "bg-white text-gray-800 border-gray-300 cursor-pointer"}`}
                                            >
                                                <MdOutlineShoppingCart className='mt-1' />
                                                {isInCart ? <span className='text-sm font-medium text-gray-500'>Added</span> :
                                                    <span className='text-sm font-medium text-gray-800'>Add to Cart</span>}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col p-3 border-t-2 border-[#ff4d2d] mt-1'>
                                    <div className='flex justify-between mt-1 text-[17px] font-semibold text-[#ff4d2d]'>
                                        {item?.foodname}
                                    </div>

                                    <div className='mt-3 text-[14px] text-slate-400 font-normal'>
                                        {item?.description}
                                    </div>

                                    <div className='mt-1 mr-0.5 ml-0.5 flex justify-between text-sm text-gray-600'>
                                        <span>{item?.category}</span>
                                        <span>{item?.foodtype}</span>
                                    </div>

                                    <div className='mt-2 text-lg flex justify-between'>
                                        <span className='font-bold text-green-600'>
                                            ₹{item?.price}
                                        </span>

                                        <span className='text-[12px]'>
                                            {item.isAvailable === "yes" ?
                                                <div className='px-3 py-0.5 mt-1 rounded-xl flex items-center justify-center text-green-700 bg-green-100'>
                                                    Available
                                                </div>
                                                :
                                                <div className='px-3 py-0.5 mt-1 rounded-xl flex items-center justify-center text-red-700 bg-red-100'>
                                                    Out of Stock
                                                </div>
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : "No food available yet"}
                </div>

                {
                    userFoodLoading &&
                    <div className='inset-0 flex items-center justify-center z-50'>
                        <Loader2 className='h-12 w-12 animate-spin text-[#ff4d2d]' />
                    </div>
                }
            </div>

            {/* Pagination */}
            {
                resturentFoodTotalPage > 1 &&
                <div className='mx-0 lg:mx-20 fixed bottom-0 right-0 left-0 bg-white flex gap-3 items-center justify-center border-t border-black z-99'>
                    <button
                        disabled={!resturentFoodHasPrev || userFoodLoading}
                        onClick={() => {
                            dispatch(setResturentFoodCurrentPage(resturentFoodCurrentPage - 1))
                        }}
                        className={`flex items-center justify-center border border-orange-500 px-1.5 py-3 rounded-md ${!resturentFoodHasPrev || userFoodLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                        <FaAngleLeft />
                    </button>

                    <div className="overflow-x-auto scrollbar-hide ">
                        <div className="flex w-max gap-2 py-1">
                            {totalPaegs?.map(i => (
                                <button key={i} onClick={() => dispatch(setResturentFoodCurrentPage(i))}
                                    className={`shrink-0 border border-orange-500 px-2.5 py-2 rounded-md ${resturentFoodCurrentPage === i ? "bg-orange-500 text-white" : "bg-white"}`}>
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={!resturentFoodHasNext || userFoodLoading}
                        onClick={() => {
                            dispatch(setResturentFoodCurrentPage(resturentFoodCurrentPage + 1))
                        }}
                        className={`flex items-center justify-center border border-orange-500 px-1.5 py-3 rounded-md  ${!resturentFoodHasNext || userFoodLoading ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
                        <FaAngleRight />
                    </button>
                </div>
            }

        </>
    )
}

export default UserFoodItem