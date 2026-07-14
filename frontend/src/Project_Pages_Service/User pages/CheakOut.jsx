import React, { useEffect, useState } from 'react'
import UserNav from '../Component/UserNav'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setUserOrderData } from '../Redux/orderSlice'

const CheakOut = () => {
    let params = useParams()
    let cartId = params.id
    let navigate = useNavigate()
    let dispatch = useDispatch()

    let [foodData, setFoodData] = useState([])
    let foodId = foodData?.foodDetails?._id

    //Cart food Data :
    let fetchSingleFood = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_cart_endpoint}/get/${cartId}`, { withCredentials: true });
            if (res.data.success) {
                setFoodData(res.data.food)
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        fetchSingleFood()
    }, [])


    //Create order :
    let [loading, setLoading] = useState(false)
    let [input, setInput] = useState({
        address: "",
        pincode: "",
        paymentMethod: ""
    })

    let handleInput = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    let handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        let order = async () => {
            try {
                let res = await axios.post(`${import.meta.env.VITE_order_endpoint}/apply_order/${foodId}`, {
                    quantity: foodData.quantity,
                    paymentMethod: input.paymentMethod,
                    address: input.address || foodData.userDetails?.address,
                    pincode: input.pincode || foodData.userDetails?.pincode
                }, { withCredentials: true })
                if (res.data.success) {
                    toast.success(res.data.message)
                    navigate("/allfoods")
                }
            } catch (error) {
                console.log(error)
                toast.error(error.response.data.message || "Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        order()
    }

    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>

            <div className='lg:mx-20 mt-5 lg:mt-7 shadow-sm border rounded-md h-fit p-4 flex flex-col lg:flex-row justify-between gap-3 lg:gap-0'>
                {/* Left DeliVary details */}
                <div className='w-full h-fit lg:w-[40%] flex flex-col border-b-2 border-[#ff4d2d] lg:border-none pb-7 lg:pb-0'>
                    <div className='py-2'>
                        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-9 h-9 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer">
                            <IoChevronBack size={20} />
                        </button>
                    </div>

                    <div className='py-2 text-2xl font-bold text-black'>ShopDetails</div>
                    <div className='flex mt-4 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Shop Name </span> <span className='text-gray-600 font-normal'>: {foodData?.shopDetails?.shopname || "Null"}</span></div>
                    <div className='flex mt-1 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Email </span> <span className='text-gray-600 font-normal'>: {foodData?.shopDetails?.email || "Null"}</span></div>
                    <div className='flex mt-1 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Phone </span> <span className='text-gray-600 font-normal'>: {foodData?.shopDetails?.phone || "Null"}</span></div>
                    <div className='flex mt-1 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Location </span> <span className='text-gray-600 font-normal'>: {foodData?.shopDetails?.location || "Null"}</span></div>
                    <div className='flex mt-1 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>City </span> <span className='text-gray-600 font-normal'>: {foodData?.shopDetails?.city || "Null"}</span></div>
                    <div className='flex mt-1 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>State </span> <span className='text-gray-600 font-normal'>: {foodData?.shopDetails?.state || "Null"}</span></div>
                </div>

                {/* Right Side Food Item */}
                <div className='w-full lg:w-[59%] h-full lg:border-l-2 lg:border-gray-200 flex flex-col'>
                    <div className='lg:px-6 py-2 text-4xl font-bold text-[#ff4d2d]'>{foodData.shopDetails?.shopname}</div>

                    <div className='lg:px-6 mt-2 text-2xl font-bold text-black'>FoodDetails</div>

                    <div className='flex mt-3 lg:mt-5 lg:px-6 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Food Item : </span> <span className='text-gray-600 font-normal'>{foodData?.foodDetails?.foodname || "Null"}</span></div>
                    <div className='flex mt-1 lg:px-6 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Description </span> <span className='text-gray-600 font-normal'>: {foodData?.foodDetails?.description || "Null"}</span></div>
                    <div className='lg:mt-1 flex flex-col lg:flex-row lg:gap-5'>
                        <div className='flex mt-1 lg:px-6 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Category </span> <span className='text-gray-600 font-normal'>: {foodData?.foodDetails?.category || "Null"}</span></div>
                        <div className='flex mt-1 lg:px-6 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Foodtype </span> <span className='text-gray-600 font-normal'>: {foodData?.foodDetails?.foodtype || "Null"}</span></div>
                        <div className='flex mt-1 lg:px-6 text-[17px]'> <span className='mr-2 text-gray-800 font-semibold'>Item Price </span> <span className='text-gray-600 font-normal'>: {foodData?.foodDetails?.price || "Null"}</span></div>
                    </div>
                    <div className='flex mt-1 lg:px-6 text-[17px] items-center'>
                        <span className='mr-2 text-gray-800 font-semibold'>Available</span>

                        <span className={`px-3 py-1 rounded-md text-sm font-medium ${foodData?.foodDetails?.isAvailable === "yes" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {foodData?.foodDetails?.isAvailable}
                        </span>
                    </div>

                    <div className='flex gap-3'>
                        <div className='w-fit mt-7 lg:ml-6 px-6 py-1 bg-gray-200 border border-blue-300 rounded-md'><span className='font-semibold'>Quantity - </span>{foodData.quantity}</div>
                        <div className='w-fit mt-7 lg:ml-6 px-6 py-1 bg-gray-200 border border-blue-300 rounded-md'><span className='font-semibold'>Total Price - </span>{foodData.quantity * foodData.foodDetails?.price || 0}</div>
                    </div>

                    {/* User Address */}
                    {!foodData.userDetails?.address ?
                        <div className='w-full lg:ml-6 mt-10 flex flex-col lg:flex-row  gap-2 lg:gap-10 mb-1'>
                            <div className='flex items-center text-[17px]'> <span className='mr-3 text-gray-800 font-semibold'>Address </span>
                                <input onChange={handleInput} name="address" value={input.address} placeholder='Enter your address' className='ml-1 lg:ml-0 w-full lg:w-[42.5vh] focus:outline-none px-3 py-1 border border-blue-300 focus:border-blue-400 rounded-md text-gray-700' type="text" />
                            </div>

                            <div className='flex  items-center text-[17px] '> <span className='mr-3 text-gray-800 font-semibold'>Pincode</span>
                                <input onChange={handleInput} name="pincode" value={input.pincode} className=' w-full lg:w-[15vh] focus:outline-none px-3 py-1 border border-blue-300 focus:border-blue-400 rounded-md text-gray-700' type="text" />
                            </div>
                        </div> : <div className='mt-5 flex lg:px-6 text-[17px]'> <span className='mr-3 text-gray-800 font-semibold'>Address :</span> <span className='text-gray-600 font-normal'>{foodData?.userDetails?.address || "Null"} {", " + foodData.userDetails.pincode || "Null"}</span></div>}

                    {/* Payment Method - */}
                    <div className='w-fit lg:w-fit mt-3 lg:ml-6 px-2 py-1 rounded-md border border-blue-300'>
                        <label> <input type="radio" name="paymentMethod" onChange={handleInput} value="online" /> Online Payment </label>
                        <label className='ml-10'> <input type="radio" name="paymentMethod" onChange={handleInput} value="cod" /> Cash on Delivery (COD) </label>
                    </div>

                    <button onClick={handleSubmit} disabled={loading} className='lg:ml-6 mt-5 lg:mt-8 py-2 border border-[#ff4d2d] rounded-md cursor-pointer font-semibold active:scale-98 duration-200'>
                        {loading ? "Placing Order..." : "Place Order"}
                    </button>
                </div>
            </div>
        </>
    )
}

export default CheakOut