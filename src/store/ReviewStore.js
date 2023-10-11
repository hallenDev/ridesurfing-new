import { create } from 'zustand';
import callApi from "../util/apiCaller";
import { notify } from 'react-notify-toast'

const useReviewStore = create((set) => ({
    reviews: [], 
    review: {
        attributes: {}, 
        relationships: {
            rated_by: { attributes: {} }, 
            user: { attributes: {} }, 
            trip: { attributes: {} }
        }
    }, 
    errors: [], 
    isUpdated: false, 
    dataLoaded: false, 
    isProcessing: false,

    getReviewsRequest: () => {
        callApi(`reviews.json`).then((res) => {
            if (res.error || res.errors) {
              set({
                errors: res.errors,
                isProcessing: false
              })
            } else {
              set({
                reviews: res.data,
                dataLoaded: true
              })
            }
        });
    },
    getReviewRequest: (reviewId) => {
        callApi(`reviews/${reviewId}`).then((res) => {
            if (res.error || res.errors) {
                set({
                    errors: res.errors,
                    isProcessing: false
                })
            } else {
              set({
                review: res.data,
                isProcessing: false
              })
            }
        });
    },
    updateReviewRequest: (reviewId, params) => {
        callApi(`reviews/${reviewId}`, "put", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors,
                    isProcessing: false
                })
            } else {
                notify.show('Thanks for sharing your reviews.', 'success');
                set({
                    review: res.data,
                    isUpdated: true,
                    isProcessing: false
                })
            }
        });
    },
    resetReviewFlagRequest: () => {
        set({
            errors: [],
            isUpdated: false,
            isProcessing: false
        })
    },
    resetDataLoadedRequest: () => {
        set({dataLoaded: false})
    },
    setProcessingRequest: () => {
        set({ isProcessing: true })
    }
}))

export default useReviewStore;