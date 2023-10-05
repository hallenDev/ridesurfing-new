import callApi from "../util/apiCaller";

export const GET_REVIEWS = "GET_REVIEWS";
export const GET_REVIEW = "GET_REVIEW";
export const UPDATE_REVIEW = "UPDATE_REVIEW";
export const RESET_REVIEW_FLAGS = "RESET_REVIEW_FLAGS";
export const RESET_DATA_LOADED = "RESET_DATA_LOADED";
export const GET_REVIEW_ERRORS = "GET_REVIEW_ERRORS";
export const SET_PROCESSING = "SET_PROCESSING";

function getReviews(res) {
  return {
    type: GET_REVIEWS,
    reviews: res.data,
  };
}

function getReview(res) {
  return {
    type: GET_REVIEW,
    review: res.data,
  };
}

function updateReview(res) {
  return {
    type: UPDATE_REVIEW,
    review: res.data,
  };
}

function resetReviewFlags() {
  return {
    type: RESET_REVIEW_FLAGS,
  };
}

function resetDataLoaded() {
  return {
    type: RESET_DATA_LOADED,
  };
}

function getReviewErrors(data) {
  return {
    type: GET_REVIEW_ERRORS,
    errors: data.errors || {},
    error: data.error || "",
  };
}

function setProcessing() {
  return {
    type: SET_PROCESSING,
  };
}

export function getReviewsRequest() {
  return (dispatch) => {
    return callApi(`reviews.json`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getReviewErrors(res));
      } else {
        dispatch(getReviews(res));
      }
    });
  };
}

export function getReviewRequest(reviewId) {
  return (dispatch) => {
    return callApi(`reviews/${reviewId}`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getReviewErrors(res));
      } else {
        dispatch(getReview(res));
      }
    });
  };
}

export function updateReviewRequest(reviewId, params) {
  return (dispatch) => {
    return callApi(`reviews/${reviewId}`, "put", params).then((res) => {
      if (res.errors) {
        dispatch(getReviewErrors(res));
      } else {
        dispatch(updateReview(res));
      }
    });
  };
}

export function resetReviewFlagRequest() {
  return (dispatch) => {
    dispatch(resetReviewFlags());
  };
}

export function resetDataLoadedRequest() {
  return (dispatch) => {
    dispatch(resetDataLoaded());
  };
}

export function setProcessingRequest() {
  return (dispatch) => {
    dispatch(setProcessing());
  };
}
