import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import axios from 'axios';
import { toast } from 'sonner';
import { addFoodInCart, replaceFoodInCart, setResturentFoodCurrentPage } from '../Redux/foodSlice';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

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

    // Replace the cart foods with another shop food item's :
    let foodReplace = async (foodId, shopId) => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_cart_endpoint}/replaceitem`, { shopId: shopId, foodId: foodId }, { withCredentials: true })

            if (res.data.success) {
                dispatch(replaceFoodInCart(res.data.cartData))
                toast.success(res.data.message || "Replace successfully")
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Something wrong")
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
                    {userFoodData?.length > 0 ? userFoodData?.map((item) => {

                        let isInCart = cartData?.some(i => (i?.foodDetails?._id || i?.foodDetails) === item?._id)
                        let isAnotherShopInCart = cartData?.length > 0 && cartData[0]?.shopDetails?._id !== item?.shopDetails?._id[0]

                        return (
                            <div key={item?._id} className='border border-gray-200 rounded-lg flex flex-col'>
                                <div key={item?._id} className='relative'>
                                    <img
                                        src={item?.image}
                                        alt={item?.foodname}
                                        className="w-full h-40 object-cover rounded-t-md"
                                    />

                                    <div className='flex justify-between'>
                                        <div className='flex items-center justify-center gap-2 px-3 py-1'>
                                            <MdOutlineShoppingCart className='mt-1' />

                                            {
                                                isInCart ? (
                                                    <span className='flex items-center gap-2 px-3 py-1 rounded-lg border border-gray-300 bg-gray-200 text-gray-500 text-sm font-medium cursor-not-allowed'>
                                                        Added
                                                    </span>
                                                ) : !isAnotherShopInCart ? (
                                                    <span
                                                        onClick={() => addFoodToCart(item?._id)}
                                                        className='px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50'
                                                    >
                                                        Add To Cart
                                                    </span>
                                                ) : (
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <span className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                                                                Add To Cart
                                                            </span>
                                                        </PopoverTrigger>

                                                        <PopoverContent className="mt-1 w-72 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-50">
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <h4 className="text-base font-semibold text-gray-900">
                                                                        Replace Item ?
                                                                    </h4>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        Cart contains items from another shop. Replace them ?
                                                                    </p>
                                                                </div>

                                                                <div className="flex justify-end gap-2">
                                                                    <PopoverClose asChild>
                                                                        <button className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer">
                                                                            Cancel
                                                                        </button>
                                                                    </PopoverClose>

                                                                    <button
                                                                        onClick={() => foodReplace(item?._id, item?.shopDetails?._id)}
                                                                        className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                                                                    >
                                                                        Replace
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )
                                            }
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