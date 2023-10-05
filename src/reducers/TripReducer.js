import { GET_TRIPS, GET_TRIP, CREATE_TRIP, CANCEL_TRIP, GET_TRIP_ERRORS, DELETE_TRIP,
  UPDATE_TRIP, RESET_TRIP_FLAGS, GET_SEARCHED_TRIPS, GET_SEARCHED_TRIP_IDS, BOOK_TRIP, RESET_DATA_LOADED, SET_PROCESSING
} from '../actions/TripActions'

const initialState = { 
  allTrips: [], 
  trips: [], 
  searchedTrips: [], 
  similarTrips: [],
  waypoints:[],
  errors: [], 
  isSaved: false, 
  dataLoaded: false, 
  isDeleted: false, 
  isCompleted: false, 
  isBooked: false, 
  isProcessing: false,
  error: '',
  trip: {
    attributes: {}, relationships: {
      profile: {
        user: { attributes: {}, relationships: { reviews: {} }}
      }
    }
  }, isCancelled: false, pagination: {current_page: 1, per_page: 5, total_pages: 1, total_count: 5}
}

const TripReducer = (state = initialState, action) => {
  console.log(action.type)
  switch (action.type) {
    case GET_TRIPS:
      return Object.assign({}, state, {
        trips: action.trips,
        pagination: action.pagination,
        dataLoaded: true,
        isProcessing: false
      })

    case GET_SEARCHED_TRIPS:
      return Object.assign({}, state, {
        searchedTrips: action.searchedTrips,
        similarTrips: action.similarTrips,
        allTrips: action.allTrips,
        pagination: action.pagination,
        dataLoaded: true,
        isProcessing: false
      })    
    case GET_SEARCHED_TRIP_IDS:
      return Object.assign({}, state, {
        searchedTrips: action.searchedTrips,
        similarTrips: action.similarTrips,
        allTrips: action.allTrips,
        pagination: action.pagination,
        waypoints: action.waypoints,
        dataLoaded: true,
        isProcessing: false
      })
      
    case GET_SEARCHED_TRIP_IDS:
      return Object.assign({}, state, {
        searchedTrips: action.searchedTrips,
        similarTrips: action.similarTrips,
        allTrips: action.allTrips,
        pagination: action.pagination,
        dataLoaded: true,
        isProcessing: false
      })

    case CREATE_TRIP:
      state.trips.splice(0, 0, action.trip)

      return Object.assign({}, state, {
        trip: action.trip,
        trips: state.trips,
        isSaved: true,
        isProcessing: false
      })

    case UPDATE_TRIP:
      return Object.assign({}, state, {
        trip: action.trip,
        isCompleted: true,
        isProcessing: false
      })

    case CANCEL_TRIP:
      return Object.assign({}, state, {
        trip: action.trip,
        isCancelled: true,
        isProcessing: false
      })

    case GET_TRIP:
      return Object.assign({}, state, {
        trip: action.trip,
        isProcessing: false
      })

    case GET_TRIP_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors,
        error: action.error,
        isProcessing: false
      })

    case BOOK_TRIP:
      return Object.assign({}, state, {
        isBooked: true,
        isProcessing: false
      })

    case DELETE_TRIP:
      return Object.assign({}, state, {
        isDeleted: true,
      })

    case RESET_TRIP_FLAGS:
      return Object.assign({}, state, {
        errors: [],
        error: '',
        isSaved: false,
        isBooked: false,
        isCompleted: false,
        isDeleted: false,
        isCancelled: false,
        isProcessing: false,
        trip: { attributes: {}, relationships: { trip_requests: [], profile: { user: { attributes: {}, relationships: { reviews: [] } } }, attributes: {}, relationships: {} } }
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

export const getTrips = state => state.trips.trips
export const getAllTrips = state => state.trips.allTrips
export const getSearchedTrips = state => state.trips.searchedTrips
export const getSearchedTripIds = state => state.trips.searchedTrips
export const getSimilarTrips = state => state.trips.similarTrips
export const getPagination = state => state.trips.pagination
export const getTrip = state => state.trips.trip
export const getWaypoints = state => state.trips.waypoints
export const getTripError = state => state.trips.error
export const getTripErrors = state => state.trips.errors
export const getTripSaved = state => state.trips.isSaved
export const getTripCancelled = state => state.trips.isCancelled
export const getTripBooked = state => state.trips.isBooked
export const getTripCompleted = state => state.trips.isCompleted
export const getTripDeleted = state => state.trips.isDeleted
export const getDataLoaded = state => state.trips.dataLoaded
export const getIsProcessing = state => state.trips.isProcessing

export default TripReducer
