import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Route, useNavigate, useParams } from 'react-router-dom'

import { useMap, Marker, MapContainer, TileLayer, Popup } from 'react-leaflet'
import L, { icon } from 'leaflet'

import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { getSocket } from '@/Project_Pages_Service/WebSocketHooks/connetSocket'

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

// Map Integration with throttled routing control:
let RoutingContrtoll = ({ destinationCoords, delivaryBoyCoords }) => {
  let map = useMap()
  let RouteControlRef = useRef(null)
  let lastUpdateRef = useRef(0)
  let lastDestRef = useRef(null)

  useEffect(() => {
    if (!map || !destinationCoords?.length || !delivaryBoyCoords?.length) return

    let startLatLng = L.latLng(delivaryBoyCoords[0], delivaryBoyCoords[1])
    let destLatLng = L.latLng(destinationCoords[0], destinationCoords[1])
    let newWaypoints = [startLatLng, destLatLng]

    let destKey = `${destinationCoords[0]},${destinationCoords[1]}`
    let destChanged = lastDestRef.current !== destKey
    lastDestRef.current = destKey

    let now = Date.now()

    if (!RouteControlRef.current) {
      // First initialization of routing control
      RouteControlRef.current = L.routing.control({
        waypoints: newWaypoints,
        lineOptions: {
          styles: [{ color: "#6FA1EC", weight: 4 }],
        },
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null
      }).addTo(map)
      lastUpdateRef.current = now
    } else {
      // Throttle waypoint updates to ~15s unless destination changed
      if (destChanged || (now - lastUpdateRef.current >= 15000)) {
        RouteControlRef.current.setWaypoints(newWaypoints)
        lastUpdateRef.current = now
      }
    }
  }, [map, destinationCoords, delivaryBoyCoords])

  // Cleanup routing control on unmount
  useEffect(() => {
    return () => {
      if (RouteControlRef.current && map) {
        try {
          map.removeControl(RouteControlRef.current)
        } catch (e) {
          // ignore cleanup errors if map destroyed
        }
        RouteControlRef.current = null
      }
    }
  }, [map])

  return null
}

// Centralize the map
let MapCentarize = ({ center }) => {
  let map = useMap()

  useEffect(() => {
    if (!center || center.length !== 2) return
    map.setView(center, 16)
  }, [center, map])

  return null
}

const DelivaryMap = () => {

  let params = useParams()
  let assignmentId = params.id
  let navigate = useNavigate()

  let socket = getSocket()

  let [orderDetails, setOrderDetails] = useState('')
  let [loading, setLoading] = useState(false)

  //fetching accepted order details :
  let fetchOrderDetails = async () => {
    try {
      setLoading(true)
      let res = await axios.get(`${import.meta.env.VITE_delivary_endpoint}/acceptedorders/${assignmentId}`, { withCredentials: true })

      if (res.data.success) {
        setOrderDetails(res.data.acceptedOrder)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [assignmentId])


  //Map integration data :
  let { userData } = useSelector((state) => state.user)

  let shopCoords = orderDetails?.shopDetails?.shopGeoLocation?.coordinates
  let userCoords = orderDetails?.orderedBy?.location?.coordinates

  let orderStatus = orderDetails?.order?.[0]?.orderStatus || orderDetails?.orderStatus || ""
  let isPickedUp = orderStatus === "picked up and on_the_way" ||
                   orderStatus.includes("picked_up") ||
                   orderStatus.includes("on_the_way") ||
                   orderStatus === "compleate"

  let shopLatLng = shopCoords?.length === 2 ? [shopCoords[1], shopCoords[0]] : null
  let userLatLng = userCoords?.length === 2 ? [userCoords[1], userCoords[0]] : null

  // Route destination switches to user coordinates once status is PICKED_UP+
  let destinationCoords = isPickedUp && userLatLng ? userLatLng : shopLatLng

  let [delivaryBoyCoords, setDelivaryBoyCoords] = useState([]) 

  // for map centralization :
  let defaultCenter = [22.5726, 88.3639]
  let mapCenter = delivaryBoyCoords.length ? delivaryBoyCoords : (destinationCoords || defaultCenter)

  // Send live location to user :
  useEffect(() => {
    if (!socket || !assignmentId) return

    // Create a Socket.IO room for the delivery boy and user using the same assignment ID
    socket.emit("joinAssignmentRoom", assignmentId)

    let watchLocation = navigator.geolocation.watchPosition(position => {
      let lat = position.coords.latitude
      let lon = position.coords.longitude

      setDelivaryBoyCoords([lat, lon])

      socket.emit("delivaryBoyLiveLocation", {
        latitude: lat,
        longitude: lon,
        delivaryBoyId: userData?.user?._id,
        delivaryBoyName: userData?.user?.fullname,
        delivaryBoyPhone: userData?.user?.phone,
        assignmentId: assignmentId
      })

    }, (err) => console.log(err), {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    })

    return () => {
      navigator.geolocation.clearWatch(watchLocation)
    }

  }, [socket, assignmentId, userData])

  return (
    <div className="relative h-screen w-full">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-20 left-2 z-1000 bg-white px-4 py-2 rounded-md shadow-md active:scale-97 duration-200 cursor-pointer"
      > ← Back </button>

      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <MapCentarize center={mapCenter} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {shopLatLng && (
          <Marker
            position={shopLatLng}
            icon={shopIcon}
          />
        )}

        {userLatLng && (
          <Marker
            position={userLatLng}
            icon={userIcon}
          />
        )}

        {/* rider ka single, smooth-moving marker — yahi source of truth hai */}
        {delivaryBoyCoords.length > 0 && (
          <Marker
            position={delivaryBoyCoords}
            icon={riderIcon}
          />
        )}

        <RoutingContrtoll
          destinationCoords={destinationCoords}
          delivaryBoyCoords={delivaryBoyCoords}
        />
      </MapContainer>
    </div>
  )
}

export default DelivaryMap