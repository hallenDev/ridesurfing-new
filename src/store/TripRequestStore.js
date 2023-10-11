import { create } from 'zustand';
import callApi from "../util/apiCaller";
import _ from 'underscore';
import { notify } from "react-notify-toast";

const useTripRequestStore = create((set) => ({
    tripRequests: [], 
    receivedTripRequests: [], 
    tripRequest: {}, 
    errors: [], 
    isSaved: false, 
    isDeleted: false, 
    isCancelled: false,
    dataLoaded: false,

    getTripRequestsRequest: () => {
        callApi(`trip_requests/current`).then((res) => {
            if (res.error || res.errors) {
                set({errors: res.errors || {}})
            } else {
                set({
                    tripRequests: res.data,
                    dataLoaded: true
                })
            }
        });
    },
    getReceivedTripRequestsRequest: () => {
        callApi(`trip_requests`).then((res) => {
            if (res.error || res.errors) {
                set({errors: res.errors || {}})
            } else {
                set({ 
                    receivedTripRequests: res.data,
                    dataLoaded: true
                })
            }
        });
    },
    getTripRequestRequest: (tripRequestId) => {
        callApi(`trip_requests/${tripRequestId}`).then((res) => {
            set({
                tripRequests: res.data,
                dataLoaded: true
            })
        });
    },
    createTripRequestRequest: (params) => {
        callApi(`trip_requests`, "post", params).then((res) => {
            if (res.errors) {
                set({errors: res.errors || {}})
            } else {
                
                set((state) => ({tripRequests: state.tripRequests.splice(0, 0, res.data) }))
                set({
                    tripRequest: res.data,
                    isSaved: true
                })
            }
        });
    },
    acceptTripRequestRequest: (tripRequestId) => {
        callApi(`trip_requests/${tripRequestId}/accept`).then((res) => {
            if (res.errors) {
                set({errors: res.errors || {}})
            } else {
              set((state) => ({
                receivedTripRequests: _.without(state.receivedTripRequests, _.findWhere(state.receivedTripRequests, { id: res.data.id })),
                errors: []
              }))
            }
        });
    },
    ignoreTripRequestRequest: (tripRequestId) => {
        callApi(`trip_requests/${tripRequestId}/ignore`).then((res) => {
            if (res.errors) {
                set({errors: res.errors || {}})
            } else {
                set((state) => ({
                    receivedTripRequests: _.without(state.receivedTripRequests, _.findWhere(state.receivedTripRequests, { id: res.data.id })),
                    errors: []
                }))
            }
        });
    },
    cancelTripRequestRequest: (tripRequestId) => {
        callApi(`trip_requests/${tripRequestId}/cancel`, "delete").then((res) => {
                if (res.errors) {
                    set({errors: res.errors || {}})
                } else {
                    notify.show("Your request has been cancelled.", "success");
                    set((state) => ({
                        tripRequests: _.without(state.tripRequests, _.findWhere(state.tripRequests, { id: res.data.id })),
                        isCancelled: true,
                        errors: []
                    }))
                }
            }
        );
    },
    resetTripRequestsFlagRequest: () => {
        set({
            errors: [],
            isSaved: false,
            isDeleted: false,
            isCancelled: false,
            tripRequest: {}
        })
    },
    resetDataLoadedRequest: () => {
        set({ dataLoaded: false })
    }
}))

export default useTripRequestStore;