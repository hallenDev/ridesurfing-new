import styles from './MessageList.module.scss'

const ReceiveMessageBox = ({message, isFirst, isLast}) => {
  return (
    <div className={`${styles.message}`}>
      <img
        alt=""
        draggable="false"
        src={message.avatar}
        className={styles.avatar}
      />
      <div
        className={`${styles.content} ${styles.contentReceive} ${
          isFirst && styles.firstMessageReceive
        } ${isLast && styles.lastMessageReceive}`}>
        <div className={styles.textReceive}>{message.text}</div>
        <div className={styles.timeReceive}>{message.time}</div>
      </div>
    </div>
  )
}

export default ReceiveMessageBox
