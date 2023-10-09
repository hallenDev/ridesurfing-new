import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import StarRatingComponent from 'react-star-rating-component'

import missingImg from '../images/missing.png'

const TripTab = (props) => {

  const getImage = (user) => {
    return !!user.attributes.display_image ? user.attributes.display_image : missingImg
  }

  const { trip } = props
  const { profile } = trip.relationships
  const { user } = profile

  return (
    <Link to={`/ride/${trip.attributes.slug || trip.id}`} className="trip-tab">
      <div className="card web">
        <div className="main">
          <div className="left-box pl0">
            <div className="user-img-container">
              <img className="responsive-img user-img" src={getImage(user)} alt="" />
            </div>

            <div className="reviews-rating center mt5">
              <StarRatingComponent
                name="average_rating"
                starCount={5}
                value={user.attributes.average_rating || 0}
                editing={false}
              />
              <span className="rating-count">({user.attributes.rating_count})</span>
            </div>
          </div>
          <div className="right-box">
            <p className="heading">{trip.attributes.name}</p>
            <div className="mr10">
              <span className="label">
                <span className="label">event: </span>
                <span className="user-val">{trip.attributes.event_name}</span> &nbsp;
              </span>
              <span className="drive-label-box">
                <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                  {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                </span>
              </span>
            </div>
            <div className="avb-seat">
              <span className="seat-left">Seats Left: {trip.attributes.available_seats}</span>
            </div>
            <div className="top-section clearfix">
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
            <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.destination}</div>
            <div className="travel-date">
              <div className="user-val">{trip.attributes.finish_date}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card mob">
        <div className="card-header">
          <div className="trip-name">{trip.attributes.name}</div>
        </div>
        <div className="row">
          <div className="col s5">
            <div className="avatar-container">
              <img className="responsive-img user-img" src={getImage(user)} alt="" />
            </div>
            <div className="driver-name">
              <span>{user.attributes.name}</span>
            </div>
          </div>
          <div className="col s7">
            <div className="event">{trip.attributes.event_name}</div>
            <div className="seatLeft">
              Seats left<span className="seats"> {trip.attributes.available_seats}</span>
              <span className="drive-label-box">
                <span className="drive-box-text" style={{color: (trip.attributes.drive_type === 'commute' ? '#004085' : '#856404'), background: (trip.attributes.drive_type === 'commute' ? '#cce5ff' : '#fff3cd')}}>
                  {trip.attributes.drive_type === 'commute' ? 'Commute' : 'Adventure'}
                </span>
              </span>
            </div>
            <div className="reviews-rating clearfix mt10">
              <StarRatingComponent
                name="average_rating"
                starCount={5}
                value={user.attributes.average_rating || 0}
                editing={false}
              />
              <span className="rating-count">({user.attributes.rating_count})</span>
            </div>
            <div className="clearfix mt10 mob-trip-specs">
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
      </div>
    </Link>
  )
}

export default withRouter(TripTab)
