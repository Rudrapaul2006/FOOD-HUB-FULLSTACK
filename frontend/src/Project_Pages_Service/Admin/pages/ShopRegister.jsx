import React, { useState } from 'react'
import AdminNav from '../AdminNav'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { IoIosArrowBack } from 'react-icons/io'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { setShopData} from '@/Project_Pages_Service/Redux/adminSlice'

const ShopRegister = () => {
  let [input, setInput] = useState({
    shopname: "",
    email: "",
    description: "",
    location: "",
    phone: "",
    city: "",
    state: "",
    image : ""
  })
  let [loading, setLoading] = useState(false)

  let navigate = useNavigate();
  let dispatch = useDispatch()

  let handleForm = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  let handleImage = (e) => {
    setInput({ ...input, file: e.target.files?.[0] })
  }

  let handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true)

    let fetchShop = async () => {
      try {
        let formData = new FormData();

        formData.append("shopname", input.shopname);
        formData.append("email", input.email);
        formData.append("description", input.description);
        formData.append("location", input.location);
        formData.append("phone", input.phone);
        formData.append("city", input.city);
        formData.append("state", input.state);

        if (input.file) {
          formData.append("image", input.file);
        }

        let res = await axios.post(`${import.meta.env.VITE_shop_endpoint}/register`, formData, { withCredentials: true });
        if (res.data.success) {
          toast.success(res.data.message)
          dispatch(setShopData([res.data.shop]))
          navigate("/admins-shop")
        }
      } catch (error) {
        console.log(error)
        toast.error( error?.response?.data?.message || "Something error")
      } finally {
        setLoading(false)
      }
    }

    fetchShop()
  }

  return (

    <>
      <div className="mt-3 mx-auto lg:max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className='flex flex-col'>
          <button className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 " onClick={() => navigate(-1)}>
            <IoIosArrowBack size={22} />
          </button>

          <h2 className="text-xl font-bold mb-6 text-gray-800">
            Register Your Shop
          </h2>
        </div>

        <form className="space-y-5 pb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              name="shopname"
              value={input.shopname}
              onChange={handleForm}
              placeholder="Enter shop name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={input.email}
                onChange={handleForm}
                placeholder="shop@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={input.phone}
                onChange={handleForm}
                placeholder="Enter shop number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 "
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              rows="3"
              name="description"
              value={input.description}
              onChange={handleForm}
              placeholder="Brief description about your shop"
              className="w-full border border-gray-300 rounded-lg px-4 py-5 "
            ></input>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={input.location}
              onChange={handleForm}
              placeholder="Street / Area"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="City"
                name="city"
                value={input.city}
                onChange={handleForm}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={input.state}
                onChange={handleForm}
                placeholder="State"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 "
              />
            </div>

            {/* image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="w-[99%] file:bg-orange-300 file:ml-2 border rounded-md py-2 text-sm 
             file:mr-3 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-slate-700  transition-colors 
             duration-300 cursor-pointer" />
            </div>
          </div>



          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex items-center justify-center w-full bg-[#ff4d2d] text-white py-2.5 rounded-lg font-semibold hover:bg-[#e64528] transition active:scale-95 cursor-pointer"
            >
              {loading ? <Loader2 className='animate-spin' /> : "Register Shop"}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}

export default ShopRegister
