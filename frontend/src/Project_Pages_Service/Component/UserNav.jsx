import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React, { use, useState } from 'react'
import { IoIosSearch, IoMdCart } from 'react-icons/io';
import { IoFastFood, IoLocationOutline } from "react-icons/io5";
import { NavLink, useNavigate } from 'react-router-dom';
import { HiMiniBars3 } from "react-icons/hi2";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { MdAccountCircle, MdOutlineHome } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserData } from '../Redux/userSlice';
import { FcBusinessman } from 'react-icons/fc';
import { setCartData, setFoodData } from '../Redux/foodSlice';
import { setUserShopData } from '../Redux/adminSlice';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import { TbReorder } from 'react-icons/tb';
import { disconnectSocket, getSocket } from '../WebSocketHooks/connetSocket';

const UserNav = () => {
    useGetAllCartItems()

    let socket = getSocket()
    let { userData, city  } = useSelector((state) => state.user)
    let image = userData?.user?.image


    let dispatch = useDispatch()
    let navigate = useNavigate()
    let { cartData } = useSelector(state => state.food)

    let handleLogOut = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_user_endpoint}/logout`, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setUserData(null))
                // dispatch(setFoodData(null))
                disconnectSocket()
                dispatch(setUserShopData([]))
                dispatch(setCartData([]))
                navigate("/signin")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    }

    return (
        <>
            <div className="w-full h-[12vh] border-b shadow-sm flex items-center justify-between px-4 md:px-10 lg:px-20">
                {/* Logo */}
                <div className="text-2xl md:text-3xl font-bold text-[#fd4322] flex items-center">
                    FoodHub
                </div>

                {/* Search bar {} */}
                {/* remove md:hidden and put md:flex*/}
                <div className="hidden md:hidden ml-11  items-center justify-center w-[48%]">
                    <div className="flex items-center w-full h-13 bg-[#fbf9f7] border border-gray-200 rounded-xl shadow-md transition">

                        <div className="flex items-center gap-3 px-5 h-[50%] border-r-2 border-[#ff6d53] text-gray-500">
                            <IoLocationOutline size={22} />
                            <h5 className="text-sm font-medium">{city}</h5>
                        </div>

                        <div className="flex items-center gap-3 px-4 flex-1">
                            <IoIosSearch size={22} className="text-[#ff4d2d]" />
                            <input
                                type="text"
                                placeholder="Search for food, restaurants, or places"
                                className="w-full bg-transparent text-sm outline-none placeholder-gray-400"
                            />
                        </div>

                    </div>
                </div>


                <div className="flex items-center gap-4 md:gap-5 ">
                    {/* For small device [small search bar] */}
                    <div>
                        <Popover>
                            {/* remove hidden */}
                            <PopoverTrigger>
                                <IoIosSearch className='hidden mt-3 text-gray-600 font-bold md:hidden lg:hidden cursor-pointer' size={24} />
                            </PopoverTrigger>

                            <PopoverContent className="lg:hidden md:hidden mr-5 p-2 bg-white border border-gray-200 rounded-xl shadow-md mt-3 w-full mx-auto">

                                <div className="flex flex-col gap-3 w-full mr-4">
                                    <div className="flex items-center w-full border border-gray-200 rounded-xl overflow-hidden">

                                        <div className="flex items-center gap-2 px-3 py-2 border-[#ff5e00] border-r-2 text-gray-500">
                                            <IoLocationOutline size={20} />
                                            <span className="text-sm font-medium">{city}</span>
                                        </div>

                                        <div className="flex items-center gap-2 px-3 flex-1">
                                            <IoIosSearch size={20} className="text-[#ff4d2d]" />
                                            <input
                                                type="text"
                                                placeholder="Search for food , restaurants "
                                                className="w-full text-sm outline-none placeholder-gray-400 bg-transparent"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className='hidden lg:flex gap-5'>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `hidden md:block relative mr-3 ml-2 mt-1 text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`}

                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/allfoods"
                            className={({ isActive }) => `hidden md:block relative mr-3 ml-1 mt-1 text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`}

                        >
                            Foods
                        </NavLink>

                        <NavLink
                            to="/userorders"
                            className={({ isActive }) => `hidden md:block relative mr-3 ml-1 mt-1 text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`}

                        >
                            Orders
                        </NavLink>

                    </div>
                    <NavLink
                        to="/cart"
                        className={({ isActive }) =>
                            `relative mr-3 ml-2 mt-1 text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`
                        }
                    >
                        <IoMdCart size={24} />
                        <span className="absolute -top-2 -right-3 text-xs text-[#ff4d2d]">{cartData?.length || "0"}</span>
                    </NavLink>


                    {/* For small devices [user profile and log out / orders etc] */}
                    <div className='flex lg:hidden '>
                        <Popover className="">
                            <PopoverTrigger>
                                <HiMiniBars3 className="flex  mt-1 lg:mt-0 cursor-pointer" size={22} />
                            </PopoverTrigger>

                            <PopoverContent className="lg:hidden mt-10 mr-1 bg-transparent border-none z-9999">
                                <div className="p-1 w-44 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
                                    <div onClick={() => navigate("/")} className="flex items-center gap-3 w-full rounded-lg text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <MdOutlineHome className="text-gray-600 " size={18} />
                                        <span>Home</span>
                                    </div>
                                    <div onClick={() => navigate("/allfoods")} className="flex items-center gap-3 w-full rounded-lg text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <IoFastFood className=" text-orange-600" size={18} />
                                        <span>Foods</span>
                                    </div>
                                    <div onClick={() => navigate("/userorders")} className="flex items-center gap-3 w-full rounded-lg text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <TbReorder className="text-gray-600 " size={18} />
                                        <span>Orders</span>
                                    </div>
                                    <div onClick={() => navigate("/userprofile")} className="flex items-center gap-3 w-full rounded-lg text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <MdAccountCircle className="text-gray-600 " size={18} />
                                        <span>View Profile</span>
                                    </div>

                                    <div onClick={handleLogOut} className="flex items-center gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <CiLogout className="text-[black] mt-1" size={18} />
                                        <span>Log Out</span>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* User Profile */}
                    <div className="hidden lg:flex items-center">
                        <Popover>
                            <PopoverTrigger>
                                <div className="w-13 h-13 lg:ml-5 rounded-full border border-[gray]/70 bg-gray-400 flex items-center justify-center cursor-pointer hover:shadow-md hover:sclae-105 duration-200">
                                    { image ? 
                                    <div className='w-13 h-13 rounded-full border-2 border-blue-400 p-0.5 bg-white overflow-hidden active:border-orange-500 duration-150'>
                                        <img
                                            src={userData.user?.image || "https://avatar.iran.liara.run/public"}
                                            alt="profile"
                                            className="w-full h-full rounded-full object-cover"
                                        /></div> : <FcBusinessman className="w-12 h-12 cursor-pointer transition-transform duration-300 ease-in-out  active:scale-95" />}
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="mt-4 mr-1 bg-transparent border-none z-9999">
                                <div className="p-1 w-54 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hidden lg:flex flex-col">
                                    <div onClick={() => navigate("/userprofile")} className="flex items-center gap-3 w-full rounded-lg text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
                                        <MdAccountCircle className="text-gray-600 " size={18} />
                                        <span>View Profile</span>
                                    </div>

                                    <div onClick={handleLogOut} className="flex items-center gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition">
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

export default UserNav
