import { create } from 'zustand';
import callApi from "../util/apiCaller";

const useNotificationStore = create((set) =>({
    notifications: [], 
    notification: {}, 
    errors: [], 
    isSaved: false, 
    isDeleted: false, 
    dataLoaded: false,

    getNotificationsRequest: () => {
        callApi(`notifications.json`).then((res) => {
            if (res.error || res.errors) {
                set ({errors: res.errors})
            } else {
                set({
                    notifications: res.data,
                    dataLoaded: true
                })
            }
        });
    },
    getNotificationRequest: (notificationId) => {
        callApi(`notifications/${notificationId}.json`).then((res) => {
            // dispatch(getNotification(res));
            set({
                notification: res.data,
                dataLoaded: true
            })
        });
    },
    updateNotificationRequest: (notificationId) => {
        callApi(`notifications/${notificationId}.json`, "put").then(
            (res) => {
              if (res.errors) {
                set ({errors: res.errors})
              } else {
                set({
                    notifications: res.data,
                    dataLoaded: true
                })
              }
            }
        );
    },
    updateAllNotificationsRequest: () => {
        callApi(`notifications/update_all.json`, "put").then((res) => {
            if (res.errors) {
                set ({errors: res.errors})
            } else {
              set({
                notifications: res.data,
                dataLoaded: true
              })
            }
        });
    },
    resetNotificationsFlagRequest: () => {
        set({
            errors: [],
            isSaved: false,
            isDeleted: false,
            dataLoaded: false,
            notification: {}
        })
    }
}))

export default useNotificationStore;