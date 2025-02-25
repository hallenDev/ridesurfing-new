import React, {useCallback} from 'react'
import ReactSlider from 'react-slider'

import styles from './Slider.module.scss'

const Slider = ({min, max, value, defaultValue, onAfterChange}) => {
  const renderThumb = useCallback(
    props => (
      <div {...props}>
        <div className={styles.thumb}></div>
      </div>
    ),
    [],
  )

  const renderTrack = useCallback(
    (props, state) => (
      <div {...props}>
        <div
          className={styles.track}
          style={{
            backgroundColor: Array.isArray(defaultValue)
              ? state.index === 0 || state.index === 2
                ? 'lightgray'
                : '#3399ff'
              : state.index === 0
              ? '#3399ff'
              : 'lightgray',
          }}></div>
      </div>
    ),
    [defaultValue],
  )
  return (
    <div className={styles.container}>
      <ReactSlider
        defaultValue={defaultValue}
        min={min}
        max={max}
        value={value}
        renderThumb={renderThumb}
        renderTrack={renderTrack}
        onAfterChange={onAfterChange}
      />
    </div>
  )
}

export default Slider
