import { GET_PROFILE, GET_PROFILE_ERRORS } from '../actions/ProfileActions'

const initialState = { data: { user: { profile: {} } }, errors: [] }

const ProfileReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PROFILE:
      return Object.assign({}, state, {
        data: action.data
      })

    case GET_PROFILE_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors
      })

    default:
      return state
  }
}

export const getProfile = state => state.profiles.data
export const getProfileErrors = state => state.profiles.errors

export default ProfileReducer
