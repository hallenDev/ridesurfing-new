import { GET_REVIEWS, GET_REVIEW, UPDATE_REVIEW, RESET_REVIEW_FLAGS, GET_REVIEW_ERRORS, RESET_DATA_LOADED, SET_PROCESSING } from '../actions/ReviewActions'
import { notify } from 'react-notify-toast'

const initialState = { reviews: [], review: {attributes: {}, relationships: {rated_by: { attributes: {} }, user: { attributes: {} }, trip: { attributes: {} }}}, errors: [], isUpdated: false, dataLoaded: false, isProcessing: false }


const ReviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REVIEWS:
      return Object.assign({}, state, {
        reviews: action.reviews,
        dataLoaded: true
      })

    case UPDATE_REVIEW:
      notify.show('Thanks for sharing your reviews.', 'success')
      return Object.assign({}, state, {
        review: action.review,
        isUpdated: true,
        isProcessing: false
      })

    case GET_REVIEW:
      return Object.assign({}, state, {
        review: action.review,
        isProcessing: false
      })

    case GET_REVIEW_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors,
        isProcessing: false
      })

    case RESET_REVIEW_FLAGS:
      return Object.assign({}, state, {
        errors: [],
        isUpdated: false,
        isProcessing: false
      })

    case RESET_DATA_LOADED:
      return Object.assign({}, state, {
        dataLoaded: false,
      })

    case SET_PROCESSING:
      return Object.assign({}, state, {
        isProcessing: true,
      })

    default:
      return state
  }
}

export const getReviews = state => state.reviews.reviews
export const getReview= state => state.reviews.review
export const getReviewUpdated = state => state.reviews.isUpdated
export const getDataLoaded = state => state.reviews.dataLoaded
export const getReviewErrors = state => state.reviews.errors
export const getIsProcessing = state => state.reviews.isProcessing

export default ReviewReducer
