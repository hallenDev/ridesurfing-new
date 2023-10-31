import styles from './MessageList.module.scss'

const SendMessageBox = ({message, isFirst, isLast}) => {
  return (
    <div className={`${styles.message} ${styles.messageSend}`}>
      <div
        className={`${styles.content} ${styles.contentSend} ${
          isFirst && styles.firstMessageSend
        } ${isLast && styles.lastMessageSend}`}>
        <div className={styles.textSend}>{message.text}</div>
        <div className={styles.timeSend}>{message.time}</div>
      </div>
    </div>
  )
}

export default SendMessageBox
