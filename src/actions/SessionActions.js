import callApi from "../util/apiCaller";

export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";
export const GET_CURRENT_USER = "GET_CURRENT_USER";
export const UPDATE_CURRENT_USER = "UPDATE_CURRENT_USER";
export const GET_CURRENT_USER_ERRORS = "GET_CURRENT_USER_ERRORS";
export const RESET_CURRENT_USER_FLAGS = "RESET_CURRENT_USER_FLAGS";
export const CHANGE_USER_PASSWORD = "CHANGE_USER_PASSWORD";
export const GET_SAVED_PROFILE = "GET_SAVED_PROFILE";
export const GET_SAVED_ACCOUNT = "GET_SAVED_ACCOUNT";
export const GET_PROFILE_ERRORS = "GET_PROFILE_ERRORS";
export const RESET_PROFILE_FLAGS = "RESET_PROFILE_FLAGS";
export const CAR_MAKE_LIST = "CAR_MAKE_LIST";
export const GET_UPLOADED_IMAGE_PROFILE = "GET_UPLOADED_IMAGE_PROFILE";
export const SOCIAL_LOGIN_ERRORS = "SOCIAL_LOGIN_ERRORS";
export const NOTIFICATION_COUNT = "NOTIFICATION_COUNT";
export const RESEND_EMAIL_VERIFICATION = "RESEND_EMAIL_VERIFICATION";
export const RESET_DATA_LOADED = "RESET_DATA_LOADED";
export const SET_PROCESSING = "SET_PROCESSING";
export const RESET_PROCESSING = "RESET_PROCESSING";

function login(res) {
  const { token } = res.data.attributes;

  return {
    type: LOGIN,
    accessToken: token,
  };
}

function loginErr() {
  return {
    type: LOGIN,
    loggedIn: false,
    errors: "Invalid Credentials",
  };
}

function currentUserLoginErr() {
  return {
    type: LOGIN,
    loggedIn: false,
    errors: null,
  };
}

function logout(res) {
  return {
    type: LOGOUT,
  };
}

function getCurrentUser(res) {
  return {
    type: GET_CURRENT_USER,
    currentUser: res.data,
  };
}

function updateCurrentUser(res) {
  return {
    type: UPDATE_CURRENT_USER,
    currentUser: res.data,
  };
}

function getUserErrors(data) {
  return {
    type: GET_CURRENT_USER_ERRORS,
    errors: data.errors || {},
  };
}

function resetCurrentUserFlags() {
  return {
    type: RESET_CURRENT_USER_FLAGS,
  };
}

function changeUserPassword(res) {
  return {
    type: CHANGE_USER_PASSWORD,
  };
}

function getProfileErrors(data) {
  return {
    type: GET_PROFILE_ERRORS,
    errors: data.errors || {},
  };
}

function getSavedProfile(res, profile = false, accountUpdated = false) {
  return {
    type: GET_SAVED_PROFILE,
    currentUser: res.data,
    profile: profile,
    accountUpdated: accountUpdated,
  };
}

function getSavedAccount(res, profile = false, accountUpdated = false) {
  return {
    type: GET_SAVED_ACCOUNT,
    currentUser: res.data,
    profile: profile,
    accountUpdated: accountUpdated,
  };
}

function resetProfileFlags() {
  return {
    type: RESET_PROFILE_FLAGS,
  };
}

function carMakeList(data) {
  return {
    type: CAR_MAKE_LIST,
    data,
  };
}

function getUploadedImageProfile(res, imageDeleted = false) {
  return {
    type: GET_UPLOADED_IMAGE_PROFILE,
    currentUser: res.data,
    imageDeleted,
  };
}

function socialLoginErrors(data) {
  return {
    type: SOCIAL_LOGIN_ERRORS,
  };
}

function setNotificationCount(hash) {
  return {
    type: NOTIFICATION_COUNT,
    notificationCount: hash.count,
    chatsCount: hash.chat_count,
  };
}

function resetDataLoaded() {
  return {
    type: RESET_DATA_LOADED,
  };
}

function setProcessing(processType) {
  return {
    type: SET_PROCESSING,
    processType,
  };
}

