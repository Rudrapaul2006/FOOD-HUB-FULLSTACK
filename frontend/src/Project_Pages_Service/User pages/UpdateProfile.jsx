import React, { useEffect, useState } from 'react'
import UserNav from '../Component/UserNav'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { updateUserProfile } from '../Redux/userSlice'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { IoIosArrowBack } from 'react-icons/io'
import { useNavigate } from 'react-router-dom'

const UpdateProfile = () => {
    let dispatch = useDispatch()
    let navigate = useNavigate()

    //User profile Update
    let [input, setInput] = useState({
        fullname: "",
        phone: "",
        image: null
    })
    let [loading, setLoading] = useState(false)

    let handleChange = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    let handleImage = (e) => {
        setInput({ ...input, image: e.target.files?.[0] })
    }

    let submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
        let formData = new FormData()

        formData.append("fullname", input.fullname)
        formData.append("phone", input.phone)

        if (input.image) {
            formData.append("image", input.image)
        }

        let res = await axios.put( `${import.meta.env.VITE_user_endpoint}/update`, formData , { withCredentials: true })

        if (res.data.success) {
            dispatch(updateUserProfile(res.data.updateduser))
            toast.success(res.data.message)
            navigate("/userprofile")
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
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>

            <div className="max-w-2xl mx-auto mt-6 bg-white border border-gray-200 p-6 rounded-xl lg:shadow-md mb-3">
                <button className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 " onClick={() => navigate(-1)}>
                    <IoIosArrowBack size={22} />
                </button>

                <h2 className="text-xl font-bold mb-4">Update Profile</h2>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="fullname"
                            value={input.fullname}
                            onChange={handleChange}
                            placeholder="Enter name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 "
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="string"
                            name="phone"
                            value={input.phone}
                            onChange={handleChange}
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

export default UpdateProfile