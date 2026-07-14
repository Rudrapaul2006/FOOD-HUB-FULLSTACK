import React from 'react'

const UserDashBoardFooter = () => {
    return (
        <footer className="bg-gray-900 text-white py-6 mt-10">

            <div className="max-w-7xl px-6 lg:px-20 
                      flex flex-col lg:flex-row 
                      items-center lg:items-start 
                      justify-between gap-6">

                <div className="w-full lg:w-[60%] 
                        flex flex-col md:flex-row 
                        items-center md:items-start 
                        justify-between gap-4">

                    <div className="text-2xl font-semibold">
                        FoodHub
                    </div>

                    <div className="flex flex-col md:flex-row 
                          items-center md:items-start 
                          gap-4 text-gray-300">
                        <a className="hover:text-white transition cursor-pointer">Home</a>
                        <a className="hover:text-white transition cursor-pointer">About</a>
                        <a className="hover:text-white transition cursor-pointer">Services</a>
                        <a className="hover:text-white transition cursor-pointer">Contact</a>
                    </div>
                </div>

                <div className="w-full lg:w-[40%] 
                        flex justify-center lg:justify-end 
                        gap-6 text-gray-300">
                    <a className="hover:text-blue-500 transition cursor-pointer">Facebook</a>
                    <a className="hover:text-blue-400 transition cursor-pointer">Twitter</a>
                    <a className="hover:text-pink-500 transition cursor-pointer">Instagram</a>
                </div>

            </div>
            
            <div className="text-center lg:text-left text-gray-500 text-sm mt-6 px-6 lg:px-20">
                &copy; {new Date().getFullYear()} FoodHub. All rights reserved.
            </div>

        </footer>
    )
}

export default UserDashBoardFooter
