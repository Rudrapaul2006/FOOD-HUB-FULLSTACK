import React, { use, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setShopHasNext, setShopHasPrev, setShopTotalPage, setUserShopData, setUserShopLoading } from '../Redux/adminSlice';
import axios from 'axios';

const getUserAllShops = () => {
    let dispatch = useDispatch()

    let { userData } = useSelector((state) => state.user);
    let { shopCurrentPage, findShopByText , shopSortByUser } = useSelector(state => state.admin)
    if (!userData) return;

    useEffect(() => {
        if (userData?.user?.role !== "user") return;
        dispatch(setUserShopLoading(true))

        let fetchAllShops = async () => {
            try {
                let res = await axios.get(`${import.meta.env.VITE_shop_endpoint}/getallshops?page=${shopCurrentPage}&query=${findShopByText}&sort=${shopSortByUser}` , { withCredentials: true } )
                if (res.data.success) {
                    dispatch(setUserShopData(res.data.shops))
                    dispatch(setUserShopLoading(false))

                    //pagination data :
                    dispatch(setShopTotalPage(res.data.totalPages))
                    dispatch(setShopHasPrev(res.data.hasPrev))
                    dispatch(setShopHasNext(res.data.hasNext))
                }
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setUserShopLoading(false))
            }
        }

        fetchAllShops()
    }, [userData , dispatch , shopCurrentPage, findShopByText, shopSortByUser])
}

export default getUserAllShops
