import _ from 'underscore'
import React, { useState} from 'react'
import { Link } from 'react-router-dom'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Dialog from '@material-ui/core/Dialog'
import ReactLoading from 'react-loading'
import StarRatingComponent from 'react-star-rating-component'

import TripCard from '../components/TripCard'
import Pagination from '../components/Pagination'

import missingImg from '../images/missing.png'
import useSessionStore from '../store/SessionStore';
import useTripStore from '../store/TripStore';
import useTripRequestStore from '../store/TripRequestStore';

const initial_state = {
  trip: {},
  tripErrors: {},
  dataLoaded: false
}

const MyTrips = (props) => {

  const tripStore = useTripStore();
  const sessionStore = useSessionStore();
  const tripRequestStore = useTripRequestStore();

  // const dataLoaded = tripStore.dataLoaded;
  const trips = tripStore.trips;
  const tripRequest = tripRequestStore.tripRequest;
  const currentUser = sessionStore.currentUser;
  const tripErrors = tripStore.errors;
  const tripCancelled = tripStore.isCancelled;
  const tripRequestCancelled = tripRequestStore.isCancelled;
  const pagination = tripStore.pagination;

  const [state, setState] = useState(initial_state);

  // to-do
  // componentWillMount () {
  //   const { getTripsRequest, getCurrentUserRequest } = this.props.actions
  //   this.setState({trip: {}, tripErrors:{}, dataLoaded: false})
  //   getTripsRequest()
  //   //getCurrentUserRequest()
  //   if (!localStorage.accessToken) {
  //     localStorage.setItem('prevUrl', `/my_rides`)
  //     return window.location.href = `/login`
  //   }
  // }

  // to-d0
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   const { getTripsRequest, resetTripFlagRequest, resetTripRequestsFlagRequest } = this.props.actions
  //   if (nextProps.dataLoaded || nextProps.dataLoaded === false) {
  //     this.setState({ dataLoaded: nextProps.dataLoaded })
  //   }
  //   if (nextProps.tripCancelled) {
  //     resetTripFlagRequest()
  //     getTripsRequest()
  //   }
  //   if (nextProps.tripRequestCancelled) {
  //     resetTripRequestsFlagRequest()
  //     getTripsRequest()
  //   }
  //   if (nextProps.dataLoaded) {
  //     var elems = document.querySelectorAll(".clicked-page");
  //     [].forEach.call(elems, function(el) {
  //       el.classList.remove("clicked-page");
  //     });
  //   }
  // }

  const errorMessageFor = (fieldName) => {
    if (tripErrors && tripErrors[fieldName])
      return tripErrors[fieldName]
  }

  const handleClick = (index, event) => {
    setState({ 
      ...state, 
      [`anchorEl${index}`]: event.currentTarget 
    })
  }

  const handleClose = (index) => {
    setState({ 
      ...state, 
      [`anchorEl${index}`]: null 
    })
  }

  const handleDialogOpen = (index) => {
    setState({ ...state, 
      [`dialogState${index}`]: true, [`anchorEl${index}`]: null 
    })
  }

  const handleDialogClose = (index) => {
    setState({ 
      ...state, 
      [`dialogState${index}`]: false 
    })
  }

  const handleMenuClick = (url) => {
    const { history } = props
    history.push(url)
  }

  const sendCancelTripRequest = (tripId, index) => {
    tripStore.cancelTripRequest(tripId)
    setState({ 
      ...state, 
      [`anchorEl${index}`]: null 
    })
  }

  const sendCancelRiderTripRequest = (trip, index) => {
    const { trip_requests } = trip.relationships
    const trip_request = _.find(trip_requests, (tr) => { return tr.requested_by === currentUser.id})
    setState({ 
      ...state,
      [`anchorEl${index}`]: null 
    })
    tripRequestStore.cancelTripRequestRequest(trip_request.id)
  }
  const onPageNumClick = (e, page) => {

    e.target.parentElement.classList.add("clicked-page")

    tripStore.resetDataLoadedRequest()
    tripStore.getTripsRequest(page)
  }


  const renderCard = (trip, trip_idx) => {
    return  <TripCard trip={JSON.parse(JSON.stringify(trip))} render_status={true} render_menu={true} />
  }

  const renderTrips = () => {
    if (trips.length > 0)
      return _.map(trips, (trip, index)=>{ return renderCard(trip, index); });
    return "You have no trips yet. Consider listing your next ride or tagging along with someone :)";
  }

  const { dataLoaded } = state

  return (
    <div className="my-trips">
        <h4>My Rides</h4>
          <div>
              <Pagination
                  current_page={pagination.current_page}
                  per_page={pagination.per_page}
                  total_pages={pagination.total_pages}
                  total_count={pagination.total_count}
                  onPageNumClick={onPageNumClick}
              />
          </div>
        <hr className="mb20"/>
        <div className="trips-container">
          {dataLoaded ? renderTrips() : <div className="loading">
            {!dataLoaded && <ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' />}
            </div>
          }
      </div>
    </div>
  )
}

export default (MyTrips)
