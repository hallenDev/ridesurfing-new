import { GET_TRIP } from '../actions/TripActions'

const initialState = { 
  trip: {},
  loaded: false
}

const TripCardReducer = (state = initialState, action) => {
  console.log(action.type)
  switch (action.type) {
    case GET_TRIP:
      return Object.assign({}, state, {
        trip: action.trip,
        dataLoaded: true
      })

    default:
      return state
  }
}

export const getDataLoaded = state => state.trips.dataLoaded

export default TripCardReducer
