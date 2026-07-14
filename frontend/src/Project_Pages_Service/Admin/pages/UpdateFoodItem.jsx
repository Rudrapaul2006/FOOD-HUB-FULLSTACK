import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { IoIosArrowBack } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNav from '../AdminNav';
import { toast } from 'sonner';
import axios from 'axios';
import { updateFood } from '@/Project_Pages_Service/Redux/foodSlice';

const UpdateFoodItem = () => {
  let [input, setInput] = useState({
    foodname: "",
    price: "",
    category: "",
    foodtype: "",
    description: "",
    isAvailable: "yes",
    image: null
  });

  let [loading, setLoading] = useState(false);
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let params = useParams();
  let foodId = params.id;

  let FOOD_TYPES = [
    "Starter", "Main Course",
    "Side Dish", "Dessert", "Beverage",
    "Snack", "Breakfast", "Lunch",
    "Dinner", "Fast Food"
  ]

  let handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  let imageHandler = (e) => {
    setInput({ ...input, image: e.target.files?.[0] });
  }

  let submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let formData = new FormData();
      formData.append("foodname", input.foodname);
      formData.append("description", input.description);
      formData.append("price", input.price);
      formData.append("category", input.category);
      formData.append("foodtype", input.foodtype);
      formData.append("isAvailable", input.isAvailable);
      formData.append("image", input.image);

      let res = await axios.put(`${import.meta.env.VITE_food_endpoint}/update/${foodId}`, formData, { withCredentials: true });

      if (res.data.success) {
        toast.success(res.data.message)
        navigate("/fooditems")
        dispatch(updateFood(res.data.foodItem))
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AdminNav />

      <div className="max-w-2xl mx-auto mt-6 bg-white border border-gray-200 p-6 rounded-xl lg:shadow-md mb-3">
        <button className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 " onClick={() => navigate(-1)}>
          <IoIosArrowBack size={22} />
        </button>

        <h2 className="text-xl font-bold mb-4">Update FoodItem</h2>

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="text"
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
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={input.description}
              onChange={handleChange}
              placeholder="Enter item's description"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 "
            />
          </div>


          <div className='mt-10'>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="isAvailable"
                  value="yes"
                  checked={input.isAvailable === "yes"}
                  onChange={handleChange}
                />
                Available
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="isAvailable"
                  value="no"
                  checked={input.isAvailable === "no"}
                  onChange={handleChange}
                />
                Not Available
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-between lg:gap-10">
            <div className="w-80 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="text-blue-800">Image</span>
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
                <span className="text-blue-800">Category</span>
              </label>
              <select
                name="category"
                value={input.category}
                onChange={handleChange}
                className="w-[90%] ml-6 mt-2 border px-4 py-2 rounded-md cursor-pointer"
              >
                <option value="">Select Category</option>
                <option value="veg">Veg</option>
                <option value="nonveg">Non-Veg</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-7 w-full bg-[#ff4d2d] text-white py-2 rounded-md font-semibold cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Update Food"}
          </button>


        </form>
      </div>
    </>
  )
}

export default UpdateFoodItem;
