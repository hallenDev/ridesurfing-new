import _ from 'underscore'
import $ from 'jquery'
import React, { Component } from 'react'

const google = window.google

var directionsDisplay = new google.maps.DirectionsRenderer()
// eslint-disable-next-line
var directionsService = new google.maps.DirectionsService

var map
var markersArray = []

class Gmaps extends Component {

  constructor (props) {
    super(props)
    this.state = {
      latitude: 39.73915,
      longitude: -104.9847
    }
  }

  initializeMap () {
    const { latitude, longitude } = this.state
    var myLatlng = new google.maps.LatLng(latitude, longitude)
    var mapOptions = { zoom: 4, center: myLatlng }

    return new google.maps.Map(document.getElementById('map'), mapOptions)
  }

  componentDidMount () {
    const { defaultLat, defaultLng } = this.props
    if (defaultLat && defaultLng) {
      this.setState({ latitude: defaultLat, longitude: defaultLng})
    }
    map = this.initializeMap()
    this.rerenderGMap()
  }

  placeStartingMarkers () {
    const { waypoints } = this.props
    var bounds = new google.maps.LatLngBounds()

    if (waypoints.length !== 0) {
      _.each(waypoints, (trip) => {
        var marker, latLng
        latLng = new google.maps.LatLng(Number(trip.start_location_latitude), Number(trip.start_location_longitude))
        marker = this.placeMarker(trip, latLng)
        bounds.extend(latLng)
        markersArray.push(marker)
      })
      if (map) {
        map.setCenter(bounds.getCenter())
        map.fitBounds(bounds)
        map.setZoom(Math.min(15, map.getZoom()))
      }
    } else {
      map = this.initializeMap()
    }
  }

  placeMarker(trip, latLng) {
    const comp = this
    const { name, price, finish_date } = trip
    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: name + " ($" + price + ") - Arrival : " + finish_date
    })
    google.maps.event.addListener(marker, 'click', comp.filterTrips.bind(comp, trip))
    return marker
  }

  clearOverlays () {
    if (markersArray) {
      for (var i=0; i < markersArray.length; i++) {
        markersArray[i].setMap(null)
      }
    }
  }

  filterTrips (trip) {
    this.props.onMarkerClick(trip)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.showTrip !== this.props.showTrip
      || prevProps.start_location !== this.props.start_location
      || prevProps.destination !== this.props.destination
      || prevProps.latitude !== this.props.latitude
      || prevProps.longitude !== this.props.longitude
      || prevProps.trips !== this.props.trips
      || prevProps.allTrips !== this.props.allTrips
    ) {
      this.rerenderGMap()
    }
  }

  rerenderGMap() {
    if (this.props.showTrip) {
      $('#mapError').html("")
      if (this.props.start_location !== undefined && this.props.destination !== undefined) {
        const { start_location_latitude, start_location_longitude, destination_latitude, destination_longitude } = this.props
        if (start_location_latitude && start_location_longitude && destination_latitude && destination_longitude) {
          var start = new google.maps.LatLng(this.props.start_location_latitude, this.props.start_location_longitude)
          var end = new google.maps.LatLng(this.props.destination_latitude, this.props.destination_longitude)
          directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              this.clearOverlays()
              directionsDisplay.setMap(map)
              directionsDisplay.setDirections(result)
              $("#duration").val(directionsDisplay.directions.routes[0].legs[0].duration.text)
            } else {
              if (status !== google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
                directionsDisplay.setDirections({routes: []})
                this.clearOverlays()
                $("#duration").val(null)
                $('#mapError').html("No route available")
              }
            }
          });
        }
      }
    } else {
      directionsDisplay.setDirections({routes: []})
      this.clearOverlays()
      this.placeStartingMarkers()
    }
  }

  render() {
    return (
      <div id="map" ref="map_canvas"></div>
    );
  }

}

export default Gmaps
