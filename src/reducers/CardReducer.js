import { GET_CARDS, GET_CARD, CREATE_CARD, GET_CARD_ERRORS, DELETE_CARD, UPDATE_CARD, SET_AS_PRIMARY_CARD, RESET_CARD_FLAGS, SET_PROCESSING, SET_CARD_PROCESSING } from '../actions/CardActions'

import { notify } from 'react-notify-toast'

const initialState = { cards: [], card: {}, errors: [], isSaved: false, isDeleted: false, isPrimary: false, isProcessing: false }

const CardReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CARDS:
      return Object.assign({}, state, {
        cards: action.cards,
        isProcessing: false
      })

    case CREATE_CARD:
      state.cards.splice(0, 0, action.card)
      notify.show('Information has been updated', 'success')
      return Object.assign({}, state, {
        card: action.card,
        cards: state.cards,
        isSaved: true,
        isProcessing: false,
        isCardProcessing: false
      })

    case UPDATE_CARD:
      notify.show('Information has been updated', 'success')
      return Object.assign({}, state, {
        card: action.card,
        isSaved: true,
        isProcessing: false,
        isCardProcessing: false
      })

    case SET_AS_PRIMARY_CARD:
      notify.show('Card has been set as primary card', 'success')
      return Object.assign({}, state, {
        cards: action.cards,
        isPrimary: true,
        isProcessing: false
      })

    case GET_CARD:
      return Object.assign({}, state, {
        card: action.card,
        isProcessing: false,
        isCardProcessing: false
      })

    case GET_CARD_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors,
        isProcessing: false,
        isCardProcessing: false
      })

    case DELETE_CARD:
      notify.show('Card information has been deleted', 'success')
      return Object.assign({}, state, {
        isDeleted: true,
      })

    case RESET_CARD_FLAGS:
      return Object.assign({}, state, {
        errors: [],
        isSaved: false,
        isDeleted: false,
        isPrimary: false,
        isProcessing: false,
        isCardProcessing: false,
        card: {}
      })

    case SET_PROCESSING:
      return Object.assign({}, state, {
        isProcessing: true,
      })

    case SET_CARD_PROCESSING:
      return Object.assign({}, state, {
        isCardProcessing: true
      })


    default:
      return state
  }
}

export const getCards = state => state.cards.cards
export const getCard = state => state.cards.card
export const getCardErrors = state => state.cards.errors
export const getCardSaved = state => state.cards.isSaved
export const getCardDeleted = state => state.cards.isDeleted
export const getCardPrimary = state => state.cards.isPrimary
export const getIsProcessing = state => state.cards.isProcessing
export const getIsCardProcessing = state => state.cards.isCardProcessing


export default CardReducer
