import _ from 'underscore'
import React, { Component } from 'react'
import { Tabs, Tab, TabPanel, TabList } from 'react-web-tabs'
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
import { getTripRequests, getReceivedTripRequests, getDataLoaded } from '../reducers/TripRequestReducer'
import { getCurrentUser } from '../reducers/SessionReducer'
import { getTripRequestErrors } from '../reducers/TripRequestReducer'

import missingImg from '../images/missing.png'

class Requests extends Component {

  constructor (props) {
    super(props)
    this.state = {
      anchorEl: null,
      sentAnchorEl: null,
      receivedDialogState: false,
      sentDialogState: false,
      currentUserId: props.currentUserId || {},
      tripErrors: {},
      dataLoaded: false
    }
  }

  componentDidMount () {
    const { getTripRequestsRequest, getReceivedTripRequestsRequest } = this.props.actions
    getReceivedTripRequestsRequest()
    getTripRequestsRequest()
  }

  componentWillMount () {
    if (!localStorage.accessToken) {
      localStorage.setItem('prevUrl', `/requests`)
      return window.location.href = `/login`
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.dataLoaded || nextProps.dataLoaded === false) {
      this.setState({ dataLoaded: nextProps.dataLoaded })
    }
  }

  handleClick = (index, itemType, event) => {
    if (itemType === 'received') {
      this.setState({ [`anchorEl${index}`]: event.currentTarget })
    } else {
      this.setState({ [`sentAnchorEl${index}`]: event.currentTarget })
    }
  }

  handleClose = (index, itemType) => {
    if (itemType === 'received') {
      this.setState({ [`anchorEl${index}`]: null })
    } else {
      this.setState({ [`sentAnchorEl${index}`]: null })
    }
  }

  handleDialogOpen = (index, dialogType) => {
    this.setState({ [`${dialogType}DialogState${index}`]: true, [`anchorEl${index}`]: null, [`sentAnchorEl${index}`]: null })
  }

  handleDialogClose = (index, dialogType) => {
    this.setState({ [`${dialogType}DialogState${index}`]: false })
  }

  errorMessageFor = (fieldName) => {
    const { tripErrors } = this.props
    if (tripErrors && tripErrors[fieldName])
      return tripErrors[fieldName]
  }

  handleMenuClick (url) {
    const { history } = this.props
    history.push(url)
  }

  sendAcceptTripRequest (tripRequestId) {
    const { acceptTripRequestRequest } = this.props.actions
    acceptTripRequestRequest(tripRequestId)
  }

  sendIgnoreTripRequest (tripRequestId) {
    const { ignoreTripRequestRequest } = this.props.actions
    ignoreTripRequestRequest(tripRequestId)
  }

  sendCancelTripRequest (tripRequestId) {
    const { cancelTripRequestRequest } = this.props.actions
    cancelTripRequestRequest(tripRequestId)
  }

  getImage (passenger) {
    return passenger.attributes.display_image ? passenger.attributes.display_image : missingImg
  }

