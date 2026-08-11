import React, { useEffect, useRef, useState } from 'react'
import UserNav from '../Component/UserNav'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { getSocket } from '../WebSocketHooks/connetSocket'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

let shopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
  iconSize: [35, 35],
})

let riderIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [35, 35],
})

let userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
  iconSize: [35, 35],
})

// Route control drawing path: Shop -> Delivery Boy -> User
const RoutingControl = ({ shopCoords, riderCoords, userCoords }) => {
  let map = useMap()
  let routeControlRef = useRef(null)

  useEffect(() => {
    if (!map) return

    let waypoints = []
    if (shopCoords?.length === 2 && !isNaN(shopCoords[0]) && !isNaN(shopCoords[1])) {
      waypoints.push(L.latLng(shopCoords[0], shopCoords[1]))
    }
    if (riderCoords?.length === 2 && !isNaN(riderCoords[0]) && !isNaN(riderCoords[1])) {
      waypoints.push(L.latLng(riderCoords[0], riderCoords[1]))
    }
    if (userCoords?.length === 2 && !isNaN(userCoords[0]) && !isNaN(userCoords[1])) {
      waypoints.push(L.latLng(userCoords[0], userCoords[1]))
    }

    if (waypoints.length < 2) {
      if (routeControlRef.current && map) {
        try { map.removeControl(routeControlRef.current) } catch (e) {}
        routeControlRef.current = null
      }
      return
    }

    if (!routeControlRef.current) {
      routeControlRef.current = L.routing.control({
        waypoints: waypoints,
        lineOptions: {
          styles: [{ color: "#2563EB", weight: 4, opacity: 0.85 }],
        },
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        createMarker: () => null
      }).addTo(map)
    } else {
      routeControlRef.current.setWaypoints(waypoints)
    }
  }, [map, shopCoords, riderCoords, userCoords])

  useEffect(() => {
    return () => {
      if (routeControlRef.current && map) {
        try { map.removeControl(routeControlRef.current) } catch (e) {}
        routeControlRef.current = null
      }
    }
  }, [map])

  return null
}

const MapBoundsFit = ({ shopCoords, riderCoords, userCoords }) => {
 let map = useMap()
 let initialFitDoneRef = useRef(false)

  useEffect(() => {
    if (!map) return
   let points = []
    if (shopCoords?.length === 2 && !isNaN(shopCoords[0]) && !isNaN(shopCoords[1])) points.push(shopCoords)
    if (riderCoords?.length === 2 && !isNaN(riderCoords[0]) && !isNaN(riderCoords[1])) points.push(riderCoords)
    if (userCoords?.length === 2 && !isNaN(userCoords[0]) && !isNaN(userCoords[1])) points.push(userCoords)

    if (points.length > 0 && !initialFitDoneRef.current) {
     let bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
      initialFitDoneRef.current = true
    }
  }, [map, shopCoords, riderCoords, userCoords])

  return null
}

