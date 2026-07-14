import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setCurrentPage, setFoodData, setFoodLoading, setHasNext, setHasPrev, setTotalAdminShopFood, setTotalPages } from "../Redux/foodSlice";

let useGetFoodData = () => {
  let dispatch = useDispatch()
  let { userData } = useSelector(state => state.user)
  let { shopData } = useSelector(state => state.admin)
  let { foodData, searchFoodByText, currentPage } = useSelector(state => state.food)

  useEffect(() => {
    if (userData?.user?.role !== "admin") return;
    if (!shopData) return;

    let fetchFoods = async () => {
      try {
        dispatch(setFoodLoading(true))

        let res = await axios.get(`${import.meta.env.VITE_food_endpoint}/get?query=${searchFoodByText}&page=${currentPage}`, { withCredentials: true })

        if (res.data.success) {
          dispatch(setTotalAdminShopFood(res.data.allFoods))
          dispatch(setFoodData(res.data.foods)) //admin shops all food

          //Pagination Data :
          dispatch(setTotalPages(res.data.totalPages))
          dispatch(setHasNext(res.data.hasNext))
          dispatch(setHasPrev(res.data.hasPrev))

          if (res.data.page !== currentPage) {
            dispatch(setCurrentPage(res.data.page))
          }
        }

      } catch (error) {
        console.log("Food fetch error:", error)
        dispatch(setFoodData([]))
      } finally {
        dispatch(setFoodLoading(false))
      }
    }
    fetchFoods()
    
  }, [dispatch, shopData, searchFoodByText, currentPage, foodData.length])
}

export default useGetFoodData;
