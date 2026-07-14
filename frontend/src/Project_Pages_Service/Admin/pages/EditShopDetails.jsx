import { setShopData, updateShop } from '@/Project_Pages_Service/Redux/adminSlice';
import axios from 'axios'
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AdminNav from '../AdminNav';

const EditShopDetails = () => {
    let params = useParams();
    let shopId = params.id;
    let dispatch = useDispatch();
    let navigate = useNavigate();

    let [input, setInput] = useState({
        shopname: "", email: "", description: "", location: "", phone: "", city: "", file: null
    })
    
    let [loading, setLoading] = useState(false)


    let handleForm = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }
    let handleImage = (e) => {
        setInput({ ...input, file: e.target.files?.[0] })
    }
    let handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true);

        let formData = new FormData()
        formData.append("shopname", input.shopname)
        formData.append("email", input.email)
        formData.append("description", input.description)
        formData.append("location", input.location)
        formData.append("phone", input.phone)
        formData.append("city", input.city)
        if (input.file) {
            formData.append("image", input.file)
        }

        let fetchShopForUpdate = async () => {
            try {
                let res = await axios.put(`${import.meta.env.VITE_shop_endpoint}/update/${shopId}`, formData, { withCredentials: true })
                if (res.data.success) {
                    setInput(res.data.shop)
                    navigate("/admins-shop")
                    dispatch(updateShop(res.data.shop))
                    toast.success(res.data.message)
                }
            } catch (error) {     
                console.log(error)
                toast.error( error?.response?.data?.message)
            }
            finally {
                setLoading(false)
            }
        }

        fetchShopForUpdate();
    }
    return (
        <>  
            <AdminNav/>
            <div className="mt-3 mx-auto  lg:max-w-2xl bg-white border border-gray-200 rounded-2xl lg:shadow-sm p-6">
                <div className='flex flex-col'>
                    <button className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200" onClick={() => navigate(-1)}>
                        <IoIosArrowBack size={22} />
                    </button>

                    <h2 className="text-xl font-bold mb-6 text-gray-800">
                        Update Your Shop Details
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
                        {/* <div>
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
                        </div> */}

                        {/* image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                className="w-full border border-gray-300 file:px-2 file:rounded-xl file:bg-orange-200 file:cursor-pointer rounded-lg px-4 py-2 cursor-pointer" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="flex items-center justify-center w-full bg-[#ff4d2d] text-white py-2.5 rounded-lg font-semibold hover:bg-[#e64528] transition active:scale-95 cursor-pointer"
                        >
                            {loading ? <Loader2 className='animate-spin' /> : "Update Shop Details"}
                        </button>
                    </div>

                </form>
            </div>
        </>
    )
}

export default EditShopDetails
