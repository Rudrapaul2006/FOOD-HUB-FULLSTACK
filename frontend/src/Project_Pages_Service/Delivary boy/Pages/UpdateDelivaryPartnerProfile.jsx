import React, { use, useState } from 'react'
import DelivaryBoyNav from '../Components/DelivaryBoyNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { IoIosArrowBack } from 'react-icons/io'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updateUserProfile } from '@/Project_Pages_Service/Redux/userSlice'

const UpdateDelivaryPartnerProfile = () => {
    let navigate = useNavigate()
    let dispatch = useDispatch()

    let [input, setinput] = useState({
        fullname: "",
        phone: "",
        image: null
    })

    let [loading, setLoading] = useState(false)

    let handleInput = async (e) => {
        setinput({ ...input, [e.target.name]: e.target.value })
    }

    let handleImage = async (e) => {
        setinput({ ...input, image: e.target.files?.[0] })
    }

    let handleSubmit = async (e) => {
        e.preventDefault()

        let formdata = new FormData()
        formdata.append("fullname", input.fullname)
        formdata.append("phone", input.phone)

        formdata.append("image", input.image)


        try {
            setLoading(true)

            let res = await axios.put(`${import.meta.env.VITE_user_endpoint}/update`, formdata, { withCredentials: true })
            if (res.data.success) {
                dispatch(updateUserProfile(res.data.updateduser))
                toast.success(res.data.message)
                navigate("/delivarypartnerprofile")
            }

        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <DelivaryBoyNav />

            <div className="max-w-2xl mx-auto mt-6 bg-white border border-gray-200 p-6 rounded-xl lg:shadow-md mb-3">
                <button className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 " onClick={() => navigate(-1)}>
                    <IoIosArrowBack size={22} />
                </button>

                <h2 className="text-xl font-bold mb-4">Update Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={input.fullname}
                            onChange={handleInput}
                            placeholder="Enter name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 "
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={input.phone}
                            onChange={handleInput}
                            placeholder="Enter phone number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 "
                        />
                    </div>

                    <div className="w-80 flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-blue-800">Image</span>
                        </label>
                        <input
                            type="file"
                            accept="*/image"
                            onChange={handleImage}
                            className="mt-2 w-[90%] border border-gray-300 file:px-2 file:rounded-xl file:bg-orange-200 file:cursor-pointer rounded-lg px-4 py-2 cursor-pointer"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-7 w-full bg-[#ff4d2d] text-white py-2 rounded-md font-semibold cursor-pointer"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Update Profile"}
                    </button>

                </form>
            </div>
        </>
    )
}

export default UpdateDelivaryPartnerProfile
