import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ForgotPassword = () => {
    let [step, setStep] = useState(1);
    let [email, setEmail] = useState("");
    let [otp, setOtp] = useState("")
    let [newpassword, setNewpassword] = useState("")
    let [confirmpassword, setConfirmPassword] = useState("")
    let navigate = useNavigate()

    // send OTP :
    let handleSendOTP = async () => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/send-otp`, { email }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message)
                setStep(2)
            }
        } catch (error) {
            console.log(error);
            // toast.error(res.error.response.message);
        }
    }
    //Verify OTP :
    let handleVerifyOTp = async () => {
        try {
            let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/verify-otp`, { email, otp }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message)
                setStep(3)
            }
        } catch (error) {
            console.log(error);
            // toast.error(res.error.response.message);
        }
    }
    //Reset Password :
    let handleResetPassword = async () => {
        if (newpassword !== confirmpassword) {
            toast.error("Password not match")
            return;
        }

        try {
            let res = await axios.post(`${import.meta.env.VITE_user_endpoint}/reset-password`, { email, newpassword }, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message)
                navigate("/signin")
            } else {
                toast.error(error?.response?.data?.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "pass")
            toast.error("Reset password error");
        }
    }


    return (
        <>
            <div className='flex items-center justify-center h-[99.99vh] w-full'>
                {/* //Step -1 */}
                {step == 1 &&
                    <div className="border border-gray-200 shadow-xl rounded-md pb-7 flexflex-col space-y-1 w-110 p-3">

                        <div className='mb-5 flex items-center w-full' ><IoIosArrowBack onClick={() => navigate("/signin")} className=' py-1 px-2 border border-gray-100 bg-gray-200 hover:bg-gray-300 rounded-full duration-100 cursor-pointer' size={34} />
                            <div className=' w-full flex justify-center text-lg font-bold text-[#ff4d2d]'>Forgot Password</div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700">
                                Email
                            </label>
                            <input
                                type="text"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200"
                            />
                        </div>

                        <button onClick={handleSendOTP} className='flex items-center justify-center mt-7 w-full bg-[#ff4d2d] hover:bg-[#e64323] py-2 rounded-md cursor-pointer text-[white] font-semibold duration-100'>Send OTP</button>
                    </div>
                }

                {/* step - 2 */}
                {step == 2 &&
                    <div className="border border-gray-200 shadow-xl rounded-md pb-7 flexflex-col space-y-1 w-110 p-3">
                        <div className='mb-5 flex items-center w-full' ><IoIosArrowBack onClick={() => navigate(-1)} className=' py-1 px-2 border border-gray-100 bg-gray-200 hover:bg-gray-300 rounded-full duration-100 cursor-pointer' size={34} />
                            <div className=' w-full flex justify-center text-lg font-bold text-[#ff4d2d]'>Forgot Password</div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter your OTP"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200"
                            />
                        </div>

                        <button onClick={handleVerifyOTp} className='flex items-center justify-center mt-7 w-full bg-[#ff4d2d] hover:bg-[#e64323] py-2 rounded-md cursor-pointer text-[white] font-semibold duration-100'>Verify OTP</button>
                    </div>
                }

                {/* step - 3*/}
                {step == 3 &&
                    <div className="border border-gray-200 shadow-xl rounded-md pb-7 flexflex-col space-y-1 w-110 p-3">
                        <div className='mb-5 flex items-center w-full' ><IoIosArrowBack onClick={() => navigate(-1)} className=' py-1 px-2 border border-gray-100 bg-gray-200 hover:bg-gray-300 rounded-full duration-100 cursor-pointer' size={34} />
                            <div className=' w-full flex justify-center text-lg font-bold text-[#ff4d2d]'>Forgot Password</div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700">
                                New Password
                            </label>
                            <input
                                type="text"
                                name="newpassword"
                                value={newpassword}
                                onChange={(e) => setNewpassword(e.target.value)}
                                placeholder="Enter new password"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200"
                            />
                        </div>
                        <div className='mt-3'>
                            <label className="text-sm font-semibold text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                type="text"
                                name="confirmpassword"
                                value={confirmpassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="conform password"
                                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition duration-200"
                            />
                        </div>

                        <button onClick={handleResetPassword} className='flex items-center justify-center mt-7 w-full bg-[#ff4d2d] hover:bg-[#e64323] py-2 rounded-md cursor-pointer text-[white] font-semibold duration-100'>Reset password</button>
                    </div>
                }

            </div>
        </>
    )
}

export default ForgotPassword
