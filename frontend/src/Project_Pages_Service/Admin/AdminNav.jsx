import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React from 'react'
import { IoIosHome} from 'react-icons/io';
import { IoFastFoodSharp, IoLocationOutline } from "react-icons/io5";
import { NavLink, useNavigate } from 'react-router-dom';
import { HiMiniBars3 } from "react-icons/hi2";
import { CiLogout } from "react-icons/ci";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setUserData } from '../Redux/userSlice';
import { FcBusinessman } from 'react-icons/fc';
import { setFoodData } from '../Redux/foodSlice';
import { TbReorder } from "react-icons/tb";



const AdminNav = () => {
    let dispatch = useDispatch()
    let navigate = useNavigate()

    let handleLogOut = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_user_endpoint}/logout`, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message)
                dispatch(setUserData(null))
                dispatch(setFoodData([]))
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Logout failed")
        }
    }

    let { pendingOrders } = useSelector(state => state.order)

    return (
        <>
            <div className="sticky top-0 z-999 bg-white w-full h-[12vh] border-b  flex items-center justify-between px-4 md:px-10 lg:px-20">
                {/* Logo */}
                <div className="text-2xl md:text-3xl font-bold text-[#fd4322] flex items-center">
                    FoodHub
                </div>

                <div className="flex items-center gap-4 md:gap-5">
                    <NavLink
                        to="/admins-shop"
                        className={({ isActive }) => `hidden lg:flex items-center text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/fooditems"
                        className={({ isActive }) => `hidden lg:flex items-center text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`}
                    >
                        FoodItems
                    </NavLink>
                    <NavLink
                        to="/allorders"
                        className={({ isActive }) => `hidden lg:flex items-center text-lg font-semibold transition ${isActive ? "text-[#ff4d2d]" : "text-gray-700"}`}
                    >
                        <span className='relative'>Orders <span className=' text-blue-500 rounded-xl'>({pendingOrders})</span></span>
                    </NavLink>

                    {/* For small devices [user profile and log out] */}
                    <div className='flex lg:hidden'>
                        <Popover className="">
                            <PopoverTrigger>
                                <HiMiniBars3 className="flex lg:hidden mt-1 lg:mt-0 cursor-pointer" size={22} />
                            </PopoverTrigger>

                            <PopoverContent className="lg:hidden z-9999 mt-9 mr-1 bg-transparent border-none">
                                <div className="p-1 w-44 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
                                    <div className='mt-0.5'>
                                        <button onClick={() => navigate("/admins-shop")} className='flex items-center gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition'> <span><IoIosHome className='text-[#ff4d2d]' size={18} /></span>Home</button>
                                    </div>
                                    <div className='mt-0.5'>
                                        <button onClick={() => navigate("/fooditems")} className='flex items-center gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition'> <span><IoFastFoodSharp className='text-[#ff4d2d]' size={18} /></span>FoodItems</button>
                                    </div>
                                    <div className='mt-0.5'>
                                        <button onClick={() => navigate("/allorders")} className='flex items-center gap-3 rounded-lg w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:underline cursor-pointer transition'>
                                            <span><TbReorder className='text-[#ff4d2d]' size={18} /></span> <span className=''> Orders <span className='ml-1 bg-[#f9e8e4] text-blue-500 px-1 rounded-full'>{pendingOrders}</span></span>
                                        </button>
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
                                    <FcBusinessman className="w-9 h-9 cursor-pointer transition-transform duration-300 ease-in-out  active:scale-95" />
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="z-99999 mt-5 mr-1 bg-transparent border-none">
                                <div className="p-2 w-54 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col">
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

export default AdminNav

