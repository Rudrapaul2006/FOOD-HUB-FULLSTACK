import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { connectSocket, disconnectSocket } from './connetSocket'

const connectWithSocket = () => {

    let { userData } = useSelector(state => state.user)


    useEffect(() => {
    if (!userData) return;

    connectSocket(userData?.user?._id)

     return () => {
      disconnectSocket()
    }
    
}, [userData?.user?._id])
}

export default connectWithSocket
