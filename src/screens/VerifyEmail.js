import React, { Component, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'

import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'
import useUserStore from '../store/UserStore';

const VerifyEmail = (props) => {

  const userStore = useUserStore();

  const userErrors = userStore.errors;
  // const emailVerified = userStore.emailVerified;
  // const isProcessing = userStore.isProcessing;

  const initial_state = {
    identity: '',
    userErrors: {},
    otp: '',
    isProcessing: false
  }
  
  const [state, setState] = useState(initial_state);

  // to-do
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   const { resetUserFlagsRequest } = this.props.actions
  //   const { history } = this.props

  //   if (nextProps.emailVerified) {
  //     resetUserFlagsRequest()
  //     history.push('/login')
  //   }

  //   if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //     this.setState({ isProcessing: nextProps.isProcessing })
  //   }

  //   if (nextProps.userErrors)
  //     this.setState({userErrors: nextProps.userErrors})
  // }

  const onFieldChange = (fieldName, event) => {
    setState({ 
      ...state, 
      [fieldName]: event.target.value, [`${fieldName}userErrors`]: null })
  }

  const handleVerifyEmail = () => {
    const { otp } = state
    userStore.verifyOtpRequest({otp: otp})
    setState({ 
      ...state,
      isProcessing: true 
    })
  }

  const errorMessageFor = (fieldName) => {
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }

  const { otpError, isProcessing } = state
  return (
    <div className="login-container">
      <div className="container">
          <Card className="cardContainer">
            <h3 className="center-align">Verify Email</h3>
            <div className="subHeading">
              Please enter a valid verification code that you've received on your registered email.
            </div>
            <TextField
              fullWidth
              className='text-field'
              id='email'
              type='text'
              label='Enter Verification Code'
              margin="normal"
              onChange={(event) => onFieldChange('otp', event)}
              onKeyPress={event => {
                if (event.key === 'Enter') {
                  handleVerifyEmail()
                }
              }}
            />
            <span className='error'>{otpError}</span>
            <span className='error'>{errorMessageFor('email')}</span>
            <div className="mt40">
              <PrimaryButton
                color='primary'
                buttonName={isProcessing ? "Please Wait..." : "Verify Email"}
                disabled={!!isProcessing}
                className="leftIcon-btn pswrd-btn"
                handleButtonClick={() => handleVerifyEmail()}
              />
            </div>
          </Card>
      </div>
    </div>
  )
}

export default withRouter(VerifyEmail)
