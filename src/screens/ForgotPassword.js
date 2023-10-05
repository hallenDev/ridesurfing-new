import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'

import * as actions from '../actions'
import { getUserErrors, getCodeSent, getIsProcessing } from '../reducers/UserReducer'

class ForgotPassword extends Component {

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

    if (nextProps.codeSent) {
      resetUserFlagsRequest()
      history.push('/reset_password')
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

  handleForgotPassword () {
    const { forgotPasswordRequest } = this.props.actions
    const { identity } = this.state
    forgotPasswordRequest(identity)
    this.setState({ isProcessing: true })

    if (!identity)
      this.setState({ identityError: 'Please provide a valid registered email.' })
  }

  errorMessageFor = (fieldName) => {
    const { userErrors } = this.props
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }

  render () {
    const { isProcessing } = this.state
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
                onChange={(event) => this.onFieldChange('identity', event)}
                onKeyPress={event => {
                  if (event.key === 'Enter' || event.keyCode === 13) {
                    this.handleForgotPassword()
                  }
                }}
              />
              <span className='error'>{this.errorMessageFor('mobile')}</span>
              <div className="mt40">
                <PrimaryButton
                  color='primary'
                  buttonName={isProcessing ? "Please Wait" : "Request Password Reset Link"}
                  className="leftIcon-btn pswrd-btn"
                  disabled={!!isProcessing}
                  handleButtonClick={() => this.handleForgotPassword()}
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
