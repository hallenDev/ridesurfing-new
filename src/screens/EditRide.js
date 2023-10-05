import $ from 'jquery'
import React, { Component } from 'react'
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
import geolib from 'geolib'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getCurrentUser } from '../reducers/SessionReducer'
import { getTrip, getTripErrors, getTripSaved, getTripCompleted } from '../reducers/TripReducer'

import SearchField from '../components/SearchField'
import { PrimaryButton } from '../components/Buttons'
import Gmap from '../components/Gmap'

const eventName = ['No event', 'Concerts', 'Music Festivals', 'Entertainment show', 'Museum', 'Cultural Event']
const MenuProps = { PaperProps: { style: { maxHeight: 300 } } }

class EditRide extends Component {

  constructor (props) {
    super(props)
    this.state = {
      latitude: 39.73915,
      longitude: -104.9847,
      selectedDate: '',
      value: 'commute',
      trip: {
        seats: 1,
        price: '0',
        drive_type: 'commute',
        event_name: 'No event'
      },
      dates: null,
      priceTip: 0,
      miles: '',
      tripId: props.match.params.rideId,
      tripErrors: {}
    }
  }

  componentWillMount () {

    if (!localStorage.accessToken) {
      return window.location.href = `/login`
    }

    const { tripId } = this.state
    const { getTripRequest } = this.props.actions
    getTripRequest(tripId)
  }

  componentDidMount () {
    this.setCurrentPosition()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { resetTripFlagRequest } = this.props.actions
    const { history, currentUser } = this.props

    if (nextProps.trip && nextProps.trip.attributes) {

      if (currentUser.id !== nextProps.trip.attributes.driver_id) {
        return window.location.href = `/search`
      }

      this.setState({ trip: nextProps.trip.attributes })
      this.getPriceEstimate(nextProps.trip.attributes)
    }

    if (nextProps.tripCompleted) {
      resetTripFlagRequest()
      history.push({ pathname: this.navigationUrl(nextProps.trip), state: { drive_created: true, price: nextProps.trip.attributes.price } })
    }

  }

  navigationUrl (trip) {
    const { currentUser } = this.props
    const { has_payout_details, has_completed_profile, has_car_image } = currentUser.attributes

    return ((parseFloat(trip.attributes.price) === 0 || (parseFloat(trip.attributes.price) > 0 && !!has_payout_details)) && !!has_completed_profile && !!has_car_image) ? `/ride/${trip.attributes.slug || trip.id}` : '/complete_profile'
  }

  setCurrentPosition () {
    const { latitude, longitude } = this.state
    const comp = this

    $.getJSON('https://geoip-db.com/json/')
      .done(function(location) {
        comp.setState({ latitude: location.latitude, longitude: location.longitude })
      })
      .fail(function(error) {
        comp.setState({ latitude, longitude })
      });
  }

  onFieldChange = (fieldName, event) => {
    const { trip } = this.state
    trip[fieldName] = event.target.value
    this.setState({ trip })
  }

  updateDateFilters = (fieldName, date) => {
    const { trip } = this.state

    trip[fieldName] = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
    this.setState({ trip })
    if (fieldName === 'start_date') {
      $('#finish_date').focus()
    }
  }

  onTimeChange = (fieldName, time) => {
    const { trip } = this.state
    trip[fieldName] = time
    this.setState({ trip })
  }

  errorMessageFor = (fieldName) => {
    const { tripErrors } = this.props
    if (tripErrors && tripErrors[fieldName])
      return tripErrors[fieldName]
  }

  handleSaveTrip () {
    const { trip, tripId } = this.state
    const { updateTripRequest } = this.props.actions
    updateTripRequest(tripId, trip)
  }

  setAddress (address, geometry, fieldName) {
    const { trip } = this.state
    if (geometry) {
      const { lat, lng } = geometry.location

      trip[fieldName] = address
      trip[`${fieldName}_latitude`] = lat()
      trip[`${fieldName}_longitude`] = lng()

      if (fieldName === 'destination') {
        const total_distance = this.getDistance(trip.start_location_latitude, trip.start_location_longitude, lat(), lng())
        this.setPriceEstimate(trip, total_distance)
        $('#start_date').focus()
      } else {
        if (trip.destination) {
          const total_distance = this.getDistance(lat(), lng(), trip.destination_latitude, trip.destination_longitude)
          this.setPriceEstimate(trip, total_distance)
        }
        $('#destination').focus()
      }
    } else {
      trip[fieldName] = address
    }
    this.setState({ trip })
  }

