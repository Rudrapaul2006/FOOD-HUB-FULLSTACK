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

// Map Intigration :
let RoutingContrtoll = ({ shopCoords, delivaryBoyCoords }) => {
  let map = useMap()
  let RouteControlRef = useRef(null)

  useEffect(() => {
    if (!map || !shopCoords?.length || !delivaryBoyCoords?.length) return

    let routeControl = L.routing.control({
      waypoints: [
        L.latLng(delivaryBoyCoords[1], delivaryBoyCoords[0]),
        L.latLng(shopCoords[1], shopCoords[0])
      ],
      lineOptions: {
        styles: [{ color: "#6FA1EC", weight: 4 }],
      },
      routeWhileDragging: false,
      show: true,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      marker: () => null,

      createMarker: (i, wp) =>
        L.marker(wp.latLng, {
          icon: i === 0 ? riderIcon : shopIcon,
        })

    }).addTo(map)

    RouteControlRef.current = routeControl

    return () => {
      if (RouteControlRef.current) {
        map.removeControl(RouteControlRef.current)
        RouteControlRef.current = null
      }
    }
  }, [map, shopCoords, delivaryBoyCoords])

  return null
}

// Centralize the map
let MapCentarize = ({ center }) => {
  let map = useMap()

  useEffect(() => {
    map.setView(center, 16)
  }, [center, map])

  return null
}

const DelivaryMap = () => {

  let params = useParams()
  let assignmentId = params.id
  let navigate = useNavigate()

  let socket = getSocket()
  // // console.log(socket)
  

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


  //Map intigration data :
  let { userData } = useSelector((state) => state.user)

  let shopCoords = orderDetails?.shopDetails?.shopGeoLocation?.coordinates
  // let shopCoords =  [ 88.37908645353211 , 22.677142512912074]
  let delivaryBoyCoords = userData?.user?.location?.coordinates

  // for map centralization :
  let defaultCenter = [22.5726, 88.3639]
  let mapCenter = delivaryBoyCoords ? [delivaryBoyCoords[1], delivaryBoyCoords[0]] : defaultCenter

  // // Send live location to user :
  useEffect(() => {
    
      let watchLocation = navigator.geolocation.watchPosition(position => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude

        console.log(lat , lon);
        
        // socket.emit("delivaryBoyLiveLocation" , {
        //   latitude : lat,
        //   longitude : lon,
        //   id : userData.user._id,
        //   assignmentId : assignmentId
        // })
        
      })

      return () => {
        navigator.geolocation.clearWatch(watchLocation)
      }
    
  }, [])

  return (
    <div className="relative h-screen w-full">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-20 left-2 z-[1000] bg-white px-4 py-2 rounded-md shadow-md active:scale-97 duration-200 cursor-pointer"
      > ← Back </button>

      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <MapCentarize center={mapCenter} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {shopCoords && (
          <Marker
            position={[shopCoords[1], shopCoords[0]]}
            icon={shopIcon}
          />
        )}

        {delivaryBoyCoords && (
          <Marker
            position={[
              delivaryBoyCoords[1],
              delivaryBoyCoords[0],
            ]}
            icon={riderIcon}
          />
        )}

        <RoutingContrtoll
          shopCoords={shopCoords}
          delivaryBoyCoords={delivaryBoyCoords}
        />
      </MapContainer>
    </div>
  )
}

export default DelivaryMap