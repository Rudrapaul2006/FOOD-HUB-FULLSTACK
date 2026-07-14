// AllFoodItems.jsx (Parent)
import AdminNav from "../AdminNav";
import FoodItemCard from "../Component/FoodItemCard";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentPage, setSearchFoodByText } from "@/Project_Pages_Service/Redux/foodSlice";
import singleOrderSocket from "@/Project_Pages_Service/WebSocketHooks/singleOrderSocket";
import multipleOrderSocket from "@/Project_Pages_Service/WebSocketHooks/multipleOrderSocket";
import useGetShop from "@/Project_Pages_Service/Hooks/useGetShop";
import { IoIosSearch } from "react-icons/io";
import useGetPendingOrders from "@/Project_Pages_Service/Hooks/useGetOrders";
import { useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { Loader2 } from "lucide-react";
import useGetFoodData from "@/Project_Pages_Service/Hooks/useGetFoodItem";
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";

const AllFoodItems = () => {
  // useGetFoodData() // overWrite the redux toolkit's unshift method - [initialize this hook in (App.jsx) for avoid this problem]
  useGetPendingOrders()

  //socket function for the [for the single order]
  singleOrderSocket()
  //socket function for the [for the multiple order]
  multipleOrderSocket()


  let navigate = useNavigate()
  let dispatch = useDispatch()
  let { shopData } = useSelector((state) => state.admin)


  //Pagination :
  let { totalPages, hasNext, hasPrev, searchFoodByText, foodData, foodLoading, currentPage } = useSelector(state => state.food)
  let pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  //search query:
  let [query, setQuery] = useState("")
  let handelQuery = () => {
    if (currentPage !== 1) {
      dispatch(setCurrentPage(1))
    }
    dispatch(setSearchFoodByText(query.trim().toLocaleLowerCase()))
  }

  // URL sync
  useEffect(() => {
    navigate(`/fooditems?page=${currentPage}&query=${searchFoodByText || "null"}`, { replace: true })
  }, [currentPage, searchFoodByText])

  // cleanup
  useEffect(() => {
    return () => {
      dispatch(setSearchFoodByText(""))
      dispatch(setCurrentPage(1))
    }
  }, [dispatch])

  return (
    <>
      <AdminNav />

      {shopData &&
        <div className="sticky top-19 lg:top-17 bg-white flex w-full pt-5 pb-3 gap-5 justify-between px-2 sm:px-4 lg:px-0 z-20">

          <div className="mx-0 lg:mx-20 flex justify-between items-center gap-2 w-full">
            <div className="flex items-center w-full max-w-md h-11 px-0 lg:px-3 gap-2 bg-white  rounded-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food items..."
                className="w-full h-full border px-2 rounded-md outline-none text-sm text-gray-600 bg-transparent"
              />

              <button
                onClick={() => handelQuery()}
                className="flex items-center justify-center h-11 w-11 border rounded-md bg-gray-100 hover:bg-gray-200 active:scale-94 duration-300 cursor-pointer">
                <IoIosSearch size={22} />
              </button>
            </div>

            {/* Add Food button */}
            <div className=" lg:mr-0 w-[50%] flex justify-end rounded-lg lg:w-fit">
              <button
                onClick={() => navigate("/addfoodItems")}
                className="h-11 w-fit lg:w-fit px-2 lg:px-5 py-2.5 rounded-lg bg-[#ff4d2d] text-white font-medium cursor-pointer  focus:scale-97 hover:scale-101 duration-200"
              >
                Add Food
              </button>
            </div>
          </div>


        </div>
      }

      <div className="mt-4 lg:mt-7 lg:mx-20 ">
        {shopData?.shopname && (
          <div className="sticky top-37 lg:top-35 bg-white mt-3 z-50">
            <div className="mb-3 ml-2 lg:ml-0 w-full flex justify-between">
              <h1 className="text-[30px] font-bold text-gray-800">
                <span className="text-[#ff4d2d] ml-0 lg:ml-2">{shopData?.shopname}'s</span>
                <span className="text-black"> food items</span>
              </h1>
            </div>
          </div>
        )}

        {/* veg and non_veg button : */}
        {shopData && foodData &&
          <div className="sticky top-38 lg:top-36 bg-white z-60 py-3">

            <div className="w-fit lg:w-fit flex bg-white text-sm mb-7 ml-2 rounded-lg overflow-hidden shadow-sm border border-gray-500">
              <button onClick={() => {
                dispatch(setSearchFoodByText("veg"))
                setQuery("")
                dispatch(setCurrentPage(1))
              }} className="flex items-center">
                <input type="radio" className="hidden peer" checked={searchFoodByText === "veg"} readOnly />
                <label htmlFor="html" className={`cursor-pointer py-2 border-r border-gray-200 px-5 font-medium transition-all duration-200 ${searchFoodByText === "veg" ? "bg-green-100 text-green-600" : "text-gray-500 hover:bg-gray-50"}`}>
                  {/* {foodLoading && searchFoodByText === "veg" ? <Loader2 className="h-5 w-6 animate-spin" /> : "Veg"} */}
                  Veg
                </label>
              </button>

              <button onClick={() => {
                dispatch(setSearchFoodByText("nonveg"))
                setQuery("")
                dispatch(setCurrentPage(1))
              }} className="flex items-center">
                <input type="radio" checked={searchFoodByText === "nonveg"} className="hidden peer" readOnly />
                <label htmlFor="css" className={`cursor-pointer py-2 border-r border-gray-200 px-5 font-medium transition-all duration-200 ${searchFoodByText === "nonveg" ? "bg-red-100 text-red-600" : "text-gray-500 hover:bg-gray-50"}`}>
                  {/* {foodLoading && searchFoodByText === "nonveg" ? <Loader2 className="h-5 w-13 animate-spin" /> : "Non Veg"} */}
                  Non Veg
                </label>
              </button>

              <button onClick={() => dispatch(setSearchFoodByText(""))} className={`px-5 flex items-center justify-center cursor-pointer transition-all duration-200 ${searchFoodByText === "" ? "bg-amber-100 text-amber-600" : "text-gray-500 hover:bg-amber-50 hover:text-amber-600"}`}>
                <ImCross size={14} />
              </button>
            </div>
          </div>
        }

        <div className="relative mr-0 pb-1 lg:pb-15">
          {shopData ? (
            <>
              <FoodItemCard />

              {foodLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No food items found, Please create your shop first
            </div>
          )}
        </div>

      </div>

      {/* Pagination */}
      {totalPages > 1 &&
        <div className="fixed bottom-0 left-0 right-0 mx-0 lg:mx-20 border-t border-black px-2 pt-1 bg-white z-50">
          <div className="flex justify-center items-center py-1 gap-2">

            <button
              disabled={!hasPrev || foodLoading}
              onClick={() => dispatch(setCurrentPage(currentPage - 1))}
              className={`border px-1 py-2 rounded-md ${!hasPrev || foodLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <GrFormPrevious size={22} />
            </button>

            <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
              {pages.map((i) => (
                <div className="shrink-0" key={i}>
                  <button
                    disabled={foodLoading || currentPage === i}
                    onClick={() => dispatch(setCurrentPage(i))}
                    className={`border px-3 py-2 rounded-md transition-all duration-200 ${currentPage === i ? "bg-orange-600 text-white" : "bg-white hover:bg-gray-100"}
                ${foodLoading || currentPage === i ? "cursor-not-allowed" : "cursor-pointer"} `}
                  >
                    {foodLoading && currentPage === i ? <Loader2 className="h-6 w-2 animate-spin" /> : i}
                  </button>
                </div>
              ))}
            </div>

            <button
              disabled={!hasNext || foodLoading}
              onClick={() => dispatch(setCurrentPage(currentPage + 1))}
              className={`border px-1 py-2 rounded-md ${!hasNext || foodLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <MdNavigateNext size={22} />
            </button>

          </div>
        </div>
      }
    </>
  )
}

export default AllFoodItems;
