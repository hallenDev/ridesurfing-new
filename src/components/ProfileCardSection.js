import _ from 'underscore'
import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import { PrimaryButton } from '../components/Buttons'
import Cards from '../images/card.png'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from '../actions'
import { getCards, getCard, getCardErrors, getCardSaved, getCardDeleted, getCardPrimary, getIsProcessing } from '../reducers/CardReducer'

const expMonth = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const selectYear = [ '2019', '2020', '2021', '2022', '2023', '2024']

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
}

class ProfileCardSection extends Component {

  constructor (props) {
    super(props)
    this.state = {
      card: {},
      cardProcessing: false,
      primaryProcessing: false
    }
  }

  componentWillMount () {
    const { getCardsRequest } = this.props.actions
    getCardsRequest()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { resetCardsFlagRequest, getCardsRequest } = this.props.actions

    if (nextProps.cardSaved) {
      resetCardsFlagRequest()
      getCardsRequest()
      this.setState({ card: {} })
    }

    if (nextProps.cardDeleted) {
      resetCardsFlagRequest()
      getCardsRequest()
      this.setState({ card: {} })
    }

    if (nextProps.cardPrimary) {
      resetCardsFlagRequest()
      getCardsRequest()
      this.setState({ card: {} })
    }

    if (!!nextProps.submitCardForm && nextProps.submitCardForm !== this.props.submitCardForm) {
      this.handleCardSave()
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ isProcessing: nextProps.isProcessing })
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ cardProcessing: nextProps.isProcessing, primaryProcessing: nextProps.isProcessing })
    }
  }

  handleChange = prop => event => {
    this.setState({ [prop] : event.target.value });
  }

  onFieldChange = (fieldName, event) => {
    const { card } = this.state
    card[fieldName] = event.target.value
    this.setState({card})
  }

  errorMessageFor = (fieldName) => {
    const { cardErrors } = this.props
    if (cardErrors && cardErrors[fieldName])
      return cardErrors[fieldName]
  }

  handleCardSave () {
    const { card } = this.state
    const { setCardProcessingRequest, createCardRequest, updateCardRequest } = this.props.actions
    this.setState({ cardProcessing: true })

    setCardProcessingRequest()
    card.id ? updateCardRequest(card.id, card) : createCardRequest(card)
  }

  handleEditCard (cardToUpdate) {
    const { last4, card_holder_name } = cardToUpdate.attributes
    const card = { id: cardToUpdate.id, name: card_holder_name, last4 }
    this.setState({ card })
  }

  setAsPrimaryCard (cardId) {
    const { setAsPrimaryCardRequest } = this.props.actions
    this.setState({ primaryProcessing: true })
    setAsPrimaryCardRequest(cardId)
  }

  handleDeleteCard = (cardId) => {
    const { deleteCardRequest } = this.props.actions

    confirmAlert({
      title: 'Alert!',
      message: 'Are you sure you want to delete the credit card details?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteCardRequest(cardId)
        },
        {
          label: 'No',
          onClick: () => console.log('canceled')
        }
      ]
    })
  }

  render () {
    const { card, cardProcessing, primaryProcessing } = this.state
    const { cards, ignoreButton, cardErrors  } = this.props

    return (
      <div className="profile-card-section">
        <div className="row">
          <div className="col s12 m12">
            <div className="row">
              <div className="col l5 m6 s12">
                <h5>Payment Method <span className='payout' target='_blank'>powered by <a href='https://stripe.com'>Stripe</a></span></h5>
              </div>
              <div className="col l7 m6 s12">
                <img src={Cards} alt='visa' className="mt10 responsive-img"/>
              </div>
            </div>
            <div className=" row">
              <div className="col s12">
                {!card.id && <TextField
                  fullWidth
                  className='text-field cvc-field'
                  id='name'
                  type='text'
                  label='Name on the card*'
                  margin="normal"
                  value={card.name || ''}
                  onChange={(event) => this.onFieldChange('name', event)}
                />}
                {!!card.id && <TextField
                  fullWidth
                  className='text-field cvc-field'
                  id='name'
                  type='text'
                  label='Name on the card*'
                  margin="normal"
                  value={card.name || ''}
                />}
                <span className='error'>{this.errorMessageFor('name')}</span>
              </div>
            </div>
            <div className=" row">
              <div className="col s12">
                {!!card.id && <TextField
                  fullWidth
                  className='text-field cvc-field'
                  id='card-number'
                  type='text'
                  label='Card Number*'
                  margin="normal"
                  value={`XXXX-XXXX-XXXX-${card.last4}`}
                />}
                {!card.id && <TextField
                  fullWidth
                  className='text-field cvc-field'
                  id='card-number'
                  type='text'
                  label='Card Number*'
                  margin="normal"
                  value={card.number || ''}
                  onChange={(event) => this.onFieldChange('number', event)}
                />}
                <span className='error'>{this.errorMessageFor('number')}</span>
              </div>
            </div>
            <div className="row">
              <div className="col l5 s12 mb10">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Select Month*</InputLabel>
                  <Select
                    value={card.exp_month || ''}
                    onChange={(event) => this.onFieldChange('exp_month', event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    className="selected-menu-field"
                  >
                    {expMonth.map(month => (
                      <MenuItem
                        key={month}
                        value={month}
                      >
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                  <span className='error'>{this.errorMessageFor('exp_month')}</span>
                  {!!cardErrors['card_params'] && <span className='error'>{cardErrors['card_params']}</span>}
                </FormControl>
              </div>
              <div className="col l5 s12 mb10">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Select Year*</InputLabel>
                  <Select
                    value={card.exp_year || ''}
                    onChange={(event) => this.onFieldChange('exp_year', event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    className="selected-menu-field"
                  >
                    {selectYear.map(year => (
                      <MenuItem
                        key={year}
                        value={year}
                      >
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  <span className='error'>{this.errorMessageFor('exp_year')}</span>
                </FormControl>
              </div>
              <div className="col l2 s12">
                <TextField
                  fullWidth
                  className='text-field cvc-field'
                  id='cvc'
                  type='text'
                  label='CVC*'
                  margin="normal"
                  value={card.cvc || ''}
                  onChange={(event) => this.onFieldChange('cvc', event)}
                />
                <span className='error'>{this.errorMessageFor('cvc')}</span>
              </div>
            </div>
            {!ignoreButton && <div className="mt20 mb20">
              <PrimaryButton
                color='primary'
                buttonName={cardProcessing ? "Please Wait..." : "Save Card"}
                className="lg-primary"
                handleButtonClick={() => this.handleCardSave()}
                disabled={!!cardProcessing}
              />
            </div>}
            <div className="cardsList">
              {_.map(cards, (card, index) => {
                return <div className=" list-group text-left" key={`card-${index}`}>
                  <p className="cardNumber">
                    XXXX-XXXX-XXXX-{card.attributes.last4}
                    {card.attributes.is_primary &&
                      <span className="prime-card">Primary</span>
                    }
                    {/* eslint-disable-next-line */}
                    {!card.attributes.is_primary && <a href='javascript:void(0)' onClick={() => this.handleDeleteCard(card.id)} className="active-status"><i className="fa fa-trash"></i></a>}
                    {/* eslint-disable-next-line */}
                    <a href='javascript:void(0)' onClick={() => this.handleEditCard(card)} className="active-status"><i className="fa fa-pencil"></i>&nbsp;</a>
                    {/* eslint-disable-next-line */}
                    {!card.attributes.is_primary && <a href='javascript:void(0)' onClick={() => this.setAsPrimaryCard(card.id)} className="prime-btn"><span>{primaryProcessing ? "Please Wait..." : "Set as Primary"}</span> <i className="fa fa-credit-card"/></a>}
                  </p>
                </div>
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    card: getCard(state),
    cards: getCards(state),
    cardErrors: getCardErrors(state),
    cardSaved: getCardSaved(state),
    cardDeleted: getCardDeleted(state),
    cardPrimary: getCardPrimary(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getCardRequest, getCardsRequest, createCardRequest, updateCardRequest, deleteCardRequest, setAsPrimaryCardRequest, resetCardsFlagRequest, setProcessingRequest, setCardProcessingRequest  } = actions

  return {
    actions: bindActionCreators(
      {
        getCardRequest,
        getCardsRequest,
        createCardRequest,
        updateCardRequest,
        deleteCardRequest,
        setAsPrimaryCardRequest,
        resetCardsFlagRequest,
        setProcessingRequest,
        setCardProcessingRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileCardSection)
