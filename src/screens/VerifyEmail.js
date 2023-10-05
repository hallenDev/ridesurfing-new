import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'

import * as actions from '../actions'
import { getUserErrors, getEmailVerified, getIsProcessing } from '../reducers/UserReducer'

class VerifyEmail extends Component {

  constructor (props) {
    super(props)
    this.state = {
      identity: '',
      userErrors: {},
      otp: '',
      isProcessing: false
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { resetUserFlagsRequest } = this.props.actions
    const { history } = this.props

    if (nextProps.emailVerified) {
      resetUserFlagsRequest()
      history.push('/login')
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ isProcessing: nextProps.isProcessing })
    }

    if (nextProps.userErrors)
      this.setState({userErrors: nextProps.userErrors})
  }

  onFieldChange = (fieldName, event) => {
    this.setState({ [fieldName]: event.target.value, [`${fieldName}userErrors`]: null })
  }

  handleVerifyEmail () {
    const { verifyOtpRequest } = this.props.actions
    const { otp } = this.state
    verifyOtpRequest({otp: otp})
    this.setState({ isProcessing: true })
  }

  errorMessageFor = (fieldName) => {
    const { userErrors } = this.props
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }

  render () {
    const { otpError, isProcessing } = this.state
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
                onChange={(event) => this.onFieldChange('otp', event)}
                onKeyPress={event => {
                  if (event.key === 'Enter') {
                    this.handleVerifyEmail()
                  }
                }}
              />
              <span className='error'>{otpError}</span>
              <span className='error'>{this.errorMessageFor('email')}</span>
              <div className="mt40">
                <PrimaryButton
                  color='primary'
                  buttonName={isProcessing ? "Please Wait..." : "Verify Email"}
                  disabled={!!isProcessing}
                  className="leftIcon-btn pswrd-btn"
                  handleButtonClick={() => this.handleVerifyEmail()}
                />
              </div>
            </Card>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    userErrors: getUserErrors(state),
    emailVerified: getEmailVerified(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { forgotPasswordRequest, resetUserFlagsRequest, verifyOtpRequest, setProcessingRequest } = actions

  return {
    actions: bindActionCreators(
      {
        forgotPasswordRequest,
        resetUserFlagsRequest,
        verifyOtpRequest,
        setProcessingRequest
      },
      dispatch
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(VerifyEmail))
