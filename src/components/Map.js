import _ from 'underscore'
import React from 'react'

import { compose, lifecycle } from 'recompose'
import { withGoogleMap, GoogleMap, Marker, DirectionsRenderer } from 'react-google-maps'

const google = window.google

const Map = compose(
  withGoogleMap,
  lifecycle({

    UNSAFE_componentWillReceiveProps(nextProps) {
      const DirectionsService = new google.maps.DirectionsService()
      if (nextProps.showDirections && ((nextProps.origin.lat !== this.props.origin.lat) || (nextProps.destination.lat !== this.props.destination.lat))) {
        DirectionsService.route({
          origin: nextProps.origin,
          destination: nextProps.destination,
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.setState({ directions: result })
          } else {
            console.error(`error fetching directions ${result}`)
          }
        })
      }
    }
  })
)(props =>
  <GoogleMap
    defaultCenter={{ lat: (props.latitude || 33.4484), lng: (props.longitude || -112.0740) }}
    center={{ lat: (props.latitude || 33.4484), lng: (props.longitude || -112.0740) }}
  >
    {props.showDirections && props.directions && <DirectionsRenderer directions={props.directions} />}
    {!props.showDirections && props.isMarkerShown && _.map(props.markers, (marker, index) => {
      return <Marker position={marker} key={`marker-${index}`}/>}
    )}
  </GoogleMap>
)

export default Map
