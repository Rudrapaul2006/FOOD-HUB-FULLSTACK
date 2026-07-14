import React, { useEffect, useState } from 'react'
import UserNav from '../Component/UserNav'
import getUserAllShops from '../User Hooks/getUserAllShops'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setResturentFoodCurrentPage, setResturentFoodHasNext, setResturentFoodHasPrev, setResturentFoodTotalPage, setSearchUserFoodByText, setUserFoodData, setUserFoodLoading, setUserFoodSorting } from '../Redux/foodSlice';
import { setSingleShopData } from '../Redux/adminSlice';
import UserFoodItem from '../User Component/UserFoodItem';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import { IoChevronBack, IoSearchOutline } from 'react-icons/io5';

const ShopFoods = () => {
    useGetAllCartItems()

    let params = useParams()
    let dispatch = useDispatch()
    let navigate = useNavigate()
    let shopId = params.id

    let { singleShopData } = useSelector(state => state.admin)
    let { userFoodLoading, userFoodSorting, searchUserFoodByText, resturentFoodCurrentPage , resturentFoodTotalPage } = useSelector(state => state.food) //Search from userFoodData : [] => redux 

    //search functionality :
    let [search, setSearch] = useState("")

    //search function : 
    let handelSearch = () => {
        dispatch(setResturentFoodCurrentPage(1))
        dispatch(setSearchUserFoodByText(search))
        dispatch(setUserFoodSorting(""))
    }

    //Fetch Particular shops food Items :
    let foodItemsOfShop = async () => {
        try {
            dispatch(setUserFoodLoading(true))
            let res = await axios.get(`${import.meta.env.VITE_food_endpoint}/getallshopfoods/${shopId}?page=${resturentFoodCurrentPage}&query=${searchUserFoodByText}&sort=${userFoodSorting}&limit=`, { withCredentials: true })
            if (res.data.success) {
                
                dispatch(setUserFoodData(res?.data?.foods))
                dispatch(setResturentFoodTotalPage(res?.data?.totalPage))
                dispatch(setResturentFoodHasPrev(res?.data?.hasPrev))
                dispatch(setResturentFoodHasNext(res?.data?.hasNext))
            }
        } catch (error) {
            console.log(error)
        } finally {
            dispatch(setUserFoodLoading(false))
        }
    }

    // Fetch shopData : 
    let fetchShopData = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_shop_endpoint}/get/${shopId}`, { withCredentials: true });
            if (res?.data?.success) {
                dispatch(setSingleShopData(res?.data?.shop))
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        foodItemsOfShop()
        fetchShopData()
    }, [shopId, dispatch, resturentFoodCurrentPage, searchUserFoodByText, userFoodSorting])


    // URL handle:
    useEffect(() => {
        navigate(`/shopfooditems/${shopId}?page=${resturentFoodCurrentPage}&query=${searchUserFoodByText || null}&sort=${userFoodSorting || null}`, { replace: true })
    }, [resturentFoodCurrentPage, searchUserFoodByText, userFoodSorting])

    //clean up :
    useEffect(() => {
        return () => {
            dispatch(setResturentFoodCurrentPage(1))
            dispatch(setSearchUserFoodByText(""))
            dispatch(setUserFoodSorting(""))
        }
    }, [])


    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>

            <div className='lg:mx-20 mt-9'>

                <div className="fixed top-25 lg:top-23 left-0 right-0 bg-white z-50 border-b mx-2 lg:mx-20 py-2">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

                        <div className="flex items-center gap-2 w-full lg:w-auto">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center justify-center w-10 h-10 shrink-0 border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            >
                                <IoChevronBack size={20} />
                            </button>

                            <div className="flex flex-1 lg:w-[550px] gap-2">
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search For food item"
                                    type="text"
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 "
                                />
                                <button
                                    onClick={handelSearch}
                                    className="px-3 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 active:scale-96 cursor-pointer duration-200"
                                >
                                    <IoSearchOutline size={22} />
                                </button>
                            </div>
                        </div>

                        <div className="w-full lg:w-auto">
                            <select 
                            value={userFoodSorting}
                            onChange={(e) => {
                                dispatch(setUserFoodSorting(e.target.value))
                                dispatch(setResturentFoodCurrentPage(1))
                                dispatch(setSearchUserFoodByText(""))
                                setSearch("")
                            }}
                            className="w-full lg:w-[220px] border border-gray-300 rounded-lg py-2 bg-white">
                                <option value="">Sort By</option>
                                <option value="htl">Price: High to Low</option>
                                <option value="lth">Price: Low to High</option>
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>

                    </div>
                </div>

                <div className='mt-32 lg:mt-20'>
                    <div className='mr-2 ml-2 lg:ml-0 lg:mr-0 text-3xl font-bold text-[#ff4d2d]'>{singleShopData?.shopname ? <div>{singleShopData?.shopname} <span className='text-[black]'>'s food item</span></div> : "Null"}</div>

                    <div className='mt-7 w-full'>
                        <UserFoodItem />
                    </div>
                </div>
            </div>
        </>
    )
}


export default ShopFoods