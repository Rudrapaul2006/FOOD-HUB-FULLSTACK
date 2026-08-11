import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setShopData, setShopLoading } from '../Redux/adminSlice'

const useGetShop = () => {
    let dispatch = useDispatch();
    let { userData } = useSelector(state => state.user);

    useEffect(() => {
        
        if (!userData || userData?.user?.role !== "admin") {
            dispatch(setShopData(null));
            dispatch(setShopLoading(false));
            return;
        }

        let fetchShop = async () => {
            dispatch(setShopLoading(true))
            try {
                let res = await axios.get(`${import.meta.env.VITE_shop_endpoint}/get`, { withCredentials: true })
                if (res.data.success) {
                    dispatch(setShopData(res.data.shop))              
                }
            } catch (error) {
                console.log(error)
                dispatch(setShopData(null))
            } finally {
                dispatch(setShopLoading(false))
            }
        }
        fetchShop()

    }, [userData, dispatch]);
};

export default useGetShop;
