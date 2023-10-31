import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import StarRatingComponent from 'react-star-rating-component'

import missingImg from '../images/missing.png'

import TripMenu from '../components/TripMenu'

const TripCard = (props) => {
  const initial_state = {
    render_status: props.render_status || false,
    render_menu: props.render_menu || false,
    on_click_active: true,
    trip_cancel_sent: false,
    request_cancel_sent: false,
  }

  const [state, setState] = useState(initial_state)

  const renderStatus = (trip_status) => {
    const options = {
      active: {text: 'Active', style: 'active-label'},
      expired: {text: 'Expired', style: 'exp-label'},
      cancelled: {text: 'Cancelled', style: 'cancel-label'},
    }
    // if (!props.render_status || typeof trip_status === 'undefined') return ''

    let stat = options['active']
    if (trip_status?.is_expired) stat = options['expired']
    if (trip_status?.is_cancelled) stat = options['cancelled']
    // const stat = state.trip_cancel_sent
    //   ? options.cancelled
    //   : options[trip_status]
    return (
      <span className="label-status">
        <span className={`label ${stat.style}`}>{`${stat.text}`}</span>
      </span>
    )
  }

  const renderMenu = () => {
    if (!state.render_menu) return ''

    return (
      <TripMenu
        trip={props.trip}
        on_menu_open={() => {
          setState({...state, on_click_active: false})
        }}
        on_menu_closed={() => {
          setState({...state, on_click_active: true})
        }}
        on_trip_cancelled={(id) => {
          setState({...state, trip_cancel_sent: true, trip_rendered: false})
        }}
        on_request_cancelled={(id) => {
          setState({...state, request_cancel_sent: true, trip_rendered: false})
        }}
      />
    )
  }

  const getImage = (user) => {
    return user?.display_image ? user.display_image : missingImg
  }

  const {trip} = props
  console.log(trip)
  const user = trip.relationships.profile.user.attributes

  let mouse_enter_cb = () => {}
  let mouse_leave_cb = () => {}

  if (props.onMouseEnter) {
    mouse_enter_cb = () => props.onMouseEnter(trip)
  }
  if (props.onMouseLeave) {
    mouse_leave_cb = () => props.onMouseLeave()
  }

  const link_to = {
    pathname: '/ride/' + trip.id,
    state: {},
  }
  const on_click_cb = (e) => {
    if (
      state.on_click_active &&
      !e.target.className.includes('MuiDialog-container')
    )
      window.location = link_to.pathname
  }

  return (
    <div
      className="trip-box card"
      onMouseEnter={mouse_enter_cb}
      onMouseLeave={mouse_leave_cb}
      onClick={on_click_cb}>
      <div className="flex-field web">
        <div className="content-flex">
          <div className="main">
            <div className="left-box pl0">
              <Link to={link_to} target="_self" className="trip-tab">
                <div className="user-img-container">
                  <img
                    className="responsive-img user-img"
                    src={getImage(user)}
                    alt=""
                    loading="lazy"
                  />
                </div>
              </Link>
              <div style={{justifyContent: 'center', display: 'flex'}}>
                {`${trip.relationships.profile.user.attributes.first_name}`}'s
                Ride
              </div>
            </div>
            <div className="right-box">
              {renderMenu()}
              <p className="heading">{trip.attributes.name}</p>
              <div className="mr10">
                <span className="label">
                  <span className="label">event: </span>
                  <span className="user-val">
                    {trip.attributes.event_name}
                  </span>{' '}
                  &nbsp;
                </span>
                {renderStatus(trip.attributes)}
                <span className="drive-label-box">
                  <span
                    className="drive-box-text"
                    style={{
                      color:
                        trip.attributes.drive_type === 'commute'
                          ? '#004085'
                          : '#856404',
                      background:
                        trip.attributes.drive_type === 'commute'
                          ? '#cce5ff'
                          : '#fff3cd',
                    }}>
                    {trip.attributes.drive_type === 'commute'
                      ? 'Commute'
                      : 'Adventure'}
                  </span>
                </span>
              </div>
              <div className="avb-seat">
                <span className="seat-left">
                  Seats Left: {trip.attributes.available_seats}
                </span>
              </div>
              <div className="top-section clearfix">
                <div className="reviews-rating center mt5">
                  <StarRatingComponent
                    name="average_rating"
                    starCount={5}
                    value={user?.average_rating || 0}
                    editing={false}
                  />
                  <span className="rating-count">({user?.rating_count})</span>
                </div>

                <div className="row">
                  <div className="col s4 l4 pl0">
                    <div className="item-label">price</div>
                    <div className="item-value">${trip.attributes.price}</div>
                  </div>
                  <div className="col s4 l4">
                    <div className="item-label">miles</div>
                    <div className="item-value">
                      {trip.attributes.total_distance}
                    </div>
                  </div>
                  <div className="col s4 l4">
                    <div className="item-label">duration</div>
                    <div className="item-value">
                      {trip.attributes.modified_duration}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="row bottom-section">
            <div className="col s6 l6 sep-section">
              <div className="detailsHeading">DEPARTURE</div>
              <div className="location">
                <i className="fa fa-map-marker icon" />{' '}
                {trip.attributes.modified_start_location}
              </div>
              <i className="fa fa-long-arrow-right separator-icon"></i>
              <div className="travel-date">
                <span className="user-val">{trip.attributes.start_date}</span>
              </div>
            </div>
            <div className="col s6 l6 sep-section">
              <div className="detailsHeading">ARRIVAL</div>
              <div className="location">
                <i className="fa fa-map-marker icon" />{' '}
                {trip.attributes.destination}
              </div>
              <div className="travel-date">
                <div className="user-val">{trip.attributes.finish_date}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-field mob">
        <div className="card-header">
          <div className="trip-name">{trip.attributes.name}</div>
        </div>
        <div className="row">
          <div className="col s5">
            <div className="avatar-container">
              <img
                className="responsive-img user-img"
                src={getImage(user)}
                alt=""
              />
            </div>
            <div className="driver-name">
              <span>{user?.name ? user.name : 'Deleted User'}</span>
            </div>
          </div>
          <div className="col s7">
            <div className="event">{trip.attributes.event_name}</div>
            {renderMenu()}
            <div className="seatLeft">
              <span className="seats">
                {' '}
                {`Seats left: ${trip.attributes.available_seats}`}{' '}
              </span>
              {renderStatus(trip.attributes)}
              <span className="drive-label-box">
                <span
                  className="drive-box-text"
                  style={{
                    color:
                      trip.attributes.drive_type === 'commute'
                        ? '#004085'
                        : '#856404',
                    background:
                      trip.attributes.drive_type === 'commute'
                        ? '#cce5ff'
                        : '#fff3cd',
                  }}>
                  {trip.attributes.drive_type === 'commute'
                    ? 'Commute'
                    : 'Adventure'}
                </span>
              </span>
            </div>
            <div className="reviews-rating clearfix mt10">
              <StarRatingComponent
                name="average_rating"
                starCount={5}
                value={user.average_rating || 0}
                editing={false}
              />
              <span className="rating-count">({user.rating_count})</span>
            </div>
            <div className="clearfix mt10 mob-trip-specs">
              <div className="col s3">
                <div className="item-label">Price</div>
                <div className="item-value">${trip.attributes.price}</div>
              </div>
              <div className="col s3">
                <div className="item-label">Miles</div>
                <div className="item-value">
                  {trip.attributes.total_distance}
                </div>
              </div>
              <div className="col s6">
                <div className="item-label">Duration</div>
                <div className="item-value">
                  {trip.attributes.modified_duration}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom-section">
          <div className="row">
            <div className="col s6 sep-section">
              <div className="address">
                <i className="fa fa-map-marker icon" />{' '}
                {trip.attributes.modified_start_location}
              </div>
              <div className="time-text">{trip.attributes.start_date}</div>
              <i className="fa fa-long-arrow-right separator-icon"></i>
            </div>
            <div className="col s6 sep-section">
              <div className="address">
                <i className="fa fa-map-marker icon" />{' '}
                {trip.attributes.modified_destination}
              </div>
              <div className="time-text">{trip.attributes.finish_date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripCard
