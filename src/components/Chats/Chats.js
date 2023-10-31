import React, {useState} from 'react'
import {Button, Input} from 'react-chat-elements'
import styles from './Chats.module.scss'
import MessageList from './components/MessageList'

import 'react-chat-elements/dist/main.css'
import useSessionStore from '../../store/SessionStore'

const Chats = ({messages = [], onSend}) => {
  const sessionStore = useSessionStore()
  const currentUser = sessionStore.currentUser
  const [message, setMessage] = useState('')

  const data = messages
    .map((message) => ({
      position: message?.user?.id === currentUser?.id ? 'right' : 'left',
      text: message.text,
      date: new Date(message.createdAt).toLocaleString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: new Date(message.createdAt).toLocaleString('en-us', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }),
      createdAt: message.createdAt,
      avatar:
        message?.user?.id !== currentUser?.id ? message?.user?.avatar : '',
    }))
    .reverse()

  const sendMessage = () => {
    if (message.trim().length === 0) return
    onSend(message.trim())
    setMessage('')
  }

  return (
    <div className={styles.container}>
      <MessageList
        // className={styles.messageList}
        // lockable={true}
        messages={data}
      />

      <Input
        placeholder="Type a message..."
        multiline={false}
        value={message}
        rightButtons={
          message !== '' && (
            <Button
              // color="white"
              // backgroundColor="black"
              text="Send"
              onClick={sendMessage}
              className="chat-send-btn"
            />
          )
        }
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={(e) => {
          e.key === 'Enter' && sendMessage()
        }}
      />
    </div>
  )
}

export default Chats