  goToProfile (user) {
    return `/profile/${user.attributes.slug || user.id}`
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

  renderReceivedRequests () {
    const { receivedTripRequests } = this.props
    const reqList = _.filter(receivedTripRequests, (req) => {
      const { trip } = req.relationships
      return !trip.attributes.is_expired
    })

    if (reqList.length > 0) {
      return _.map(reqList, (tripRequest, index) => {
        const anchorEl = this.state[`anchorEl${index}`]
        const receivedDialogState = this.state[`receivedDialogState${index}`]
        const { trip, passenger } = tripRequest.relationships

        if (!trip.attributes.is_expired && !trip.attributes.is_cancelled) {
          return <div className="trip-box card" key={`rec-req-${index}`}>
            <div className="flex-field web">
              <div className="content-flex">
                <div className="main">
                  <div className="left-box pl0">
                    <div className="user-img-container">
                      <Link to={this.goToProfile(passenger)}>
                        <img className="responsive-img user-img" src={this.getImage(passenger)} alt="" />
                      </Link>
                    </div>
                  </div>
                  <div className="right-box">
                    <div className="right">
                      <IconButton
                        aria-owns={anchorEl ? `simple-menu${index}` : undefined}
                        aria-haspopup="true"
                        onClick={(event) => this.handleClick(index, 'received', event)}
                        className="dropdown"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id={`simple-menu${index}`}
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => this.handleClose(index, 'received')}
                        PaperProps={{
                          style: {
                            transform: 'translateX(-10%)',
                            width: 150,
                            padding: 0,
                          }
                        }}
                        MenuListProps={{
                          style: {
                            padding: 0,
                          },
                        }}
                        className="trip-dropdown"
                      >
                        <MenuItem onClick={() => this.handleDialogOpen(index, 'received')}><Icon className="menu-icon">list</Icon> View Riders</MenuItem>
                      </Menu>
                    </div>
                    <p className="heading"><Link to={`/ride/${trip.attributes.slug || trip.id}`}>{trip.attributes.name}</Link></p>
                    {!!this.errorMessageFor('trip') && <span className='error'>{this.errorMessageFor('trip')}<br/></span>}
                    <span className="label">
                      <span className="label">event: </span>
                      <span className="user-val">{trip.attributes.event_name}</span> &nbsp;
                    </span><br/>
                    <span className="label-status">
                      <span className={`label ${this.renderStyle(trip)}`}> {this.renderStatus(trip)}</span>
                    </span>
                    <span className="drive-label-box">
                      <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                        {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                      </span>
                    </span>
                    <div className="avb-seat">
                      <span className="seat-available">Seats Requested: {tripRequest.attributes.seats}</span>
                      &nbsp; &nbsp;
                      <span className="seat-left">Seats Left: {trip.attributes.available_seats}</span>
                    </div>

                    <div className="reviews-rating">
                      <StarRatingComponent
                        name="average_rating"
                        starCount={5}
                        value={passenger.attributes.average_rating || 0}
                        editing={false}
                      />
                      <span className="rating-count">({passenger.attributes.rating_count})</span>

                    </div>
                    <div className="top-section">
                      <div className="row">
                        <div className="col s4 l4 pl0 pr0">
                          <div className="item-label">price</div>
                          <div className="item-value">${trip.attributes.price}</div>
                        </div>
                        <div className="col s4 l4 pl0 pr0">
                          <div className="item-label">miles</div>
                          <div className="item-value">{trip.attributes.total_distance}</div>
                        </div>
                        <div className="col s4 l4 pl0 pr0">
                          <div className="item-label">duration</div>
                          <div className="item-value">{trip.attributes.modified_duration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row bottom-section">
                  <div className="col s6 l6 sep-section">
                    <div className="detailsHeading">DEPARTURE</div>
                    <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.modified_start_location}</div>
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
                </div>
                <div className="row bottom-section">
                  <div className="col s6 l6 accept-block">
                    <div className='center' onClick={() => this.sendAcceptTripRequest(tripRequest.id)}>
                      <Icon className="menu-icon">check</Icon>
                      <span className='request-actions'>Accept Request</span>
                    </div>
                  </div>
                  <div className="col s6 l6 ignore-block">
                    <div className='center' onClick={() => this.sendIgnoreTripRequest(tripRequest.id)}>
                      <Icon className="menu-icon">close</Icon>
                      <span className='request-actions'>Ignore Request</span>
                    </div>
                  </div>
                </div>
              </div>
              <Dialog
                open={receivedDialogState || false}
                onClose={() => this.handleDialogClose(index, 'received')}
                className="dialog-box"
                fullWidth={true}
              >
                <div className="dialog-heading">
                  <Icon
                    className="close-icon right"
                    onClick={() => this.handleDialogClose(index, 'received')}
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
              <div className="card-header">
                <div className="trip-name"><Link to={`/ride/${trip.attributes.slug || trip.id}`}>{trip.attributes.name}</Link></div>
              </div>
              <div className="row">
                <div className="col s5">
                  <div className="avatar-container">
                    <Link to={this.goToProfile(passenger)}>
                      <img className="responsive-img user-img" src={this.getImage(passenger)} alt="" />
                    </Link>
                  </div>
                  <div className="requestor-name">
                    <span >{passenger.attributes.name}</span>
                  </div>
                </div>
                <div className="col s7">
                  <div className="dropdown-btn">
                    <IconButton
                      aria-owns={anchorEl ? `simple-menu${index}` : undefined}
                      aria-haspopup="true"
                      onClick={(event) => this.handleClick(index, 'received', event)}
                      className="dropdown"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`simple-menu${index}`}
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => this.handleClose(index, 'received')}
                      PaperProps={{
                        style: {
                          transform: 'translateX(-10%)',
                          width: 150,
                          padding: 0,
                        }
                      }}
                      MenuListProps={{
                        style: {
                          padding: 0,
                        },
                      }}
                      className="trip-dropdown"
                    >
                      <MenuItem onClick={() => this.handleDialogOpen(index, 'received')}><Icon className="menu-icon">list</Icon> View Riders</MenuItem>
                      <MenuItem onClick={() => this.sendAcceptTripRequest (tripRequest.id)}><Icon className="menu-icon">edit</Icon> Accept</MenuItem>
                      <MenuItem onClick={() => this.sendIgnoreTripRequest (tripRequest.id)}><Icon className="menu-icon">delete</Icon> Ignore</MenuItem>
                    </Menu>
                  </div>
                  <div className="event">{trip.attributes.event_name}</div>
                  <span className="label-status">
                    <span className={`label ${this.renderStyle(trip)}`}> {this.renderStatus(trip)}</span>
                  </span>
                  <span className="drive-label-box">
                    <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                      {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                    </span>
                  </span>
                  <div className="seatLeft">
                    Seats Requested:<span className="seats"> {tripRequest.attributes.seats}</span>
                  </div>
                  <div className="seatLeft">
                    Seats left:<span className="seats"> {trip.attributes.available_seats}</span>
                  </div>
                    <div className="reviews-rating">
                      <StarRatingComponent
                        name="average_rating"
                        starCount={5}
                        value={passenger.attributes.average_rating || 0}
                        editing={false}
                      />
                      <span className="rating-count">({passenger.attributes.rating_count})</span>
                    </div>

                  <div className="mob-trip-specs clearfix">
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
                  </div>
                </div>
              </div>
              <div className="bottom-section">
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
              </div>
              <div className="bottom-section">
                <div className="row">
                  <div className="col s6 l6 accept-block">
                    <div className='center' onClick={() => this.sendAcceptTripRequest(tripRequest.id)}>
                      <Icon className="menu-icon">check</Icon>
                      <span className='request-actions'>Accept Request</span>
                    </div>
                  </div>
                  <div className="col s6 l6 ignore-block">
                    <div className='center' onClick={() => this.sendIgnoreTripRequest(tripRequest.id)}>
                      <Icon className="menu-icon">close</Icon>
                      <span className='request-actions'>Ignore Request</span>
                    </div>
                  </div>
                </div>
              </div>
              <Dialog
                open={receivedDialogState || false}
                onClose={() => this.handleDialogClose(index, 'received')}
                className="dialog-box"
                fullWidth={true}
              >
                <div className="dialog-heading">
                  <Icon
                    className="close-icon right"
                    onClick={() => this.handleDialogClose(index, 'received')}
                  >close</Icon>
                  <h3>Riders list</h3>
                </div>
                <div className="dialog-body">
                  {this.renderDriver(trip)}
                  {this.renderRiders(trip)}
                </div>
              </Dialog>
            </div>
          </div>
        }
      })
    } else {
      return <div className='loading'><h4>No New Requests!</h4></div>
    }
  }

