import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'
import useUserStore from '../store/UserStore';

const initial_state = {
  identity: '',
  userErrors: {},
  otp: '',
  isProcessing: false
}

const ForgotPassword = (props) => {

  const userStore = useUserStore();

  const userErrors = userStore.errors;
  const codeSent = userStore.codeSent;
  const isProcessing = userStore.isProcessing;

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    const { history } = props;
    if (codeSent) {
      userStore.resetUserFlagsRequest()
      history.push('/reset_password')
    }
  }, [codeSent])

  useEffect(() => {
    if (userErrors) {
      setState({...state, userErrors: userErrors})
    }
  }, [userErrors])

  const onFieldChange = (fieldName, event) => {
    setState({ 
      ...state, 
      [fieldName]: event.target.value, [`${fieldName}userErrors`]: null 
    })
  }

  const handleForgotPassword = () => {
    const { identity } = state
    setState({ 
      ...state, 
      isProcessing: true 
    })
    
    if (identity == '') {
      setState({ 
        ...state, 
        identityError: 'Please provide a valid registered email.',
        isProcessing: false
      })
    } else {
      userStore.forgotPasswordRequest(identity)
    }
      
  }

  const errorMessageFor = (fieldName) => {
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }
  return (
    <div className="login-container">
      <div className="container">
          <Card className="cardContainer">
            <h3 className="center-align">Forgot Password</h3>
            <TextField
              fullWidth
              className='text-field'
              id='email'
              type='text'
              label='Email'
              margin="normal"
              onChange={(event) => onFieldChange('identity', event)}
              onKeyPress={event => {
                if (event.key === 'Enter' || event.keyCode === 13) {
                  handleForgotPassword()
                }
              }}
            />
            <span className='error'>{errorMessageFor('mobile')}</span>
            <div className="mt40">
              <PrimaryButton
                color='primary'
                buttonName={isProcessing ? "Please Wait" : "Request Password Reset Link"}
                className="leftIcon-btn pswrd-btn"
                disabled={!!isProcessing}
                handleButtonClick={() => handleForgotPassword()}
              />
            </div>
            <div className="terms-n-policy">
              <Link className="underline" to='/login'>Return to Login page</Link>
            </div>
          </Card>
      </div>
    </div>
  )
}

export default withRouter(ForgotPassword)
