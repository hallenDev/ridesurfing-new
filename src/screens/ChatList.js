import React, { Component, useState } from 'react'
import _ from 'underscore'
import ReactLoading from 'react-loading'
import { Link } from 'react-router-dom'

import missingImg from '../images/missing.png'
import noChat from '../images/No-chat.png'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getCurrentUser } from '../reducers/SessionReducer'
import { getChatUsers, getChats, getCurrentChatUser, getChatsDataLoaded } from '../reducers/ChatReducer'

const ChatList = (props) => {

  const initial_state = {
    dataLoaded: false
  }

  const [state, setState] = useState(initial_state);

  // to-do
  // componentWillMount () {
  //   const { getChatUsersRequest } = this.props.actions
  //   getChatUsersRequest()
  //   if (!localStorage.accessToken) {
  //     localStorage.setItem('prevUrl', `/chatList`)
  //     return window.location.href = `/login`
  //   }
  // }

  // to-do
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   if (nextProps.dataLoaded || nextProps.dataLoaded === false) {
  //     this.setState({ dataLoaded: nextProps.dataLoaded })
  //   }
  // }

  const loadChat = (userId) => {
    const { history } = props
    const { getChatUsersRequest, getDirectChatUserRequest } = props.actions

    localStorage.setItem("directChatUserId", userId)
    getDirectChatUserRequest(userId, true)
    getChatUsersRequest()
    history.push('/chat')
  }

  const getImage = (user) => {
    return user.attributes.display_image ? user.attributes.display_image : missingImg
  }

  const renderUsersList = () => {
    const { users } = props
    if (users.length > 0) {
      return _.map(users, (user, index) => {
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

  const { dataLoaded } = state
  const { users } = props
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
              {dataLoaded ? renderUsersList() : <div className="loading"><ReactLoading type='bubbles' color='#3399ff' height='10%' width='10%' /></div>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    chats: getChats(state),
    users: getChatUsers(state),
    chatUser: getCurrentChatUser(state),
    dataLoaded: getChatsDataLoaded(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getChatUsersRequest, getDirectChatUserRequest, sendChatRequest, resetDataLoadedRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getChatUsersRequest,
        getDirectChatUserRequest,
        sendChatRequest,
        resetDataLoadedRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatList)
