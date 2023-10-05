import callApi from "../util/apiCaller";

export const GET_TRIPS = "GET_TRIPS";
export const GET_SEARCHED_TRIPS = "GET_SEARCHED_TRIPS";
export const GET_SEARCHED_TRIP_IDS = "GET_SEARCHED_TRIP_IDS";
export const GET_TRIP = "GET_TRIP";
export const CREATE_TRIP = "CREATE_TRIP";
export const UPDATE_TRIP = "UPDATE_TRIP";
export const DELETE_TRIP = "DELETE_TRIP";
export const BOOK_TRIP = "BOOK_TRIP";
export const GET_TRIP_ERRORS = "GET_TRIP_ERRORS";
export const RESET_TRIP_FLAGS = "RESET_TRIP_FLAGS";
export const RESET_DATA_LOADED = "RESET_DATA_LOADED";
export const CANCEL_TRIP = "CANCEL_TRIP";
export const SET_PROCESSING = "SET_PROCESSING";

function getTrips(res) {
  return {
    type: GET_TRIPS,
    trips: res.data,
    pagination: res.pagination,
  };
}

function getSearchedTrips(res) {
  return {
    type: GET_SEARCHED_TRIPS,
    searchedTrips: res.data,
    similarTrips: res.similar,
    pagination: res.pagination,
    allTrips: res.all_trips,
  };
}

function getSearchedTripIds(res) {
  return {
    type: GET_SEARCHED_TRIP_IDS,
    searchedTrips: res.data,
    similarTrips: res.similar,
    pagination: res.pagination,
    allTrips: res.all_trips,
    waypoints: res.waypoints,
  };
}

function getTrip(res) {
  return {
    type: GET_TRIP,
    trip: res.data,
  };
}

function createTrip(res) {
  return {
    type: CREATE_TRIP,
    trip: res.data,
  };
}

function updateTrip(res) {
  return {
    type: UPDATE_TRIP,
    trip: res.data,
  };
}

function bookTrip(data) {
  return {
    type: BOOK_TRIP,
  };
}

function deleteTrip(data) {
  return {
    type: DELETE_TRIP,
  };
}

function getTripErrors(data) {
  return {
    type: GET_TRIP_ERRORS,
    errors: data.errors || {},
    error: data.error || "",
  };
}

function resetTripFlags() {
  return {
    type: RESET_TRIP_FLAGS,
  };
}

function resetDataLoaded() {
  return {
    type: RESET_DATA_LOADED,
  };
}

function cancelTrip(res) {
  return {
    type: CANCEL_TRIP,
    trip: res.data,
  };
}

function setProcessing() {
  return {
    type: SET_PROCESSING,
  };
}

export function getTripsRequest(page = 1) {
  return (dispatch) => {
    return callApi(`trips/current?page=${page}`, "get").then((res) => {
      if (res.error || res.errors) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(getTrips(res));
      }
    });
  };
}

export function loadTripsRequest() {
  return (dispatch) => {
    return callApi(`trips`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(getSearchedTrips(res));
      }
    });
  };
}

export function searchTripsRequest(query = {}, page = 1) {
  return (dispatch) => {
    return callApi(`trips/search?page=${page}`, "post", query).then((res) => {
      if (res && (res.error || res.errors)) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(getSearchedTrips(res));
      }
    });
  };
}

export function searchTripIdsRequest(query = {}, page = 1, waypoints = true) {
  return (dispatch) => {
    const no_waypoints = waypoints ? "" : "&no_waypoints=1";
    return callApi(
      `trips/search?page=${page}${no_waypoints}`,
      "post",
      query
    ).then((res) => {
      if (res && (res.error || res.errors)) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(getSearchedTripIds(res));
      }
    });
  };
}

export function getTripRequest(tripId) {
  return (dispatch) => {
    return callApi(`trips/${tripId}`).then((res) => {
      if (res && !res.error && !res.errors) {
        dispatch(getTrip(res));
      } else {
        dispatch(getTripErrors(res || { error: "Trip not found" }));
      }
    });
  };
}

export function getTripInfoRequest(tripId) {
  return (dispatch) => {
    return callApi(`trips/trip/${tripId}`, "get").then((res) => {
      if (res && !res.error && !res.errors) {
        dispatch(getTrip(res));
        return res;
      } else {
        dispatch(getTripErrors(res || { error: "Trip not found" }));
      }
    });
  };
}

export function createTripRequest(params) {
  return (dispatch) => {
    return callApi(`trips`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(createTrip(res));
      }
    });
  };
}

export function updateTripRequest(tripId, params) {
  return (dispatch) => {
    return callApi(`trips/${tripId}.json`, "put", params).then((res) => {
      if (res.errors) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(updateTrip(res));
      }
    });
  };
}

export function bookTripRequest(tripId, params) {
  return (dispatch) => {
    return callApi(`trips/${tripId}/trip_requests`, "post", params).then(
      (res) => {
        if (res.errors) {
          dispatch(getTripErrors(res));
        } else {
          dispatch(bookTrip(res));
        }
      }
    );
  };
}

export function deleteTripRequest(tripId) {
  return (dispatch) => {
    return callApi(`trips/${tripId}`, "delete").then((res) => {
      if (res.errors) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(deleteTrip(res));
      }
    });
  };
}

export function resetTripFlagRequest() {
  return (dispatch) => {
    dispatch(resetTripFlags());
  };
}

export function resetDataLoadedRequest() {
  return (dispatch) => {
    dispatch(resetDataLoaded());
  };
}

export function cancelTripRequest(tripId) {
  return (dispatch) => {
    return callApi(`trips/${tripId}/cancel`, "delete").then((res) => {
      if (res.errors) {
        dispatch(getTripErrors(res));
      } else {
        dispatch(cancelTrip(res));
      }
    });
  };
}

export function setProcessingRequest() {
  return (dispatch) => {
    dispatch(setProcessing());
  };
}
