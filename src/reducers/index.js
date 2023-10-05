import { combineReducers } from 'redux'
import users from './UserReducer'
import sessions from './SessionReducer'
import profiles from './ProfileReducer'
import cards from './CardReducer'
import trips from './TripReducer'
import tripRequests from './TripRequestReducer'
import notifications from './NotificationReducer'
import reviews from './ReviewReducer'
import chats from './ChatReducer'

const rootReducer = combineReducers({
  sessions,
  users,
  profiles,
  cards,
  trips,
  tripRequests,
  notifications,
  reviews,
  chats
})

export default rootReducer
