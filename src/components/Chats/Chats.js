import React, {useState} from 'react'
import {Button, Input, MessageList} from 'react-chat-elements'
import styles from './Chats.module.scss'

import 'react-chat-elements/dist/main.css'
import useSessionStore from '../../store/SessionStore'

const Chats = ({messages = [], onSend}) => {
  const sessionStore = useSessionStore()
  const currentUser = sessionStore.currentUser
  const [message, setMessage] = useState('')

  const data = messages
    .map(message => ({
      position: message?.user?.id === currentUser?.id ? 'right' : 'left',
      type: 'text',
      text: message.text,
      date: new Date(message.createdAt),
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
        className={styles.messageList}
        lockable={true}
        dataSource={data}
      />

      <Input
        placeholder="Type here..."
        multiline={false}
        value={message}
        rightButtons={
          <Button
            color="white"
            backgroundColor="black"
            text="Send"
            onClick={sendMessage}
          />
        }
        onChange={event => setMessage(event.target.value)}
        onKeyPress={e => {
          e.key === 'Enter' && sendMessage()
        }}
      />
    </div>
  )
}

export default Chats
