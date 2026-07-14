import axios from "axios";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import AdminNav from "../AdminNav";
import { useDispatch } from "react-redux";
import { addFood } from "@/Project_Pages_Service/Redux/foodSlice";

const AddFoodItem = () => {
    let [input, setInput] = useState({
        foodname: "",
        price: "",
        category: "",
        foodtype: "",
        description: "",
        isAvailable: "yes",
        image: null
    })

    let [loading, setLoading] = useState(false);
    let navigate = useNavigate();
    let dispatch = useDispatch()

    let handleChange = (e) => {
        let { name, value, type, checked } = e.target;
        setInput({ ...input, [name]: type === "checkbox" ? checked : value })
    }

    let imageHandler = (e) => {
        setInput({ ...input, image: e.target.files[0] });
    };

    let submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let formData = new FormData();
            Object.keys(input).forEach((key) => {
                formData.append(key, input[key]);
            })

            let res = await axios.post(
                `${import.meta.env.VITE_food_endpoint}/register`, formData, { withCredentials: true }
            )

            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(addFood(res.data.foodItem))
                setInput(res.data)
                navigate("/fooditems")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false);
        }
    }

    let FOOD_TYPES = [
        "Starter", "Main Course",
        "Side Dish", "Dessert", "Beverage",
        "Snack", "Breakfast", "Lunch",
        "Dinner", "Fast Food"
    ]

    return (
        <>
            <AdminNav />

            <div className="max-w-2xl mx-auto mt-6 bg-white border border-gray-200 p-6 rounded-xl shadow-md mb-5">
                <button className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 " onClick={() => navigate(-1)}>
                    <IoIosArrowBack size={22} />
                </button>
                <h2 className="text-xl font-bold mb-4">Add FoodItem</h2>

                <form onSubmit={submitHandler} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Food Name
                        </label>
                        <input
                            type="text"
                            name="foodname"
                            value={input.foodname}
                            onChange={handleChange}
                            placeholder="Enter item's name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 "
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                        </label>
                        <input
                            type="tel"
                            name="price"
                            value={input.price}
                            onChange={handleChange}
                            placeholder="Enter item's price"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 "
                        />
                    </div>

                    <div>
                        <label>Food Type</label>
                        <select
                            name="foodtype"
                            value={input.foodtype}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 cursor-pointer"
                        >
                            <option value="">Select Food Type</option>
                            {FOOD_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            type="text"
                            name="description"
                            value={input.description}
                            onChange={handleChange}
                            placeholder="Enter item's description"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 "
                        />
                    </div>


                    <div className="mt-7 flex justify-between lg:gap-10">
                        <div className="w-80 flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-blue-800 ">Image</span>
                            </label>
                            <input
                                type="file"
                                accept="*/image"
                                onChange={imageHandler}
                                className="mt-2 w-[90%] border border-gray-300 file:px-2 file:rounded-xl file:bg-orange-200 file:cursor-pointer rounded-lg px-4 py-2 cursor-pointer"
                            />
                        </div>

                        <div className="w-80">
                            <label className="ml-6 block text-sm font-medium text-gray-700 mb-1">
                                <span className="text-blue-800 ">Category</span>
                            </label>
                            <select
                                name="category"
                                value={input.category}
                                onChange={handleChange}
                                className="w-[90%] ml-6 mt-2 border px-4 py-2 rounded-md cursor-pointer"
                            >
                                <option value="">Select Category</option>
                                <option value="veg">Veg Food</option>
                                <option value="nonveg">Non_veg food</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#ff4d2d] text-white py-2 rounded-md font-semibold cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Add Food"}
                    </button>
                </form>
            </div>
        </>
    )
};

export default AddFoodItem;
