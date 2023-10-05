import {
  CREATE_USER,
  GET_USER,
  GET_USER_ERRORS,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  GET_OTP_ERROR,
  RESET_USER_FLAGS,
  VERIFY_OTP_REQUEST,
  SET_PROCESSING,
} from "../actions/UserActions";
import { notify } from "react-notify-toast";

const initialState = {
  user: {
    attributes: {},
    relationships: { profile: { attributes: {}, user: {} }, reviews: [] },
  },
  errors: [],
  isSaved: false,
  isReset: false,
  otpError: "",
  codeSent: false,
  emailVerified: false,
  isProcessing: false,
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_USER:
      return Object.assign({}, state, {
        user: action.user,
        isSaved: true,
        errors: [],
        isProcessing: false,
      });

    case GET_USER:
      return Object.assign({}, state, {
        user: action.user,
        errors: [],
        isProcessing: false,
      });

    case GET_USER_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors,
        isProcessing: false,
      });

    case FORGOT_PASSWORD:
      notify.show(
        "We have sent a verification code on your registered mobile number or email.",
        "success"
      );
      return Object.assign({}, state, {
        codeSent: true,
        isProcessing: false,
      });

    case RESET_PASSWORD:
      notify.show("Your password has been reset successfully.", "success");
      return Object.assign({}, state, {
        isReset: true,
        isProcessing: false,
      });

    case GET_OTP_ERROR:
      return Object.assign({}, state, {
        otpError: action.otpError,
        isProcessing: false,
      });

    case VERIFY_OTP_REQUEST:
      notify.show("Your email has been verified. Please login.", "success");
      return Object.assign({}, state, {
        emailVerified: true,
        isProcessing: false,
      });

    case RESET_USER_FLAGS:
      return Object.assign({}, state, {
        isSaved: false,
        codeSent: false,
        isReset: false,
        emailVerified: false,
        isProcessing: false,
        errors: [],
        otpError: "",
      });

    case SET_PROCESSING:
      return Object.assign({}, state, {
        isProcessing: true,
      });

    default:
      return state;
  }
};

export const getUser = (state) => state.users.user;
export const getUserSaved = (state) => state.users.isSaved;
export const getUserErrors = (state) => state.users.errors;
export const getOtpError = (state) => state.users.otpError;
export const getCodeSent = (state) => state.users.codeSent;
export const getEmailVerified = (state) => state.users.emailVerified;
export const getResetPassword = (state) => state.users.isReset;
export const getIsProcessing = (state) => state.users.isProcessing;

export default UserReducer;
