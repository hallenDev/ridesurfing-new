import styles from './MessageList.module.scss'
import SendMessageBox from './SendMessageBox'
import ReceiveMessageBox from './ReceiveMessageBox'

const MessageList = ({messages = []}) => {
  const messageList = messages.map((message, index, arr) => {
    const prevMessage = arr[index - 1]
    const nextMessage = arr[index + 1]
    const isReceived = message.position === 'left'
    const isFirst = prevMessage?.position !== message.position
    const isLast = nextMessage?.position !== message.position
    const newDate = prevMessage?.date !== message.date

    return (
      <div key={message.createdAt}>
        {newDate && <div className={styles.date}>{message.date}</div>}
        {isReceived ? (
          <ReceiveMessageBox
            message={message}
            isFirst={isFirst}
            isLast={isLast}
          />
        ) : (
          <SendMessageBox message={message} isFirst={isFirst} isLast={isLast} />
        )}
      </div>
    )
  })

  return <div className={styles.container}>{messageList}</div>
}

export default MessageList
