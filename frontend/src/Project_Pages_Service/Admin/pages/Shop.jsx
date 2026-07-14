import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminNav from "../AdminNav";
import { Store, UtensilsCrossed, ShoppingBag } from "lucide-react";
import ShopUi from "../ShopUi";
import useGetFoodData from "@/Project_Pages_Service/Hooks/useGetFoodItem";
import useGetShop from "@/Project_Pages_Service/Hooks/useGetShop";
import singleOrderSocket from "@/Project_Pages_Service/WebSocketHooks/singleOrderSocket";
import multipleOrderSocket from "@/Project_Pages_Service/WebSocketHooks/multipleOrderSocket";
import useGetPendingOrders from "@/Project_Pages_Service/Hooks/useGetOrders";

const Shop = () => {
    useGetShop()
    // useGetPendingOrders()
    // useGetFoodData()

    //socket function for the [for the single order]
    singleOrderSocket()
    //socket function for the [for the multiple order]
    multipleOrderSocket()

    let navigate = useNavigate()
    let { shopData, shopLoading } = useSelector(state => state.admin)

    return (
        <>
            <AdminNav />
            
            {shopData && (
                <div className="lg:mx-20 mt-5">
                     <ShopUi/>
                </div>
            )}

            {shopData === null  && !shopData && (
                <div className="lg:mx-20 mt-5 px-4">
                    <div className="bg-gradient from-[#fff7f5] to-white rounded-2xl p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-5">
                            Admin Setup Guide
                        </h2>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#ff4d2d]/10 flex items-center justify-center">
                                    <Store className="text-[#ff4d2d]" size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Create Shop</p>
                                    <p className="text-sm text-gray-500">
                                        Register your shop details
                                    </p>
                                </div>
                            </div>

                            <span className="hidden md:block text-gray-500 text-[20px]">→</span>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <UtensilsCrossed className="text-gray-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Add Food Items</p>
                                    <p className="text-xs text-gray-500">
                                        Upload your menu
                                    </p>
                                </div>
                            </div>

                            <span className="hidden md:block text-gray-500 text-[20px]">→</span>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <ShoppingBag className="text-gray-600" size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Start Orders</p>
                                    <p className="text-xs text-gray-500">
                                        Receive & manage orders
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 mx-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                        <h1 className="font-semibold">
                            Get started with registering a shop <span className="text-lg ml-3">→</span>
                        </h1>

                        <button
                            onClick={() => navigate("/registerShop")}
                            className="bg-[#ff4d2d] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#e64528] transition active:scale-95 shadow-md cursor-pointer"
                        >
                            Register Shop
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Shop;
