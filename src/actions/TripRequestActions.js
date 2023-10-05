import callApi from "../util/apiCaller";
import { notify } from "react-notify-toast";

export const GET_TRIP_REQUESTS = "GET_TRIP_REQUESTS";
export const GET_TRIP_REQUEST = "GET_TRIP_REQUEST";
export const GET_RECEIVED_TRIP_REQUESTS = "GET_RECEIVED_TRIP_REQUESTS";
export const CREATE_TRIP_REQUEST = "CREATE_TRIP_REQUEST";
export const ACCEPT_TRIP_REQUEST = "ACCEPT_TRIP_REQUEST";
export const IGNORE_TRIP_REQUEST = "IGNORE_TRIP_REQUEST";
export const CANCEL_TRIP_REQUEST = "CANCEL_TRIP_REQUEST";
export const DELETE_TRIP_REQUEST = "DELETE_TRIP_REQUEST";
export const GET_TRIP_REQUEST_ERRORS = "GET_TRIP_REQUEST_ERRORS";
export const RESET_TRIP_REQUEST_FLAGS = "RESET_TRIP_REQUEST_FLAGS";
export const RESET_DATA_LOADED = "RESET_DATA_LOADED";

function getTripRequests(res) {
  return {
    type: GET_TRIP_REQUESTS,
    tripRequests: res.data,
  };
}

function getReceivedTripRequests(res) {
  return {
    type: GET_RECEIVED_TRIP_REQUESTS,
    receivedTripRequests: res.data,
  };
}

function getTripRequest(data) {
  return {
    type: GET_TRIP_REQUEST,
    tripRequest: data,
  };
}

function createTripRequest(res) {
  return {
    type: CREATE_TRIP_REQUEST,
    tripRequest: res.data,
  };
}

function acceptTripRequest(res) {
  return {
    type: ACCEPT_TRIP_REQUEST,
    tripRequest: res.data,
  };
}

function ignoreTripRequest(res) {
  return {
    type: IGNORE_TRIP_REQUEST,
    tripRequest: res.data,
  };
}

function cancelTripRequest(res) {
  notify.show("Your request has been cancelled.", "success");
  return {
    type: CANCEL_TRIP_REQUEST,
    tripRequest: res.data,
  };
}

function getTripRequestErrors(data) {
  return {
    type: GET_TRIP_REQUEST_ERRORS,
    errors: data.errors || {},
    error: data.error || "",
  };
}

function resetTripRequestFlags() {
  return {
    type: RESET_TRIP_REQUEST_FLAGS,
  };
}

function resetDataLoaded() {
  return {
    type: RESET_DATA_LOADED,
  };
}

export function getTripRequestsRequest() {
  return (dispatch) => {
    return callApi(`trip_requests/current`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getTripRequestErrors(res));
      } else {
        dispatch(getTripRequests(res));
      }
    });
  };
}

export function getReceivedTripRequestsRequest() {
  return (dispatch) => {
    return callApi(`trip_requests`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getTripRequestErrors(res));
      } else {
        dispatch(getReceivedTripRequests(res));
      }
    });
  };
}

export function getTripRequestRequest(tripRequestId) {
  return (dispatch) => {
    return callApi(`trip_requests/${tripRequestId}`).then((res) => {
      dispatch(getTripRequest(res));
    });
  };
}

export function createTripRequestRequest(params) {
  return (dispatch) => {
    return callApi(`trip_requests`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getTripRequestErrors(res));
      } else {
        dispatch(createTripRequest(res));
      }
    });
  };
}

export function acceptTripRequestRequest(tripRequestId) {
  return (dispatch) => {
    return callApi(`trip_requests/${tripRequestId}/accept`).then((res) => {
      if (res.errors) {
        dispatch(getTripRequestErrors(res));
      } else {
        dispatch(acceptTripRequest(res));
      }
    });
  };
}

export function ignoreTripRequestRequest(tripRequestId) {
  return (dispatch) => {
    return callApi(`trip_requests/${tripRequestId}/ignore`).then((res) => {
      if (res.errors) {
        dispatch(getTripRequestErrors(res));
      } else {
        dispatch(ignoreTripRequest(res));
      }
    });
  };
}

export function cancelTripRequestRequest(tripRequestId) {
  return (dispatch) => {
    return callApi(`trip_requests/${tripRequestId}/cancel`, "delete").then(
      (res) => {
        if (res.errors) {
          dispatch(getTripRequestErrors(res));
        } else {
          dispatch(cancelTripRequest(res));
        }
      }
    );
  };
}

export function resetTripRequestsFlagRequest() {
  return (dispatch) => {
    dispatch(resetTripRequestFlags());
  };
}

export function resetDataLoadedRequest() {
  return (dispatch) => {
    dispatch(resetDataLoaded());
  };
}
