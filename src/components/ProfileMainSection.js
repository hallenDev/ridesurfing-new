import _ from 'underscore'
import React, { Component } from 'react'
import StarRatingComponent from 'react-star-rating-component'
import Carousel from 'nuka-carousel'

import findRide from '../images/EYT.png'
import smoke from '../images/smoke.jpg'
import pet from '../images/pet.jpg'
import kid from '../images/kid.jpg'
import heater from '../images/ac-heater.jpg'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getProfileErrors } from '../reducers/ProfileReducer'
import { getCurrentUser } from '../reducers/SessionReducer'

const ProfileMainSection = (props) => {

  const goToProfile = (user) =>  {
    const { history } = props
    history.push(`/profile/${user.attributes.slug || user.id}`)
  }

  const renderTestimonials = (user) => {
    const { reviews } = user.relationships
    const { currentUser } = props
    if (reviews.length > 0) {
      return <Carousel autoplay={true} className="testimonial-carousel">
        {_.map(reviews, (review, index) => {
          return <div className="rating-block" key={`review-${index}`}>
            <a href={review.reviewer_id === currentUser.id ? `/my_profile` : `/profile/${review.reviewer_slug || review.reviewer_id}`}>
              <img className="img-circle user-img" alt="" src={review.reviewer_image || findRide} />
            </a>
            <div className="feedback">
              <a href={review.reviewer_id === currentUser.id ? `/my_profile` : `/profile/${review.reviewer_slug || review.reviewer_id}`} className="name">{review.reviewer}</a><br/>
              <StarRatingComponent
                name="average_rating"
                starCount={5}
                value={review.total}
                editing={false}
              />
              <p className="rating-content">
                {review.testimonial}<br/>
                <small> {review.timestamp} ago</small>
              </p>
            </div>
          </div>
        })}
      </Carousel>
    } else {
      return <div className="rating-block">No Testimonials</div>
    }
  }

  const { profile, user } = props
  const userInfo = profile.attributes

  return (
    <div className="profile-main-section">
      {!!userInfo && <div className="user-info">
        <div className="row">
          <div className="col s12">
            <h5>About Me</h5>
            <p className="details">{userInfo.bio}</p>
          </div>
        </div>
        <div className="row">
          <div className="col s12 m6">
            <h5>Personal Information</h5>
            <table className="table table-user-information">
              <tbody>
                <tr>
                  <td className="info-label"><b>Age</b></td>
                  <td className="info-val">{user.age || user.attributes.age}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Gender</b></td>
                  <td className="info-val capitalize">{user.gender || user.attributes.gender}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Education Level</b></td>
                  <td className="info-val">{userInfo.education}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Occupation</b></td>
                  <td className="info-val">{userInfo.occupation}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Relationship</b></td>
                  <td className="info-val capitalize">{userInfo.relationship_status}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Kids</b></td>
                  <td className="info-val">{userInfo.kids ? 'Yes' : (userInfo.kids == false) ? 'No' : '' }</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col s12 offset-m1 m5 user-preferences">
            <h5>User preferences</h5>
            <span className="preference-icon-wrapper" data-toggle="tooltip" data-placement="bottom" title="Smoking Friendly">
              <img src={smoke} alt="" className="preference-icon"/>
              {!!userInfo.smoking && <i className="fa fa-check success"></i>}
              {!userInfo.smoking && <i className="fa fa-times danger"></i>}
            </span>
            <span className="preference-icon-wrapper" data-toggle="tooltip" data-placement="bottom" title="Pet Friendly">
              <img src={pet} alt="" className="preference-icon"/>
              {!!userInfo.pets && <i className="fa fa-check success"></i>}
              {!userInfo.pets && <i className="fa fa-times danger"></i>}
            </span>
            <span className="preference-icon-wrapper" data-toggle="tooltip" data-placement="bottom" title="Kid Friendly">
              <img src={kid} alt="" className="preference-icon"/>
              {!!userInfo.kid_friendly && <i className="fa fa-check success"></i>}
              {!userInfo.kid_friendly && <i className="fa fa-times danger"></i>}
            </span>
            <span className="preference-icon-wrapper" data-toggle="tooltip" data-placement="bottom" title="AC/Heater">
              <img src={heater} alt="" className="preference-icon"/>
              {!!userInfo.car_ac && <i className="fa fa-check success"></i>}
              {!userInfo.car_ac && <i className="fa fa-times danger"></i>}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col s12">
            <h5 className="mt40 mb20">Users Testimonials/Feedback</h5>
            {renderTestimonials(user)}
          </div>
        </div>
      </div>}
    </div>
  )
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    profileErrors: getProfileErrors(state),
  }
}

function mapDispatchToProps (dispatch) {
  const { getCurrentUserRequest, getProfileRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        getProfileRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileMainSection)
