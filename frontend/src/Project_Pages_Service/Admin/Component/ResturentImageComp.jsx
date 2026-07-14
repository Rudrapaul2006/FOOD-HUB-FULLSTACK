import useGetShop from "@/Project_Pages_Service/Hooks/useGetShop"
import React from "react"
import { useSelector } from "react-redux"

const ResturentImageComp = () => {
  let { shopData } = useSelector(state => state.admin)

  return (
    <div className="">
      <div className="flex lg:max-w-8xl lg:h-[49.63vh]">
        
        {shopData && (
          <div
            className="relative group flex-1 transition-all duration-500 rounded-xl overflow-hidden shadow-lg"
          >
            <img
              src={shopData?.image}
              alt="restaurant"
              className="lg:h-full lg:w-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6 text-white">
              <h2 className="text-2xl font-semibold">
                {shopData?.shopname || "Our Special"}
              </h2>
              <p className="text-sm text-gray-200 mt-1">
                Fresh • Hygienic • Delicious
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ResturentImageComp