  getPriceEstimate (trip) {
    if (trip.destination_latitude && trip.destination_longitude) {
      this.setPriceEstimate(trip, trip.total_distance)
      this.forceUpdate()
    }
  }

  getDistance (slat, slng, dlat, dlng) {
    if (slat && slng && dlat && dlng) {
      const distance = geolib.getDistance(
        { latitude: slat, longitude: slng },
        { latitude: dlat, longitude: dlng }
      )
      return geolib.convertUnit('mi', distance, 2)
    }
  }

  setPriceEstimate(trip, total_distance) {
    var price = 0
    price = Math.ceil((-0.00002177 * total_distance * total_distance) + (0.13 * total_distance) + 6.19)

    if (!isNaN(price) && price >= 0) {
      trip.total_distance = total_distance
      this.setState({ priceTip: price.toString(), miles: `(${total_distance} miles)`, trip })
      return true
    }
  }

  exactTime(trip, total_distance) {
    var num = total_distance * 1.6
    var hours = (num / 60)
    var rhours = Math.floor(hours)
    var minutes = (hours - rhours) * 60
    var rminutes = Math.round(minutes)
    return rhours + `${rhours > 1 ? ' hrs ' : ' hr '}` + rminutes + " mins"
  }

  estimatedDuration () {
    const { trip } = this.state
    if (trip.total_distance) {
      if (!!trip.start_date && trip.start_date === trip.finish_date) {
        return this.exactTime(trip, trip.total_distance)
      } else {
        if (!!trip.start_date && !!trip.finish_date) {
          const start = new Date(trip.start_date)
          const finish = new Date(trip.finish_date)
          const timeDiff = Math.abs(finish.getTime() - start.getTime())
          const days = Math.ceil(timeDiff / (1000 * 3600 * 24))

          return  `${days} ${days > 1 ? 'days' : 'day'}`
        } else {
          return 'NA'
        }
      }
    } else {
      return 'NA'
    }
  }

