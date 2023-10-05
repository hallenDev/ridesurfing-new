import { GET_NOTIFICATIONS, GET_NOTIFICATION, UPDATE_NOTIFICATION, UPDATE_ALL_NOTIFICATIONS,
  GET_NOTIFICATION_ERRORS, RESET_NOTIFICATION_FLAGS
} from '../actions/NotificationActions'

const initialState = { notifications: [], notification: {}, errors: [], isSaved: false, isDeleted: false, dataLoaded: false }

const NotificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NOTIFICATIONS:
      return Object.assign({}, state, {
        notifications: action.notifications,
        dataLoaded: true
      })

    case UPDATE_NOTIFICATION:
      return Object.assign({}, state, {
        notifications: action.notifications,
        isSaved: true
      })

    case GET_NOTIFICATION:
      return Object.assign({}, state, {
        notification: action.notification,
        dataLoaded: true
      })

    case GET_NOTIFICATION_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors
      })

    case UPDATE_ALL_NOTIFICATIONS:
      return Object.assign({}, state, {
        notifications: action.notifications,
        dataLoaded: true
      })

    case RESET_NOTIFICATION_FLAGS:
      return Object.assign({}, state, {
        errors: [],
        isSaved: false,
        isDeleted: false,
        dataLoaded: false,
        notification: {}
      })

    default:
      return state
  }
}

export const getNotifications = state => state.notifications.notifications
export const getNotification = state => state.notifications.notification
export const getNotificationErrors = state => state.notifications.errors
export const getNotificationSaved = state => state.notifications.isSaved
export const getNotificationsDataLoaded = state => state.notifications.dataLoaded

export default NotificationReducer
