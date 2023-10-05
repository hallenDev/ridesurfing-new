import callApi from '../util/apiCaller'

export const GET_PROFILE = 'GET_PROFILE'
export const GET_PROFILE_ERRORS = 'GET_PROFILE_ERRORS'

function getProfile (data) {
  return {
    type: GET_PROFILE,
    data
  }
}

export function getProfileRequest (profileId) {
  return (dispatch) => {
    return callApi(``).then(res => {
      dispatch(getProfile(res))
    })
  }
}