  renderSentRequests () {
    const { sentTripRequests } = this.props
    const reqList = _.filter(sentTripRequests, (req) => {
      const { trip } = req.relationships
      return !trip.attributes.is_expired
    })

    if (reqList.length > 0) {
      return _.map(reqList, (tripRequest, index) => {
        const anchorEl = this.state[`sentAnchorEl${index}`]
        const sentDialogState = this.state[`sentDialogState${index}`]
        const { trip } = tripRequest.relationships
        const { profile } = trip.relationships
        const { user } = profile

        if (!trip.attributes.is_expired) {
          return <div className="trip-box card" key={`sent-req-${index}`}>
            <div className="flex-field web">
              <div className="content-flex">
                <div className="main">
                  <div className="left-box pl0">
                    <div className="user-img-container">
                      <Link to={this.goToProfile(user)}>
                        <img className="responsive-img user-img" src={this.getImage(user)} alt="" />
                      </Link>
                    </div>
                  </div>
                  <div className="right-box">
                    <div className="right">
                      <IconButton
                        aria-owns={anchorEl ? `sent-menu${index}` : undefined}
                        aria-haspopup="true"
                        onClick={(event) => this.handleClick(index, 'sent', event)}
                        className="dropdown"
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        id={`sent-menu${index}`}
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => this.handleClose(index, 'sent')}
                        PaperProps={{
                          style: {
                            transform: 'translateX(-10%)',
                            width: 200,
                            padding: 0
                          }
                        }}
                        MenuListProps={{ style: { padding: 0 } }}
                        className="trip-dropdown"
                      >
                        <MenuItem onClick={() => this.handleDialogOpen(index, 'sent')}><Icon className="menu-icon">list</Icon> View Riders</MenuItem>
                      </Menu>
                    </div>
                    <p className="heading"><Link to={`/ride/${trip.attributes.slug || trip.id}`}>{trip.attributes.name}</Link></p>
                    <span className="label">
                      <span className="label">Event: </span>
                      <span className="user-val">{trip.attributes.event_name}</span> &nbsp;
                    </span><br/>
                    <span className="label-status">
                      <span className={`label ${this.renderStyle(trip)}`}> {this.renderStatus(trip)}</span>
                    </span>
                    <span className="drive-label-box">
                      <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                        {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                      </span>
                    </span>
                    <div className="avb-seat">
                      <span className="seat-available">Seats Requested: {tripRequest.attributes.seats}</span>
                      &nbsp; &nbsp;
                      <span className="seat-left">Seats Left: {trip.attributes.available_seats}</span>
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
                    <div className="top-section">
                      <div className="row">
                        <div className="col s4 l4 pl0 pr0">
                          <div className="item-label">price</div>
                          <div className="item-value">${trip.attributes.price}</div>
                        </div>
                        <div className="col s4 l4 pl0 pr0">
                          <div className="item-label">miles</div>
                          <div className="item-value">{trip.attributes.total_distance}</div>
                        </div>
                        <div className="col s4 l4 pl0 pr0">
                          <div className="item-label">duration</div>
                          <div className="item-value">{trip.attributes.modified_duration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row bottom-section">
                  <div className="col s6 l6 sep-section">
                    <div className="detailsHeading">DEPARTURE</div>
                    <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.modified_start_location}</div>
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
                </div>
                <div className="row bottom-section">
                  <div className='center ignore-block' onClick={() => this.sendCancelTripRequest(tripRequest.id)}>
                    <Icon className="menu-icon">delete</Icon>
                    <span className='request-actions'>Cancel Request</span>
                  </div>
                </div>
              </div>
              <Dialog
                open={sentDialogState || false}
                onClose={() => this.handleDialogClose(index, 'sent')}
                className="dialog-box"
                fullWidth={true}
              >
                <div className="dialog-heading">
                  <Icon
                    className="close-icon right"
                    onClick={() => this.handleDialogClose(index, 'sent')}
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
              <div className="card-header">
                <div className="trip-name">
                  <Link to={this.goToProfile(user)}>
                    {trip.attributes.name}
                  </Link>
                </div>
              </div>
              <div className="row">
                <div className="col s5">
                  <div className="avatar-container">
                    <Link to={this.goToProfile(user)}>
                      <img className="responsive-img user-img" src={this.getImage(user)} alt="" />
                    </Link>
                  </div>
                  <div className="driver-name">
                    <span >{user.attributes.name}</span>
                  </div>
                </div>
                <div className="col s7">
                  <div className="dropdown-btn">
                    <IconButton
                      aria-owns={anchorEl ? `sent-menu${index}` : undefined}
                      aria-haspopup="true"
                      onClick={(event) => this.handleClick(index, 'sent', event)}
                      className="dropdown"
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id={`sent-menu${index}`}
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => this.handleClose(index, 'sent')}
                      PaperProps={{
                        style: {
                          transform: 'translateX(-10%)',
                          width: 200,
                          padding: 0
                        }
                      }}
                      MenuListProps={{ style: { padding: 0 } }}
                      className="trip-dropdown"
                    >
                      <MenuItem onClick={() => this.handleDialogOpen(index, 'sent')}><Icon className="menu-icon">list</Icon> View Riders</MenuItem>
                    </Menu>
                  </div>
                  <div className="event">{trip.attributes.event_name}</div>
                  <span className="label-status">
                    <span className={`label ${this.renderStyle(trip)}`}> {this.renderStatus(trip)}</span>
                  </span>
                  <span className="drive-label-box">
                    <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                      {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                    </span>
                  </span>
                  <div className="seatLeft">
                    Seats left:<span className="seats"> {trip.attributes.available_seats}</span>
                  </div>
                  <div className="seatLeft">
                    Seats Requested:<span className="seats"> {tripRequest.attributes.seats}</span>
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
                  <div className="clearfix mt5 mob-trip-specs">
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
                  </div>
                </div>
              </div>
              <div className="bottom-section">
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
              </div>
              <div className="bottom-section">
                <div className="row">
                  <div className='center ignore-block' onClick={() => this.sendCancelTripRequest(tripRequest.id)}>
                    <Icon className="menu-icon">delete</Icon>
                    <span className='request-actions'>Cancel</span>
                  </div>
                </div>
              </div>
              <Dialog
                open={sentDialogState || false}
                onClose={() => this.handleDialogClose(index, 'sent')}
                className="dialog-box"
                fullWidth={true}
              >
                <div className="dialog-heading">
                  <Icon
                    className="close-icon right"
                    onClick={() => this.handleDialogClose(index, 'sent')}
                  >close</Icon>
                  <h3>Riders list</h3>
                </div>
                <div className="dialog-body">
                  {this.renderDriver(trip)}
                  {this.renderRiders(trip)}
                </div>
              </Dialog>
            </div>
          </div>
        }
      })
    } else {
      return <div className='loading'><h4>No New Requests!</h4></div>
    }
  }

