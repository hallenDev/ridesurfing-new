import { create } from 'zustand';
import callApi from "../util/apiCaller";
import { notify } from 'react-notify-toast'

const useTripStore = create((set) => ({
    allTrips: [], 
    trips: [], 
    searchedTrips: [], 
    similarTrips: [],
    waypoints:[],
    errors: [], 
    isSaved: false, 
    dataLoaded: false, 
    isDeleted: false, 
    isCompleted: false, 
    isBooked: false, 
    isProcessing: false,
    error: '',
    trip: {
        attributes: {}, 
        relationships: {
            profile: {
                user: { 
                    attributes: {}, 
                    relationships: { reviews: {} }
                }
            }
        }
    }, 
    isCancelled: false, 
    pagination: {
        current_page: 1, 
        per_page: 5, 
        total_pages: 1, 
        total_count: 5
    },

    getTripsRequest: (page = 1) => {
        callApi(`trips/current?page=${page}`, "get").then((res) => {
            if (res.error || res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set({
                    trips: res.data,
                    pagination: res.pagination,
                    dataLoaded: true,
                    isProcessing: false
                })
            }
        });
    },
    loadTripsRequest: () => {
        callApi(`trips`).then((res) => {
            if (res.error || res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set({
                    searchedTrips: res.data,
                    similarTrips: res.similar,
                    allTrips: res.all_trips,
                    pagination: res.pagination,
                    dataLoaded: true,
                    isProcessing: false
                })
            }
        });
    },
    searchTripsRequest: (query = {}, page = 1) => {
        callApi(`trips/search?page=${page}`, "post", query).then((res) => {
            if (res && (res.error || res.errors)) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set({
                    searchedTrips: res.data,
                    similarTrips: res.similar,
                    allTrips: res.all_trips,
                    pagination: res.pagination,
                    dataLoaded: true,
                    isProcessing: false
                })
            }
        });
    },
    searchTripIdsRequest: (query = {}, page = 1, waypoints = true) => {
        const no_waypoints = waypoints ? "" : "&no_waypoints=1";
        callApi(`trips/search?page=${page}${no_waypoints}`, "post", query).then((res) => {
            if(!res) {
                notify.show('internet connection error.', 'error');
                set({
                    isProcessing: false
                })
            } else {
                if (res.error || res.errors) {
                    set({
                        errors: res.errors,
                        error: res.error,
                        isProcessing: false
                    })
                } else {
                    set({
                        searchedTrips: res.data,
                        similarTrips: res.similar,
                        allTrips: res.all_trips,
                        pagination: res.pagination,
                        waypoints: res.waypoints,
                        dataLoaded: true,
                        isProcessing: false
                    })
                }
            }
            
        });
    },
    getTripRequest: (tripId) => {
        callApi(`trips/${tripId}`).then((res) => {
            if (res && !res.error && !res.errors) {
                set({
                    trip: res.data,
                    isProcessing: false
                })
            } else {
                set({
                    errors: res.errors,
                    error: "Trip not found",
                    isProcessing: false
                })
            }
        });
    },
    getTripInfoRequest: (tripId) => {
        callApi(`trips/trip/${tripId}`, "get").then((res) => {
            if(!res) {

            } else {
                if (res && !res.error && !res.errors) {
                    set({
                        trip: res.data,
                        isProcessing: false
                    })
                } else {
                    set({
                        errors: res.errors,
                        error: "Trip not found",
                        isProcessing: false
                    })
                }
            }
        });
    },
    createTripRequest: (params) => {
        set({ isProcessing: true })
        callApi(`trips`, "post", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set((state) => ({ trips: state.trips.splice(0, 0, res.data) }));
                set({
                    trip: res.data,
                    isSaved: true,
                    isProcessing: false
                })
            }
        });
    },
    updateTripRequest: (tripId, params) => {
        set({ isProcessing: true })
        callApi(`trips/${tripId}.json`, "put", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set({
                    trip: res.data,
                    isCompleted: true,
                    isProcessing: false
                })
            }
        });
    },
    bookTripRequest: (tripId, params) => {
        callApi(`trips/${tripId}/trip_requests`, "post", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set({
                    isBooked: true,
                    isProcessing: false
                })
            }
        });
    },
    deleteTripRequest: (tripId) => {
        callApi(`trips/${tripId}`, "delete").then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
                set({ isDeleted: true })
            }
        });
    },
    resetTripFlagRequest: () => {
        set({
            errors: [],
            error: '',
            isSaved: false,
            isBooked: false,
            isCompleted: false,
            isDeleted: false,
            isCancelled: false,
            isProcessing: false,
            trip: { attributes: {}, relationships: { trip_requests: [], profile: { user: { attributes: {}, relationships: { reviews: [] } } }, attributes: {}, relationships: {} } }
        })
    },
    resetDataLoadedRequest: () => {
        set({ dataLoaded: false })
    },
    cancelTripRequest: (tripId) => {
        callApi(`trips/${tripId}/cancel`, "delete").then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors,
                    error: res.error,
                    isProcessing: false
                })
            } else {
              set({
                trip: res.data,
                isCancelled: true,
                isProcessing: false
              })
            }
        });
    },
    setProcessingRequest: () => {
        set({ isProcessing: true })
    }
}))

export default useTripStore;