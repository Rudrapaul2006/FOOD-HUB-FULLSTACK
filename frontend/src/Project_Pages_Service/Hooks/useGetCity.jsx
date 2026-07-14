import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCity, setLocation } from "../Redux/userSlice";

const useGetCity = () => {
    let dispatch = useDispatch();
    let { userData } = useSelector((state) => state.user)

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                let latitude = position.coords.latitude
                let longitude = position.coords.longitude

                let res = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${import.meta.env.VITE_GEO_API_KEY}`)
                // console.log(res.data.results[0].city);
                dispatch(setCity(res.data.results[0].city))
                dispatch(setLocation(res.data.results[0]))

            } catch (error) {
                console.log("Geo API error:", error)
            }
        }
        )

    }, [userData])
};

export default useGetCity;
