import React, { Component, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'

import * as actions from '../actions'
import { getUserErrors, getCodeSent, getIsProcessing } from '../reducers/UserReducer'

const ForgotPassword = (props) => {

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

  //   if (nextProps.codeSent) {
  //     resetUserFlagsRequest()
  //     history.push('/reset_password')
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
      [fieldName]: event.target.value, [`${fieldName}userErrors`]: null 
    })
  }

  const handleForgotPassword = () => {
    const { forgotPasswordRequest } = props.actions
    const { identity } = state
    forgotPasswordRequest(identity)
    setState({ 
      ...state, 
      isProcessing: true 
    })

    if (!identity)
      setState({ 
        ...state, 
        identityError: 'Please provide a valid registered email.' 
      })
  }

  const errorMessageFor = (fieldName) => {
    const { userErrors } = props
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }

  const { isProcessing } = state
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

function mapStateToProps (state) {
  return {
    userErrors: getUserErrors(state),
    codeSent: getCodeSent(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { forgotPasswordRequest, resetUserFlagsRequest, setProcessingRequest } = actions

  return {
    actions: bindActionCreators(
      {
        forgotPasswordRequest,
        resetUserFlagsRequest,
        setProcessingRequest
      },
      dispatch
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ForgotPassword))
