import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../Component/UserDashboard';
import DelivaryBoyDashboard from '../Component/DelivaryBoyDashboard';
import useGetCurrentUser from '../Hooks/useGetCurrentUser';

const Home = () => {
  useGetCurrentUser()
  
  let {userData} = useSelector((state) => state.user) // [redux store (for current user) userSlice]
  
  return (
    <>
      <div>
        {userData?.user?.role === "user" && <UserDashboard/>}
        {userData?.user?.role === "delivaryboy" && <DelivaryBoyDashboard/>}
        {/* {userData.user.role === "admin" && <AdminDashboard/>} */}
      </div>
    </>
  )
}

export default Home
