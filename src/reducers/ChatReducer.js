import _ from 'underscore'
import { GET_CHAT_USERS, GET_CHATS, UPDATE_CHAT, UPDATE_ALL_CHATS,
  GET_CHAT_ERRORS, RESET_CHAT_FLAGS, RESET_DATA_LOADED
} from '../actions/ChatActions'

const initialState = { chats: [], users: [], user: {attributes: {}}, chat: {}, errors: [], isSaved: false, isDeleted: false, dataLoaded: false }

const ChatReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CHAT_USERS:
      return Object.assign({}, state, {
        users: action.users,
        dataLoaded: true
      })

    case UPDATE_CHAT:
      return Object.assign({}, state, {
        chat: action.chat,
        isSaved: true
      })

    case GET_CHATS:
      var arr = []
      _.map(action.chats, (chat) => {
        chat.createdAt = new Date(chat.createdAt)
        arr.push(chat)
      })
      return Object.assign({}, state, {
        chats: arr,
        user: action.user,
        dataLoaded: true
      })

    case GET_CHAT_ERRORS:
      return Object.assign({}, state, {
        errors: action.errors
      })

    case UPDATE_ALL_CHATS:
      return Object.assign({}, state, {
        chats: action.chats,
        dataLoaded: true
      })

    case RESET_CHAT_FLAGS:
      return Object.assign({}, state, {
        errors: [],
        isSaved: false,
        isDeleted: false,
        dataLoaded: false,
        chat: {}
      })

    case RESET_DATA_LOADED:
      return Object.assign({}, state, {
        dataLoaded: false,
      })

    default:
      return state
  }
}

export const getChats = state => state.chats.chats
export const getCurrentChatUser = state => state.chats.user
export const getChatUsers = state => state.chats.users
export const getChat = state => state.chats.chat
export const getChatErrors = state => state.chats.errors
export const getChatSaved = state => state.chats.isSaved
export const getChatsDataLoaded = state => state.chats.dataLoaded

export default ChatReducer
