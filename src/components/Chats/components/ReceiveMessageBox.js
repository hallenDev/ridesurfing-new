import styles from './MessageList.module.scss'
import {Link} from 'react-router-dom'

const ReceiveMessageBox = ({message, isFirst, isLast}) => {
  return (
    <div className={`${styles.message}`}>
      <Link to={`/profile/${message.user_id}`} className="user-img-container">
        <img
          alt=""
          draggable="false"
          src={message.avatar}
          className={styles.avatar}
        />
      </Link>
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
