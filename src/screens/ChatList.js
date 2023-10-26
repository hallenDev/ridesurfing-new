import React, { useState, useEffect } from 'react'
import _ from 'underscore'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'

import missingImg from '../images/missing.png'
import noChat from '../images/No-chat.png'
import useSessionStore from '../store/SessionStore';
import useChatStore from '../store/ChatStore';

const ChatList = (props) => {

  const sessionStore = useSessionStore();
  const chatStore = useChatStore();

  const currentUser = sessionStore.currentUser;
  const chats = chatStore.chats;
  const users = chatStore.users;
  const chatUser = chatStore.user;
  const dataLoaded = chatStore.dataLoaded;

  const initial_state = {
    dataLoaded: false
  }
  
  const [state, setState] = useState(initial_state);

  useEffect(() => {
    chatStore.getChatUsersRequest()
    if (!localStorage.accessToken) {
      localStorage.setItem('prevUrl', `/chatList`)
      return window.location.href = `/login`
    }
  }, [])
  
  useEffect(() => {
    if (dataLoaded || dataLoaded === false) {
      setState({ 
        ...state, 
        dataLoaded: dataLoaded 
      })
    }
  }, [dataLoaded])


  const loadChat = (userId) => {
    const { history } = props

    localStorage.setItem("directChatUserId", userId)
    chatStore.getDirectChatUserRequest(userId, true)
    chatStore.getChatUsersRequest()
    history.push('/chat')
  }

  const getImage = (user) => {
    return user.attributes.display_image ? user.attributes.display_image : missingImg
  }

  const renderUsersList = () => {
    if (users.length > 0) {
      return _.map(users, (user, index) => {
        if(!user.attributes) return;
        return <li className="user" onClick={() => loadChat(user.id)} key={`chat-${index}`}>
          <div className={`user-link clearfix ${user.attributes.unread > 0 && 'unread-msg-block'}`}>
            <div className="img-container">
              <img src={user.attributes.small_image_url || missingImg} className="responsive-img" alt="" />
            </div>
            <div className='friend-name'>
              <strong>{user.attributes.name}<i className="fa fa-circle online"/></strong>
            </div>
            <div className={`last-message ${user.attributes.unread > 0 && 'unread-color'}`}>{user.attributes.last_message}</div>
            <small className={`time ${user.attributes.unread > 0 && 'unread-color'}`}>{user.attributes.last_message_at} ago</small>
            {user.attributes.unread > 0 && <small className="unread-msg ">{user.attributes.unread}</small>}
            <small className="chat-alert text-muted"><i className="fa fa-reply"></i></small>
          </div>
        </li>
      })
    } else {
      return <div className="new-user">
        <div className="landing-heading center-align">
          <img src={noChat} className='chat-icon img-responsive' alt=""/>
          <h4>No messages yet!</h4>
          <p>You chat will live here once you start sharing messages with Ridesurfing.</p>
          <Link className="btn btn-sm dashboard-btn" to="/search" >
            Search
          </Link>
        </div>
      </div>
    }
  }

  return (
    <div className="chatList-page">
      {(users.length > 0) ?
        <div className="row chat-list-sm">
          <div className="col s12 user-name center-align">
            <span>Users List</span>
          </div>
        </div>
        : ""
      }
      <div className="row mb0">
        <div className="col s12 user-list">
          <div className="user-chat-list">
            <ul className="friend-list">
              {state.dataLoaded ? renderUsersList() : <div className="loading"><ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' /></div>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default (ChatList)
