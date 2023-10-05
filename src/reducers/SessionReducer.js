import {
  LOGIN,
  LOGOUT,
  GET_CURRENT_USER,
  UPDATE_CURRENT_USER,
  GET_CURRENT_USER_ERRORS,
  RESET_CURRENT_USER_FLAGS,
  CHANGE_USER_PASSWORD,
  GET_SAVED_PROFILE,
  GET_SAVED_ACCOUNT,
  GET_PROFILE_ERRORS,
  RESET_PROFILE_FLAGS,
  CAR_MAKE_LIST,
  SOCIAL_LOGIN_ERRORS,
  GET_UPLOADED_IMAGE_PROFILE,
  NOTIFICATION_COUNT,
  RESET_DATA_LOADED,
  SET_PROCESSING,
  RESET_PROCESSING,
  RESEND_EMAIL_VERIFICATION,
} from "../actions/SessionActions";

import { notify } from "react-notify-toast";

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  loggedIn: !!(localStorage.getItem("accessToken") || null),
  errors: "",
  currentUser: {
    attributes: {},
    relationships: { profile: { attributes: {}, user: {} }, reviews: [] },
  },
  userUpdated: false,
  userErrors: {},
  socialLoginError: false,
  passwordUpdated: false,
  profileSaved: false,
  profileErrors: {},
  carMakeList: {},
  imageDeleted: false,
  imageUploaded: false,
  notificationCount: 0,
  chatsCount: 0,
  dataLoaded: false,
  isProcessing: false,
  resendEmailVerification: false,
  accountUpdated: false,
  getIsCarImageProcessing: false,
  isPayoutProcessing: false,
};

const SessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      if (action.accessToken) {
        localStorage.setItem(`accessToken`, action.accessToken);
      }

      return Object.assign({}, state, {
        accessToken: action.accessToken,
        loggedIn: !!action.accessToken,
        errors: action.errors,
        isProcessing: false,
        isCarImageProcessing: false,
        isPayoutProcessing: false,
      });

    case LOGOUT:
      localStorage.removeItem(`accessToken`);
      return Object.assign({}, state, {
        loggedIn: false,
        accessToken: null,
      });

    case NOTIFICATION_COUNT:
      if (action.chatsCount > 0) {
        document.title = `(${action.chatsCount}) Ridesurfing - Peer to Peer Road Tripping Community`;
      } else {
        document.title = `Ridesurfing - Peer to Peer Road Tripping Community`;
      }
      return Object.assign({}, state, {
        notificationCount: action.notificationCount,
        chatsCount: action.chatsCount,
      });

    case GET_CURRENT_USER:
      return Object.assign({}, state, {
        currentUser: action.currentUser,
        notificationCount:
          action.currentUser.attributes.unread_notifications_count,
        chatsCount: action.currentUser.attributes.chat_count,
        loggedIn: true,
      });

    case UPDATE_CURRENT_USER:
      notify.show("Information has been updated", "success");
      return Object.assign({}, state, {
        currentUser: action.currentUser,
        userUpdated: true,
      });

    case GET_CURRENT_USER_ERRORS:
      return Object.assign({}, state, {
        userErrors: action.errors,
        userUpdated: false,
        isProcessing: false,
        isCarImageProcessing: false,
        isPayoutProcessing: false,
      });

    case RESET_CURRENT_USER_FLAGS:
      return Object.assign({}, state, {
        userErrors: {},
        userUpdated: false,
        passwordUpdated: false,
        socialLoginError: false,
        resendEmailVerification: false,
        accountUpdated: false,
        imageUploaded: false,
      });

    case RESEND_EMAIL_VERIFICATION:
      return Object.assign({}, state, {
        resendEmailVerification: true,
      });

    case CHANGE_USER_PASSWORD:
      notify.show("Your password has been updated", "success");
      return Object.assign({}, state, {
        passwordUpdated: true,
      });

    case GET_SAVED_PROFILE:
      if (
        action.profile &&
        !action.profile.is_rider &&
        !action.profile.is_driver
      )
        notify.show("Information has been saved.", "success");
      return Object.assign({}, state, {
        currentUser: action.currentUser,
        profileErrors: {},
        profileSaved: true,
        isProcessing: false,
        isCarImageProcessing: false,
        accountUpdated: action.accountUpdated,
      });

    case GET_SAVED_ACCOUNT:
      return Object.assign({}, state, {
        currentUser: action.currentUser,
        profileErrors: {},
        profileSaved: true,
        isPayoutProcessing: false,
        accountUpdated: action.accountUpdated,
      });

    case GET_PROFILE_ERRORS:
      return Object.assign({}, state, {
        profileErrors: action.errors,
        profileSaved: false,
        isProcessing: false,
        isCarImageProcessing: false,
        isPayoutProcessing: false,
      });

    case SOCIAL_LOGIN_ERRORS:
      return Object.assign({}, state, {
        socialLoginError: true,
      });

    case RESET_PROFILE_FLAGS:
      return Object.assign({}, state, {
        profileErrors: {},
        profileSaved: false,
        isProcessing: false,
        isCarImageProcessing: false,
        accountUpdated: false,
      });

    case GET_UPLOADED_IMAGE_PROFILE:
      return Object.assign({}, state, {
        currentUser: action.currentUser,
        imageUploaded: true,
        imageDeleted: action.imageDeleted || false,
        isProcessing: false,
        isCarImageProcessing: false,
        isPayoutProcessing: false,
      });

    case CAR_MAKE_LIST:
      return Object.assign({}, state, {
        carMakeList: action.data,
      });

    case SET_PROCESSING:
      return Object.assign({}, state, {
        isProcessing: action.processType === "display" ? true : false,
        isCarImageProcessing: action.processType === "car" ? true : false,
        isPayoutProcessing: action.processType === "payout" ? true : false,
      });

    case RESET_PROCESSING:
      return Object.assign({}, state, {
        isProcessing: false,
        isCarImageProcessing: false,
        isPayoutProcessing: false,
      });

    case RESET_DATA_LOADED:
      return Object.assign({}, state, {
        dataLoaded: false,
      });

    default:
      return state;
  }
};

export const getLoggedIn = (state) => state.sessions.loggedIn;
export const getErrors = (state) => state.sessions.errors;
export const getCurrentUser = (state) => state.sessions.currentUser;
export const getUserUpdated = (state) => state.sessions.userUpdated;
export const getCurrentUserErrors = (state) => state.sessions.userErrors;
export const getPasswordUpdated = (state) => state.sessions.passwordUpdated;
export const getProfileErrors = (state) => state.sessions.profileErrors;
export const getProfileSaved = (state) => state.sessions.profileSaved;
export const getAccountUpdated = (state) => state.sessions.accountUpdated;
export const getCarMakeList = (state) => state.sessions.carMakeList;
export const getSocialLoginError = (state) => state.sessions.socialLoginError;
export const getImageUploaded = (state) => state.sessions.imageUploaded;
export const getImageDeleted = (state) => state.sessions.imageDeleted;
export const getNotificationCount = (state) => state.sessions.notificationCount;
export const getResendEmailVerification = (state) =>
  state.sessions.resendEmailVerification;
export const getChatsCount = (state) => state.sessions.chatsCount;
export const getDataLoaded = (state) => state.sessions.dataLoaded;
export const getIsProcessing = (state) => state.sessions.isProcessing;
export const getIsCarImageProcessing = (state) =>
  state.sessions.isCarImageProcessing;
export const getIsPayoutProcessing = (state) =>
  state.sessions.isPayoutProcessing;

export default SessionReducer;
