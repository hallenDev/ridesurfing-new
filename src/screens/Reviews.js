import React, { useState, useEffect } from 'react'
import StarRatingComponent from 'react-star-rating-component'
import _ from 'underscore'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Dialog from '@material-ui/core/Dialog'

import useReviewStore from '../store/ReviewStore';
import useSessionStore from '../store/SessionStore';

import missingImg from '../images/missing.png'

const Review = (props) => {

  const reviewStore = useReviewStore();
  const sessionStore = useSessionStore();

  const reviews = reviewStore.reviews;
  const currentUser = sessionStore.currentUser;
  const review = reviewStore.review;
  const reviewUpdated = reviewStore.isUpdated;
  const dataLoaded = reviewStore.dataLoaded;
  
  const initial_state = {
    review: {},
    dataLoaded: false
  }

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    reviewStore.getReviewsRequest()
  }, [])

  useEffect(() => {
   if (dataLoaded || dataLoaded === false) {
      setState({ ...state, dataLoaded: dataLoaded })
    }
  }, [dataLoaded])

  if (!localStorage.accessToken) {
    localStorage.setItem('prevUrl', `/reviews`)
    return window.location.href = `/login`
  }

  const errorMessageFor = (fieldName) => {
    const { tripErrors } = props
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
    setState({ 
      ...state, 
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


  const renderStatus = (trip) => {
    if (!trip.attributes.is_cancelled && !!trip.attributes.is_expired) {
      return "Expired"
    } else {
      if (trip.attributes.is_cancelled || (trip.trip_request && trip.trip_request.status === "Cancelled")) {
        return "Cancelled"
      } else {
        if (!trip.attributes.is_cancelled && !trip.attributes.is_expired && (!trip.trip_request || (trip.trip_request && trip.trip_request.status !== "Cancelled"))) {
          return "It's a go!"
        }
      }
    }
  }

  const renderStyle = (trip) => {
    if (!trip.attributes.is_cancelled && !!trip.attributes.is_expired) {
      return 'exp-label'
    } else {
      if (trip.attributes.is_cancelled || (trip.trip_request && trip.trip_request.status === "Cancelled")) {
        return 'cancel-label'
      } else {
        if (!trip.attributes.is_cancelled && !trip.attributes.is_expired && (!trip.trip_request || (trip.trip_request && trip.trip_request.status !== "Cancelled"))) {
          return 'active-label'
        }
      }
    }
  }

  const getImage = (passenger) => {
    return passenger?.attributes?.display_image ? passenger.attributes.display_image : missingImg
  }

  const goToProfile = (user) => {
    return user.id === currentUser.id ? `/my_profile` : `/profile/${user.attributes.slug || user.id}`
  }

  const goToReview = (review) => {
    return `/reviews/${review.id}`
  }

  const renderDriver = (trip) => {
    const { profile } = trip.relationships
    const { user } = profile

    return <div className="rider-list">
      <Link to={goToProfile(user)}>
        <div className="rider-img-container">
          <img className="responsive-img circle user-img" src={getImage(user)} alt="" />
        </div>
        <div className="user-name">
          <Link to={goToProfile(user)}>{user.attributes.name}</Link>
        </div>
        <div className="user-type">Driver</div>
      </Link>
    </div>
  }

  // new-add
  const sendCancelTripRequest = (tripe_id, index) => {

  }

  // new-add
  const sendCancelRiderTripRequest = (tripe_id, index) => {

  }

  const renderRiders = (trip) => {
    const { trip_requests } = trip.relationships

    return _.map(trip_requests, (trip_request, index) => {
      if (trip_request.status === "Accepted") {
        const { passenger } = trip_request
        return <div className="rider-list" key={`tr_${index}`}>
          <Link to={goToProfile(passenger)} onClick={event => {if(!passenger) event.preventDefault()}}>
            <div className="rider-img-container">
              <img className="responsive-img circle user-img" src={getImage(passenger)} alt="" onClick={event => {if(!passenger) event.preventDefault()}}/>
            </div>
            <div className="user-name">
              <Link to={goToProfile(passenger)} onClick={event => {if(!passenger) event.preventDefault()}}>{passenger?.attributes?.name ?? 'Deleted User'}</Link>
            </div>
            <div className="user-type">Passenger</div>
          </Link>
        </div>
    }
  })
}

  const goToRideDetails = (trip) => {
    return `/ride/${trip.attributes.slug || trip.id}`
  }

  const renderReviews = () => {
    return _.map(reviews, (review, index) => {
        const anchorEl = state[`anchorEl${index}`]
        const dialogState = state[`dialogState${index}`]      
	      const { trip, user } = review.relationships

        return <div className="trip-box card" key={`trip-${index}`}>
          <div className="flex-field web">
            <div className="content-flex">
              <div className="main">
                <div className="left-box pl0">
                  <Link to={goToProfile(user)}>
                    <div className="user-img-container">
                      <img className="responsive-img user-img" src={getImage(user)} alt="" />
                    </div>
                  </Link>
                </div>
                <div className="right-box">
                  <div className="right">
                    <IconButton
                      aria-owns={anchorEl ? `simple-menu${index}` : undefined}
                      aria-haspopup="true"
                      onClick={(event) => handleClick(index, event)}
                      className="dropdown"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`simple-menu${index}`}
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => handleClose(index)}
                      PaperProps={{
                        style: {
                          transform: 'translateX(-10%)',
                          width: 150,
                          padding: 0,
                        }
                      }}
                      MenuListProps={{style: { padding: 0 }}}
                      className="trip-dropdown"
                    >
                      <MenuItem onClick={() => handleDialogOpen(index)}><Icon className="menu-icon">list</Icon>View Riders</MenuItem>
                      {!!trip.attributes.can_edit && <MenuItem onClick={() => handleMenuClick(`/edit_ride/${trip.attributes.slug || trip.id}`)}><Icon className="menu-icon">edit</Icon>Edit Ride</MenuItem>}
                      {!!trip.attributes.can_cancel && <MenuItem onClick={() => sendCancelTripRequest(trip.id, index)}><Icon className="menu-icon">delete</Icon>Cancel Ride</MenuItem>}
                      {!trip.attributes.is_expired && trip.attributes.driver_id !== currentUser.id &&  <MenuItem onClick={() => sendCancelRiderTripRequest(trip, index)}><Icon className="menu-icon">delete</Icon>Opt Out</MenuItem>}
                    </Menu>
                  </div>
                  <Link to={goToReview(review)} className="heading">{trip.attributes.name}</Link>
                  {!!errorMessageFor('trip') && <span className='error'>{errorMessageFor('trip')}<br/></span>}
                  <div className="mr10">
                    <Link to={goToRideDetails(trip)}>
                      <span className="label">
                        <span className="label">event: </span>
                        <span className="user-val">{trip.attributes.event_name}</span> &nbsp;
                      </span>
                      <span className="label-status">
                        <span className={`label ${renderStyle(trip)}`}> {renderStatus(trip)}</span>
                      </span>
                      <span className="drive-label-box">
                        <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                          {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                        </span>
                      </span>
                    </Link>
                  </div>
                  <div className="avb-seat">
                    <Link to={goToReview(review)}>
                      <span className="seat-left">Seats Left : {trip.attributes.available_seats}</span>
                    </Link>
                  </div>
                  <div className="reviews-rating">
                    <StarRatingComponent
                      name="average_rating"
                      starCount={5}
                      value={user.attributes.average_rating || 0}
                      editing={false}
                    />
                    <span className="rating-count">({user.attributes.rating_count})</span>
                  </div>
                  <div className="top-section clearfix">
                    <Link to={goToReview(review)}>
                      <div className="row">
                        <div className="col s4 l4 pl0">
                          <div className="item-label">price</div>
                          <div className="item-value">${trip.attributes.price}</div>
                        </div>
                        <div className="col s4 l4">
                          <div className="item-label">miles</div>
                          <div className="item-value">{trip.attributes.total_distance}</div>
                        </div>
                        <div className="col s4 l4">
                          <div className="item-label">duration</div>
                          <div className="item-value">{trip.attributes.modified_duration}</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="row bottom-section">
                <Link to={goToReview(review)}>
                  <div className="col s6 l6 sep-section">
                    <div className="detailsHeading">DEPARTURE</div>
                    <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.modified_start_location},</div>
                    <i className="fa fa-long-arrow-right separator-icon"></i>
                    <div className="travel-date">
                      <span className="user-val">{trip.attributes.start_date}</span>
                    </div>
                  </div>
                  <div className="col s6 l6 sep-section">
                    <div className="detailsHeading">ARRIVAL</div>
                    <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.modified_destination}</div>
                    <div className="travel-date">
                      <div className="user-val">{trip.attributes.finish_date}</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            <Dialog
              open={dialogState || false}
              onClose={() => handleDialogClose(index)}
              className="dialog-box"
              maxWidth='sm'
              fullWidth={true}
            >
              <div className="dialog-heading">
                <Icon
                  className="close-icon right"
                  onClick={() => handleDialogClose(index)}
                >close</Icon>
                <h3>Riders list</h3>
              </div>
              <div className="dialog-body">
                {renderDriver(trip)}
                {renderRiders(trip)}
              </div>
            </Dialog>
          </div>
          <div className="flex-field mob">
            <Link to={goToRideDetails(trip)}>
              <div className="card-header">
                  <div className="trip-name">{trip.attributes.name}</div>
              </div>
            </Link>

            <div className="row">
              <div className="col s5">
                <Link to={goToRideDetails(trip)}>
                  <div className="avatar-container">
                    <img className="responsive-img user-img" src={getImage(user)} alt="" />
                  </div>
                  <div className="driver-name">
                    <span >{user.attributes.name}</span>
                  </div>
                </Link>
              </div>
              <div className="col s7">
                {!!errorMessageFor('trip') && <span className='error'>{errorMessageFor('trip')}<br/></span>}
                <div className="dropdown-btn">
                  <IconButton
                    aria-owns={anchorEl ? `simple-menu${index}` : undefined}
                    aria-haspopup="true"
                    onClick={(event) => handleClick(index, event)}
                    className="dropdown"
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`simple-menu${index}`}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => handleClose(index)}
                    PaperProps={{
                      style: {
                        transform: 'translateX(-10%)',
                        width: 150,
                        padding: 0,
                      }
                    }}
                    MenuListProps={{style: { padding: 0 }}}
                    className="trip-dropdown"
                  >
                    <MenuItem onClick={() => handleDialogOpen(index)}><Icon className="menu-icon">list</Icon>View Riders</MenuItem>
                    {!!trip.attributes.can_edit && <MenuItem onClick={() => handleMenuClick(`/edit_ride/${trip.attributes.slug || trip.id}`)}><Icon className="menu-icon">edit</Icon>Edit Ride</MenuItem>}
                    {!!trip.attributes.can_cancel && <MenuItem onClick={() => sendCancelTripRequest(trip.id, index)}><Icon className="menu-icon">delete</Icon>Cancel Ride</MenuItem>}
                    {!trip.attributes.is_expired && trip.attributes.driver_id !== currentUser.id && <MenuItem onClick={() => sendCancelRiderTripRequest(trip, index)}><Icon className="menu-icon">delete</Icon> Opt Out</MenuItem>}
                  </Menu>
                </div>
                <Link className="event" to={goToReview(review)}>{trip.attributes.event_name}</Link>
                <Link className="label-status" to={goToReview(review)}>
                  <span className={`label ${renderStyle(trip)}`}> {renderStatus(trip)}</span>
                </Link>
                <Link className="drive-label-box" to={goToRideDetails(trip)}>
                  <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                    {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                  </span>
                </Link>
                <Link className="seatLeft" to={goToReview(review)}>
                  Seats left<span className="seats"> {trip.attributes.available_seats}</span>
                </Link>

                  <div className="reviews-rating">
                    <StarRatingComponent
                      name="average_rating"
                      starCount={5}
                      value={user.attributes.average_rating || 0}
                      editing={false}
                    />
                    <span className="rating-count">({user.attributes.rating_count})</span>
                  </div>
                <div className="clearfix mt5 mob-trip-specs">
                  <Link to={goToRideDetails(trip)}>
                    <div className="col s3">
                      <div className="item-label">Price</div>
                      <div className="item-value">${trip.attributes.price}</div>
                    </div>
                    <div className="col s3">
                      <div className="item-label">Miles</div>
                      <div className="item-value">{trip.attributes.total_distance}</div>
                    </div>
                    <div className="col s6">
                      <div className="item-label">Duration</div>
                      <div className="item-value">{trip.attributes.modified_duration}</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="bottom-section">
              <Link to={goToReview(review)}>
                <div className="row">
                  <div className="col s6 sep-section">
                    <div className="address">
                      <i className="fa fa-map-marker icon"/> {trip.attributes.modified_start_location}
                    </div>
                    <div className="time-text">{trip.attributes.start_date}</div>
                    <i className="fa fa-long-arrow-right separator-icon"></i>
                  </div>
                  <div className="col s6 sep-section">
                    <div className="address">
                      <i className="fa fa-map-marker icon"/> {trip.attributes.modified_destination}
                    </div>
                    <div className="time-text">
                      {trip.attributes.finish_date}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      })
  }

  if (reviews.length > 0) {
    return (
      <div className="my-trips">
      <div className="container review-page-container">
        <h4>Reviews</h4>
        <hr className="mb20"/>
        <div className="trips-container">
            {renderReviews()}
        </div>
      </div>
      </div>
    )
  } else {
    return <div className="container review-page-container">
      <h4>Reviews</h4>
      <hr className="mb30"/>
      <div className="review-page">
        <div className="trips-container">
          {state.dataLoaded ? <h4 className="center-align">No Pending Reviews!</h4> : <div className="loading">
            {!state.dataLoaded && <ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' />}
            </div>
          }
        </div>
      </div>
    </div>
  }
}

export default (Review)
