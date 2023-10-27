import _ from "underscore";
import $ from "jquery";
import React, { useEffect, useState, useRef, useCallback } from "react";

const google = window.google;

var directionsDisplay = new google.maps.DirectionsRenderer();
// eslint-disable-next-line
var directionsService = new google.maps.DirectionsService();

var map;
var markersArray = [];

const initial_state = {
  latitude: 39.73915,
  longitude: -104.9847,
};

const Gmaps = ({
  start_location,
  start_location_latitude,
  start_location_longitude,
  destination,
  destination_latitude,
  destination_longitude,
  defaultLat,
  defaultLng,
  trips,
  allTrips,
  waypoints,
  showTrip,
  onMarkerClick,
}) => {
  console.log(showTrip, "shoTrop", waypoints.length);
  const [state, setState] = useState(initial_state);
  const map_canvas = useRef();

  const initializeMap = useCallback(() => {
    const { latitude, longitude } = state;
    var myLatlng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = { zoom: 4, center: myLatlng };

    return new google.maps.Map(document.getElementById("map"), mapOptions);
  }, []);

  const placeStartingMarkers = () => {
    var bounds = new google.maps.LatLngBounds();

    if (waypoints.length !== 0) {
      _.each(waypoints, (trip) => {
        var marker, latLng;
        latLng = new google.maps.LatLng(
          Number(trip.start_location_latitude),
          Number(trip.start_location_longitude)
        );
        marker = placeMarker(trip, latLng);
        bounds.extend(latLng);
        markersArray.push(marker);
      });
      if (map) {
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
        map.setZoom(Math.min(15, map.getZoom()));
      }
    } else {
      map = initializeMap();
    }
  };

  const placeMarker = (trip, latLng) => {
    // const comp = this;
    const { name, price, finish_date } = trip;
    var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: name + " ($" + price + ") - Arrival : " + finish_date,
    });
    google.maps.event.addListener(
      marker,
      "click",
      // filterTrips.bind(comp, trip)
      filterTrips
    );
    return marker;
  };

  const clearOverlays = () => {
    if (markersArray) {
      for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
      }
    }
  };

  const filterTrips = (trip) => {
    onMarkerClick(trip);
  };

  const rerenderGMap = useCallback(() => {
    if (showTrip) {
      $("#mapError").html("");
      if (start_location !== undefined && destination !== undefined) {
        if (
          start_location_latitude &&
          start_location_longitude &&
          destination_latitude &&
          destination_longitude
        ) {
          var start = new google.maps.LatLng(
            start_location_latitude,
            start_location_longitude
          );
          var end = new google.maps.LatLng(
            destination_latitude,
            destination_longitude
          );
          directionsService.route(
            {
              origin: start,
              destination: end,
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.IMPERIAL,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                clearOverlays();
                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(result);
                $("#duration").val(
                  directionsDisplay.directions.routes[0].legs[0].duration.text
                );
              } else {
                if (status !== google.maps.DirectionsStatus.OVER_QUERY_LIMIT) {
                  directionsDisplay.setDirections({ routes: [] });
                  clearOverlays();
                  $("#duration").val(null);
                  $("#mapError").html("No route available");
                }
              }
            }
          );
        }
      }
    } else {
      directionsDisplay.setDirections({ routes: [] });
      clearOverlays();
      placeStartingMarkers();
    }
  }, []);

  useEffect(() => {
    if (defaultLat && defaultLng) {
      setState((s) => ({ ...s, latitude: defaultLat, longitude: defaultLng }));
    }
    map = initializeMap();
    rerenderGMap();
  }, [defaultLat, defaultLng, initializeMap, rerenderGMap]);

  useEffect(() => {
    rerenderGMap();
  }, [showTrip, start_location, destination, trips, allTrips, rerenderGMap]);

  return <div id="map" ref={map_canvas}></div>;
};

export default Gmaps;
