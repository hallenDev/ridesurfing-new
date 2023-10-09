import _ from 'underscore'
import React, { Component, useState } from 'react'
import TextField from '@material-ui/core/TextField'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../actions'
import { getCurrentUser, getProfileSaved, getProfileErrors, getIsProcessing } from '../reducers/SessionReducer'

import { PrimaryButton } from '../components/Buttons'
import Card from '../images/card.png'
import fetch from 'isomorphic-fetch'

const initial_state = {
  account: {
    account_number: '',
    routing_number: '',
    ssn: ''
  },
  address: {
    address: '',
    city: '',
    state: '',
    zip: ''
  },
  ip: '',
  accountErrors: {},
  addressErrors: {},
  isProcessing: false
}

const ProfilePayoutSection = (props) => {

  const [state, setState] = useState(initial_state);

  // to-do
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   const { resetProfileFlagsRequest } = this.props.actions

  //   if (nextProps.profileSaved) {
  //     resetProfileFlagsRequest()
  //     this.setState({ account: {}, address: {} })
  //   }

  //   if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //     this.setState({ isProcessing: nextProps.isProcessing })
  //   }

  //   if (!!nextProps.submitAccountForm && nextProps.submitAccountForm !== this.props.submitAccountForm) {
  //     this.handleAccountSave()
  //   }
  // }

  const onFieldChange = (field, fieldName, event) => {
    const bank = state[field]
    bank[fieldName] = event.target.value
    setState({
      ...state, 
      bank
    })

    fetch('https://geolocation-db.com/json/')
      .then(res => res.json())
      .then(json => setState({...state, ip: json.IPv4}))
  }

  const handleAccountSave = () => {
    const { account, address, ip } = state
    const { setAccountProcessingRequest, saveAccountRequest } = props.actions
    setState({ isProcessing: true })

    if (allFieldsPresent()) {
      setAccountProcessingRequest('payout')
      saveAccountRequest(account, address, ip)
    }
  }

  const allFieldsPresent = () => {
    let present = true
    const { account, address, accountErrors, addressErrors } = state

    _.map(['routing_number', 'account_number', 'ssn'], (field) => {
      if (!account[field]) {
        accountErrors[field] = "can't be blank"
        present = false
      } else {
        accountErrors[field] = ""
      }
    })

    _.map(['address', 'city', 'state', 'zip'], (field) => {
      if (!address[field]) {
        addressErrors[field] = "can't be blank"
        present = false
      } else {
        addressErrors[field] = ""
      }
    })

    if (!present) {
      setState({ 
        ...state,
        accountErrors, 
        addressErrors, 
        isProcessing: false 
      })
      return false
    } else {
      return true
    }
  }

  const errorMessageFor = (fieldName) => {
    const { profileErrors } = props
    if (profileErrors && profileErrors[fieldName])
      return profileErrors[fieldName]
  }
  const { account, address, accountErrors, addressErrors, isProcessing } = state
  const { profileErrors } = props
  const { currentUser, ignoreButton } = props
  
  return (
    <div className="profile-payout-section">
      <div className="row">
        <div className="col s12 m12">
          <div className="row">
            <div className="col l6 s12">
              <h5>Payout <span className='payout' target='_blank'>powered by <a href='https://stripe.com'>Stripe</a></span></h5>
            </div>
            <div className="col l6 s12">
              <img src={Card} alt='visa' className="mt10"/>
            </div>
          </div>
          <div className="row">
            <div className="col l4 s12">
              <TextField
                fullWidth
                className='text-field'
                id='routing-number'
                type='text'
                label='Routing Number*'
                margin="normal"
                value={account.routing_number || ''}
                onChange={(event) => onFieldChange('account', 'routing_number', event)}
              />
              {!!accountErrors['routing_number'] && <span className='error'>{accountErrors['routing_number']}</span>}
              {!!profileErrors['account_params'] && <span className='error'>{profileErrors['account_params']}</span>}
            </div>
            <div className="col l4 s12">
              <TextField
                fullWidth
                className='text-field'
                id='acc-number'
                type='text'
                label='Account Number*'
                margin="normal"
                value={account.account_number || ''}
                onChange={(event) => onFieldChange('account', 'account_number', event)}
              />
              {!!accountErrors['account_number'] && <span className='error'>{accountErrors['account_number']}</span>}
            </div>
            <div className="col l4 s12">
              <TextField
                fullWidth
                className='text-field'
                id='ssh'
                type='text'
                label='SSN last four*'
                margin="normal"
                value={account.ssn || ''}
                onChange={(event) => onFieldChange('account', 'ssn', event)}
              />
              {!!accountErrors['ssn'] && <span className='error'>{accountErrors['ssn']}</span>}
            </div>
          </div>
          <h6>Address Details</h6>
          <div className='row'>
            <div className="col l6 s12">
              <TextField
                fullWidth
                className='text-field'
                id='address'
                type='text'
                label='Address*'
                margin="normal"
                value={address.address || ''}
                onChange={(event) => onFieldChange('address', 'address', event)}
              />
              {!!addressErrors['address'] && <span className='error'>{addressErrors['address']}</span>}
            </div>
            <div className="col l6 s12">
              <TextField
                fullWidth
                className='text-field'
                id='city'
                type='text'
                label='City*'
                margin="normal"
                value={address.city || ''}
                onChange={(event) => onFieldChange('address', 'city', event)}
              />
              {!!addressErrors['city'] && <span className='error'>{addressErrors['city']}</span>}
            </div>
          </div>
          <div className="row">
            <div className="col l6 s12">
              <TextField
                fullWidth
                className='text-field'
                id='state'
                type='text'
                label='State*'
                margin="normal"
                value={address.state || ''}
                onChange={(event) => onFieldChange('address', 'state', event)}
              />
              {!!addressErrors['state'] && <span className='error'>{addressErrors['state']}</span>}
            </div>
            <div className="col l6 s12">
              <TextField
                fullWidth
                className='text-field'
                id='zip'
                type='text'
                label='Zip*'
                margin="normal"
                value={address.zip || ''}
                onChange={(event) => onFieldChange('address', 'zip', event)}
              />
              {!!addressErrors['zip'] && <span className='error'>{addressErrors['zip']}</span>}
            </div>
          </div>
          {!ignoreButton && <div className="mt20 mb20">
            <PrimaryButton
              color='primary'
              buttonName={isProcessing ? "Please Wait..." : "Save Account"}
              className="lg-primary"
              disabled={!!isProcessing}
              handleButtonClick={() => handleAccountSave()}
            />
          </div>}
          {(currentUser.attributes.account_last4 || !!ignoreButton) && <div className="cardsList">
            <div className=" list-group text-left">
              <p className="cardNumber">
                {currentUser.attributes.account_last4 && <span>Your Ridesurfing account is connected to the Bank Account <span className='bold'>xxxx-xxxx-{currentUser.attributes.account_last4}</span><br/></span>}
                We do not store your bank account and credit cards details with us. {currentUser.attributes.account_last4 && "You can update the new bank account details by using the form above."}
              </p>
            </div>
          </div>}
        </div>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    profileErrors: getProfileErrors(state),
    profileSaved: getProfileSaved(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { saveAccountRequest, resetProfileFlagsRequest, setAccountProcessingRequest  } = actions

  return {
    actions: bindActionCreators(
      {
        saveAccountRequest,
        resetProfileFlagsRequest,
        setAccountProcessingRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePayoutSection)
