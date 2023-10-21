import _ from 'underscore'
import React, { useEffect, useState, useRef } from 'react'
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

import useCardStore from '../store/CardStore';

const expMonth = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const selectYear = [ '2019', '2020', '2021', '2022', '2023', '2024']

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
}

const initial_state = {
  card: {},
  cardProcessing: false,
  primaryProcessing: false
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const ProfileCardSection = (props) => {

  const cardStore = useCardStore();
  // const card = cardStore.card;
  const cards = cardStore.cards;
  const cardErrors = cardStore.errors;
  const cardSaved = cardStore.isSaved;
  const cardDeleted = cardStore.isDeleted;
  const cardPrimary = cardStore.isPrimary;
  const isProcessing = cardStore.isProcessing;

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    cardStore.getCardsRequest()
  }, [])

  useEffect(() => {
    if (cardSaved) {
      cardStore.resetCardsFlagRequest()
      cardStore.getCardsRequest()
      setState({ ...state, card: {} })
    }
  }, [cardSaved])

  useEffect(() => {
    if (cardDeleted) {
      cardStore.resetCardsFlagRequest()
      cardStore.getCardsRequest()
      setState({ ...state, card: {} })
    }
  }, [cardDeleted])

  useEffect(() => {
    if (cardPrimary) {
      cardStore.resetCardsFlagRequest()
      cardStore.getCardsRequest()
      setState({ ...state, card: {} })
    }
  }, [cardPrimary])

  let prevProps = usePrevious(props);
  useEffect(() => {
    if (!!props.submitCardForm && props.submitCardForm !== prevProps.submitCardForm) {
      handleCardSave()
    }
  }, [props])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({ 
        ...state, 
        isProcessing: isProcessing, 
        cardProcessing: isProcessing, 
        primaryProcessing: isProcessing 
      })
    }
  }, [isProcessing])

  const handleChange = prop => event => {
    setState({ 
      ...state,
      [prop] : event.target.value 
    });
  }

  const onFieldChange = (fieldName, event) => {
    const { card } = state;
    let tmp = JSON.parse(JSON.stringify(card));
    tmp[fieldName] = event.target.value
    setState({
      ...state,
      card: tmp
    })
  }

  const errorMessageFor = (fieldName) => {
    if (cardErrors && cardErrors[fieldName])
      return cardErrors[fieldName]
  }

  const handleCardSave = () => {
    const { card } = state
    setState({ 
      ...state,
      cardProcessing: true 
    })

    cardStore.setCardProcessingRequest()
    card.id ? cardStore.updateCardRequest(card.id, card) : cardStore.createCardRequest(card)
  }

  const handleEditCard = (cardToUpdate) => {
    const { last4, card_holder_name } = cardToUpdate.attributes
    const card = { id: cardToUpdate.id, name: card_holder_name, last4 }
    setState({ 
      ...state,
      card 
    })
  }

  const setAsPrimaryCard = (cardId) => {
    setState({ 
      ...state,
      primaryProcessing: true 
    })
    cardStore.setAsPrimaryCardRequest(cardId)
  }

  const handleDeleteCard = (cardId) => {

    confirmAlert({
      title: 'Alert!',
      message: 'Are you sure you want to delete the credit card details?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => cardStore.deleteCardRequest(cardId)
        },
        {
          label: 'No',
          onClick: () => console.log('canceled')
        }
      ]
    })
  }

  const { cardProcessing, primaryProcessing, card } = state
  const { ignoreButton } = props

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
                onChange={(event) => onFieldChange('name', event)}
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
              <span className='error'>{errorMessageFor('name')}</span>
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
                onChange={(event) => onFieldChange('number', event)}
              />}
              <span className='error'>{errorMessageFor('number')}</span>
            </div>
          </div>
          <div className="row">
            <div className="col l5 s12 mb10">
              <FormControl className="selectField">
                <InputLabel htmlFor="select-multiple">Select Month*</InputLabel>
                <Select
                  value={card.exp_month || ''}
                  onChange={(event) => onFieldChange('exp_month', event)}
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
                <span className='error'>{errorMessageFor('exp_month')}</span>
                {!!cardErrors['card_params'] && <span className='error'>{cardErrors['card_params']}</span>}
              </FormControl>
            </div>
            <div className="col l5 s12 mb10">
              <FormControl className="selectField">
                <InputLabel htmlFor="select-multiple">Select Year*</InputLabel>
                <Select
                  value={card.exp_year || ''}
                  onChange={(event) => onFieldChange('exp_year', event)}
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
                <span className='error'>{errorMessageFor('exp_year')}</span>
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
                onChange={(event) => onFieldChange('cvc', event)}
              />
              <span className='error'>{errorMessageFor('cvc')}</span>
            </div>
          </div>
          {!ignoreButton && <div className="mt20 mb20">
            <PrimaryButton
              color='primary'
              buttonName={cardProcessing ? "Please Wait..." : "Save Card"}
              className="lg-primary"
              handleButtonClick={() => handleCardSave()}
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
                  {!card.attributes.is_primary && <a href='javascript:void(0)' onClick={() => handleDeleteCard(card.id)} className="active-status"><i className="fa fa-trash"></i></a>}
                  {/* eslint-disable-next-line */}
                  <a href='javascript:void(0)' onClick={() => handleEditCard(card)} className="active-status"><i className="fa fa-pencil"></i>&nbsp;</a>
                  {/* eslint-disable-next-line */}
                  {!card.attributes.is_primary && <a href='javascript:void(0)' onClick={() => setAsPrimaryCard(card.id)} className="prime-btn"><span>{primaryProcessing ? "Please Wait..." : "Set as Primary"}</span> <i className="fa fa-credit-card"/></a>}
                </p>
              </div>
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default (ProfileCardSection)
