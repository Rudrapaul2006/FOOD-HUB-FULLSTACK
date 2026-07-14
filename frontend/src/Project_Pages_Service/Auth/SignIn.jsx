import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';
import { IoIosArrowBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../Redux/userSlice.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../Firebase/firebase.js';
import { FcGoogle } from 'react-icons/fc';

const SignIn = () => {

  let [input, setInput] = useState({
    email: "",
    password: ""
  })
  let [role, setRole] = useState("user");

  let navigate = useNavigate();
  let dispatch = useDispatch()

  let [showpassword, setShowpassword] = useState(false);
  let [loading, setLoading] = useState(false);

  let handleInput = async (e) => {
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  //user local login logic :
  let handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true);

    try {
      let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/login`, { ...input, role }, { withCredentials: true });
      if (res.data.success) {
        toast.success(res.data.message)
        dispatch(setUserData(res.data)) // [userData (redux store (current user))]
        navigate("/")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "User not found" || error.message);
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // Google login logic :
  let [googleLoginLoading, setGoogleLoginLoading] = useState(false)

  let googleLogin = async () => {
    let provide = new GoogleAuthProvider()
    let result = await signInWithPopup(auth, provide)

    try {
      setGoogleLoginLoading(true)

      let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/google-login`, { email: result.user.email, role: role }, { withCredentials: true })

      if (res.data.success) {
        toast.success(res.data.message)
        dispatch(setUserData(res.data))
        navigate("/")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
      console.log(error)
      throw error
    }
  }


  return (
    <>
      <div className='flex items-center justify-center h-[99.99vh] mx-25'>
        <form onSubmit={handleSubmit} className="lg:w-110 mx-auto p-4 bg-[#fffcfc] backdrop-blur rounded-2xl shadow-xl pb-5 space-y-4 border border-gray-200" >

          <div onClick={() => navigate("/signup")} className='p-1.5 border border-gray-100 bg-gray-200 hover:bg-gray-300 w-fit rounded-full duration-100 cursor-pointer' ><IoIosArrowBack size={20} /></div>
          <div className='flex flex-col text-[#ff4d2d] font-bold text-xl gap-1 mb-7'>
            FoodHuB
            <span className='text-slate-600 text-sm font-normal'>Create your account to get started with delicious food deliveries ..</span>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={input.email}
              onChange={handleInput}
              placeholder="Enter your email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className='relative'>
              <input
                type={showpassword ? "text" : "password"}
                name="password"
                value={input.password}
                onChange={handleInput}
                placeholder="Enter your password"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200"
              />

              <button
                type="button"
                onClick={() => setShowpassword(prev => !prev)}
                className='absolute right-2 top-4 text-gray-500 hover:text-gray-800 cursor-pointer'
              >
                {showpassword ? <FaRegEyeSlash /> : <FaRegEye />}
              </button>

              <div onClick={() => navigate("/forgot-password")} className='absolute right-0 text-[#fe5335] mt-1 cursor-pointer hover:text-[#f72c08]'>Forgot password</div>
            </div>
          </div>


          <div className='mt-10 w-full'>
            <label htmlFor="">Role</label>
            <div className='flex gap-5'>
              {["user", "admin", "delivaryboy"].map((r) => {
                return (
                  <div
                    key={r} type="button" onClick={() => setRole(r)}
                    className={` mt-1 px-5 py-1 rounded-lg transition ${role === r ? "bg-[#ff4d2d] border border-[#ff4d2d] text-white"
                      : "border border-orange-500 text-orange-500 hover:bg-orange-50 cursor-pointer"}`}>
                    {r}
                  </div>
                )
              })}
            </div>

          </div>

          <button type='submit' disabled={loading} className='flex items-center justify-center mt-5 w-full bg-[#ff4d2d] py-2 rounded-md cursor-pointer'>
            {loading ? <Loader2 className='animate-spin' /> : <span className='text-[white] font-bold'>Login</span>}
          </button>

          <button
            type='button'
            onClick={googleLogin}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:shadow-sm transition cursor-pointer"
          >
            <FcGoogle className="text-2xl" />
            <span className="font-medium">Login with Google</span>
          </button>

          <div className='text-sm'>Don't have an account ? <span onClick={() => navigate("/signup")} className='text-[#ff4d2d] font-semibold cursor-pointer'>Sign up</span></div>
        </form>
      </div>
    </>
  )
}

export default SignIn
