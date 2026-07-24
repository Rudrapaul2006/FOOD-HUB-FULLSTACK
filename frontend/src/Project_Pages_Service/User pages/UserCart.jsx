import React, { useEffect, useState } from 'react'
import UserNav from '../Component/UserNav'
import { useDispatch, useSelector } from 'react-redux'
import { IoChevronBack } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import { removeAllFoodFromCart, removeFoodFromCart, setCartData, updateQuantityInCart } from '../Redux/foodSlice'
import axios from 'axios'
import { toast } from 'sonner'
import useGetAllCartItems from '../User Hooks/useGetAllCartItems'
import { getSocket } from '../WebSocketHooks/connetSocket'

const UserCart = () => {
    useGetAllCartItems()

    let navigate = useNavigate()
    let dispatch = useDispatch()


    let { cartData } = useSelector(state => state.food)
    let socket = getSocket()

    let price = cartData?.map(i => (i?.foodDetails?.price * i?.quantity))
    let totalPrice = price?.reduce((curr, penn) => curr + penn, 0)

    //RemoveFrom Cart :
    let removeFromCart = async (foodId) => {
        try {
            let res = await axios.delete(`${import.meta.env.VITE_cart_endpoint}/delete/${foodId}`, { withCredentials: true })
            if (res.data.success) {
                dispatch(removeFoodFromCart(foodId))
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    //Increase or decrease quantity : 
    let updateQuantity = async (foodId, Quantity) => {
        try {
            let res = await axios.put(`${import.meta.env.VITE_cart_endpoint}/update/${foodId}`, { quantity: Quantity }, { withCredentials: true })
            if (res.data.success) {
                dispatch(updateQuantityInCart(res.data.updateQuantity))
            }
        } catch (error) {
            console.log(error)
        }
    }

    //Remove from cart :
    let removeAllCartItem = async () => {
        try {
            let res = await axios.delete(`${import.meta.env.VITE_cart_endpoint}/deleteall`, { withCredentials: true })
            if (res.data.success) {
                dispatch(removeAllFoodFromCart())
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Cart is empty" || error.message)
        }
    }

    //shop status update when admin logout or close the website :
    useEffect(() => {
        if (!socket) return
        
        let handleData = (data) => {
            dispatch(
                setCartData(
                    cartData?.map(i =>
                        i?.shopDetails?._id === data.shopId ? {
                            ...i,
                            shopDetails: {
                                ...i.shopDetails, ...(data.open && { open: data.open }), ...(data.socketOpen && { socketOpen: data.socketOpen })
                            }
                        } : i
                    )
                )
            )   
        }

        socket.on("updateShopStatus", handleData)

        return () => {
            socket.off("updateShopStatus", handleData)
        }

    }, [socket, cartData])

    let isClosed = cartData?.[0]?.shopDetails?.open === "no" && cartData?.[0]?.shopDetails?.socketOpen === "yes" || cartData?.[0]?.shopDetails?.open === "yes" && cartData?.[0]?.shopDetails?.socketOpen === "no" ||
    cartData?.[0]?.shopDetails?.open === "no" && cartData?.[0]?.shopDetails?.socketOpen === "no" ;

    return (
        <>
            <div className='w-full fixed z-99 bg-white top-0'>
                <UserNav />
            </div>

            <div className=" flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:mx-60 mt-25 lg:mt-30">
                <div className='flex flex-row items-center gap-3'>
                    <button onClick={() => navigate(-1)}
                        className=" ml-4 lg:ml-0 flex items-center justify-center w-9 h-9 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                    >
                        <IoChevronBack size={20} />
                    </button>
                    <span className="text-xl lg:text-2xl font-bold">
                        Your Cart
                    </span>
                </div>

                <div className='flex items-center gap-2 ml-4 lg:ml-0 '>
                    <span className='text-md lg:text-lg font-semibold'> {cartData?.map(i => i?.shopDetails?.shopname || "Null")[0]}</span>
                    {cartData?.length !== 0 &&
                        <span>
                            {(cartData?.[0]?.shopDetails?.open === "yes" && cartData?.[0]?.shopDetails?.socketOpen === "yes" )  ? <div className='px-2 border border-green-400 bg-green-200 rounded-md font-semibold'>Open</div>
                                : <div className='px-2 border border-red-400 bg-red-200 rounded-md'>Closed</div>}
                        </span>
                    }
                </div>
            </div>

            <div className="lg:mx-60 mt-7 mb-5">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ml-4 lg:ml-0 mr-4 lg:mr-0">
                    {cartData?.length > 0 ? cartData?.map((item) => {
                        let qty = item?.quantity || 1

                        return (
                            <div key={item?._id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border-b border-orange-600 lg:border-gray-200 last:border-b-0 hover:bg-gray-50 transition " >

                                <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                                    <img
                                        className="w-40 h-44 min-w-[160px] min-h-[176px] max-w-[160px] max-h-[176px] rounded-lg object-cover"
                                        src={item?.foodDetails?.image || ""}
                                        alt={item?.foodDetails?.foodname || "Null"}
                                    />

                                    <div className="flex flex-col lg:flex-row justify-between w-full lg:w-[65%] lg:mr-10">
                                        <div className="flex flex-col mt-1 lg:mt-0">
                                            <span className="font-semibold text-gray-800"> {item?.foodDetails?.foodname} </span>
                                            <span className='text-sm mt-1 text-blue-600 border px-2 w-fit rounded-lg bg-blue-50 border-blue-300'>{item?.shopDetails?.shopname}</span>
                                            <span className="text-sm text-gray-500">  {item?.foodDetails?.description} </span>

                                            <span className='mt-2'> {item?.foodDetails?.isAvailable === "yes" ? <div className='px-3 rounded-md flex border w-fit bg-green-100 text-sm text-green-700'> available </div> :
                                                <div className='px-3 rounded-md flex border w-fit bg-red-100 text-sm text-red-700'>  Out of Stock </div>}
                                            </span>

                                            <span className='text-sm mt-1'>Total Price for {item?.quantity} item(s) = ₹{item?.quantity * item?.foodDetails?.price || 0}</span>
                                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <span className="text-md text-gray-400">Item Price :</span>
                                                <span className="text-base font-semibold text-green-600">
                                                    ₹ {item?.foodDetails?.price}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full lg:w-fit flex flex-row gap-2 lg:gap-10 pb-3 '>
                                    <div className="lg:ml-10 flex items-center rounded-md overflow-hidden border border-red-300">
                                        <button disabled={item?.quantity === 1} onClick={() => updateQuantity(item?._id, qty - 1)}
                                            className={` px-3.5 cursor-pointer disabled:cursor-not-allowed  bg-red-200 border-r border-red-300`}>
                                            <span className="text-red-600 text-[22px]">−</span>
                                        </button>

                                        <span className="px-3">{qty}</span>

                                        <button onClick={() => updateQuantity(item?._id, qty + 1)}
                                            className="bg-green-200 px-3 border-l border-red-300 cursor-pointer" >
                                            <span className="text-green-600 text-[22px]">+</span>
                                        </button>
                                    </div>

                                    {/* <button hidden={cartData.length > 1} disabled={cartData?.map(i => i?.shopDetails?.open === "no")[0]} onClick={() => navigate(`/cheakout/${item._id}`)} className={`px-4 py-2 rounded-md ${cartData?.map(i => i?.shopDetails?.open === "no")[0] ? "border px-4 py-1.5 rounded-md bg-green-600 text-white cursor-not-allowed opacity-60" : "border px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white active:scale-97 cursor-pointer duration-150"}`}>
                                        CheakOut
                                    </button> */}

                                    <button onClick={() => removeFromCart(item?._id)} className="border px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white active:scale-97 cursor-pointer duration-150">
                                        Remove
                                    </button>

                                    <button disabled={isClosed} onClick={() => navigate(`/orderallcartitem/${item?.foodDetails?._id}`)} className={`border px-4 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white ${isClosed ? "cursor-not-allowed opacity-60" : "hover:bg-green-700 active:scale-95 cursor-pointer duration-150"}`}>
                                        Order
                                    </button>

                                </div>
                            </div>
                        )
                    }) : (<div className="p-6 text-center text-gray-500"> No Foods In Your Cart Yet </div>)}

                    <div className="lg:mx-22 flex flex-col lg:flex-row justify-between gap-3 py-3 font-semibold">
                        <span className='ml-4 lg:ml-0'>Total Price <span className="ml-2 text-green-600 font-bold">₹ {totalPrice}</span></span>
                        <div className="flex ml-4 lg:ml-0 mt-2 lg:mt-0">
                            <button hidden={cartData.length === 0 || cartData.length === 1} disabled={isClosed} onClick={() => navigate("/orderallcartitem")}
                                className={`px-4 py-1.5 rounded-md bg-green-600 text-white ${isClosed ? "cursor-not-allowed opacity-60" : "hover:bg-green-700 active:scale-95 cursor-pointer duration-150"}`}
                            >
                                Order All Items
                            </button>

                            <button hidden={cartData.length === 0 || cartData.length === 1} onClick={removeAllCartItem} className="ml-4 lg:ml-6 px-4 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white active:scale-95 cursor-pointer">Remove All</button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default UserCart