import _ from 'underscore'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StarRatingComponent from 'react-star-rating-component'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'

import missingImg from '../images/missing.png'
import useSessionStore from '../store/SessionStore';
import useReviewStore from '../store/ReviewStore';

const ReviewForm = (props) => {

  const sessionStore = useSessionStore();
  const reviewStore = useReviewStore();

  const reviewErrors = reviewStore.errors;
  const dataLoaded = reviewStore.dataLoaded;
  const reviews = reviewStore.reviews;
  const review = reviewStore.review;
  const currentUser = sessionStore.currentUser;
  const reviewUpdated = reviewStore.isUpdated;
  const isProcessing = reviewStore.isProcessing;

  
  const initial_state = {
    rating: 1,
    reviewId: props.match.params.reviewId,
    reviewData: {},
    dataLoaded: false,
    isProcessing: false
  };

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    const { history } = props;
    if (reviewErrors && reviewErrors.review) {
      alert('Invalid URL')
      reviewStore.resetReviewFlagRequest()
      reviewStore.getReviewsRequest()
      history.push('/reviews')
    }
  }, [reviewErrors])

  useEffect(() => {
    const { history } = props;
    if (reviewUpdated) {
      reviewStore.resetReviewFlagRequest()
      reviewStore.getReviewsRequest()
      history.push('/reviews')
    }
  }, [reviewUpdated])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({ ...state, isProcessing: isProcessing })
    }
  }, [isProcessing])
    
  if (!localStorage.accessToken) {
    localStorage.setItem('prevUrl', `/review/${this.props.match.params.reviewId}`)
    return window.location.href = `/login`
  }

  reviewStore.getReviewRequest(state.reviewId)

  const getImage = (user) => {
    return user.attributes.display_image ? user.attributes.display_image : missingImg
  }

  const onFieldChange = (fieldName, value) => {
    const { reviewData } = state
    let tmp = JSON.parse(JSON.stringify(reviewData));
    tmp[fieldName] = value
    setState({ 
      ...state, 
      reviewData: tmp
    })
  }

  const onValueChange = (fieldName, event) => {
    const { reviewData } = state
    let tmp = JSON.parse(JSON.stringify(reviewData));
    tmp[fieldName] = event.target.value
    setState({ 
      ...state, 
      reviewData: tmp
    })
  }

  const setRadioValue = (fieldName, event) => {
    const { reviewData } = state
    let tmp = JSON.parse(JSON.stringify(reviewData));
    tmp[fieldName] = event.target.value
    setState({ 
      ...state, 
      reviewData: tmp
    })
  }

  const errorMessageFor = (fieldName) => {
    if (reviewErrors && reviewErrors[fieldName])
      return reviewErrors[fieldName]
  }

  const sendReviewRequest = (review) => {
    const { reviewData } = state
    setState({ 
      ...state, 
      isProcessing: true 
    })

    if (review.attributes.for_driver) {
      _.extend(reviewData, {
        value: reviewData.trip_value
      })
    }

    reviewStore.updateReviewRequest(review.id, reviewData)
  }

  const { reviewData } = state
  const { trip, user } = review.relationships
  return (
    <div className="review-form-page">
      <div className="container">
        <div className="mt20 ml10">
          <Link to="/reviews" className="back-link"><i className="fa fa-arrow-left back-icon"/> Back</Link>
        </div>
        <hr className="mb0"/>
        <div className="row mb0">
          <div className="col l4 s12 user-section">
            <div className="user-img-container">
              <img src={getImage(user)} className="user-img responsive-img" alt="" />
            </div>
            <h5 className=" center-align mb10">{user.attributes.name}</h5>
            <h6 className=" center-align">Age: {user.attributes.age} yrs</h6>
            <div className="center-align">
              <StarRatingComponent
                name="average_rating"
                starCount={5}
                value={parseInt(user.attributes.average_rating)}
                editing={false}
              />
            </div>
            <hr className="hr-line mb20" />
            <h5 className="mb20 mt10 center-align">{trip.attributes.name}</h5>
            <div className="row">
              <div className="col s6 l6 sep-section">
                <div className="dep-section">
                  <div className="detailsHeading">DEPARTURE</div>
                  <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.modified_start_location}</div>
                  <i className="fa fa-long-arrow-right separator-icon"></i>
                  <div className="travel-date">
                    <span className="user-val">{trip.attributes.start_date}</span>
                  </div>
                </div>
              </div>
              <div className="col s6 l6 sep-section">
                <div className="ariv-section">
                  <div className="detailsHeading">ARRIVAL</div>
                  <div className="location"><i className="fa fa-map-marker icon"/> {trip.attributes.modified_destination}</div>
                  <div className="travel-date">
                    <div className="user-val">{trip.attributes.finish_date}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col l8 s12 right-container">
            <div className="right-section">
              <div className="que-section">
                <div className="ques">
                  Overall Experience
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="overall_rating"
                    value={reviewData.overall_rating || 0}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, val) => onFieldChange('overall_rating', nextValue)}
                  />
                </div>
              </div>
              <div className="que-section">
                <div className="ques">
                  { review.attributes.for_driver? "Was the Driver timely with the posted or otherwise agreed upon departure and arrival time?" : "Was the Ridesurfer timely with the agreed upon departure and arrival time?"}
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="departure"
                    value={reviewData.departure || 0}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('departure', nextValue)}
                  />
                  <span className='error'>{errorMessageFor('departure')}</span>
                </div>
              </div>
              <div className="que-section">
                <div className="ques">
                  { review.attributes.for_driver? "Did you feel comfortable with this Driver?" : "Did you feel comfortable with this Ridesurfer?" }
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="social"
                    value={reviewData.social || 0}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('social', nextValue)}
                  />
                  <span className='error'>{errorMessageFor('social')}</span>
                </div>
              </div>
              <div className="que-section">
                <div className="ques">
                  { review.attributes.for_driver? "Did the cleanliness and scent of the vehicle match your expectations?" : "How would your rate the etiquette and cleanliness of the Ridesurfer?" }
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="cleanliness"
                    value={reviewData.cleanliness || 0}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('cleanliness', nextValue)}
                  />
                  <span className='error'>{errorMessageFor('cleanliness')}</span>
                </div>
              </div>
              <div className="que-section">
                <div className="ques">
                  { review.attributes.for_driver? "How smooth was the pick-up and drop-off process, within control of the Driver?" : "Did this ride meet your expectations for what it was advertised to be?" }
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="pickup"
                    value={reviewData.pickup || 0}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('pickup', nextValue)}
                  />
                </div>
              </div>
              <div className="que-section">
                <div className="ques">
                  { review.attributes.for_driver ? "How responsive and accessible was the Driver before your trip?" : "How responsive and accessible was the Ridesurfer before your trip?" }
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="communication"
                    value={reviewData.communication}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('communication', nextValue)}
                  />
                </div>
              </div>
              {!!review.attributes.for_driver && <div className="que-section">
                <div className="ques">
                  Did you feel that the vehicle was safe and in good operating condition?
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="maintenance"
                    value={reviewData.maintenance}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('maintenance', nextValue)}
                  />
                </div>
              </div>}
              {!!review.attributes.for_driver && <div className="que-section">
                <div className="ques">
                  Was the trip reasonably priced (1=Overpriced, 5=fair)?
                </div>
                <div className="ml30">
                  <StarRatingComponent
                    name="trip_value"
                    value={reviewData.trip_value}
                    starCount={5}
                    editing={true}
                    size={30}
                    className="star-rating"
                    onStarClick={(nextValue, prevValue, name) => onFieldChange('trip_value', nextValue)}
                  />
                </div>
              </div>}
              <div className="que-section">
                <div className="ques">
                  { review.attributes.for_driver? "Please provide your overall driver experience feedback" : "Please provide your overall Ridesurfer experience feedback" }
                </div>
                <div className="ml30">
                  <TextField
                    className='text-field'
                    id='about'
                    placeholder="Tell us more about driver"
                    type='text'
                    multiline={true}
                    rowsMax="4"
                    rows={2}
                    margin="normal"
                    onChange={(event) => onValueChange('testimonial', event)}
                  />
                </div>
              </div>
              <div className="que-section">
                <div className="ques">
                  Is there anything Ridesurfing can do to improve your experience?
                </div>
                <div className="ml30">
                  <TextField
                    className='text-field'
                    id='about'
                    placeholder="Tell us more about ridesurfing"
                    type='text'
                    multiline={true}
                    rowsMax="4"
                    rows={2}
                    margin="normal"
                    onChange={(event) => onValueChange('feedback', event)}
                  />
                </div>
              </div>
              <div className="que-section">
                <div className="ml30">
                  <FormControl component="fieldset">
                    <div className="label">Would you recommend Ridesurfing to others?</div>
                    <RadioGroup
                      aria-label="Gender"
                      name="gender1"
                      className="radioContainer"
                      value={reviewData.recommendation || 0}
                      onChange={(event) => setRadioValue('recommendation', event)}
                    >
                      <FormControlLabel
                        className="formControl"
                        value="yes"
                        control={<Radio className="radio-btn" color="primary"/>}
                        label={<div className="label-text">Yes</div>}
                      />
                      <FormControlLabel
                        className="Control"
                        value="no"
                        control={<Radio color="primary"/>}
                        label={<div className="label-text">No</div>}
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
              </div>
              <div className="mt40 ml30">
                <Button
                  variant="contained"
                  color='primary'
                  className='sub-btn'
                  disabled={!!state.isProcessing}
                  onClick={() => sendReviewRequest(review)}
                >
                  {state.isProcessing ? "Please Wait": "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default (ReviewForm)
