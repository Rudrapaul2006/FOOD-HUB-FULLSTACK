import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCartData, setCartDataLoading } from '../Redux/foodSlice'

const useGetAllCartItems = () => {
    //Add to cart :
    let dispatch = useDispatch()
    let { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (userData?.user?.role !== "user") return;
        let getCartFoods = async () => {
            if (!userData) return;
            try {
                dispatch(setCartDataLoading(true))
                let res = await axios.get(`${import.meta.env.VITE_cart_endpoint}/get`, { withCredentials: true })
                if (res.data.success) {
                    dispatch(setCartData(res.data.getFoodItem))
                }
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setCartDataLoading(false))
            }
        }

        getCartFoods()
    }, [userData, dispatch])
}

export default useGetAllCartItems
