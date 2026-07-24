import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setDelivaryData, setDelivaryloading } from '../Redux/delivarySlice'
import axios from 'axios'

const useGetDelivaryData = () => {
    let dispatch = useDispatch()
    let { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (userData?.user?.role !== "delivaryboy") return;

        if (!userData) {
            dispatch(setDelivaryData([]));
            return;
        }

        let fetchDelivaryDetails = async () => {
            try {
                dispatch(setDelivaryloading(true))

                let res = await axios.get(`${import.meta.env.VITE_delivary_endpoint}/get` , {withCredentials : true})
                if(res.data.success){
                    dispatch(setDelivaryData(res.data.shopOrder))                    
                }
            } catch (error) {
                console.log(error)
            } finally {
                dispatch(setDelivaryloading(false))
            }
        }

        fetchDelivaryDetails();
    }, [userData, dispatch])
}

export default useGetDelivaryData
