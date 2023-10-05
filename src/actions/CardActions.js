import callApi from "../util/apiCaller";

export const GET_CARDS = "GET_CARDS";
export const GET_CARD = "GET_CARD";
export const CREATE_CARD = "CREATE_CARD";
export const UPDATE_CARD = "UPDATE_CARD";
export const DELETE_CARD = "DELETE_CARD";
export const SET_AS_PRIMARY_CARD = "SET_AS_PRIMARY_CARD";
export const GET_CARD_ERRORS = "GET_CARD_ERRORS";
export const RESET_CARD_FLAGS = "RESET_CARD_FLAGS";
export const SET_PROCESSING = "SET_PROCESSING";
export const SET_CARD_PROCESSING = "SET_CARD_PROCESSING";

function getCards(res) {
  return {
    type: GET_CARDS,
    cards: res.data,
  };
}

function getCard(data) {
  return {
    type: GET_CARD,
    card: data,
  };
}

function createCard(res) {
  return {
    type: CREATE_CARD,
    card: res.data,
  };
}

function updateCard(res) {
  return {
    type: UPDATE_CARD,
    card: res.data,
  };
}

function deleteCard(data) {
  return {
    type: DELETE_CARD,
  };
}

function setAsPrimaryCard(res) {
  return {
    type: SET_AS_PRIMARY_CARD,
    cards: res.data,
  };
}

function getCardErrors(data) {
  return {
    type: GET_CARD_ERRORS,
    errors: data.errors || {},
    error: data.error || "",
  };
}

function resetCardFlags() {
  return {
    type: RESET_CARD_FLAGS,
  };
}

function setProcessing() {
  return {
    type: SET_PROCESSING,
  };
}

function setCardProcessing() {
  return {
    type: SET_CARD_PROCESSING,
  };
}

export function getCardsRequest() {
  return (dispatch) => {
    return callApi(`cards`, "get").then((res) => {
      if (res.error || res.errors) {
        dispatch(getCardErrors(res));
      } else {
        dispatch(getCards(res));
      }
    });
  };
}

export function getCardRequest(cardId) {
  return (dispatch) => {
    return callApi(`cards/${cardId}`, "get").then((res) => {
      dispatch(getCard(res));
    });
  };
}

export function createCardRequest(params) {
  return (dispatch) => {
    return callApi(`cards`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getCardErrors(res));
      } else {
        dispatch(createCard(res));
      }
    });
  };
}

export function updateCardRequest(cardId, params) {
  return (dispatch) => {
    return callApi(`cards/${cardId}`, "put", params).then((res) => {
      if (res.errors) {
        dispatch(getCardErrors(res));
      } else {
        dispatch(updateCard(res));
      }
    });
  };
}

export function deleteCardRequest(cardId) {
  return (dispatch) => {
    return callApi(`cards/${cardId}`, "delete").then((res) => {
      if (res.errors) {
        dispatch(getCardErrors(res));
      } else {
        dispatch(deleteCard(res));
      }
    });
  };
}

export function setAsPrimaryCardRequest(cardId, params) {
  return (dispatch) => {
    return callApi(`cards/${cardId}/set_as_primary`, "put", params).then(
      (res) => {
        if (res.errors) {
          dispatch(getCardErrors(res));
        } else {
          dispatch(setAsPrimaryCard(res));
        }
      }
    );
  };
}

export function resetCardsFlagRequest() {
  return (dispatch) => {
    dispatch(resetCardFlags());
  };
}

export function setProcessingRequest() {
  return (dispatch) => {
    dispatch(setProcessing());
  };
}

export function setCardProcessingRequest() {
  return (dispatch) => {
    dispatch(setCardProcessing());
  };
}
