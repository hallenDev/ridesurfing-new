import React from 'react'
import Button from '@material-ui/core/Button'

const PrimaryButton = (props) => {
  return (
    <Button
      variant="contained"
      color={props.color}
      className={props.className}
      onClick={props.handleButtonClick}
      type="submit"
      disabled={props.disabled}>
      {props.buttonName}
    </Button>
  )
}

const LeftIconButton = (props) => {
  return (
    <Button
      variant="contained"
      color={props.color}
      className={props.className}
      onClick={props.handleButtonClick}>
      {props.icon}
      {props.buttonName}
    </Button>
  )
}

export {PrimaryButton, LeftIconButton}
