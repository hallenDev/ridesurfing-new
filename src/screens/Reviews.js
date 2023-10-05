import React, { Component } from 'react'
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

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getReviews, getReview, getDataLoaded, getReviewUpdated } from '../reducers/ReviewReducer'
import { getCurrentUser } from '../reducers/SessionReducer'


import missingImg from '../images/missing.png'

class Review extends Component {

  constructor (props) {
    super(props)
    this.state = {
      review: {},
      dataLoaded: false
    }
  }

  componentWillMount () {
    if (!localStorage.accessToken) {
      localStorage.setItem('prevUrl', `/reviews`)
      return window.location.href = `/login`
    }
  }

  componentDidMount() {
    const { getReviewsRequest } = this.props.actions
    getReviewsRequest()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.dataLoaded || nextProps.dataLoaded === false) {
      this.setState({ dataLoaded: nextProps.dataLoaded })
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


  renderStatus (trip) {
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

  renderStyle (trip) {
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

  getImage (passenger) {
    return passenger.attributes.display_image ? passenger.attributes.display_image : missingImg
  }

  goToProfile (user) {
    const { currentUser } = this.props
    return user.id === currentUser.id ? `/my_profile` : `/profile/${user.attributes.slug || user.id}`
  }
  goToReview (review) {
    return `/reviews/${review.id}`
  }

  renderDriver (trip) {
    const { profile } = trip.relationships
    const { user } = profile

    return <div className="rider-list">
      <Link to={this.goToProfile(user)}>
        <div className="rider-img-container">
          <img className="responsive-img circle user-img" src={this.getImage(user)} alt="" />
        </div>
        <div className="user-name">
          <Link to={this.goToProfile(user)}>{user.attributes.name}</Link>
        </div>
        <div className="user-type">Driver</div>
      </Link>
    </div>
  }

  renderRiders (trip) {
    const { trip_requests } = trip.relationships

    return _.map(trip_requests, (trip_request, index) => {
      if (trip_request.status === "Accepted") {
        const { passenger } = trip_request
        return <div className="rider-list" key={`tr_${index}`}>
          <Link to={this.goToProfile(passenger)}>
            <div className="rider-img-container">
              <img className="responsive-img circle user-img" src={this.getImage(passenger)} alt="" />
            </div>
            <div className="user-name">
              <Link to={this.goToProfile(passenger)}>{passenger.attributes.name}</Link>
            </div>
            <div className="user-type">Passenger</div>
          </Link>
        </div>
      }
    })
  }

  goToRideDetails (trip) {
    return `/ride/${trip.attributes.slug || trip.id}`
  }

  getImage (user) {
    return user.attributes.display_image ? user.attributes.display_image : missingImg
  }

  renderReviews () {
    const { reviews } = this.props
    const { currentUser } = this.props
    return _.map(reviews, (review, index) => {
        const anchorEl = this.state[`anchorEl${index}`]
        const dialogState = this.state[`dialogState${index}`]      
	    const { trip, user } = review.relationships

        return <div className="trip-box card" key={`trip-${index}`}>
          <div className="flex-field web">
            <div className="content-flex">
              <div className="main">
                <div className="left-box pl0">
                  <Link to={this.goToProfile(user)}>
                    <div className="user-img-container">
                      <img className="responsive-img user-img" src={this.getImage(user)} alt="" />
                    </div>
                  </Link>
                </div>
                <div className="right-box">
                  <div className="right">
                    <IconButton
                      aria-owns={anchorEl ? `simple-menu${index}` : undefined}
                      aria-haspopup="true"
                      onClick={(event) => this.handleClick(index, event)}
                      className="dropdown"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`simple-menu${index}`}
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => this.handleClose(index)}
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
                      <MenuItem onClick={() => this.handleDialogOpen(index)}><Icon className="menu-icon">list</Icon>View Riders</MenuItem>
                      {!!trip.attributes.can_edit && <MenuItem onClick={() => this.handleMenuClick(`/ride/${trip.attributes.slug || trip.id}/edit`)}><Icon className="menu-icon">edit</Icon>Edit Ride</MenuItem>}
                      {!!trip.attributes.can_cancel && <MenuItem onClick={() => this.sendCancelTripRequest(trip.id, index)}><Icon className="menu-icon">delete</Icon>Cancel Ride</MenuItem>}
                      {!trip.attributes.is_expired && trip.attributes.driver_id !== currentUser.id &&  <MenuItem onClick={() => this.sendCancelRiderTripRequest(trip, index)}><Icon className="menu-icon">delete</Icon>Opt Out</MenuItem>}
                    </Menu>
                  </div>
                  <Link to={this.goToReview(review)} className="heading">{trip.attributes.name}</Link>
                  {!!this.errorMessageFor('trip') && <span className='error'>{this.errorMessageFor('trip')}<br/></span>}
                  <div className="mr10">
                    <Link to={this.goToRideDetails(trip)}>
                      <span className="label">
                        <span className="label">event: </span>
                        <span className="user-val">{trip.attributes.event_name}</span> &nbsp;
                      </span>
                      <span className="label-status">
                        <span className={`label ${this.renderStyle(trip)}`}> {this.renderStatus(trip)}</span>
                      </span>
                      <span className="drive-label-box">
                        <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                          {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                        </span>
                      </span>
                    </Link>
                  </div>
                  <div className="avb-seat">
                    <Link to={this.goToReview(review)}>
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
                    <Link to={this.goToReview(review)}>
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
                <Link to={this.goToReview(review)}>
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
              onClose={() => this.handleDialogClose(index)}
              className="dialog-box"
              maxWidth='sm'
              fullWidth={true}
            >
              <div className="dialog-heading">
                <Icon
                  className="close-icon right"
                  onClick={() => this.handleDialogClose(index)}
                >close</Icon>
                <h3>Riders list</h3>
              </div>
              <div className="dialog-body">
                {this.renderDriver(trip)}
                {this.renderRiders(trip)}
              </div>
            </Dialog>
          </div>
          <div className="flex-field mob">
            <Link to={this.goToRideDetails(trip)}>
              <div className="card-header">
                  <div className="trip-name">{trip.attributes.name}</div>
              </div>
            </Link>

            <div className="row">
              <div className="col s5">
                <Link to={this.goToRideDetails(trip)}>
                  <div className="avatar-container">
                    <img className="responsive-img user-img" src={this.getImage(user)} alt="" />
                  </div>
                  <div className="driver-name">
                    <span >{user.attributes.name}</span>
                  </div>
                </Link>
              </div>
              <div className="col s7">
                {!!this.errorMessageFor('trip') && <span className='error'>{this.errorMessageFor('trip')}<br/></span>}
                <div className="dropdown-btn">
                  <IconButton
                    aria-owns={anchorEl ? `simple-menu${index}` : undefined}
                    aria-haspopup="true"
                    onClick={(event) => this.handleClick(index, event)}
                    className="dropdown"
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id={`simple-menu${index}`}
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => this.handleClose(index)}
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
                    <MenuItem onClick={() => this.handleDialogOpen(index)}><Icon className="menu-icon">list</Icon>View Riders</MenuItem>
                    {!!trip.attributes.can_edit && <MenuItem onClick={() => this.handleMenuClick(`/ride/${trip.attributes.slug || trip.id}/edit`)}><Icon className="menu-icon">edit</Icon>Edit Ride</MenuItem>}
                    {!!trip.attributes.can_cancel && <MenuItem onClick={() => this.sendCancelTripRequest(trip.id, index)}><Icon className="menu-icon">delete</Icon>Cancel Ride</MenuItem>}
                    {!trip.attributes.is_expired && trip.attributes.driver_id !== currentUser.id && <MenuItem onClick={() => this.sendCancelRiderTripRequest(trip, index)}><Icon className="menu-icon">delete</Icon> Opt Out</MenuItem>}
                  </Menu>
                </div>
                <Link className="event" to={this.goToReview(review)}>{trip.attributes.event_name}</Link>
                <Link className="label-status" to={this.goToReview(review)}>
                  <span className={`label ${this.renderStyle(trip)}`}> {this.renderStatus(trip)}</span>
                </Link>
                <Link className="drive-label-box" to={this.goToRideDetails(trip)}>
                  <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                    {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                  </span>
                </Link>
                <Link className="seatLeft" to={this.goToReview(review)}>
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
                  <Link to={this.goToRideDetails(trip)}>
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
              <Link to={this.goToReview(review)}>
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

  render () {
    const { dataLoaded } = this.state
    const { reviews } = this.props

    if (reviews.length > 0) {
      return (
        <div className="my-trips">
        <div className="container review-page-container">
          <h4>Reviews</h4>
          <hr className="mb20"/>
          <div className="trips-container">
              {this.renderReviews()}
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
            {dataLoaded ? <h4 className="center-align">No Pending Reviews!</h4> : <div className="loading">
              {!dataLoaded && <ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' />}
              </div>
            }
          </div>
        </div>
      </div>
    }
  }
}

function mapStateToProps (state) {
  return {
    dataLoaded: getDataLoaded(state),
    reviews: getReviews(state),
    review: getReview(state),
    currentUser: getCurrentUser(state),
    reviewUpdated: getReviewUpdated(state)
  }
}

function mapDispatchToProps (dispatch) {
  const {
    getReviewsRequest, getReviewRequest, getCurrentUserRequest, resetDataLoadedRequest, updateReviewRequest
  } = actions

  return {
    actions: bindActionCreators(
      {
        getReviewsRequest,
        getReviewRequest,
        getCurrentUserRequest,
        resetDataLoadedRequest,
        updateReviewRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Review)
