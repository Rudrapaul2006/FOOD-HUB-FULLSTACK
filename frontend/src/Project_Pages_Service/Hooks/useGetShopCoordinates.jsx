import axios from 'axios';
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

const useGetShopCoordinates = () => {
    let { shopData } = useSelector(state => state.admin);
    let {userData} = useSelector(state => state.user)
    
    useEffect(() => {
        if (userData?.user?.role !== "admin") return

        let updateLocation = async (lon, lat) => {
            try {
                let res = await axios.put(`${import.meta.env.VITE_shop_endpoint}/shoplocation`, { lon, lat }, { withCredentials: true });
                // console.log(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        
        navigator.geolocation.getCurrentPosition((pos) => {
            updateLocation(pos.coords.longitude, pos.coords.latitude)
        })

    }, [shopData])
}

export default useGetShopCoordinates
