import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { HiMiniBars3 } from "react-icons/hi2";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { MdAccountCircle } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserData } from '@/Project_Pages_Service/Redux/userSlice';
import { setFoodData } from '@/Project_Pages_Service/Redux/foodSlice';
import { setOrderData } from '@/Project_Pages_Service/Redux/orderSlice';
import { setShopData } from '@/Project_Pages_Service/Redux/adminSlice';


const DelivaryBoyNav = () => {
    let dispatch = useDispatch();
    let navigate = useNavigate();

    let { userData } = useSelector(state => state.user)
    let handleLogOut = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_user_endpoint}/logout`, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setUserData(null))
                dispatch(setFoodData([]))
                dispatch(setOrderData([]));
                dispatch(setShopData([]))
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    }


    return (
        <>
            <div className="sticky top-0 z-999 bg-white w-full h-[12vh] border-b  flex items-center justify-between px-4 md:px-10 lg:px-20">
                {/* Logo */}
                <div className="text-2xl md:text-3xl font-bold text-[#fd4322] flex items-center">
                    FoodHub
                </div>

                <div className="flex items-center gap-4 md:gap-5">

                    {/* For small devices [user profile and log out] */}
                    <div className='flex lg:hidden'>
                        <Popover className="">
                            <PopoverTrigger>
                                <HiMiniBars3 className="flex lg:hidden mt-1 lg:mt-0 cursor-pointer" size={22} />
                            </PopoverTrigger>

                            <PopoverContent className="lg:hidden z-9999 mt-9 mr-1 bg-transparent border-none">
                                <div className="p-1 w-44 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="flex items-center z-999 gap-3 rounded-lg w-full text-left px-4 py-2 text-sm">
                                        <button className=''>{userData?.user?.fullname} ({userData?.user?.role})</button>
                                    </div>
                                    <div onClick={() => navigate("/delivarypartnerprofile")} className="flex items-center z-999 gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <CgProfile  className="text-[black] mt-1" size={18} />
                                        <button className='cursor-pointer'>Profile</button>
                                    </div>
                                    <button onClick={handleLogOut} className=" flex items-center gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <CiLogout className="text-[black] mt-1" size={18} />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* User Profile */}
                    <div className="hidden lg:flex items-center">
                        <Popover>
                            <PopoverTrigger>
                                <div className="w-12 h-12 lg:ml-5 rounded-full border border-[gray]/70 bg-gray-400 flex items-center justify-center cursor-pointer hover:shadow-md hover:sclae-105 duration-200">
                                    {userData?.user?.image ? (
                                        <img src={userData?.user?.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <MdAccountCircle size={30} className="text-gray-600" />
                                    )}
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="z-99999 mt-5 mr-1 bg-transparent border-none">
                                <div className="p-2 w-54 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="flex items-center z-999 gap-3 rounded-lg w-full text-left px-4 py-2 text-sm">
                                        <button className=''>{userData?.user?.fullname} ({userData?.user?.role})</button>
                                    </div>
                                    <div onClick={() => navigate("/delivarypartnerprofile")} className="flex items-center z-999 gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <CgProfile  className="text-[black] mt-1" size={18} />
                                        <button className='cursor-pointer'>Profile</button>
                                    </div>
                                    <div onClick={handleLogOut} className="flex items-center z-999 gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <CiLogout className="text-[black] mt-1" size={18} />
                                        <button className='cursor-pointer'>Log Out</button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                </div>
            </div>
        </>
    )
}

export default DelivaryBoyNav
