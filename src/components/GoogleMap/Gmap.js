import React, {useCallback, useEffect, useState} from 'react'
import {
  DirectionsRenderer,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from '@react-google-maps/api'

const GMap = ({
  defaultLat,
  defaultLng,
  waypoints = [],
  showTrip,
  start_location,
  start_location_latitude,
  start_location_longitude,
  destination,
  destination_latitude,
  destination_longitude,
  onMarkerClick,
}) => {
  const {isLoaded} = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_APIKEY,
  })
  const [center] = useState({
    lat: defaultLat || 39.73915,
    lng: defaultLng || -104.9847,
  })
  const [map, setMap] = useState(null)
  const [directions, setDirections] = useState(null)

  const fitBounds = useCallback(() => {
    if (waypoints.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      waypoints.forEach(waypoint => {
        const latLng = new window.google.maps.LatLng(
          Number(waypoint.start_location_latitude),
          Number(waypoint.start_location_longitude),
        )
        bounds.extend(latLng)
      })

      map.setCenter(bounds.getCenter())
      map.fitBounds(bounds)
      map.setZoom(Math.min(15, map.getZoom()))
    }
  }, [map, waypoints])

  const getDirections = useCallback(async () => {
    try {
      const directionsService = new window.google.maps.DirectionsService()

      const origin = new window.google.maps.LatLng(
        start_location_latitude,
        start_location_longitude,
      )
      const destination = new window.google.maps.LatLng(
        destination_latitude,
        destination_longitude,
      )

      const result = await directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      })

      setDirections(result)
    } catch (error) {
      setDirections(null)
    }
  }, [
    destination_latitude,
    destination_longitude,
    start_location_latitude,
    start_location_longitude,
  ])

  const onLoad = useCallback(function callback(map) {
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  useEffect(() => {
    if (map) {
      fitBounds()
    }
  }, [waypoints, map, fitBounds])

  useEffect(() => {
    if (
      showTrip &&
      start_location_latitude &&
      start_location_longitude &&
      destination_latitude &&
      destination_longitude
    ) {
      getDirections()
    } else {
      fitBounds()
    }
  }, [
    showTrip,
    start_location,
    start_location_latitude,
    start_location_longitude,
    destination,
    destination_latitude,
    destination_longitude,
    getDirections,
    fitBounds,
  ])

  if (!isLoaded) return null

  return (
    <GoogleMap
      mapContainerStyle={{width: '100%', height: '100%'}}
      center={center}
      zoom={4}
      onLoad={onLoad}
      onUnmount={onUnmount}>
      {showTrip && directions ? (
        <>
          <DirectionsRenderer directions={directions} />
        </>
      ) : (
        waypoints.map((waypoint, key) => (
          <MarkerF
            key={key}
            position={{
              lat: Number(waypoint.start_location_latitude),
              lng: Number(waypoint.start_location_longitude),
            }}
            onClick={() => onMarkerClick(waypoint)}
          />
        ))
      )}
    </GoogleMap>
  )
}

export default GMap
