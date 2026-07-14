import React from 'react'

const UserDashBoardPic = () => {
  return (
    <>
      <div className="relative w-full h-[40vh] lg:h-[55vh]">
                <img
                    src="https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395_1280.jpg"
                    className="w-full h-full object-cover"
                    alt="Pizza Background"
                />

                <div className="absolute inset-0 bg-black/60"></div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <h1 className="text-white text-4xl md:text-7xl font-bold tracking-wide">
                        Welcome to <span className="text-[#ff4d2d]">FoodHub</span>
                    </h1>
                    <p className="text-gray-200 mt-4 text-2xl font-bold">
                        Delicious food delivered to your doorstep 🍕🍔
                    </p>
                </div>
            </div>
    </>
  )
}

export default UserDashBoardPic
