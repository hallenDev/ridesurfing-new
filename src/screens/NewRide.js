import $ from 'jquery'
import React, {useEffect, useState} from 'react'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import DatePicker from 'react-datepicker'
import * as geolib from 'geolib'

import SearchField from '../components/SearchField'
import {PrimaryButton} from '../components/Buttons'
import Gmap from '../components/GoogleMap/Gmap'
import useSessionStore from '../store/SessionStore'
import useTripStore from '../store/TripStore'

const eventName = [
  'No Event',
  'Concerts',
  'Music Festivals',
  'Entertainment show',
  'Museum',
  'Cultural Event',
]
const MenuProps = {PaperProps: {style: {maxHeight: 300}}}

const initial_state = {
  latitude: 34.0489,
  longitude: -111.0937,
  selectedDate: '',
  value: 'commute',
  trip: {
    seats: 1,
    price: '0',
    drive_type: 'commute',
    event_name: 'No Event',
  },
  dates: null,
  priceTip: 0,
  miles: '',
  tripErrors: {},
  isProcessing: false,
}

const NewRide = props => {
  const sessionStore = useSessionStore()
  const tripStore = useTripStore()

  const currentUser = sessionStore.currentUser
  const trip = tripStore.trip
  const tripErrors = tripStore.errors
  const tripSaved = tripStore.isSaved
  const isProcessing = tripStore.isProcessing
  // const tripCompleted = tripStore.isCompleted;

  const [state, setState] = useState(initial_state)
  const [node, setNode] = useState(null)

  useEffect(() => {
    setCurrentPosition()
  }, [])

  useEffect(() => {
    const {history} = props
    if (tripSaved) {
      tripStore.resetTripFlagRequest()
      history.push({
        pathname: navigationUrl(trip),
        state: {drive_created: true, price: trip.attributes.price},
      })
    }
  }, [tripSaved])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({
        ...state,
        isProcessing: isProcessing,
      })
    }
  }, [isProcessing])

  if (!localStorage.accessToken) {
    localStorage.setItem('prevUrl', `/new_ride`)
    return (window.location.href = `/login`)
  }

  const navigationUrl = trip => {
    const {
      has_payout_details,
      has_completed_profile,
      has_car_image,
    } = currentUser.attributes

    return (parseFloat(trip.attributes.price) === 0 ||
      (parseFloat(trip.attributes.price) > 0 && !!has_payout_details)) &&
      !!has_completed_profile &&
      !!has_car_image
      ? `/ride/${trip.id}`
      : '/complete_profile'
  }

  const setCurrentPosition = () => {
    $.getJSON(process.env.REACT_APP_GEOLOCATION_URL)
      .done(function(location) {
        setState({
          ...state,
          latitude: location.latitude,
          longitude: location.longitude,
        })
      })
      .fail(function(error) {})
  }

  const onFieldChange = (fieldName, event) => {
    const {trip} = state
    let tmp = JSON.parse(JSON.stringify(trip))
    tmp[fieldName] = event.target.value
    setState({...state, trip: tmp})
  }

  const updateDateFilters = (fieldName, date) => {
    const {trip} = state
    let tmp = JSON.parse(JSON.stringify(trip))
    tmp[fieldName] =
      date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear()
    setState({
      ...state,
      trip: tmp,
    })
    if (fieldName === 'start_date') {
      $('#finish_date').focus()
    }
  }

  const onTimeChange = (fieldName, time) => {
    const {trip} = state
    let tmp = JSON.parse(JSON.stringify(trip))
    tmp[fieldName] = time
    setState({
      ...state,
      trip: tmp,
    })
  }

  const errorMessageFor = fieldName => {
    if (tripErrors && tripErrors[fieldName]) return tripErrors[fieldName]
  }

  const handleSaveTrip = () => {
    const {trip} = state
    trip.id
      ? tripStore.updateTripRequest(trip.id, trip)
      : tripStore.createTripRequest(trip)
    setState({
      ...state,
      isProcessing: true,
    })
  }

  const setAddress = (address, geometry, fieldName) => {
    const {trip} = state
    let tmp = {...trip}

    let newState
    if (geometry) {
      const {lat, lng} = geometry.location

      tmp[fieldName] = address
      tmp[`${fieldName}_latitude`] = lat()
      tmp[`${fieldName}_longitude`] = lng()

      if (fieldName === 'destination') {
        const total_distance = getDistance(
          tmp.start_location_latitude,
          tmp.start_location_longitude,
          lat(),
          lng(),
        )
        newState = setPriceEstimate(tmp, total_distance)
        $('#start_date').focus()
      } else {
        if (tmp.destination) {
          const total_distance = getDistance(
            lat(),
            lng(),
            tmp.destination_latitude,
            tmp.destination_longitude,
          )
          newState = setPriceEstimate(tmp, total_distance)
        }
        $('#destination').focus()
      }
    } else {
      tmp[fieldName] = address
    }

    if (!newState) newState = state

    setState({
      ...newState,
      trip: tmp,
    })
  }

  const getDistance = (slat, slng, dlat, dlng) => {
    if (slat && slng && dlat && dlng) {
      const distance = geolib.getDistance(
        {latitude: slat, longitude: slng},
        {latitude: dlat, longitude: dlng},
      )

      const mileDistance = geolib.convertDistance(distance, 'mi')
      return Math.round(mileDistance * 100) / 100
    }
  }

  const setPriceEstimate = (trip, total_distance) => {
    const price = Math.ceil(
      -0.00002177 * total_distance * total_distance +
        0.13 * total_distance +
        6.19,
    )
    if (!isNaN(price) && price >= 0) {
      trip.total_distance = total_distance
      trip.price = price

      return {
        ...state,
        priceTip: price.toString(),
        miles: `(${total_distance} miles)`,
      }
    } else {
      return state
    }
  }

  const exactTime = (trip, total_distance) => {
    var num = total_distance * 1.6
    var hours = num / 60
    var rhours = Math.floor(hours)
    var minutes = (hours - rhours) * 60
    var rminutes = Math.round(minutes)
    return rhours + `${rhours > 1 ? ' hrs ' : ' hr '}` + rminutes + ' mins'
  }

  const estimatedDuration = () => {
    const {trip} = state

    console.log(trip)
    if (trip.total_distance) {
      if (!!trip.start_date && trip.start_date === trip.finish_date) {
        return exactTime(trip, trip.total_distance)
      } else {
        if (!!trip.start_date && !!trip.finish_date) {
          const start = new Date(trip.start_date)
          const finish = new Date(trip.finish_date)
          const timeDiff = Math.abs(finish.getTime() - start.getTime())
          const days = Math.ceil(timeDiff / (1000 * 3600 * 24))

          return `${days} ${days > 1 ? 'days' : 'day'}`
        } else {
          return 'NA'
        }
      }
    } else {
      return 'NA'
    }
  }

  const {priceTip, miles} = state

  return (
    <div className="new-ride-container">
      <div className="formSection">
        <div className="container">
          <div className="row">
            <div className="col l12 m12 s12">
              <div className="headingContainer">
                <h5 className="mb5">Describe your ride</h5>
                <span className="mt10 label-heading small">
                  Fields marked with * are mandatory
                </span>
              </div>
              <hr className="hr-line mb20" />
              <FormControl component="fieldset">
                <div className="label">Ride Type*</div>
                <RadioGroup
                  aria-label="Gender"
                  name="gender1"
                  className="formContainer"
                  value={state.trip.drive_type || ''}
                  onChange={event => onFieldChange('drive_type', event)}>
                  <FormControlLabel
                    className="formControl"
                    value="commute"
                    control={<Radio color="primary" />}
                    label={
                      <div className="label-text">
                        Commute: Time punctual travel
                      </div>
                    }
                  />
                  <FormControlLabel
                    className="formControl"
                    value="adventure"
                    control={<Radio color="primary" />}
                    label={
                      <div className="label-text">
                        Adventure: Time leisure travel
                      </div>
                    }
                  />
                </RadioGroup>
                <span className="error">{errorMessageFor('drive_type')}</span>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col l6 m6 s12">
              <div className="label">Origin*</div>
              <SearchField
                placeholder="What city are you in?"
                value={state.trip.start_location || ''}
                setAddress={(address, geometry) =>
                  setAddress(address, geometry, 'start_location')
                }
                inputId="start_location"
              />
              <span className="error">{errorMessageFor('start_location')}</span>
            </div>
            <div className="col l6 m6 s12">
              <div className="label">Destination*</div>
              <SearchField
                placeholder="What city are you going to?"
                value={state.trip.destination || ''}
                setAddress={(address, geometry) =>
                  setAddress(address, geometry, 'destination')
                }
                inputId="destination"
              />
              <span className="error">{errorMessageFor('start_location')}</span>
            </div>
          </div>
          <div
            style={{position: 'relative'}}
            ref={node => {
              setNode(node)
            }}>
            <div className="row">
              <div className="col l6 m6 s12">
                <div className="label">
                  Leaving{state.trip.drive_type === 'commute' ? '*' : ''}
                </div>
                <DatePicker
                  selected={
                    state.trip.start_date ? new Date(state.trip.start_date) : ''
                  }
                  onChange={date => updateDateFilters('start_date', date)}
                  minDate={new Date()}
                  maxDate={
                    state.trip.finish_date
                      ? new Date(state.trip.finish_date)
                      : ''
                  }
                  placeholderText="MM/DD/YYYY"
                  className="text-field"
                  id="start_date"
                />
                <span className="error">{errorMessageFor('start_date')}</span>
              </div>
              <div className="col l6 m6 s12">
                <div className="label">Arrival*</div>
                <DatePicker
                  selected={
                    state.trip.finish_date
                      ? new Date(state.trip.finish_date)
                      : ''
                  }
                  onChange={date => updateDateFilters('finish_date', date)}
                  minDate={
                    state.trip.start_date
                      ? new Date(state.trip.start_date)
                      : new Date()
                  }
                  placeholderText="MM/DD/YYYY"
                  className="text-field"
                  id="finish_date"
                />
                <span className="error">{errorMessageFor('finish_date')}</span>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col l6 m6 s12">
              <div className="label">Estimated Duration {miles}</div>
              <TextField
                disabled
                value={estimatedDuration()}
                id="standard-disabled"
                className="text-field"
                margin="normal"
              />
            </div>
            <div className="col l6 m6 s12">
              <div className="label">Event Name</div>
              <FormControl className="selectField">
                <InputLabel htmlFor="select-multiple"></InputLabel>
                <Select
                  value={state.trip.event_name || ''}
                  onChange={event => onFieldChange('event_name', event)}
                  input={<Input id="select-multiple" />}
                  MenuProps={MenuProps}
                  displayEmpty
                  className="selected-menu-field">
                  {eventName.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                <span className="error">{errorMessageFor('event_name')}</span>
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="col l6 m6 s12">
              <div className="label">Available Seats*</div>
              <FormControl className="selectField">
                <InputLabel htmlFor="select-multiple"></InputLabel>
                <Select
                  value={state.trip.seats || ''}
                  onChange={event => onFieldChange('seats', event)}
                  input={<Input id="select-multiple" />}
                  MenuProps={MenuProps}
                  displayEmpty
                  className="selected-menu-field">
                  <MenuItem value="" disabled>
                    Select
                  </MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <MenuItem key={val} value={val}>
                      {val}
                    </MenuItem>
                  ))}
                </Select>
                <span className="error">{errorMessageFor('seats')}</span>
              </FormControl>
            </div>
            <div className="col l6 m6 s12">
              <div className="label">Price*</div>
              <FormControl className="selectField">
                <InputLabel htmlFor="select-multiple"></InputLabel>
                <Select
                  value={state.trip.price || ''}
                  onChange={event => onFieldChange('price', event)}
                  input={<Input id="select-multiple" />}
                  MenuProps={MenuProps}
                  displayEmpty
                  className="selected-menu-field">
                  {Array.from(Array(priceTip * 2 + 1).keys()).map(val => (
                    <MenuItem key={val} value={val.toString()}>
                      ${val}
                    </MenuItem>
                  ))}
                </Select>
                <span className="error">{errorMessageFor('price')}</span>
              </FormControl>
              <span className="right recommended-label">
                Fair Price: $
                <span className="recommended-price">{priceTip}</span>
              </span>
            </div>
          </div>
          <div className="row">
            <div className="col l12 m12 s12">
              <div className="label">Headline*</div>
              <TextField
                placeholder="Ex: 'My weekend trip to Phoenix'"
                className="text-field"
                margin="normal"
                value={state.trip.name || ''}
                onChange={event => onFieldChange('name', event)}
                onKeyPress={event => {
                  if (event.key === 'Enter' || event.keyCode === 13) {
                    handleSaveTrip()
                  }
                }}
              />
              <span className="error">{errorMessageFor('name')}</span>
            </div>
          </div>
          <div className="center-align mt20">
            <PrimaryButton
              color="primary"
              buttonName={state.isProcessing ? 'Please Wait...' : 'Create Ride'}
              className="lg-primary"
              disabled={!!state.isProcessing}
              handleButtonClick={() => handleSaveTrip()}
            />
          </div>
        </div>
      </div>
      <div className="mapSection">
        <Gmap
          start_location={state.trip.start_location}
          start_location_latitude={state.trip.start_location_latitude}
          start_location_longitude={state.trip.start_location_longitude}
          destination={state.trip.destination}
          destination_latitude={state.trip.destination_latitude}
          destination_longitude={state.trip.destination_longitude}
          showTrip={true}
        />
      </div>
    </div>
  )
}

export default NewRide
