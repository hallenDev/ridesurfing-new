import _ from 'underscore'
import React, { Component, } from 'react'
import { Link } from 'react-router-dom'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Dialog from '@material-ui/core/Dialog'
import ReactLoading from 'react-loading'
import StarRatingComponent from 'react-star-rating-component'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getTrips, getDataLoaded, getTripCancelled, getTripErrors, getPagination } from '../reducers/TripReducer'
import { getTripRequest, getTripRequestCancelled } from '../reducers/TripRequestReducer'
import { getCurrentUser } from '../reducers/SessionReducer'

import TripCard from '../components/TripCard'
import Pagination from '../components/Pagination'

import missingImg from '../images/missing.png'

class MyTrips extends Component {

  constructor (props) {
    super(props)
    this.state = {
      trip: {},
      tripErrors: {},
      dataLoaded: false
    }
  }


  componentWillMount () {
    const { getTripsRequest, getCurrentUserRequest } = this.props.actions
    this.setState({trip: {}, tripErrors:{}, dataLoaded: false})
    getTripsRequest()
    //getCurrentUserRequest()
    if (!localStorage.accessToken) {
      localStorage.setItem('prevUrl', `/my_rides`)
      return window.location.href = `/login`
    }
  }


  UNSAFE_componentWillReceiveProps (nextProps) {
    const { getTripsRequest, resetTripFlagRequest, resetTripRequestsFlagRequest } = this.props.actions
    if (nextProps.dataLoaded || nextProps.dataLoaded === false) {
      this.setState({ dataLoaded: nextProps.dataLoaded })
    }
    if (nextProps.tripCancelled) {
      resetTripFlagRequest()
      getTripsRequest()
    }
    if (nextProps.tripRequestCancelled) {
      resetTripRequestsFlagRequest()
      getTripsRequest()
    }
    if (nextProps.dataLoaded) {
      var elems = document.querySelectorAll(".clicked-page");
      [].forEach.call(elems, function(el) {
        el.classList.remove("clicked-page");
      });
    }
  }

  errorMessageFor = (fieldName) => {
    const { tripErrors } = this.props
    if (tripErrors && tripErrors[fieldName])
      return tripErrors[fieldName]
  }

  handleClick = (index, event) => {
    this.setState({ [`anchorEl${index}`]: event.currentTarget })
  }

  handleClose = (index) => {
    this.setState({ [`anchorEl${index}`]: null })
  }

  handleDialogOpen = (index) => {
    this.setState({ [`dialogState${index}`]: true, [`anchorEl${index}`]: null })
  }

  handleDialogClose = (index) => {
    this.setState({ [`dialogState${index}`]: false })
  }

  handleMenuClick (url) {
    const { history } = this.props
    history.push(url)
  }

  sendCancelTripRequest (tripId, index) {
    const { cancelTripRequest } = this.props.actions
    cancelTripRequest(tripId)
    this.setState({ [`anchorEl${index}`]: null })
  }

  sendCancelRiderTripRequest (trip, index) {
    const { trip_requests } = trip.relationships
    const { currentUser } = this.props
    const { cancelTripRequestRequest } = this.props.actions
    const trip_request = _.find(trip_requests, (tr) => { return tr.requested_by === currentUser.id})
    this.setState({ [`anchorEl${index}`]: null })
    cancelTripRequestRequest(trip_request.id)
  }
  onPageNumClick(e, page) {
    const { getTripsRequest, resetDataLoadedRequest } = this.props.actions

    e.target.parentElement.classList.add("clicked-page")

    resetDataLoadedRequest()
    getTripsRequest(page)
  }


  renderCard(trip, trip_idx){
    const { getTripInfoRequest } = this.props.actions;
    return  <TripCard trip={JSON.parse(JSON.stringify(trip))} render_status={true} render_menu={true} />
  }

  renderTrips() {
    const { trips } = this.props
    if (trips.length > 0)
      return _.map(trips, (trip, index)=>{ return this.renderCard(trip, index); });
    return "You have no trips yet. Consider listing your next ride or tagging along with someone :)";
  }

  render () {
    const { dataLoaded } = this.state

    return (
      <div className="my-trips">
          <h4>My Rides</h4>
            <div>
                <Pagination
                    current_page={this.props.pagination.current_page}
                    per_page={this.props.pagination.per_page}
                    total_pages={this.props.pagination.total_pages}
                    total_count={this.props.pagination.total_count}
                    onPageNumClick={this.onPageNumClick.bind(this)}
                />
            </div>
          <hr className="mb20"/>
          <div className="trips-container">
            {dataLoaded ? this.renderTrips() : <div className="loading">
              {!dataLoaded && <ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' />}
              </div>
            }
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    dataLoaded: getDataLoaded(state),
    trips: getTrips(state),
    tripRequest: getTripRequest(state),
    currentUser: getCurrentUser(state),
    tripErrors: getTripErrors(state),
    tripCancelled: getTripCancelled(state),
    tripRequestCancelled: getTripRequestCancelled(state),
    pagination: getPagination(state)
  }
}

function mapDispatchToProps (dispatch) {
  const {
    getTripsRequest, getTripRequest, getCurrentUserRequest, resetDataLoadedRequest, cancelTripRequest, resetTripFlagRequest, cancelTripRequestRequest,
    resetTripRequestsFlagRequest
  } = actions

  return {
    actions: bindActionCreators(
      {
        getTripsRequest,
        getTripRequest,
        getCurrentUserRequest,
        resetDataLoadedRequest,
        resetTripFlagRequest,
        cancelTripRequest,
        cancelTripRequestRequest,
        resetTripRequestsFlagRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyTrips)
