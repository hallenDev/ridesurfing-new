import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'
import useUserStore from '../store/UserStore';

const initial_state = {
  otp: '',
  password: '',
  userErrors: {},
  isProcessing: false
}

const ResetPassword = (props) => {

  const userStore = useUserStore();

  const userErrors = userStore.errors;
  const resetPassword = userStore.isReset;
  // const isProcessing = userStore.isProcessing;
  

  const [state, setState] = useState(initial_state);

  // to-do
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   const { resetUserFlagsRequest } = this.props.actions
  //   const { history } = this.props

  //   if (nextProps.resetPassword) {
  //     resetUserFlagsRequest()
  //     history.push('/login')
  //   }

  //   if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //     this.setState({ isProcessing: nextProps.isProcessing })
  //   }

  //   if (nextProps.userErrors)
  //     this.setState({userErrors: nextProps.userErrors})
  // }

  const errorMessageFor = (fieldName) => {
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }

  const onFieldChange = (fieldName, event) => {
    setState({ 
      ...state, 
      [fieldName]: event.target.value, [`userErrors[${fieldName}]`]: null 
    })
  }

  const onKeyPressEnter = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      handleResetPassword()
    }
  }

  const handleResetPassword = () => {
    const { otp, password } = state
    userStore.resetPasswordRequest(otp, password)
    setState({ 
      ...state, 
      isProcessing: true 
    })
  }

  const { isProcessing } = state
  return (
    <div className="login-container">
      <div className="container">
        <Card className="cardContainer">
          <h3 className="center-align">Reset Password</h3>
          <TextField
            fullWidth
            className='text-field'
            id='otp'
            type='text'
            label='Verification Code'
            margin="normal"
            onChange={(event) => onFieldChange('otp', event)}
            onKeyPress={(event) => onKeyPressEnter(event)}
          />
          <span className='error'>{errorMessageFor('mobile')}</span>
          <TextField
            fullWidth
            className='text-field'
            id='password'
            type='password'
            label='Reset Password'
            margin="normal"
            onChange={(event) => onFieldChange('password', event)}
            onKeyPress={(event) => onKeyPressEnter(event)}
          />
          <span className='error'>{errorMessageFor('password')}</span>
          <div className="mt40">
            <PrimaryButton
              color='primary'
              buttonName={isProcessing ? "Please Wait" : "Reset Password"}
              className="leftIcon-btn"
              disabled={!!isProcessing}
              handleButtonClick={() => handleResetPassword()}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default withRouter(ResetPassword)
