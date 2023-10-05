import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router-dom'

import { PrimaryButton } from '../components/Buttons'

import * as actions from '../actions'
import { getUserErrors, getResetPassword, getIsProcessing } from '../reducers/UserReducer'

class ResetPassword extends Component {

  constructor (props) {
    super(props)
    this.state = {
      otp: '',
      password: '',
      userErrors: {},
      isProcessing: false
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { resetUserFlagsRequest } = this.props.actions
    const { history } = this.props

    if (nextProps.resetPassword) {
      resetUserFlagsRequest()
      history.push('/login')
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ isProcessing: nextProps.isProcessing })
    }

    if (nextProps.userErrors)
      this.setState({userErrors: nextProps.userErrors})
  }

  errorMessageFor = (fieldName) => {
    const { userErrors } = this.props
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName]
    }
  }

  onFieldChange = (fieldName, event) => {
    this.setState({ [fieldName]: event.target.value, [`userErrors[${fieldName}]`]: null })
  }

  onKeyPressEnter = (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
      this.handleResetPassword()
    }
  }

  handleResetPassword () {
    const { otp, password } = this.state
    const { resetPasswordRequest } = this.props.actions
    resetPasswordRequest(otp, password)
    this.setState({ isProcessing: true })
  }

  render () {
    const { isProcessing } = this.state
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
              onChange={(event) => this.onFieldChange('otp', event)}
              onKeyPress={(event) => this.onKeyPressEnter(event)}
            />
            <span className='error'>{this.errorMessageFor('mobile')}</span>
            <TextField
              fullWidth
              className='text-field'
              id='password'
              type='password'
              label='Reset Password'
              margin="normal"
              onChange={(event) => this.onFieldChange('password', event)}
              onKeyPress={(event) => this.onKeyPressEnter(event)}
            />
            <span className='error'>{this.errorMessageFor('password')}</span>
            <div className="mt40">
              <PrimaryButton
                color='primary'
                buttonName={isProcessing ? "Please Wait" : "Reset Password"}
                className="leftIcon-btn"
                disabled={!!isProcessing}
                handleButtonClick={() => this.handleResetPassword()}
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
    resetPassword: getResetPassword(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { resetPasswordRequest, resetUserFlagsRequest, setProcessingRequest } = actions

  return {
    actions: bindActionCreators(
      {
        resetPasswordRequest,
        resetUserFlagsRequest,
        setProcessingRequest
      },
      dispatch
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResetPassword))
