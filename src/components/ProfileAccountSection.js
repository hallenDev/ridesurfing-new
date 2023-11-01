import React, {useState, useEffect} from 'react'
import TextField from '@material-ui/core/TextField'

import DatePicker from 'react-datepicker'
import moment from 'moment'
import {PrimaryButton} from '../components/Buttons'
import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core'
import useSessionStore from '../store/SessionStore'
import {confirmAlert} from 'react-confirm-alert'

const gender = ['Male', 'Female', 'Other']

const MAX_DATE = moment().subtract(18, 'years').toDate()

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
}

const initial_state = {
  user: {},
  accountProcessing: false,
  passwordProcessing: false,
}

const ProfileAccountSection = (props) => {
  const sessionStore = useSessionStore()

  const currentUser = sessionStore.currentUser
  const currentUserErrors = sessionStore.userErrors
  const userUpdated = sessionStore.userUpdated
  const passwordUpdated = sessionStore.passwordUpdated
  const isProcessing = sessionStore.isProcessing

  const [state, setState] = useState(initial_state)

  useEffect(() => {
    if (localStorage.accessToken) {
      sessionStore.getCurrentUserRequest()
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      setState({
        ...state,
        user: currentUser.attributes,
      })
    }
  }, [currentUser])

  useEffect(() => {
    if (userUpdated || passwordUpdated) {
      sessionStore.resetCurrentUserFlagsRequest()
      const {user} = state
      let tmp = JSON.parse(JSON.stringify(user))
      tmp['current_password'] = ''
      tmp['password'] = ''
      setState({
        ...state,
        user: tmp,
      })
    }
  }, [userUpdated, passwordUpdated])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({
        ...state,
        accountProcessing: isProcessing,
        passwordProcessing: isProcessing,
      })
    }
  }, [isProcessing])

  const onFieldChange = (fieldName, event) => {
    const {user} = state
    let tmp = JSON.parse(JSON.stringify(user))
    tmp[fieldName] = event.target.value
    setState({
      ...state,
      user: tmp,
    })
  }

  const onDateChange = (fieldName, date) => {
    const {user} = state
    let tmp = JSON.parse(JSON.stringify(user))
    tmp[fieldName] =
      date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear()
    setState({
      ...state,
      user: tmp,
    })
  }

  const errorMessageFor = (fieldName) => {
    if (currentUserErrors && currentUserErrors[fieldName]) {
      return currentUserErrors[fieldName]
    }
  }

  const handleAccountSave = () => {
    const {user} = state
    setState({
      ...state,
      accountProcessing: true,
    })
    sessionStore.updateUserRequest(currentUser.id, user)
  }

  const handleUpdatePassword = () => {
    const {user} = state
    setState({
      ...state,
      passwordProcessing: true,
    })
    sessionStore.changeUserPasswordRequest(user)
  }

  const handleDeleteAction = () => {
    confirmAlert({
      title: 'Alert!',
      message: 'Are you sure you delete your account?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            sessionStore.deleteAccountRequest()
            return (window.location.href = `/login`)
          },
        },
        {
          label: 'No',
          onClick: () => console.log('canceled'),
        },
      ],
    })
  }

  const {user, accountProcessing, passwordProcessing} = state

  return (
    <div className="profile-account-section">
      <div className="row">
        <div className="col s12 m12">
          <h5>Account Information</h5>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="firstname"
              type="text"
              label="First Name"
              margin="normal"
              value={user.first_name || ''}
              onChange={(event) => onFieldChange('first_name', event)}
            />
            <span className="error">{errorMessageFor('first_name')}</span>
          </div>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="lastname"
              type="text"
              label="Last Name"
              margin="normal"
              value={user.last_name || ''}
              onChange={(event) => onFieldChange('last_name', event)}
            />
            <span className="error">{errorMessageFor('last_name')}</span>
          </div>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="email"
              type="text"
              label="Email"
              margin="normal"
              value={user.email || ''}
              onChange={(event) => onFieldChange('email', event)}
            />
            <span className="error">{errorMessageFor('email')}</span>
          </div>
          <div className="mb10">
            <div className="date-label">Date of Birth</div>
            <div className="date-picker-field">
              <DatePicker
                selected={!!user.birthday ? moment(user.birthday).toDate() : ''}
                onChange={(date) => onDateChange('birthday', date)}
                maxDate={MAX_DATE}
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
                className="date-field text-field"
              />
            </div>
            <span className="error">{errorMessageFor('birthday')}</span>
          </div>
          <div className="mb10">
            <FormControl className="selectField">
              <InputLabel className="selectLabel" htmlFor="select-multiple">
                Select Gender
              </InputLabel>
              <Select
                value={user.gender || ''}
                onChange={(event) => onFieldChange('gender', event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                className="selected-menu-field">
                {gender.map((name) => (
                  <MenuItem key={name} value={name} className="menu-field">
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="mt20 mb20">
            <PrimaryButton
              color="primary"
              buttonName={accountProcessing ? 'Please Wait...' : 'Save'}
              className="lg-primary"
              handleButtonClick={() => handleAccountSave()}
              disabled={!!accountProcessing}
            />
          </div>
          <h5>Change Password</h5>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="current_password"
              type="password"
              label="Current Password"
              margin="normal"
              value={user.current_password || ''}
              onChange={(event) => onFieldChange('current_password', event)}
            />
            <span className="error">{errorMessageFor('current_password')}</span>
          </div>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="password"
              type="password"
              label="New Password"
              margin="normal"
              value={user.password || ''}
              onChange={(event) => onFieldChange('password', event)}
            />
            <span className="error">{errorMessageFor('password')}</span>
          </div>
          <div className="mt20 mb20">
            <PrimaryButton
              color="primary"
              buttonName={
                passwordProcessing ? 'Please Wait...' : 'Update Password'
              }
              className="lg-primary"
              handleButtonClick={() => handleUpdatePassword()}
              disabled={!!passwordProcessing}
            />
          </div>
        </div>
        <div className="row">
          <div class="col s12 m12">
            <PrimaryButton
              color="primary"
              buttonName={'Delete Account'}
              className="lg-primary"
              handleButtonClick={() => handleDeleteAction()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileAccountSection
