import getUserAllShops from '../User Hooks/getUserAllShops';
import useGetAllCartItems from '../User Hooks/useGetAllCartItems';
import UserHomePage from '../User pages/UserHomePage';

const UserDashboard = () => {
    getUserAllShops()
    useGetAllCartItems()
    
    return (
        <>
            <UserHomePage/>
        </>
    )
}

export default UserDashboard
