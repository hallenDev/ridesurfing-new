import callApi from "../util/apiCaller";

export const GET_CHAT_USERS = "GET_CHAT_USERS";
export const GET_CHATS = "GET_CHATS";
export const UPDATE_CHAT = "UPDATE_CHAT";
export const UPDATE_ALL_CHATS = "UPDATE_ALL_CHATS";
export const GET_CHAT_ERRORS = "GET_CHAT_ERRORS";
export const RESET_CHAT_FLAGS = "RESET_CHAT_FLAGS";
export const RESET_DATA_LOADED = "RESET_DATA_LOADED";

function getChatUsers(res) {
  return {
    type: GET_CHAT_USERS,
    users: res.data,
  };
}

function getChats(res) {
  return {
    type: GET_CHATS,
    chats: res.chats,
    user: res.user,
  };
}

function updateChat(res) {
  return {
    type: UPDATE_CHAT,
    chat: res.data,
  };
}

function updateAllChats(data) {
  return {
    type: UPDATE_ALL_CHATS,
  };
}

function getChatErrors(data) {
  return {
    type: GET_CHAT_ERRORS,
    errors: data.errors || {},
    error: data.error || "",
  };
}

function resetChatFlags() {
  return {
    type: RESET_CHAT_FLAGS,
  };
}

function resetDataLoaded() {
  return {
    type: RESET_DATA_LOADED,
  };
}

export function getChatUsersRequest() {
  return (dispatch) => {
    return callApi(`chats.json`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getChatErrors(res));
      } else {
        dispatch(getChatUsers(res));
      }
    });
  };
}

export function getDirectChatUserRequest(userId, mark_read = false) {
  return (dispatch) => {
    return callApi(`chats/receiver/${userId}.json?mark_read=${mark_read}`).then(
      (res) => {
        dispatch(getChats(res));
      }
    );
  };
}

export function sendChatRequest(params) {
  return (dispatch) => {
    return callApi(`chats.json`, "post", params).then((res) => {
      if (res.errors) {
        dispatch(getChatErrors(res));
      } else {
        dispatch(updateChat(res));
      }
    });
  };
}

export function updateAllChatsRequest() {
  return (dispatch) => {
    return callApi(`chats/update_all.json`, "put").then((res) => {
      if (res.errors) {
        dispatch(getChatErrors(res));
      } else {
        dispatch(updateAllChats(res));
      }
    });
  };
}

export function resetChatsFlagRequest() {
  return (dispatch) => {
    dispatch(resetChatFlags());
  };
}

export function resetDataLoadedRequest() {
  return (dispatch) => {
    dispatch(resetDataLoaded());
  };
}