  render () {
    const { trip, priceTip, miles, latitude, longitude } = this.state
    return (
      <div className="new-ride-container">
        <div className="formSection">
          <div className="container">
            <div className="row">
              <div className="col l12 m12 s12">
                <div className="headingContainer">
                  <h5 className="mb5">
                    Edit your ride
                  </h5>
                  <span className="mt10 label-heading small">Fields marked with * are mandatory</span>
                </div>
                <hr className="hr-line mb20" />
                <FormControl component="fieldset">
                  <div className="label">Ride Type*</div>
                  <RadioGroup
                    aria-label="Gender"
                    name="gender1"
                    className="formContainer"
                    value={trip.drive_type || ''}
                    onChange={(event) => this.onFieldChange('drive_type', event)}
                  >
                    <FormControlLabel
                      className="formControl"
                      value="commute"
                      control={<Radio color="primary"/>}
                      label={<div className="label-text">Commute: Time punctual travel</div>}
                    />
                    <FormControlLabel
                      className="formControl"
                      value="adventure"
                      control={<Radio color="primary"/>}
                      label={<div className="label-text">Adventure: Time leisure travel</div>}
                    />
                  </RadioGroup>
                  <span className='error'>{this.errorMessageFor('drive_type')}</span>
                </FormControl>
              </div>
            </div>
            <div className="row">
              <div className="col l6 m6 s12">
                <div className="label">Origin*</div>
                <SearchField
                  placeholder='What city are you in?'
                  value={trip.start_location || ''}
                  setAddress={(address, geometry) => this.setAddress(address, geometry, 'start_location')}
                  inputId='start_location'
                />
                <span className='error'>{this.errorMessageFor('start_location')}</span>
              </div>
              <div className="col l6 m6 s12">
                <div className="label">Destination*</div>
                <SearchField
                  placeholder='What city are you going to?'
                  value={trip.destination || ''}
                  setAddress={(address, geometry) => this.setAddress(address, geometry, 'destination')}
                  inputId='destination'
                />
                <span className='error'>{this.errorMessageFor('start_location')}</span>
              </div>
            </div>
            <div style={{position: 'relative'}} ref={node => { this.node = node; }}>
              <div className="row">
                <div className="col l6 m6 s12">
                  <div className="label">Leaving{trip.drive_type === 'commute' ? '*' : ''}</div>
                  <DatePicker
                    selected={trip.start_date ? new Date(trip.start_date) : ''}
                    onChange={(date) => this.updateDateFilters('start_date', date)}
                    minDate={new Date()}
                    maxDate={trip.finish_date ? new Date(trip.finish_date) : ''}
                    placeholderText="MM/DD/YYYY"
                    className='text-field'
                    id='start_date'
                  />
                  <span className='error'>{this.errorMessageFor('start_date')}</span>
                </div>
                <div className="col l6 m6 s12">
                  <div className="label">Arrival*</div>
                  <DatePicker
                    selected={trip.finish_date ? new Date(trip.finish_date) : ''}
                    onChange={(date) => this.updateDateFilters('finish_date', date)}
                    minDate={trip.start_date ? new Date(trip.start_date) : new Date()}
                    placeholderText="MM/DD/YYYY"
                    className='text-field'
                    id='finish_date'
                  />
                  <span className='error'>{this.errorMessageFor('finish_date')}</span>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col l6 m6 s12">
                <div className="label">Estimated Duration {miles}</div>
                <TextField
                  disabled
                  value={this.estimatedDuration()}
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
                    value={trip.event_name || ''}
                    onChange={(event) => this.onFieldChange('event_name', event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    {eventName.map(name => (
                      <MenuItem
                        key={name}
                        value={name}
                      >
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                  <span className='error'>{this.errorMessageFor('event_name')}</span>
                </FormControl>
              </div>

            </div>
            <div className="row">
              <div className="col l6 m6 s12">
                <div className="label">Available Seats*</div>
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple"></InputLabel>
                  <Select
                    value={trip.seats || ''}
                    onChange={(event) => this.onFieldChange('seats', event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
                    {[1,2,3,4,5,6,7,8,9,10].map(val => (
                      <MenuItem
                        key={val}
                        value={val}
                      >
                        {val}
                      </MenuItem>
                    ))}
                  </Select>
                  <span className='error'>{this.errorMessageFor('seats')}</span>
                </FormControl>
              </div>
              <div className="col l6 m6 s12">
                <div className="label">Price*</div>
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple"></InputLabel>
                  <Select
                    value={parseFloat(trip.price).toString() || ''}
                    onChange={(event) => this.onFieldChange('price', event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    {Array.from(Array(priceTip*2+1).keys()).map(val => (
                      <MenuItem
                        key={val}
                        value={val.toString()}
                      >
                        ${val}
                      </MenuItem>
                    ))}
                  </Select>
                  <span className='error'>{this.errorMessageFor('price')}</span>
                </FormControl>
                <span className="right recommended-label">Fair Price: $<span className="recommended-price">{priceTip}</span></span>
              </div>
            </div>
            <div className="row">
              <div className="col l12 m12 s12">
                <div className="label">Headline*</div>
                <TextField
                  placeholder="Ex: 'My weekend trip to Phoenix'"
                  className="text-field"
                  margin="normal"
                  value={trip.name || ''}
                  onChange={(event) => this.onFieldChange('name', event)}
                />
                <span className='error'>{this.errorMessageFor('name')}</span>
              </div>
            </div>
            <div className="center-align mt20">
              <PrimaryButton
                color='primary'
                buttonName="Update Ride"
                className="lg-primary"
                handleButtonClick={() => this.handleSaveTrip()}
              />
            </div>
          </div>
        </div>
        <div className="mapSection">
          <Gmap
            start_location={trip.start_location}
            start_location_latitude={trip.start_location_latitude}
            start_location_longitude={trip.start_location_longitude}
            destination={trip.destination}
            destination_latitude={trip.destination_latitude}
            destination_longitude={trip.destination_longitude}
            defaultLat={latitude}
            defaultLng={longitude}
            showTrip={true}
          />
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    trip: getTrip(state),
    tripErrors: getTripErrors(state),
    tripSaved: getTripSaved(state),
    tripCompleted: getTripCompleted(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getTripRequest, createTripRequest, updateTripRequest,
    resetTripFlagRequest
  } = actions

  return {
    actions: bindActionCreators(
      {
        getTripRequest,
        createTripRequest,
        updateTripRequest,
        resetTripFlagRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditRide)
