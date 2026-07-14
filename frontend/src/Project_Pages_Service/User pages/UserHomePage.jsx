import React, { useEffect, useState } from 'react'
import UserNav from '../Component/UserNav'
import { useDispatch, useSelector } from 'react-redux'
import UserDashBoardPic from '../User Component/UserDashBoardPic';
import UserDashBoardFooter from '../User Component/UserDashBoardFooter';
import { useNavigate } from 'react-router-dom';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import getUserAllShops from '../User Hooks/getUserAllShops';
import { IoIosSearch } from 'react-icons/io';
import { setFindShopByText, setShopCurrentPage, setShopSortByUser, setUserShopData } from '../Redux/adminSlice';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

const UserHomePage = () => {
    let navigate = useNavigate()
    let dispatch = useDispatch()

    let { userShopData, userShopLoading, shopCurrentPage, shopTotalPage, shopHasNext, shopHasPrev, findShopByText, shopSortByUser } = useSelector(state => state.admin)
    let { socket } = useSelector(state => state.user)

    //geting socket event for updating shopStatus
    useEffect(() => {
        let handleShopStatus = (data) => {
            dispatch(setUserShopData(userShopData.map(shop => shop._id === data.shopId
                ? { ...shop, ...(data.open && { open: data.open }), ...(data.socketOpen && { socketOpen: data.socketOpen }) }
                : shop
            )
            ))
        }

        socket.on("updateShopStatus", handleShopStatus)

        return () => {
            socket.off("updateShopStatus", handleShopStatus)
        }

    }, [socket, userShopData])
    

    //search handler :
    let [search, setSearch] = useState("")
    let handleSearch = () => {
        dispatch(setFindShopByText(search))
        dispatch(setShopCurrentPage(1))
        dispatch(setShopSortByUser(""))
    }

    //handle URL :
    useEffect(() => {
        navigate(`/?page=${shopCurrentPage}&search=${findShopByText || null}`, { replace: true })
    }, [shopCurrentPage, findShopByText, shopSortByUser])

    //Pagination Data :
    let totalPages = Array.from({ length: shopTotalPage }, (_, i) => i + 1)


    //clean up :
    useEffect(() => {
        return () => {
            dispatch(setShopCurrentPage(1))
            dispatch(setFindShopByText(""))
            dispatch(setShopSortByUser(""))
        }
    }, [])

    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>
            <div className='px-2 py-1 lg:px-0 lg:py-0'>
                <div className='lg:mx-5 rounded-md overflow-hidden mt-1 lg:mt-3'><UserDashBoardPic /></div>
            </div>

            <div className='sticky top-27 lg:top-21 bg-white mx-2 lg:mx-20 mt-12 py-1.5 border-b border-black lg:border-gray-300 mb-3 lg:mb-2 z-99'>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-800">
                    Top <span className=" text-orange-500">Restaurant</span> Near You
                </h2>

                <div className='flex flex-col lg:flex-row lg:justify-between'>
                    <div className="lg:px-0 mt-8 mb-5 flex items-center gap-2  rounded-lg w-full max-w-md bg-white transition">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                            }}
                            className="flex-1 border border-gray-300 px-2 py-2 rounded-md focus:border-orange-500 outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
                        />
                        <IoIosSearch
                            onClick={() => {
                                handleSearch()
                            }}
                            size={40}
                            className="px-1 py-2 border border-gray-300 rounded-md text-gray-500 cursor-pointer hover:text-orange-500 hover:border-orange-500 active:scale-97  transition duration-200"
                        />
                    </div>

                    {/* <div>
                        <select name="" id="">
                            <option value="">select</option>
                            <option value=""></option>
                            <option value=""></option>
                        </select>
                    </div> */}
                </div>
            </div>

            <div className='lg:mx-20 flex flex-col mb-8 lg:mb-7'>
                <div className='gap-5 w-full mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-5 '>

                    {userShopData.length > 0 && userShopData.map(item => (
                        <div key={item?._id}
                            onClick={() => navigate(`/shopfooditems/${item?._id}`)}
                            className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer  ml-2 mr-2 lg:ml-0 lg-mr-0"
                        >
                            <div className="h-40 w-full overflow-hidden">
                                <img src={item.image} alt="null" className="h-full w-full object-cover hover:scale-102 transition-transform duration-300" />
                            </div>


                            <div className="p-3 border-t-2 border-[#ff4d2d] mt-1">
                                <h3 className="text-lg font-semibold text-[#ff4d2d] truncate">
                                    {item.shopname} <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${item?.socketOpen === "yes" && item?.open === "yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item?.socketOpen === "yes" && item?.open === "yes" ? "Open" : "Closed"}</span>
                                </h3>
                                <h3 className="text-[12px] font-semibold text-blue-600 truncate">  {item.description} </h3>
                                <div className="flex items-center justify-between mt-3"> <span className="text-xs text-gray-500"> {item?.phone} </span> </div>
                                <div> <span className="text-xs text-gray-500"> {item?.email} </span> </div>
                                <div> <span className="text-xs text-gray-500"> {item?.city} </span> <span className="text-xs text-gray-500 ml-1"> , {item?.location} </span> </div>
                                <div> <span className="text-xs text-gray-500"> {item?.state} </span> </div>
                                <div className="flex items-center gap-5 lg:gap-7 mt-3">
                                    <span className="text-xs text-gray-500">LON : {item?.shopGeoLocation?.coordinates[0]} </span>
                                    <span className="text-xs text-gray-500">LAT : {item?.shopGeoLocation?.coordinates[1]} </span>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* pagination */}
            {
                totalPages.length > 1 &&
                <div className='py-2 mx-2 lg:mx-20 border-t border-black sticky bottom-0 bg-white flex items-center justify-center gap-2 z-99'>
                    <button
                        disabled={userShopLoading || !shopHasPrev}
                        className={`border border-orange-500 rounded-md px-1 py-2.5 ${userShopLoading || !shopHasPrev ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
                        onClick={() => {
                            dispatch(setShopCurrentPage(shopCurrentPage - 1))
                        }}
                    >
                        <FaAngleLeft />
                    </button>


                    <div className="overflow-x-auto sm:overflow-visible whitespace-nowrap">
                        <div className="flex items-center gap-2 w-max sm:w-auto">
                            {totalPages?.map(i => (
                                <button
                                    key={i}
                                    disabled={userShopLoading}
                                    onClick={() => {
                                        dispatch(setShopCurrentPage(i))
                                    }}
                                    className={`border border-orange-500 rounded-md px-2 py-1.5 cursor-pointer flex-shrink-0 ${shopCurrentPage === i ? "bg-orange-500 text-white"
                                        : "bg-white"}`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>


                    <button
                        disabled={userShopLoading || !shopHasNext}
                        className={`border border-orange-500 rounded-md px-1 py-2.5 ${userShopLoading || !shopHasNext ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
                        onClick={() => {
                            dispatch(setShopCurrentPage(shopCurrentPage + 1))
                        }}
                    >
                        <FaAngleRight />
                    </button>
                </div>
            }

            <UserDashBoardFooter />
        </>
    )
}

export default UserHomePage