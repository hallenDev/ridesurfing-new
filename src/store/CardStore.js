import { create } from 'zustand';
import callApi from "../util/apiCaller";
import { notify } from 'react-notify-toast';

const useCardStore = create((set) => ({

    cards: [],
    card: {},
    errors: [],
    isSaved: false,
    isDeleted: false,
    isPrimary: false,
    isProcessing: false,
    isCardProcessing: false,

    getCardsRequest: async () => {
        callApi(`cards`, "get").then((res) => {
            if (res.error || res.errors) {
                set({
                    errors: res.errors || {},
                    isProcessing: false,
                    isCardProcessing: false
                });
            } else {
                set({
                    cards: res.data,
                    isProcessing: false
                });
            }
        })
    },
    getCardRequest: async(cardId) => {
        callApi(`cards/${cardId}`, "get").then((res) => {
            if (res.error || res.errors) {
                set({
                    errors: res.errors || {},
                    isProcessing: false,
                    isCardProcessing: false
                });
            } else {
                set({
                    card: res,
                    isProcessing: false,
                    isCardProcessing: false
                });
            }
        })
    },
    createCardRequest: async(params) => {
        callApi(`cards`, "post", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors || {},
                    isProcessing: false,
                    isCardProcessing: false
                });
            } else {
                notify.show('Information has been updated', 'success')
                set((state) => ({ cards: state.cards.splice(0, 0, res.data) }));
                set({
                    card: res.data,
                    isSaved: true,
                    isProcessing: false,
                    isCardProcessing: false
                })
            }
        });
    },
    updateCardRequest: async(cardId, params) => {
        callApi(`cards/${cardId}`, "put", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors || {},
                    isProcessing: false,
                    isCardProcessing: false
                });
            } else {
                notify.show('Information has been updated', 'success')
                set({
                    card: res.data,
                    isSaved: true,
                    isProcessing: false,
                    isCardProcessing: false
                })
            }
        });
    },
    deleteCardRequest: async(cardId) => {
        callApi(`cards/${cardId}`, "delete").then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors || {},
                    isProcessing: false,
                    isCardProcessing: false
                });
            } else {
                notify.show('Card information has been deleted', 'success')
                set({
                    isDeleted: true
                })
            }
        });
    },
    setAsPrimaryCardRequest: async(cardId, params) => {
        callApi(`cards/${cardId}/set_as_primary`, "put", params).then((res) => {
            if (res.errors) {
                set({
                    errors: res.errors || {},
                    isProcessing: false,
                    isCardProcessing: false
                });
            } else {
                notify.show('Card has been set as primary card', 'success')
                set({
                    cards: res.data,
                    isPrimary: true,
                    isProcessing: false
                })
            }
        });
    },
    resetCardsFlagRequest: () => {
        set({
            errors: [],
            isSaved: false,
            isDeleted: false,
            isPrimary: false,
            isProcessing: false,
            isCardProcessing: false,
            card: {}
        })
    },
    setProcessingRequest: () => {
        set({ isProcessing: true })
    },
    setCardProcessingRequest: () => {
        set({ isCardProcessing: true })
    }
}))

export default useCardStore;