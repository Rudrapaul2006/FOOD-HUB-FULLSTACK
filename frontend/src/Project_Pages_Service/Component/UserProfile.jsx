import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import UserNav from './UserNav';
import { setUserData, updateAddress } from '../Redux/userSlice';
import { CiUser } from "react-icons/ci"
import { FaPen } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import useGetCurrentUser from '../Hooks/useGetCurrentUser';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { toast } from 'sonner';
import { IoChevronBack } from 'react-icons/io5';

const UserProfile = () => {
  useGetCurrentUser()
  let { userData, location } = useSelector((state) => state.user)

  let navigate = useNavigate()
  let image = userData?.user?.image;


  //update address popover form submit handler :
  let dispatch = useDispatch()

  let [address, setAddress] = useState("")
  let [pincode, setPincode] = useState("")
  let [loading, setLoading] = useState(false)
  let [open, setOpen] = useState(false)

  let handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let res = await axios.put(`${import.meta.env.VITE_user_endpoint}/addressUpdate`, { address, pincode}, { withCredentials: true })
      if (res.data.success) {
        dispatch(updateAddress(res.data.newAddress))
        toast.success(res.data.message)
        setOpen(false)
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <UserNav />
      <div className='lg:mx-20 mt-9'>
        <div className='border rounded-lg h-fit p-3 lg:p-5 flex flex-col lg:flex-row gap-5 justify-between'>

          <div className='flex flex-col gap-5 w-full lg:w-[60%]'>

            <div className='mb-3'>
              <button onClick={() => navigate(-1)}
                className="flex items-center justify-center w-9 h-9 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <IoChevronBack size={20} />
              </button>
            </div>

            <div className='flex flex-col w-full lg:w-[35%]'>
              <div className="w-fit h-fit rounded-full  flex items-center justify-center shadow-sm">
                {image ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img
                      src={userData?.user?.image}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <CiUser className="w-20 h-20 border-2 border-gray-300 p-2 rounded-full text-gray-500" />
                )}
              </div>

              <div className='mt-5 text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Name :</span> {userData.user?.fullname || "Null"}</div>
              <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Phone :</span> {userData.user?.phone || "Null"}</div>
              <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Email :</span> {userData.user?.email || "Null"}</div>
              <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Coordinates :</span> [ {userData.user?.location?.coordinates?.[0].toFixed(4) || "Null"} , {userData.user?.location?.coordinates?.[1].toFixed(4) || "Null"} ] </div>
              
              <div className='mt-3 flex-col gap-10'>
                <div className=''>
                  <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Address :</span> {userData.user?.address || "Null"}</div>
                  <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Pincode :</span> {userData.user?.pincode || "Null"}</div>
                </div>

                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger className='w-full lg:w-fit'>
                    <div className="mt-9 lg:mt-3 px-2 py-1 border rounded-md bg-red-200 active:scale-98 border-red-400 font-semibold cursor-pointer">
                      Update Address
                    </div>
                  </PopoverTrigger>

                  <PopoverContent className="ml-0 lg:ml-15 mt-3 border rounded-md bg-white px-3 py-1 z-999 w-80">
                    <form onSubmit={handleSubmit} className="flex flex-col items-center space-x-3">
                      <textarea
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                        className=" border rounded-md px-2 py-1 w-full"
                      />

                      {
                        <input
                          type="tel"
                          value={pincode}
                          onChange={e => setPincode(e.target.value)}
                          placeholder="Pincode"
                          className="mt-2 border rounded-md px-2 py-1 w-full"
                        />
                      }

                      <button
                        type="submit"
                        className="w-full mt-2 bg-[#ff4d2d] text-white py-1.5 rounded-md cursor-pointer"
                      >
                        Save
                      </button>
                    </form>
                  </PopoverContent>
                </Popover>

              </div>
            </div>
          </div>

          <div onClick={() => navigate(`/updateprofile/${userData?.user._id}`)} className='border w-full flex items-center justify-center lg:w-fit h-fit rounded-md px-6 py-2 hover:shadow-md hover:cursor-pointer active:scale-98 duration-200'>
            <FaPen size={25} />
          </div>

        </div>
      </div>
    </>
  )
}

export default UserProfile
