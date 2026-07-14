import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import UserNav from '../Component/UserNav'
import { IoChevronBack } from 'react-icons/io5'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { toast } from 'sonner'
import { updateAddress } from '../Redux/userSlice'
import { Loader2 } from 'lucide-react'

const OrderSigleCardItem = () => {
  let params = useParams()
  let dispatch = useDispatch()
  let navigate = useNavigate()

  let foodId = params.id

  let { userData } = useSelector(state => state.user)

  //get the item (from user cart)
  let [item, setItem] = useState([])
  let [loading, setLoading] = useState(false)

  //get the single cart item :
  let getSingleFood = async (id) => {
    try {
      let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/singleCodOrder/${id}`, { withCredentials: true })

      if (res.data.success) {
        setItem(res.data.availableFood)
      }

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getSingleFood(foodId)
  }, [foodId])


  // order the item logic :
  let [paymentMethod, setPaymentMethod] = useState("")
  let [address, setAddress] = useState("")
  let [pincode, setPincode] = useState("")

  //single cod and online order :
  let orderSingleFood = async () => {
    try {
      setLoading(true)
      let res = await axios.post(`${import.meta.env.VITE_order_endpoint}/orderSingleFood/${foodId}`, {
        paymentMethod: paymentMethod,
        address: userData?.user?.address || address,
        pincode: userData?.user?.pincode || pincode
      }, { withCredentials: true })

      if (res.data.success) {
        if (paymentMethod === "cod") {
          toast.success(res.data.message)
          navigate("/allfoods")
        } else {
          openRazorpayWindow(res.data.razorOrder, (address || userData?.user?.address), (userData?.user?.pincode || pincode), paymentMethod)
        }
      }
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong")
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  // razorpay payment gateway logic : (for online order)
  let openRazorpayWindow = (razorOrder, address, pincode, paymentMethod) => {
    let options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
      name: "Food Delivery",
      description: "Order Payment",
      order_id: razorOrder.id,
      handler: async function (response) {
        try {
          let res = await axios.post(`${import.meta.env.VITE_order_endpoint}/singleOnlineOrder/${foodId}`, {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,

            address: address,
            pincode: pincode,
            paymentMethod: paymentMethod
          }, { withCredentials: true })

          if (res.data.success) {
            toast.success(res.data.message)
            navigate("/allfoods")
          }

        } catch (error) {
          toast.error(error.response.data.message || "Something went wrong")
          console.log(error)
        }
      }
    }
    let rzp = new window.Razorpay(options)
    rzp.open()
  }


  // user address update logic here :
  let [open, setOpen] = useState(false)
  let [updateLoading, setUpdateLoading] = useState(false)
  let [updatedAddress, setUpdatedAddress] = useState("")
  let [updatedPincode, setUpdatedPincode] = useState("")

  // update user address and pincode function :
  let handleSubmit = (e) => {
    e.preventDefault()

    let updateUserAddress = async () => {
      try {
        setUpdateLoading(true)
        let res = await axios.put(`${import.meta.env.VITE_user_endpoint}/addressUpdate`, { address: updatedAddress, pincode: updatedPincode.toString() }, { withCredentials: true })

        if (res.data.success) {
          dispatch(updateAddress(res.data.newAddress))
          toast.success(res.data.message)
          setOpen(false)
        }

      } catch (error) {
        console.log(error)
        toast.error(error.response.data.message || "something wrong in address update")
      } finally {
        setUpdateLoading(false)
      }
    }

    updateUserAddress()
  }

  return (
    <>
      <div className='w-full fixed z-99 bg-white top-0'> <UserNav /> </div>

      <div className='mt-18 lg:mt-25 lg:mx-20 flex flex-col-reverse lg:flex-row lg:gap-10 lg:h-[80vh] pb-15 lg:pb-0'>
        <div className='ml-4 lg:ml-0 mr-4 lg:mr-0 mt-7 lg:w-[35%] border rounded-md mb-5 p-3 lg:p-5 lg:sticky lg:top-25 h-fit '>
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <IoChevronBack size={20} />
            </button>
          </div>

          {/* Address */}
          {(!userData?.user?.address && !userData?.user?.pincode) ?
            <div className='w-full flex flex-col mt-5 gap-2 mb-5'>
              <div className='flex items-center text-[17px]'> <span className='mr-3 text-gray-800 font-semibold'>Address </span>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder='Enter your address'
                  className='ml-1 lg:ml-0 w-full lg:w-[42.5vh] focus:outline-none px-3 py-1 border border-blue-300 focus:border-blue-400 rounded-md text-gray-700'
                  type="text" />
              </div>

              <div className='flex  items-center text-[17px]'> <span className='mr-3 text-gray-800 font-semibold'>Pincode</span>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  type="text"
                  className=' w-full lg:w-[15vh] focus:outline-none px-3 py-1 border border-blue-300 focus:border-blue-400 rounded-md text-gray-700' />
              </div>
            </div> : <div className='mt-5 pb-5 flex  text-[17px]'> <span className='mr-3 text-gray-800 font-semibold'>Address </span> <span className='text-gray-600 font-normal'>: {userData?.user?.address || "Null"} {"," + userData?.user?.pincode || "Null"}</span></div>}


          {/* Change address button with popover form : */}
          <Popover>
            <PopoverTrigger >
              <button onClick={() => setOpen(true)} className="px-3 py-1 border border-[#ff4d2d] text-[#ff4d2d] rounded-md hover:bg-[#ff4d2d] hover:text-white transition cursor-pointer duration-300">
                Change Address
              </button>
            </PopoverTrigger>

            {open === true && <PopoverContent side='buttom' className='rounded-md mt-10 lg:mt-10 bg-black z-99'>
              <div className="flex flex-col gap-3 p-4 text-white bg-black border border-orange-300 rounded-md shadow-sm">
                <input
                  type="text"
                  value={updatedAddress}
                  onChange={(e) => setUpdatedAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full text-white px-3 py-2 border border-white rounded-md focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  value={updatedPincode}
                  onChange={(e) => setUpdatedPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="w-full text-white px-3 py-2 border border-white rounded-md focus:outline-none focus:border-orange-500"
                />

                {/* {updateAddressLoading ? "" : ""} */}
                <button onClick={handleSubmit} className='border w-full py-2 rounded-md bg-orange-500 hover:bg-orange-600 flex items-center justify-center active:scale-97 duration-150 cursor-pointer'>
                  {updateLoading ? <Loader2 className='flex animate-spin items-center justify-center'/> : "Update"}
                </button>

              </div>
            </PopoverContent>}
          </Popover>


          {/* Payment Method - */}
          <div className='w-full mt-5 px-2 py-1 rounded-md border border-blue-300'>
            <label className=''>
              <input
                className='cursor-pointer'
                type="radio"
                name="paymentMethod"
                value="online"
                onChange={e => setPaymentMethod(e.target.value)}
              /> Online Payment
            </label>

            <label className='ml-10'>
              <input
                className='cursor-pointer'
                type="radio"
                name="paymentMethod"
                value="cod"
                onChange={e => setPaymentMethod(e.target.value)}
              /> Cash on Delivery (COD)
            </label>
          </div>

          <button
            onClick={() => {
              orderSingleFood()
            }}
            className='mt-6 w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition cursor-pointer'
          >
            {loading ? "Processing..." : "Order All Items"}
          </button>
        </div>

        {item?.length ? <div className='w-full lg:w-[65%] mt-15 lg:mt-6.5 mb-5 lg:h-full lg:overflow-y-auto'>
          <div className="w-[99%]">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden ml-4 lg:ml-0 mr-4 lg:mr-0">
              {item?.length > 0 && item?.map((item) => {
                return (
                  <div key={item?._id} className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 border-b border-orange-600 lg:border-gray-200 last:border-b-0 hover:bg-gray-50 transition " >

                    <div className='flex flex-col lg:flex-row gap-2 lg:gap-5'>
                      <img className="w-40 h-40 rounded-lg object-cover"
                        src={item?.foodDetails?.image || ""}
                        alt={item?.foodDetails.foodname || "Null"} />

                      <div className="flex flex-col lg:flex-row justify-between w-full lg:w-[65%] lg:mr-10 lg:gap-15">
                        <div className="flex flex-col mt-1 lg:mt-0">
                          <span className="font-semibold text-gray-800"> {item?.foodDetails?.foodname} </span>
                          {/* <span className="text-sm text-gray-500">  {item?.foodDetails?.description} </span> */}
                          <span className="text-sm text-gray-500">Item Price : <span className='text-sm text-gray-900'>{item?.foodDetails?.price}</span></span>
                          <span className="text-sm text-gray-500">Quantity : <span className='text-sm text-gray-900'>{item?.quantity}</span> </span>
                          <span className='text-sm mt-1'>Total Price for {item?.quantity} item(s) = ₹{item?.quantity * item?.foodDetails?.price || 0}</span>

                          <span className='mt-2'> {item?.foodDetails?.isAvailable === "yes" ? <div className='px-3 rounded-md flex border w-fit bg-green-100 text-sm text-green-700'> available </div> :
                            <div className='px-3 rounded-md flex border w-fit bg-red-100 text-sm text-red-700'>  Out of Stock </div>}
                          </span>
                        </div>

                        <div className="w-[99%] flex flex-col mt-5 lg:mt-0">
                          <span className="font-semibold text-gray-800"> {item?.shopDetails?.shopname} </span>
                          <span className="text-sm text-gray-500">  {item?.shopDetails?.email} </span>
                          <span className="text-sm text-gray-500">{item?.shopDetails?.phone}</span>
                          <span className='text-sm mt-1'>{item?.shopDetails?.location} , {item?.shopDetails?.state}</span>
                        </div>

                      </div>
                    </div>
                  </div>
                )
              })}

              <div className='lg:mx-22 flex justify-between items-center h-15 lg:h-20 font-bold lg:border-none'>
                <span className='ml-4 lg:ml-0'>Total Price <span className='ml-2'>{"₹ " + item?.reduce((a, b) => a + b?.foodDetails?.price * b?.quantity, 0)}</span></span>
              </div>

            </div>
          </div>
        </div> : <div className='flex justify-center w-full lg:w-[65%] mt-9 mb-5 lg:h-full lg:overflow-y-auto'> No foods Available</div>}
      </div>
    </>
  )
}

export default OrderSigleCardItem
