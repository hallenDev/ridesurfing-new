import { create } from 'zustand';
import callApi from "../util/apiCaller";
import _ from 'underscore'

const useChatStore = create((set) => ({
    chats: [], 
    users: [], 
    user: {attributes: {}}, 
    chat: {}, 
    errors: [], 
    isSaved: false, 
    isDeleted: false, 
    dataLoaded: false,

    getChatUsersRequest: () => {
        callApi(`chats.json`).then((res) => {
            if (res.error || res.errors) {
                set({errors: res.errors})
            } else {
              set({
                users: res.data,
                dataLoaded: true
              })
            }
        });
    },
    getDirectChatUserRequest: (userId, mark_read = false) => {
        callApi(`chats/receiver/${userId}.json?mark_read=${mark_read}`).then(
            (res) => {
            //   dispatch(getChats(res));
              var arr = []
                _.map(res.chats, (chat) => {
                    chat.createdAt = new Date(chat.createdAt)
                    arr.push(chat)
                })
                set({
                    chats: arr,
                    user: res.user,
                    dataLoaded: true
                })
            }
        );
    },
    sendChatRequest: (params) => {
        callApi(`chats.json`, "post", params).then((res) => {
            if (res.errors) {
                set({errors: res.errors})
            } else {
              set({
                chat: res.data,
                isSaved: true
              })
            }
        });
    },
    updateAllChatsRequest: () => {
        callApi(`chats/update_all.json`, "put").then((res) => {
            if (res.errors) {
                set({errors: res.errors})
            } else {
              set({
                chats: res.data,
                dataLoaded: true
              })
            }
        });
    },
    resetChatsFlagRequest: () => {
        set({
            errors: [],
            isSaved: false,
            isDeleted: false,
            dataLoaded: false,
            chat: {}
        })
    },
    resetDataLoadedRequest: () => {
        set({dataLoaded: false})
    }
}))

export default useChatStore;