  render () {
    const { dataLoaded } = this.state

    return <div className="my-requests">
      <div className="container">
        <div className="my-tablist">
          <Tabs defaultTab="one">
            <TabList>
              <Tab tabFor="one">Received Requests</Tab>
              <Tab tabFor="two">Sent Requests</Tab>
            </TabList>
            <TabPanel tabId="one">
              <div className="mt20 ml5 mr5">
                <div className="trips-container">
                  {!!dataLoaded && this.renderReceivedRequests()}
                  {!dataLoaded && <div className="loading"><ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' /></div>}
                </div>
              </div>
            </TabPanel>
            <TabPanel tabId="two">
              <div className="mt20 ml5 mr5">
                <div className="trips-container">
                  {!!dataLoaded && this.renderSentRequests()}
                  {!dataLoaded && <div className="loading"><ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' /></div>}
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  }
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    receivedTripRequests: getReceivedTripRequests(state),
    sentTripRequests: getTripRequests(state),
    tripErrors: getTripRequestErrors(state),
    dataLoaded: getDataLoaded(state)
  }
}

function mapDispatchToProps (dispatch) {
  const {
    getTripRequestsRequest,
    getReceivedTripRequestsRequest,
    acceptTripRequestRequest,
    ignoreTripRequestRequest,
    cancelTripRequestRequest
  } = actions

  return {
    actions: bindActionCreators(
      {
        getTripRequestsRequest,
        getReceivedTripRequestsRequest,
        acceptTripRequestRequest,
        ignoreTripRequestRequest,
        cancelTripRequestRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Requests)
