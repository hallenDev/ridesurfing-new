import _ from 'underscore'
import React, { useState, useEffect } from 'react'
import { GiftedChat } from 'react-web-gifted-chat'
import { Link } from 'react-router-dom'

import missingImg from '../images/missing.png'
import noChat from '../images/No-chat.png'
import useSessionStore from '../store/SessionStore';
import useChatStore from '../store/ChatStore';

var chatSubscription;

const Chat = (props) => {

  const sessionStore = useSessionStore();
  const chatStore = useChatStore();

  const currentUser = sessionStore.currentUser;
  const chats = chatStore.chats;
  const users = chatStore.users;
  const chatUser = chatStore.user;

  const initial_state = {
    message: ''
  }

  const [state, setState] = useState(initial_state);


  useEffect(() => {
    subscribeChannel();
    return() => {
      var cable = props.cable;
      cable.subscriptions.remove(chatSubscription);
    }
  }, [])

  /******* component will mount **********/
  if (!localStorage.accessToken) {
    localStorage.setItem('prevUrl', `/chat`)
    return window.location.href = `/login`
  }
  chatStore.getChatUsersRequest();
  if (localStorage.directChatUserId) {
    chatStore.getDirectChatUserRequest(localStorage.directChatUserId, true)
  }
  /*----------------------------------*/

  const subscribeChannel = () => {
    var cable = props.cable

    chatSubscription = cable.subscriptions.create({channel: "ChatsChannel"}, {
      connected: () => {
        console.log("Chat Channel connected")
      },
      disconnected: () => {
        console.log("Chat Channel disconnected")
      },
      received: function(data) {
        if (((chatUser.id === data.sender_id) && (currentUser.id === data.receiver_id)) || ((chatUser.id === data.receiver_id) && (currentUser.id === data.sender_id))) {
          chatStore.getDirectChatUserRequest(chatUser.id, true)
        }
      }
    })
  }

  const renderDirectChatUser = () => {
    if (chatUser.id !== undefined) {
      return(userTile(chatUser, 'active'))
    }
  }

  const goToProfile = (user) => {
    const { history } = props
    history.push(`/profile/${user.attributes.slug || user.id}`)
  }

  const renderUsersList = () => {
    return(_.map(users, (user) => {
      if (user.id !== chatUser.id) {
        return(userTile(user, ''))
      }
    }))
  }

  const loadChat = (userId) => {
    localStorage.setItem("directChatUserId", userId)
    chatStore.getDirectChatUserRequest(userId, true)
    chatStore.getChatUsersRequest()
  }

  const sendChat = (messages) => {
    const message = messages[0]
    chatStore.sendChatRequest({ message: message.text.trim().replace(/(\r\n|\n|\r)/gm,''), receiver_id: chatUser.id })

    setState({ ...state, message: '' })
  }

  const userTile = (user, currentChat) => {
    return <li className={"user "+currentChat} onClick={() => loadChat(user.id)} key={"userTile"+user.id}>
      <div className={`user-link clearfix ${user.attributes.unread > 0 && 'unread-msg-block'}`}>
        <div className="img-container">
          <img src={user.attributes.small_image_url || missingImg} className="responsive-img" alt=""/>
        </div>
        <div className="friend-name">
          <strong>{user.attributes.name}</strong>
        </div>
        <div className={`last-message ${user.attributes.unread > 0 && 'unread-color'}`}>{user.attributes.last_message}</div>
        <small className={`time ${user.attributes.unread > 0 && 'unread-color'}`}>{user.attributes.last_message_at} ago</small>
        {user.attributes.unread > 0 && <small className="unread-msg ">{user.attributes.unread}</small>}
      </div>
    </li>
  }

  const onChatKeyPress = (event) => {
    if (event.key === 'Enter') {
      const { message } = state

      chatStore.sendChatRequest({ message: message.trim().replace(/(\r\n|\n|\r)/gm,''), receiver_id: chatUser.id })
      setState({ ...state, message: '' })
    }
  }

  const onChatTextChange = (message) => {
    setState({ ...state, message: message })
  }

  const { message } = state

  return (
    <div className="chat-page">
      { users.length < 0 ?
        <div className="new-user">
          <div className="landing-heading center-align">
            <img src={noChat} className='chat-icon img-responsive' alt=""/>
            <h4>No messages yet!</h4>
            <p>Your chat will live here once you start sharing messages with Ridesurfing.</p>
            <Link className="btn btn-sm dashboard-btn" to='/search' >
              Go to Search
            </Link>
          </div>
        </div>
        :
        <div className="row mb0">
          <div className="row chat-list-sm">
            <div className="col s2 mt10">
              <Link to="/chatList" className="chatList">
                <i className="fa fa-chevron-left"/>
              </Link>
            </div>
            <div className="col s7 user-name center-align">
              <span>{chatUser.attributes.name}</span>
            </div>
            <div className="col s3">
              <Link to={`/profile/${chatUser.attributes.slug || chatUser.id}`} className="user-img-container">
                <img src={chatUser.attributes.small_image_url || missingImg} className="responsive-img user-img" alt="" />
              </Link>
            </div>
          </div>
          <div className="col l3 s12 user-list">
            <div className="user-chat-list">
              <ul className="friend-list">
                {renderDirectChatUser()}
                {renderUsersList()}
              </ul>
            </div>
          </div>
          <div className="col l9 s12">
            <div className="row mb0">
              <div className="col l4 chat-list-user-details pl0 pr0">
                <div className="user-details center-align">
                  <Link to={`/profile/${chatUser.attributes.slug || chatUser.id}`} className="user-img-container">
                    <img src={chatUser.attributes.small_image_url || missingImg} className="responsive-img" alt="" />
                  </Link>
                  <h5>{chatUser.attributes.name}</h5>
                  <table className="table table-user-information">
                    <tbody>
                      <tr>
                        <td className="info-label"><b>Gender</b></td>
                        <td className="info-val">
                          {chatUser.attributes.gender}
                        </td>
                      </tr>
                      <tr>
                        <td className="info-label"><b>Age</b></td>
                        <td className="info-val">
                          {chatUser.attributes.age} Years
                        </td>
                      </tr>
                      {!!chatUser.attributes.kids && <tr>
                        <td className="info-label"><b>Kids</b></td>
                        <td className="info-val">
                          {chatUser.attributes.kids}
                        </td>
                      </tr>}
                      {!!chatUser.attributes.relationship_status && <tr>
                        <td className="info-label"><b>Relationship</b></td>
                        <td className="info-val">
                          {chatUser.attributes.relationship_status}
                        </td>
                      </tr>}
                    </tbody>
                  </table>
                  <div className="social-icon">
                    {!!chatUser.attributes.facebook_link && <a href={chatUser.attributes.facebook_link} target='_blank' rel="noopener noreferrer">
                    <span className="ml20">
                      <i className="fa fa-facebook success" />
                    </span></a>}
                    {!!chatUser.attributes.instagram_link && <a href={chatUser.attributes.instagram_link} target='_blank' rel="noopener noreferrer">
                    <span className="ml20">
                      <i className="fa fa-instagram danger" />
                    </span></a>}
                    {!!chatUser.attributes.linkedin_link && <a href={chatUser.attributes.linkedin_link} target='_blank' rel="noopener noreferrer">
                    <span className="ml20">
                      <i className="fa fa-linkedin success" />
                    </span></a>}
                  </div>
                </div>
              </div>
              <div className="col l8 s12 pl0 pr0">
                <div className="chat-block">
                  <GiftedChat
                    messages={chats}
                    onSend={(messages) => sendChat(messages)}
                    user={currentUser}
                    showAvatarForEveryMessage={true}
                    onPressAvatar={() => goToProfile(chatUser)}
                    onInputTextChanged={(text) => onChatTextChange(text)}
                    textInputProps={{
                      autoFocus: true,
                      onKeyPress: (event) => onChatKeyPress(event),
                      value: message
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  )
}

export default (Chat)