function resetProcessing() {
  return {
    type: RESET_PROCESSING,
  };
}

function resendEmailVerification(data) {
  return {
    type: RESEND_EMAIL_VERIFICATION,
  };
}

export function loginRequest(email, password) {
  return (dispatch) => {
    return callApi(`login`, "post", { email, password }).then((res) => {
      if (!res || res.errors) {
        dispatch(loginErr());
      } else {
        dispatch(login(res));
      }

      return res;
    });
  };
}

export function logoutRequest() {
  return (dispatch) => {
    return callApi(`logout`, "delete").then((res) => {
      dispatch(logout(res));
    });
  };
}

export function getCurrentUserRequest() {
  return (dispatch) => {
    return callApi(`users/current`).then((res) => {
      if (res.errors) {
        dispatch(currentUserLoginErr());
      } else {
        dispatch(getCurrentUser(res));
      }
    });
  };
}

export function updateUserRequest(userId, user) {
  return (dispatch) => {
    return callApi(`users/${userId}`, "put", { user }).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(updateCurrentUser(res));
      }
    });
  };
}

export function changeUserPasswordRequest(params) {
  return (dispatch) => {
    return callApi(`sessions/update_password`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(changeUserPassword(res));
      }
    });
  };
}

export function resetCurrentUserFlagsRequest() {
  return (dispatch) => {
    dispatch(resetCurrentUserFlags());
  };
}

export function saveProfileRequest(profileId, profile) {
  return (dispatch) => {
    return callApi(`profiles/${profileId}`, "put", profile).then((res) => {
      if (res.errors) {
        dispatch(getProfileErrors(res));
      } else {
        dispatch(getSavedProfile(res, profile));
      }
    });
  };
}

export function resetProfileFlagsRequest() {
  return (dispatch) => {
    dispatch(resetProfileFlags());
  };
}

export function carMakeListRequest() {
  return (dispatch) => {
    return callApi(`car_make_list`).then((res) => {
      dispatch(carMakeList(res));
    });
  };
}

export function socialLoginRequest(social_type, token, email) {
  return (dispatch) => {
    return callApi(`sessions/check_provider.json`, "post", {
      social_type,
      token,
      email,
    }).then((res) => {
      if (res && res.data) {
        dispatch(login(res));
      } else {
        dispatch(socialLoginErrors(res));
      }

      return res;
    });
  };
}

export function saveAccountRequest(account_params, address_params, ip) {
  return (dispatch) => {
    return callApi(`users/save_account`, "post", {
      account_params,
      address_params,
      ip,
    }).then((res) => {
      if (res.errors) {
        dispatch(getProfileErrors(res));
      } else {
        dispatch(getSavedAccount(res, { is_driver: true }, true));
      }
    });
  };
}

export function uploadProfileImageRequest(image_type, file) {
  return (dispatch) => {
    return callApi(`profiles/image/upload`, "post", {
      image_type,
      file,
    }).then((res) => {
      if (res.errors) {
        dispatch(getProfileErrors(res));
      } else {
        dispatch(getUploadedImageProfile(res));
      }
    });
  };
}

export function deleteProfileImageRequest(imageId) {
  return (dispatch) => {
    return callApi(`profiles/image/${imageId}/delete`, "delete").then((res) => {
      if (res.errors) {
        dispatch(getProfileErrors(res));
      } else {
        dispatch(getSavedProfile(res, true));
      }
    });
  };
}

export function resendEmailVerificationRequest(params) {
  return (dispatch) => {
    return callApi(`users/resend_email.json`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(resendEmailVerification(res));
      }
    });
  };
}

export function setNotificationCountRequest(hash) {
  return (dispatch) => {
    return dispatch(setNotificationCount(hash));
  };
}

export function resetDataLoadedRequest() {
  return (dispatch) => {
    dispatch(resetDataLoaded());
  };
}

export function setProcessingRequest(processType = null) {
  return (dispatch) => {
    dispatch(setProcessing(processType));
  };
}

export function setAccountProcessingRequest(processType = null) {
  return (dispatch) => {
    dispatch(setProcessing(processType));
  };
}

export function resetProcessingRequest() {
  return (dispatch) => {
    dispatch(resetProcessing());
  };
}