const UserOrderDetails = () => {
    let params = useParams()
    let groupId = params.id
    let navigate = useNavigate()

    let [orderData, setOrderData] = useState([])
    let socket = getSocket()
    let [userOrderStatus, setUserOrderStatus] = useState([]) // socket data
    let [delivaryBoyData, setDelivaryBoyData] = useState(null)

    // Delivery boy live tracking coordinates [latitude, longitude] & live tracking status
    let [delivaryBoyCoords, setDelivaryBoyCoords] = useState([]) 
    let [isLiveLocation, setIsLiveLocation] = useState(false)
    let isLiveRef = useRef(false)

    // Reset live tracking state when order changes
    useEffect(() => {
        isLiveRef.current = false
        setIsLiveLocation(false)
        setDelivaryBoyCoords([])
    }, [groupId])

    // Fallback/Initial location from DB: orderDetails -> items -> assignment -> assignto -> location -> coordinates [longitude, latitude]
    let dbCoords = orderData?.[0]?.assignment?.assignto?.location?.coordinates

    useEffect(() => {
        if (isLiveRef.current) return // Do not let older DB location overwrite newer live location
        if (dbCoords && Array.isArray(dbCoords) && dbCoords.length === 2) {
            let lng = Number(dbCoords[0])
            let lat = Number(dbCoords[1])
            if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
                setDelivaryBoyCoords([lat, lng])
            }
        }
    }, [dbCoords])

    // Extract Shop & User location coordinates: GeoJSON [longitude, latitude] -> Leaflet [latitude, longitude]
    let shopRawCoords = orderData?.[0]?.shopDetails?.shopGeoLocation?.coordinates
    let shopLatLng = (shopRawCoords && Array.isArray(shopRawCoords) && shopRawCoords.length === 2 && !isNaN(shopRawCoords[0]) && !isNaN(shopRawCoords[1]) && (shopRawCoords[0] !== 0 || shopRawCoords[1] !== 0))
        ? [Number(shopRawCoords[1]), Number(shopRawCoords[0])]
        : null

    let userRawCoords = orderData?.[0]?.orderedBy?.location?.coordinates
    let userLatLng = (userRawCoords && Array.isArray(userRawCoords) && userRawCoords.length === 2 && !isNaN(userRawCoords[0]) && !isNaN(userRawCoords[1]) && (userRawCoords[0] !== 0 || userRawCoords[1] !== 0))
        ? [Number(userRawCoords[1]), Number(userRawCoords[0])]
        : null

    //emiting order assignment id from user side to join io room in server side :
    let assignmentId = orderData.map(i => i?.assignment?._id?.toString())[0]


    let userOrder = useSelector(state => state.order)
    let status = orderData.map(i => i?.orderStatus)[0] || userOrder?.userOrderData?.map(i => i?.order?.map(j => j?.orderStatus)[0])

    let socketOrderStatus = userOrderStatus?.orderStatus
    let cancelReason = orderData?.map(i => i?.cancelReason)[0]
    let canceledBy = orderData?.map(i => i?.cancelBy)[0]


    //Let option for user to cancel the order :
    let cancelReasonOptions = [
        "Change of mind",
        "Found a better price elsewhere",
        "Want to change items or quantity",
        "Ordered by mistake",
        "Other Reason"
    ]

    let [showCancelReasonOptions, setShowCancelReasonOptions] = useState(false)
    let [selectedCancelReason, setSelectedCancelReason] = useState("")

    let singleOrderData = async () => {
        try {
            let res = await axios.get(`${import.meta.env.VITE_order_endpoint}/userorder/${groupId}`, { withCredentials: true })
            if (res.data.success) {
                setOrderData(res.data.orderDetails)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        singleOrderData()
    }, [])

    //let cancel the order :
    let cancelOrder = async (orderstatus) => {
        try {
            let res = await axios.put(`${import.meta.env.VITE_order_endpoint}/ordercancel/${groupId}`, { orderStatus: orderstatus, cancelReason: selectedCancelReason }, { withCredentials: true })
            if (res.data.success) {
                setOrderData(res.data.order)
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    //Io geting user order status or groupId :
    let orderDataRef = useRef(orderData)

    useEffect(() => {
        orderDataRef.current = orderData
    }, [orderData])

    useEffect(() => {
        if (!socket) return

        socket.on("userOrderData", data => {
            setUserOrderStatus(data)
        })

        // Emit the same order assignment ID so the delivery boy can join the corresponding Socket.IO room [with user].
        socket.emit("joinAssignmentRoom", assignmentId)

        let handleDelivaryBoyLocation = (data) => {
            if (data && data?.latitude != null && data?.longitude != null) {
                let lat = Number(data.latitude)
                let lng = Number(data.longitude)
                if (!isNaN(lat) && !isNaN(lng)) {
                    isLiveRef.current = true
                    setIsLiveLocation(true)
                    setDelivaryBoyCoords([lat, lng])
                }
            }
        }

        socket.on("delivaryBoyLocation", handleDelivaryBoyLocation)

        socket.on("userOrderStatus", data1 => {
            setUserOrderStatus(data1)
        })

        socket.on("delivaryBoyDetails", data => {
            setDelivaryBoyData(data)
        })

        return () => {
            socket.off("userOrderData")
            socket.off("userOrderStatus")
            socket.off("delivaryBoyLocation", handleDelivaryBoyLocation)
            socket.off("delivaryBoyDetails")
        }
    }, [socket, assignmentId])

    return (
        <>
            <div className='sticky top-0 z-999 bg-white'> <UserNav /> </div>
            <div className='mt-8 lg:mx-20 lg:h-fit border rounded-lg flex flex-col md:flex lg:flex-row mb-5'>

                {/* Right Side */}
                <div className='flex flex-col p-5 gap-5 lg:w-[35%] lg:border-r-2'>
                    <div className='flex gap-5'>
                        <button onClick={() => navigate(-1)}
                            className="flex items-center justify-center w-9 h-9 border border-gray-200 bg-gray-100 rounded-lg hover:bg-gray-200 transition cursor-pointer"
                        >
                            <IoChevronBack size={20} />
                        </button>
                    </div>

                    <div className='flex flex-col lg:pb-0'>
                        <div className='text-2xl font-bold'>Shop Details</div>
                        <div className='mt-4 text-gray-800 font-semibold text-[16px] '>Shop Name</div>
                        <span className='font-normal text-sm text-gray-600'> {orderData?.[0]?.shopDetails?.shopname || "null"} </span>

                        <div className='mt-4 text-gray-800 font-semibold text-[16px] '>Phone</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'> {orderData?.[0]?.shopDetails?.phone || "null"} </span>

                        <div className='text-gray-800 font-semibold text-[16px] '>Email</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.email || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>Location</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.location || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>City </div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.city || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>State</div>
                        <span className='mb-3 font-normal text-sm text-gray-600'>{orderData?.[0]?.shopDetails?.state || "null"}</span>

                        <div className='text-gray-800 font-semibold text-[16px] '>Order Id</div>
                        <span className='font-normal text-sm text-gray-600'>{orderData?.[0]?.orderGroupId?.slice(-6) || "null"}</span>
                    </div>

                    {/* user can cancel the order */}
                    <div className='flex gap-5 lg:gap-15 items-center  mt-5'>
                        <div className='font-bold'>Cancel the order : </div>
                        <div>
                            {["cancel"].map((i, index) => {
                                return (
                                    <div key={index}>
                                        <button
                                            disabled={status === "cancel" || status === "out for delivary" || status === "picked up and on_the_way" || status === "compleate" || socketOrderStatus === "out for delivary" || socketOrderStatus === "cancel" || socketOrderStatus === "compleate" || socketOrderStatus === "picked up and on_the_way"}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${status === "cancel" || status === "out for delivary" || status === "picked up and on_the_way" || status === "compleate" || socketOrderStatus === "out for delivary"
                                                || socketOrderStatus === "cancel" || socketOrderStatus === "picked up and on_the_way" || socketOrderStatus === "compleate" ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                                : "bg-red-500 hover:bg-red-600 text-white cursor-pointer"}`} key={index}

                                            onClick={() => {
                                                setShowCancelReasonOptions(true)
                                                if (!selectedCancelReason) {
                                                    toast.message("Please choose one cancel reason")
                                                    return
                                                }
                                                cancelOrder(i, selectedCancelReason)
                                            }}>

                                            {i}
                                        </button>

                                        <div>
                                            {showCancelReasonOptions && (status !== "cancel") && (
                                                <select value={selectedCancelReason} onChange={(e) => setSelectedCancelReason(e.target.value)}
                                                    className="mt-2 px-1 py-1 border border-gray-300 rounded-sm shadow-sm text-sm cursor-pointer"
                                                >
                                                    <option value="">Cancel Reasons</option>
                                                    {cancelReasonOptions.map((op, index1) => {
                                                        return (
                                                            <>
                                                                <option key={index1} >{op}</option>
                                                            </>
                                                        )
                                                    })}
                                                </select>
                                            )}
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-1 rounded-xl text-sm font-medium shadow-sm">
                        You can cancel your order before the status changes to
                        <span className="font-semibold"> "Out for Delivery" </span>
                        or
                        <span className="font-semibold"> "Cancelled"</span>
                    </div>


                </div>

                {/* Left Side */}
                <div className='flex flex-col border-t-2 lg:border-none p-5 lg:px-8'>

                    <div className='text-3xl font-bold text-[#ff4d2d]'>{orderData?.[0]?.shopDetails?.shopname}</div>
                    <div className='mt-5 text-2xl font-bold'>Food Details</div>

                    <div className='mt-3 text-xl mb-5 font-semibold text-gray-800'>
                        Food Item
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm mb-7'>
                        {orderData?.length ? orderData.map((item, index) => (
                            <div key={index} className='bg-white border rounded-md p-3 lg:px-7 flex flex-col' >
                                <span className='text-md font-bold mb-2'><span>{item.foodDetails?.foodname || "null"}</span> <span>[{item.foodDetails?.category || "null"}]</span></span>
                                <span className='text-md font-normal text-gray-600'> Foodtype : <span className='text-red-500'>{item.foodDetails?.foodtype || "null"}</span> </span>
                                <span className='text-md font-normal text-gray-600'> Quantity : <span className='text-blue-500'>{item?.quantity || "null"}</span> items </span>
                                <span className='text-md font-normal text-gray-600'> Price : <span className='text-gray-800'>₹{item?.foodDetails?.price || "null"}</span> </span>
                            </div>)) : "null"}
                    </div>

                    <div className='flex flex-col lg:flex-row gap-5 lg:gap-25 mb-0 lg:mb-5 mt-0 lg:mt-3'>
                        <span className='text-md font-semibold'>Price : <span className='text-sm font-normal text-gray-800 '>{orderData?.map((i, index) => (
                            <div key={index} className='mt-1 flex flex-col'>₹{i?.foodDetails?.price || "null"} * {i?.quantity || "null"} = {i?.foodDetails?.price * i?.quantity || "Null"} </div>
                        )) || "null"}  </span>
                        </span>

                        <div className='flex flex-col pb-3'>
                            <div className='text-gray-800 font-semibold text-[16px] '>Total Price </div>
                            <span className='mb-3 font-normal text-sm text-gray-600'>  ₹{orderData.map(i => (i?.quantity || 0) * (i?.foodDetails?.price || 0)).reduce((acc, curr) => acc + curr, 0)} </span>
                        </div>
                    </div>

                    <div className="border w-full lg:w-fit h-fit px-3 py-2 mb-4 mt-2 lg:mt-5 rounded-md">
                        <div className="text-sm lg:text-md font-semibold mb-2"> Assigned delivery boy </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:gap-3 text-sm lg:text-base">
                            <span> <span className="font-medium">Name:</span>{" "} {delivaryBoyData?.fullname || orderData?.[0]?.assignment?.assignto?.fullname || "—"} </span>
                            <span> <span className="font-medium">Phone:</span>{" "} {delivaryBoyData?.phone || orderData?.[0]?.assignment?.assignto?.phone || "—"} </span>
                        </div>
                    </div>

                    {/* Live Delivery Tracking Map */}
                    <div className="w-full border rounded-lg p-4 bg-white shadow-sm mb-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <span>🛵</span> Live Delivery Tracking
                            </h3>
                            {isLiveLocation && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                    • Live Location
                                </span>
                            )}
                        </div>

                        {/* Map Legend */}
                        <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-700 mb-3 bg-gray-50 p-2 rounded-md border border-gray-100">
                            {shopLatLng && <span className="flex items-center gap-1">🏬 <span className="font-semibold">Shop:</span> {orderData?.[0]?.shopDetails?.shopname || "Store"}</span>}
                            {delivaryBoyCoords?.length === 2 && <span className="flex items-center gap-1">🛵 <span className="font-semibold">Rider:</span> {delivaryBoyData?.fullname || orderData?.[0]?.assignment?.assignto?.fullname || "Delivery Boy"}</span>}
                            {userLatLng && <span className="flex items-center gap-1">📍 <span className="font-semibold">User:</span> Delivery Location</span>}
                        </div>

                        {(delivaryBoyCoords?.length === 2 || shopLatLng || userLatLng) ? (
                            <div className="h-72 w-full rounded-lg overflow-hidden border border-gray-200 z-0 relative">
                                <MapContainer
                                    center={delivaryBoyCoords?.length === 2 ? delivaryBoyCoords : (shopLatLng || userLatLng || [22.5726, 88.3639])}
                                    zoom={14}
                                    style={{ height: "100%", width: "100%" }}
                                    scrollWheelZoom={false}
                                >
                                    <MapBoundsFit shopCoords={shopLatLng} riderCoords={delivaryBoyCoords} userCoords={userLatLng} />
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    
                                    {shopLatLng && (
                                        <Marker position={shopLatLng} icon={shopIcon}>
                                            <Popup>
                                                <div className="text-sm font-semibold">Shop: {orderData?.[0]?.shopDetails?.shopname || "Store"}</div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {delivaryBoyCoords?.length === 2 && !isNaN(delivaryBoyCoords[0]) && !isNaN(delivaryBoyCoords[1]) && (
                                        <Marker position={delivaryBoyCoords} icon={riderIcon}>
                                            <Popup>
                                                <div className="text-sm font-semibold">
                                                    {delivaryBoyData?.fullname || orderData?.[0]?.assignment?.assignto?.fullname || "Delivery Partner"}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {userLatLng && (
                                        <Marker position={userLatLng} icon={userIcon}>
                                            <Popup>
                                                <div className="text-sm font-semibold">Customer Delivery Location</div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    <RoutingControl shopCoords={shopLatLng} riderCoords={delivaryBoyCoords} userCoords={userLatLng} />
                                </MapContainer>
                            </div>
                        ) : (
                            <div className="h-44 w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-500 gap-1 p-4">
                                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-600">Location map unavailable</span>
                            </div>
                        )}
                    </div>

                    <div className=''>
                        {(userOrderStatus.role === "admin" || canceledBy === "admin") && (userOrderStatus?.orderStatus === "cancel" || cancelReason) && (
                            <div className='lg:pb-0 mb-5 lg:mb-0 w-full flex flex-col sm:flex-row sm:gap-5 sm:mr-7'>
                                <div className='border border-red-200 px-4 py-1.5 bg-red-50 rounded-md shadow-sm text-sm flex items-start gap-2'>
                                    <span className='font-semibold text-red-700 whitespace-nowrap'>Cancel Reason ( By Shop Owner ) :</span>
                                    <span className='text-[#7a1c1c]'>{(userOrderStatus.role === "admin" || canceledBy === "admin") ? (userOrderStatus.cancelReason || cancelReason) : "Null"}</span>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className='mt-2 lg:mt-5 flex gap-5'>
                        <div className='border bg-gray-100 px-3 py-1 border-blue-300 rounded-md'>
                            <span className='font-semibold'>Payment mode -</span> <span className='text-blue-600 font-semibold'>{orderData[0]?.paymentMethod || "null"}</span>
                        </div>
                        <div className='border bg-gray-100 px-3 py-1 border-blue-300 rounded-md'>
                            <span className='font-semibold'>Order Status - </span> <span className='text-blue-600 font-semibold'>{userOrderStatus?.orderGroupId === orderData.map(i => i?.orderGroupId)[0] ? userOrderStatus?.orderStatus : orderData[0]?.orderStatus || "null"}</span>
                        </div>
                        <div className='border bg-gray-100 px-3 py-1 border-blue-300 rounded-md'>
                            <span className='font-semibold'>payment Status - </span> <span className='text-blue-600 font-semibold'>{(userOrderStatus?.paymentStatus === true || orderData?.map(i => i?.payment)[0] === true ? "paid" : "pending")}</span>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default UserOrderDetails