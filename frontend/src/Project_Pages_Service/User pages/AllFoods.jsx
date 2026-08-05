import React, { useEffect, useRef, useState } from 'react'
import UserNav from '../Component/UserNav'
import getAllFoodsFromShops from '../User Hooks/getAllFoodsFromShops'
import { useDispatch, useSelector } from 'react-redux';
import { MdOutlineShoppingCart } from 'react-icons/md';
import axios from 'axios';
import { addFoodInCart, replaceFoodInCart, setFindAllFoodByText, setSortUserAllFoods, setUserSideCurrentPage } from '../Redux/foodSlice';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PopoverClose } from '@radix-ui/react-popover';

const AllFoods = () => {
    getAllFoodsFromShops()
    useGetAllCartItems()


    let navigate = useNavigate()

    //All Foods from every resturent stored here :
    let { userAllFoodData, userSideCurrentPage, userSideHasNext, userAllFoodLoading } = useSelector(state => state.food)

    //Filtered userAllFoodData : 
    let [search, setSearch] = useState("")

    let handelSearch = () => {
        dispatch(setFindAllFoodByText(search))
        dispatch(setUserSideCurrentPage(1)) //when search then set user current page 1
        dispatch(setSortUserAllFoods("")) //when search set user food sort value ("")
    }

    let { findAllFoodByText, sortUserAllFoods } = useSelector(state => state.food)

    //Add to cart :
    let dispatch = useDispatch()
    let addFoodToCart = async (foodId) => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_cart_endpoint}/add/${foodId}`, {}, { withCredentials: true })
            if (res.data.success) {
                dispatch(addFoodInCart(res.data.cartData))
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }

    //Replace another resturent food item :
    let foodReplace = async (foodId, shopId) => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_cart_endpoint}/replaceitem`, { foodId: foodId, shopId: shopId }, { withCredentials: true })

            if (res.data.success) {
                toast.success(res.data.message)
                dispatch(replaceFoodInCart(res.data.cartData))
            }

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Something wrong")
        }
    }

    // Cart Data :
    let { cartData } = useSelector(state => state.food)


    // Infinite Scroll :
    let userRef = useRef(null)

    useEffect(() => {
        let observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && userSideHasNext && !userAllFoodLoading) {
                dispatch(setUserSideCurrentPage(userSideCurrentPage + 1))
            }
        }, {
            threshold: 0.1
        })

        if (userRef.current) {
            observer.observe(userRef.current)
        }

        return () => {
            if (userRef.current) {
                observer.unobserve(userRef.current)
            }
        }

    }, [userSideHasNext, userAllFoodLoading])

    //url handler :
    useEffect(() => {
        navigate(`/allfoods?query=${findAllFoodByText || null}&sort=${sortUserAllFoods || null}`, { replace: true })
    }, [findAllFoodByText, sortUserAllFoods])

    // clean up function : [when user navigate then come back in this page then userSideAllPage set in 1]
    useEffect(() => {
        return () => {
            dispatch(setUserSideCurrentPage(1)) //when authorize user come in this page, set user current page = 1
            dispatch(setFindAllFoodByText("")) //when authorize user come in this page, set search text value ("")
            dispatch(setSortUserAllFoods("")) //when authorize user come in this page, set sorting value ("")
        }
    }, [])

    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>

            <div className='lg:mx-20 mt-6 lg:mt-1 px-2 lg:px-0'>
                <div className='sticky flex flex-col lg:flex-row lg:justify-between top-25 lg:top-21 w-full h-fit py-4 px-2 lg:px-0 pb-8 lg:pb-7 bg-white z-9'>

                    <div className='w-full flex gap-3'>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='w-full lg:w-[30%] border border-gray-300 px-3 py-2 rounded-md focus:border-none focus:outline-none focus:ring focus:ring-orange-500 text-gray-600'
                            placeholder='Search for food item'
                            type="text"
                        />

                        <button
                            className='border px-2 border-gray-300 bg-gray-200 rounded-md active:scale-97 duration-300 cursor-pointer'
                            onClick={handelSearch}
                        >
                            <CiSearch size={24} />
                        </button>
                    </div>

                    <select
                        value={sortUserAllFoods}
                        onChange={(e) => {
                            dispatch(setSortUserAllFoods(e.target.value))
                            dispatch(setUserSideCurrentPage(1)) //when user use sort then set user current_page 1
                            dispatch(setFindAllFoodByText("")) //when user use sort then set user search value ("")
                            setSearch("") //when user use sort then set user search value ("") => this is search value instence 
                        }}
                        className='w-fit border px-3 py-2 rounded-md lg:px-3 lg:py-0 mt-5 lg:mt-0 cursor-pointer'
                    >
                        <option className='text-orange-500' value="">Select Option</option>
                        <option value="hst">Highest to lowest</option>
                        <option value="lst">Lowest to highest</option>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>

                </div>

                <div className='text-4xl font-bold ml-2.5 lg:ml-0'>
                    All Food Items
                </div>

                <div className='gap-10 w-full h-fit mt-7 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mb-7'>
                    {userAllFoodData?.length > 0 ? userAllFoodData?.map((item) => {
                        let isInCart = cartData?.some(i => (i.foodDetails?._id || i?.foodDetails) === item?._id)
                        let isAnotherShopInCart = cartData?.length > 0 && cartData[0]?.shopDetails?._id !== item?.shopDetails?._id

                        return (
                            <div key={item?._id} className='mr-2 lg:mr-0 ml-2 lg:ml-0 border border-gray-200 rounded-md shadow-sm hover:shadow-md duration-300'>
                                <div className='relative'>
                                    <img
                                        src={item?.image}
                                        alt={item?.foodname}
                                        className="w-full h-40 object-cover rounded-t-md "
                                    />

                                    {/*Food Add To Cart Functionality */}
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
                                    <div className=' flex justify-between  mt-1 text-[17px] font-semibold text-[#ff4d2d]'>{item?.foodname || "null"}</div>
                                    <div className=' flex justify-between  mt-1 text-[14px] font-semibold text-[#6538f7]'>{item?.shopDetails?.shopname || "null"} </div>
                                    <div className='mt-3 text-[14px] text-slate-400 font-normal'> {item.description} </div>

                                    <div className='mt-1 mr-0.5 ml-0.5 flex justify-between text-sm text-gray-600'> <span>{item?.category || "null"}</span> <span>{item?.foodtype || "null"}</span></div>
                                    <div className='mt-2 text-lg flex justify-between'>
                                        <span className='font-bold text-green-600'> ₹ {item?.price || "null"}</span>
                                        <span className='text-[12px]'>{item?.isAvailable === "yes" ? <div className='px-3 py-0.5 mt-1 rounded-xl felx items-center justify-center text-green-700 bg-green-100'>available</div>
                                            : <div className='px-3 py-0.5 mt-1 rounded-xl felx items-center justify-center text-red-700 bg-red-100'>Out of Stock</div>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : <div>No foods Available yet</div>}
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center pb-1">
                {userAllFoodLoading ? <p className="text-gray-500"> <Loader2 className='w-full flex items-center justify-center animate-spin' /> </p> : ""}
            </div>

            <div ref={userRef} className="h-1 w-full"></div>
        </>
    )
}

export default AllFoods