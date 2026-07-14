import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const UseUpdateCurrentPosition = () => {
    let { userData } = useSelector(state => state.user);

    useEffect(() => {
        
        let updateLocation = async (lon, lat) => {
            try {
                await axios.put(`${import.meta.env.VITE_user_endpoint}/updatelocation`, { lon, lat }, { withCredentials: true })
            } catch (error) {
                console.log(error);
            }
        }

        let watchId = navigator.geolocation.watchPosition(
            (pos) => {
                updateLocation(pos.coords.longitude, pos.coords.latitude);
            },
            (err) => console.log(err),
            { enableHighAccuracy: true }
        )

        return () => navigator.geolocation.clearWatch(watchId)

    }, [userData])
}

export default UseUpdateCurrentPosition
