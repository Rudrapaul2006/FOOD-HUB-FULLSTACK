import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setLoading, setUserData } from '../Redux/userSlice'

const useGetCurrentUser = () => {
    let dispatch = useDispatch();

    useEffect(() => {
        let fetchUser = async () => {
            try {
                let res = await axios.get(`${import.meta.env.VITE_user_endpoint}/currentuser`, { withCredentials: true });
                dispatch(setUserData(res.data));
            } catch (error) {
                console.log(error);
                dispatch(setUserData(null));
            } finally {
                dispatch(setLoading(false));
            }
        }

        fetchUser()
    }, [dispatch])

}

export default useGetCurrentUser
