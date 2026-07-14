import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUserAllFoodData, setUserAllFoodLoading, setUserSideHasNext, setUserSideHasPrev, setUserSideTotalPages } from '../Redux/foodSlice';

const getAllFoodsFromShops = () => {
    let dispatch = useDispatch()
    let { userData } = useSelector(state => state.user)
    let { userSideCurrentPage , findAllFoodByText , sortUserAllFoods} = useSelector(state => state.food)

    useEffect(() => {
        if (userData?.user?.role !== "user") return;
        if (!userData) return

        let fetchAllFoods = async () => {
            try {
                dispatch(setUserAllFoodLoading(true))
                let res = await axios.get(`${import.meta.env.VITE_food_endpoint}/usergetallfoods?page=${userSideCurrentPage}&query=${findAllFoodByText}&sort=${sortUserAllFoods}`, { withCredentials: true })
                if (res.data.success) {
                    dispatch(setUserAllFoodData({
                        foods : res.data.foods , 
                        page : userSideCurrentPage
                    }))
                    dispatch(setUserSideTotalPages(res.data.totalPages))
                    dispatch(setUserSideHasPrev(res.data.hasPrev))
                    dispatch(setUserSideHasNext(res.data.hasNext))
                }
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setUserAllFoodLoading(false))
            }
        }

        fetchAllFoods()
    }, [dispatch, userData, userSideCurrentPage, findAllFoodByText, sortUserAllFoods])
}

export default getAllFoodsFromShops
