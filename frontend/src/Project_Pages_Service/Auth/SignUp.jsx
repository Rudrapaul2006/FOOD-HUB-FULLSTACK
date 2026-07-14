import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux';
import { auth } from '../../../Firebase/firebase.js';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setUserData } from '../Redux/userSlice.js';

const SignUp = () => {
    let [input, setInput] = useState({
        fullname: "",
        email: "",
        password: "",
        phone: ""
    })
    let navigate = useNavigate()
    let dispatch = useDispatch()

    let handle = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    let [role, setRole] = useState("user")
    let [loading, setLoading] = useState(false)
    let [showPassword, setShowPassword] = useState(false)

    //user local sign up logic :
    let handleForm = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/register`, { ...input, role }, { withCredentials: true })
            if (res.data.success) {
                toast.success(res.data.message);
                setInput(res.data)
                navigate("/signin")
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Signup failed" || error.message)
        } finally {
            setLoading(false);
        }
    }

    // Google sign up handler :
    let [googleSignUpLoading, setGoogleSignUpLoading] = useState(false)

    let handleGoogleSignUp = async () => {
        let provider = new GoogleAuthProvider()
        let result = await signInWithPopup(auth, provider)

        try {
            setGoogleSignUpLoading(true)

            let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/google-signup`, {
                email: result.user.email,
                fullname: result.user.displayName,
                image: result.user.photoURL,
                role: role,
                password: input.password,
                phone: input.phone
            }, { withCredentials: true })

            if (res.data.success) {
                toast.success(res.data.message)
                console.log(res.data)

                dispatch(setUserData(res.data)) // [userData (redux store (current user))]
                navigate("/")
            }

        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
            console.log(error.message)
            throw error
        } finally {
            setGoogleSignUpLoading(false)
        }
    }


    return (
        <>
            <div className='flex  flex-col justify-center items-center h-[99.99vh] mx-25'>
                <form
                    onSubmit={handleForm}
                    className="w-110 mx-auto p-3 bg-[#fffcfc] backdrop-blur rounded-2xl shadow-xl pb-5 lg:space-y-4 md:space-y-4 sm:space-y-3 border border-gray-200">
                    <div className='flex flex-col text-[#ff4d2d] font-bold text-xl gap-1 mb-7'>
                        FoodHuB
                        <span className='text-slate-600 text-sm font-normal'>Create your account to get started with delicious food deliveries ..</span>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="fullname"
                            value={input.fullname}
                            onChange={handle}
                            placeholder="Enter your full name"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700
                                        transition duration-200"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={input.email}
                            onChange={handle}
                            placeholder="Enter your email"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700
                                        transition duration-200"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={input.phone}
                            onChange={handle}
                            placeholder="Enter your phone number"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700
                                        transition duration-200"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={input.password}
                                onChange={handle}
                                placeholder="Create a strong password"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10
                                         text-gray-700 transition"/>
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 cursor-pointer">
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Role
                        </label>
                        <div className="flex gap-1 flex-col lg:flex-row md:flex-row md:gap-5 lg:gap-5">
                            {["user", "admin", "delivaryboy"].map((r) => {
                                return (
                                    <div
                                        key={r} type="button" onClick={() => setRole(r)}
                                        className={`mt-1 px-5 py-1 rounded-lg transition
                                                ${role === r
                                                ? "bg-[#ff4d2d] border border-[#ff4d2d] text-white"
                                                : "border border-orange-500 text-orange-500 hover:bg-orange-50 cursor-pointer"}`
                                        }>
                                        {r}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className='flex items-center justify-center mt-7 w-full py-1 rounded-md bg-[#ff4d2d] text-[white] font-bold border border-orange-500 cursor-pointer'
                    >
                        {loading ? <Loader2 className='animate-spin' /> : "Sign UP"}
                    </button>

                    <button
                        type='button'
                        onClick={handleGoogleSignUp}
                        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:shadow-sm transition cursor-pointer"
                    >
                        <FcGoogle className="text-2xl" />
                        <span className="font-medium">Continue with Google</span>
                    </button>

                    <div className='text-sm'>Have an account ? <span onClick={() => navigate("/signin")} className='text-[#ff4d2d] font-semibold cursor-pointer'>Log In</span></div>
                </form>


            </div>
        </>
    )
}

export default SignUp
