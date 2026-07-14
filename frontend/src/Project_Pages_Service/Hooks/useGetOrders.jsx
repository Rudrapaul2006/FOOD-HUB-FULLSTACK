import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentPage, setHasNext, setHasPrev, setOrderData, setOrderLoading, setPendingOrders, setTotalAdminSidePendingOrder, setTotalPages, setTotalRevenue } from '../Redux/orderSlice'


// Socket aur Hook dono yahi function use karenge
export const getPendingOrders = async (dispatch, currentPage) => {
  try {
    dispatch(setOrderLoading(true))

    let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/get?page=${currentPage}`, { withCredentials: true })

    if (res.data.success) {
      if (
        res.data.totalPages > 0 &&
        currentPage > res.data.totalPages
      ) {
        dispatch(setCurrentPage(res.data.totalPages))
        return
      }
      dispatch(setTotalAdminSidePendingOrder(res.data.totalPendingOrders)) //[all compleate orders]
      dispatch(setPendingOrders(res.data.shopPendingOrders)) //[for notification]
      dispatch(setTotalRevenue(res.data.totalRevenue))
      dispatch(setOrderData(res.data.allPendingOrders))
      dispatch(setTotalPages(res.data.totalPages))
      dispatch(setHasPrev(res.data.hasPrev))
      dispatch(setHasNext(res.data.hasNext))
    }

  } catch (error) {
    console.log(error)
  } finally {
    dispatch(setOrderLoading(false))
  }
}


let useGetPendingOrders = () => {
  let dispatch = useDispatch()

  let { shopData } = useSelector(state => state.admin)
  let { userData } = useSelector(state => state.user)
  let { currentPage } = useSelector(state => state.order)



  useEffect(() => {
    if (userData?.user?.role !== "admin") return
    if (!shopData) return

    getPendingOrders(dispatch, currentPage)

  }, [shopData, userData, currentPage, dispatch])
}

export default useGetPendingOrders