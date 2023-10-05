import callApi from "../util/apiCaller";

export const LOGIN = "LOGIN";
export const CREATE_USER = "CREATE_USER";
export const GET_USER = "GET_USER";
export const GET_USER_ERRORS = "GET_USER_ERRORS";
export const FORGOT_PASSWORD = "FORGOT_PASSWORD";
export const GET_OTP_ERROR = "GET_OTP_ERROR";
export const RESET_PASSWORD = "RESET_PASSWORD";
export const RESET_USER_FLAGS = "RESET_USER_FLAGS";
export const VERIFY_OTP_REQUEST = "VERIFY_OTP_REQUEST";
export const SET_PROCESSING = "SET_PROCESSING";

function loginUser(res) {
  const { token } = res.data.attributes;
  return {
    type: LOGIN,
    accessToken: token,
  };
}

function createUser(res) {
  return {
    type: CREATE_USER,
    user: res.data,
  };
}

function getUser(res) {
  return {
    type: GET_USER,
    user: res.data,
  };
}

function getUserErrors(res) {
  return {
    type: GET_USER_ERRORS,
    errors: res.errors || {},
  };
}

function forgotPassword(res) {
  return {
    type: FORGOT_PASSWORD,
  };
}

function resetPassword(res) {
  return {
    type: RESET_PASSWORD,
  };
}

function resetUserFlags() {
  return {
    type: RESET_USER_FLAGS,
  };
}

function verifyOtp(data) {
  return {
    type: VERIFY_OTP_REQUEST,
  };
}

function setProcessing() {
  return {
    type: SET_PROCESSING,
  };
}

export function createUserRequest(user) {
  return (dispatch) => {
    return callApi(`signup`, "post", { user }).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(createUser(res));
        dispatch(loginUser(res));
      }

      return res;
    });
  };
}

export function getUserRequest(userId) {
  return (dispatch) => {
    return callApi(`users/${userId}`).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(getUser(res));
      }
    });
  };
}

export function forgotPasswordRequest(identity) {
  return (dispatch) => {
    return callApi(`users/resend_otp`, "post", { identity }).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(forgotPassword(res));
      }
    });
  };
}

export function resetPasswordRequest(otp, password) {
  return (dispatch) => {
    return callApi(`users/reset_password`, "put", { otp, password }).then(
      (res) => {
        if (res.errors) {
          dispatch(getUserErrors(res));
        } else {
          dispatch(resetPassword(res));
        }
      }
    );
  };
}

export function verifyOtpRequest(params) {
  return (dispatch) => {
    return callApi(`users/verify_otp.json`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getUserErrors(res));
      } else {
        dispatch(verifyOtp(res));
      }
    });
  };
}

export function resetUserFlagsRequest() {
  return (dispatch) => {
    return dispatch(resetUserFlags());
  };
}

export function setProcessingRequest() {
  return (dispatch) => {
    dispatch(setProcessing());
  };
}
