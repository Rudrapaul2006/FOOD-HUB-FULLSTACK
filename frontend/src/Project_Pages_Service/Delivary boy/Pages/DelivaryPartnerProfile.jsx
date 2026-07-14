import React from 'react'
import DelivaryBoyNav from '../Components/DelivaryBoyNav'
import { useDispatch, useSelector } from 'react-redux'
import { FaPen } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowBack } from 'react-icons/io'
import axios from 'axios'
import { toast } from 'sonner'
import { setUpdateAvailability } from '@/Project_Pages_Service/Redux/userSlice'

const DelivaryPartnerProfile = () => {
  // useGetCurrentUser()

  let { userData } = useSelector(state => state.user)
  let navigate = useNavigate()
  let dispatch = useDispatch()

  let updateAvailability = async () => {
    try {
      let res = await axios.put(`${import.meta.env.VITE_user_endpoint}/updateavailability` , {available : userData?.user?.available === "yes" ? "no" : "yes"} , {withCredentials : true});
      if(res.data){
        toast.success(res.data.message)
        dispatch(setUpdateAvailability(res.data.delivaryBoy))
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Available update error");
    }
  }

  return (
    <>
      <DelivaryBoyNav />
      <div className='lg:mx-20 mt-9'>
        <div className='border rounded-lg h-fit p-5 flex flex-col lg:flex-row gap-5 justify-between'>

          <div className='flex flex-col w-full lg:w-[35%]'>
            <button
              className=" w-fit p-1.5 rounded-xl border bg-gray-100 mb-3 hover:bg-gray-200 cursor-pointer duration-200 "
              onClick={() => navigate(-1)}
            >
              <IoIosArrowBack size={22} />
            </button>

            <div className='mt-5 text-[17px] text-gray-600'>
              <img src={userData?.user?.image || "/default-image.jpg"} alt="Profile" className='w-20 h-20 rounded-full object-cover' />
            </div>
            <div className='mt-5 text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Name :</span> {userData?.user?.fullname || "Null"}</div>
            <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Phone :</span> {userData?.user?.phone || "Null"}</div>
            <div className='text-[17px] text-gray-600'><span className='font-semibold text-gray-700'>Email :</span> {userData?.user?.email || "Null"}</div>


            <div className='mt-10 lg:mt-7 text-[17px] text-gray-600 flex'>
              <div className='flex items-center font-semibold text-gray-700'> Available :
                <span className={`font-normal ml-2 px-2 py-1 w-fit rounded-md ${userData?.user?.available === "yes" ? "bg-green-400" : "bg-red-400"}`}>{userData?.user?.available || "Null"}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center  ml-5 lg:ml-12">
                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                  <input type="checkbox" className="sr-only peer" checked={userData?.user?.available === "no"} onChange={updateAvailability} />
                  <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                  Not available
                </label>
              </div>
            </div>

          </div>

          <div onClick={() => navigate("/updatedelivarypartnerprofile")} className='border w-full flex items-center justify-center lg:w-fit h-fit rounded-md px-6 py-2 hover:shadow-md hover:cursor-pointer active:scale-98 duration-200'>
            <FaPen size={25} />
          </div>



        </div>
      </div>
    </>
  )
}

export default DelivaryPartnerProfile
