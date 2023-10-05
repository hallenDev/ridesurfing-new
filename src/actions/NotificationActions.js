import callApi from "../util/apiCaller";

export const GET_NOTIFICATIONS = "GET_NOTIFICATIONS";
export const GET_NOTIFICATION = "GET_NOTIFICATION";
export const UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION";
export const UPDATE_ALL_NOTIFICATIONS = "UPDATE_ALL_NOTIFICATIONS";
export const GET_NOTIFICATION_ERRORS = "GET_NOTIFICATION_ERRORS";
export const RESET_NOTIFICATION_FLAGS = "RESET_NOTIFICATION_FLAGS";

function getNotifications(res) {
  return {
    type: GET_NOTIFICATIONS,
    notifications: res.data,
  };
}

function getNotification(res) {
  return {
    type: GET_NOTIFICATION,
    notification: res.data,
  };
}

function updateNotification(res) {
  return {
    type: UPDATE_NOTIFICATION,
    notifications: res.data,
  };
}

function updateAllNotifications(data) {
  return {
    type: UPDATE_ALL_NOTIFICATIONS,
  };
}

function getNotificationErrors(data) {
  return {
    type: GET_NOTIFICATION_ERRORS,
    errors: data.errors || {},
    error: data.error || "",
  };
}

function resetNotificationFlags() {
  return {
    type: RESET_NOTIFICATION_FLAGS,
  };
}

export function getNotificationsRequest() {
  return (dispatch) => {
    return callApi(`notifications.json`).then((res) => {
      if (res.error || res.errors) {
        dispatch(getNotificationErrors(res));
      } else {
        dispatch(getNotifications(res));
      }
    });
  };
}

export function getNotificationRequest(notificationId) {
  return (dispatch) => {
    return callApi(`notifications/${notificationId}.json`).then((res) => {
      dispatch(getNotification(res));
    });
  };
}

export function updateNotificationRequest(notificationId) {
  return (dispatch) => {
    return callApi(`notifications/${notificationId}.json`, "put").then(
      (res) => {
        if (res.errors) {
          dispatch(getNotificationErrors(res));
        } else {
          dispatch(updateNotification(res));
        }
      }
    );
  };
}

export function updateAllNotificationsRequest() {
  return (dispatch) => {
    return callApi(`notifications/update_all.json`, "put").then((res) => {
      if (res.errors) {
        dispatch(getNotificationErrors(res));
      } else {
        dispatch(updateAllNotifications(res));
      }
    });
  };
}

export function resetNotificationsFlagRequest() {
  return (dispatch) => {
    dispatch(resetNotificationFlags());
  };
}
