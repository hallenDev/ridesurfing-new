import _ from 'underscore'
import { GET_TRIP_REQUESTS, GET_TRIP_REQUEST, CREATE_TRIP_REQUEST, GET_TRIP_REQUEST_ERRORS,
  ACCEPT_TRIP_REQUEST, RESET_TRIP_REQUEST_FLAGS, GET_RECEIVED_TRIP_REQUESTS,
  IGNORE_TRIP_REQUEST, CANCEL_TRIP_REQUEST, RESET_DATA_LOADED
} from '../actions/TripRequestActions'

const initialState = { tripRequests: [], receivedTripRequests: [], tripRequest: {}, errors: [], isSaved: false, isDeleted: false, isCancelled: false,
 dataLoaded: false }

const TripRequestReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TRIP_REQUESTS:
      return Object.assign({}, state, {
        tripRequests: action.tripRequests,
        dataLoaded: true
      })

    case GET_RECEIVED_TRIP_REQUESTS:
      return Object.assign({}, state, {
        receivedTripRequests: action.receivedTripRequests,
        dataLoaded: true
      })

    case CREATE_TRIP_REQUEST:
      state.tripRequests.splice(0, 0, action.tripRequest)

      return Object.assign({}, state, {
        tripRequest: action.tripRequest,
        tripRequests: state.tripRequests,
        isSaved: true
      })

    case GET_TRIP_REQUEST:
      return Object.assign({}, state, {
        tripRequest: action.tripRequest
      })

    case GET_TRIP_REQUEST_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors
      })

    case ACCEPT_TRIP_REQUEST:
      return Object.assign({}, state, {
        receivedTripRequests: _.without(state.receivedTripRequests, _.findWhere(state.receivedTripRequests, { id: action.tripRequest.id })),
        errors: []
      })

    case IGNORE_TRIP_REQUEST:
      return Object.assign({}, state, {
        receivedTripRequests: _.without(state.receivedTripRequests, _.findWhere(state.receivedTripRequests, { id: action.tripRequest.id })),
        errors: []
      })

    case CANCEL_TRIP_REQUEST:
      return Object.assign({}, state, {
        tripRequests: _.without(state.tripRequests, _.findWhere(state.tripRequests, { id: action.tripRequest.id })),
        isCancelled: true,
        errors: []
      })

    case RESET_TRIP_REQUEST_FLAGS:
      return Object.assign({}, state, {
        errors: [],
        isSaved: false,
        isDeleted: false,
        isCancelled: false,
        tripRequest: {}
      })

    case RESET_DATA_LOADED:
      return Object.assign({}, state, {
        dataLoaded: false,
      })

    default:
      return state
  }
}

export const getTripRequests = state => state.tripRequests.tripRequests
export const getReceivedTripRequests = state => state.tripRequests.receivedTripRequests
export const getTripRequest = state => state.tripRequests.tripRequest
export const getTripRequestErrors = state => state.tripRequests.errors
export const getTripRequestSaved = state => state.tripRequests.isSaved
export const getTripRequestCancelled = state => state.tripRequests.isCancelled
export const getTripRequestDeleted = state => state.tripRequests.isDeleted
export const getDataLoaded = state => state.tripRequests.dataLoaded

export default TripRequestReducer
