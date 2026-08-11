import Home from './Project_Pages_Service/Pages/Home';
import SignIn from './Project_Pages_Service/Auth/SignIn';
import ForgotPassword from './Project_Pages_Service/Pages/ForgotPassword';
import useGetCurrentUser from './Project_Pages_Service/Hooks/useGetCurrentUser';
import useGetCity from './Project_Pages_Service/Hooks/useGetCity';
import UserProfile from './Project_Pages_Service/Component/UserProfile';
import AllFoodItems from './Project_Pages_Service/Admin/pages/AllFoodItems';
import UserOrders from './Project_Pages_Service/Admin/pages/UserOrders';
import Shop from './Project_Pages_Service/Admin/pages/Shop';
import ShopRegister from './Project_Pages_Service/Admin/pages/ShopRegister';
import useGetShop from './Project_Pages_Service/Hooks/useGetShop';
import EditShopDetails from './Project_Pages_Service/Admin/pages/EditShopDetails';
import AddFoodItem from './Project_Pages_Service/Admin/pages/AddFoodItem';
import UpdateFoodItem from './Project_Pages_Service/Admin/pages/UpdateFoodItem';
import useGetFoodData from './Project_Pages_Service/Hooks/useGetFoodItem';
import OrderDetails from './Project_Pages_Service/Admin/pages/OrderDetails';
import PreviousOrder from './Project_Pages_Service/Admin/pages/PreviousOrder';
import PreviousOrderDetails from './Project_Pages_Service/Admin/pages/PreviousOrderDetails';
import UseUpdateCurrentPosition from './Project_Pages_Service/Hooks/UseUpdateCurrentPosition';
import useGetShopCoordinates from './Project_Pages_Service/Hooks/useGetShopCoordinates';
import DelivaryBoyHomePage from './Project_Pages_Service/Delivary boy/Pages/DelivaryBoyHomePage';
import useGetDelivaryData from './Project_Pages_Service/Hooks/useGetDelivaryData';
import OrderDetailsForDelivaryBoy from './Project_Pages_Service/Delivary boy/Components/OrderDetailsForDelivaryBoy';
import ShopFoods from './Project_Pages_Service/User pages/ShopFoods';
import UserCart from './Project_Pages_Service/User pages/UserCart';
import AllFoods from './Project_Pages_Service/User pages/AllFoods';
import CheakOut from './Project_Pages_Service/User pages/CheakOut';
import UserAllOrders from './Project_Pages_Service/User pages/UserAllOrders';
import UserOrderDetails from './Project_Pages_Service/User pages/UserOrderDetails';
import UpdateProfile from './Project_Pages_Service/User pages/UpdateProfile';
import OrderAllCartItem from './Project_Pages_Service/User pages/OrderAllCartItem';
import PreviousUserOrder from './Project_Pages_Service/User pages/PreviousUserOrder';
import connectWithSocket from './Project_Pages_Service/WebSocketHooks/connectWithSocket';
import DelivaryPartnerProfile from './Project_Pages_Service/Delivary boy/Pages/DelivaryPartnerProfile';
import UpdateDelivaryPartnerProfile from './Project_Pages_Service/Delivary boy/Pages/UpdateDelivaryPartnerProfile';
import PreviousUserOrderDetails from './Project_Pages_Service/User pages/PreviousUserOrderDetails';
import useGetPendingOrders from './Project_Pages_Service/Hooks/useGetOrders';
import { useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './Project_Pages_Service/Auth/SignUp';
import OrderSigleCardItem from './Project_Pages_Service/User pages/OrderSigleCardItem';
import DelivaryMap from './Project_Pages_Service/Delivary boy/Pages/DelivaryMap';

const App = () => {
  //All children and parent components can use or access this data :
  UseUpdateCurrentPosition()
  useGetShopCoordinates()
  useGetCurrentUser() // [for get the current user] from hook
  useGetCity() // [for get current city] from hook
  useGetShop() //[Get log in admin's shop] from hook
  useGetFoodData() // [Get all food Form resturent] from hook
  useGetPendingOrders() // [Get all order from user] from hook 
  useGetDelivaryData()

  let { userData, loading } = useSelector(state => state.user)

  //connecting socket io with backend : 
  connectWithSocket()

  if (loading) return null;

  return (
    <>
      <Routes>

        <Route path="/" element={userData ? (userData.user?.role === "admin" ? <Navigate to="/admins-shop" replace /> : userData.user?.role === "delivaryboy" ? <Navigate to="/delivaryboyhome" replace /> : <Home />)
          : <Navigate to="/signin" replace />} />


        {/* Auth routes : */}
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
        <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
        <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />

        {/* Admins side route */}
        <Route path='/admins-shop' element={userData ? <Shop /> : <Navigate to={"/signin"} />} />
        <Route path='/registerShop' element={userData ? <ShopRegister /> : <Navigate to={"/signin"} />} />
        <Route path='/editdetails/:id' element={userData ? <EditShopDetails /> : <Navigate to={"/signin"} />} />

        <Route path='/fooditems' element={userData ? <AllFoodItems /> : <Navigate to={"/signin"} />} />
        <Route path='/addfoodItems' element={userData ? <AddFoodItem /> : <Navigate to={"/signin"} />} />
        <Route path='/updatefoodItem/:id' element={userData ? <UpdateFoodItem /> : <Navigate to={"/signin"} />} />

        <Route path='/allorders' element={userData ? <UserOrders /> : <Navigate to={"/signin"} />} />
        <Route path='/ordersdetail/:id' element={userData ? <OrderDetails /> : <Navigate to={"/signin"} />} />
        <Route path='/previousorders' element={userData ? <PreviousOrder /> : <Navigate to={"/signin"} />} />
        <Route path='/previousorderdetails/:id' element={userData ? <PreviousOrderDetails /> : <Navigate to={"/signin"} />} />

        {/* Delivary Boy Routes */}
        <Route path="/delivaryboyhome" element={userData ? <DelivaryBoyHomePage /> : <Navigate to="/signin" replace />} />
        <Route path='/delivaryOrderDetails/:id' element={userData ? <OrderDetailsForDelivaryBoy /> : <Navigate to={"/signin"} />} />
        <Route path='/delivarypartnerprofile' element={userData ? <DelivaryPartnerProfile /> : <Navigate to={"/signin"} />} />
        <Route path='/updatedelivarypartnerprofile' element={userData ? <UpdateDelivaryPartnerProfile /> : <Navigate to={"/signin"} />} />
        <Route path='/delivarymap/:id' element={userData ? <DelivaryMap /> : <Navigate to={"/signin"} />} />


        {/* User Side Routes */}
        <Route path='/userprofile' element={userData ? <UserProfile /> : <Navigate to={"/signin"} />} />
        <Route path='/shopfooditems/:id' element={userData ? <ShopFoods /> : <Navigate to={"/signin"} />} />
        <Route path='/cart' element={userData ? <UserCart /> : <Navigate to={"/signin"} />} />
        <Route path='/allfoods' element={userData ? <AllFoods /> : <Navigate to={"/signin"} />} />
        <Route path='/cheakout/:id' element={userData ? <CheakOut /> : <Navigate to={"/signin"} />} />
        <Route path='/userorders' element={userData ? <UserAllOrders /> : <Navigate to={"/signin"} />} />
        <Route path='/userorderdetails/:id' element={userData ? <UserOrderDetails /> : <Navigate to={"/signin"} />} />
        <Route path='/previosuserorderdetails/:id' element={userData ? <PreviousUserOrderDetails /> : <Navigate to={"/signin"} />} />
        <Route path='/updateprofile/:id' element={userData ? <UpdateProfile /> : <Navigate to={"/signin"} />} />
        <Route path='/orderallcartitem' element={userData ? <OrderAllCartItem /> : <Navigate to={"/signin"} />} />
        <Route path='/orderallcartitem/:id' element={userData ? <OrderSigleCardItem /> : <Navigate to={"/signin"} />} />
        <Route path='/previoususerorder' element={userData ? <PreviousUserOrder /> : <Navigate to={"/signin"} />} />

      </Routes>
    </>
  )
}

export default App
