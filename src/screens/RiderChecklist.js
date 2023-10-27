import _ from 'underscore'
import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone'
import Button from '@material-ui/core/Button'
import Switch from "react-switch"
import ReactLoading from 'react-loading'

import ProfileCardSection from '../components/ProfileCardSection'
import useSessionStore from '../store/SessionStore';
import useCardStore from '../store/CardStore';

import missingImg from '../images/missing.png'

const RiderChecklist = (props) => {

  const sessionStore = useSessionStore();
  const cardStore = useCardStore();

  const currentUser = sessionStore.currentUser;
  const profileErrors = sessionStore.profileErrors;
  const profileSaved = sessionStore.profileSaved;
  const cardErrors = cardStore.errors;
  const cardSaved = cardStore.isSaved;
  const isProcessing = sessionStore.isProcessing;
  const isCardProcessing = cardStore.isCardProcessing;

  const initial_state = {
    submitCardForm: false,
    profileErrors: {},
    cardErrors: {},
    profileProcessing: false,
    imageProcessing: false,
    price: !!props.location.state && props.location.state.price,
    profile: {
      is_rider: true
    }
  }

  const [state, setState] = useState(initial_state)

  useEffect(() => {
    if (profileSaved && Object.keys(profileErrors).length === 0) {
      sessionStore.resetProfileFlagsRequest()
    }
  }, [profileSaved, profileErrors])

  useEffect(() => {
    if (cardSaved && Object.keys(cardErrors).length === 0) {
      cardStore.resetCardsFlagRequest()
      setState({ ...state, submitCardForm: false })

      const prevUrl = localStorage.prevUrl
      localStorage.removeItem('prevUrl')

      if (prevUrl && prevUrl.includes('/ride/')) {
        return window.location.href = prevUrl
      }
    }
  }, [cardSaved, cardErrors])

  useEffect(() => {
    if (profileErrors) {
      setState({ ...state, profileErrors: profileErrors, submitCardForm: false })
    }
  }, [profileErrors])

  useEffect(() => {
    if (cardErrors) {
      setState({ ...state, cardErrors: cardErrors, submitCardForm: false })
    }
  }, [cardErrors])

  useEffect(() => {
    const { history } = props;
   if (currentUser) {
      const { has_cards, has_completed_rider_profile } = currentUser.attributes
      const profile = currentUser.relationships.profile.attributes
      profile['is_rider'] = true
      setState({ ...state, profile })

      if (!!has_cards && !!has_completed_rider_profile)
        history.push('/requests')
    }
  }, [currentUser])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({ 
        ...state,
        imageProcessing: isProcessing,
        cardProcessing: isCardProcessing,
        profileProcessing: isProcessing || isCardProcessing
      })
    }
  }, [isProcessing, isCardProcessing])

  if (!localStorage.accessToken) {
    localStorage.setItem('prevUrl', `/profile_details`)
    return window.location.href = `/login`
  }

  const displayImage = () => {

    const { profile } = currentUser.relationships
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const img = _.find(images, (img) => { return img.attributes.image_type === 'display'})
      return img ? img.attributes.url : missingImg
    }
  }

  const handleChange = prop => event => {
    setState({ 
      ...state, 
      [prop] : event.target.value, 
    });
  }

  const onDrop = (files) => {
    uploadImage(files, 'display')
  }

  const onCancel= () => {}

  const errorMessageFor = (fieldName) => {
    if (profileErrors && profileErrors[fieldName]) {
      return profileErrors[fieldName]
    }
  }

  const onFieldChange = (fieldName, event) => {
    const { profile } = state
    let tmp = JSON.parse(JSON.stringify(profile));
    tmp[fieldName] = event.target.value

    if (fieldName === 'car_make') {
      tmp['car_model'] = null
      tmp['car_year'] = null
      tmp['car_color'] = null
    }
    setState({ 
      ...state, 
      profile: tmp
    })
  }

  const onToggleChange = (fieldName, checked) => {
    const { profile } = state
    let tmp = JSON.parse(JSON.stringify(profile));
    tmp[fieldName] = checked

    setState({ 
      ...state,
      profile: tmp
    })
  }

  const uploadImage = (files, imageType) => {
    const fileObj = files[0]
    setState({
      ...state,
      imageProcessing: true
    })
    sessionStore.setProcessingRequest()

    let img

    if (fileObj) {
      var FR = new FileReader()

      FR.addEventListener("load", function(e) {
        img = e.target.result
        sessionStore.uploadProfileImageRequest(imageType, img)
      })

      FR.readAsDataURL(fileObj)
    }
  }

  const handleProfileSave = () => {
    const { profile } = state
    setState({ 
      ...state,
      profileProcessing: true 
    })
    sessionStore.saveProfileRequest(profile.id, profile)
    setState({ 
      ...state,
      submitCardForm: true 
    })
  }

  const { profile, submitCardForm, imageProcessing, profileProcessing } =  state
  const { has_cards } = currentUser.attributes

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="row">
          <div className="col l3 s12 center-align">
            <div className="user-img-container">
              <img src={displayImage()} className="user-img responsive-img" alt="" />
            </div>
            <span className='error'>{errorMessageFor('is_rider')}</span>
            <div className="mt20">
              <div className='bubble-container'>
                {!!imageProcessing && <ReactLoading type='bubbles' color='#3399ff' height='25%' width='25%' />}
              </div>
              <Dropzone
                onDrop={(files) => uploadImage(files, 'display')}
                onFileDialogCancel={onCancel}
                className="dropzone"
              >
                {({getRootProps, getInputProps}) => (
                  <section className="dropzone">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <div>Try dropping image here, or click to select image to upload. Size should be less than 3 MB.</div>
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>
            <div className="row mt20 user-preference">
              <div className="col l9 s9 left-align">
                <span>Do you allow smoking?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.smoking}
                  onChange={(checked, event, id) => onToggleChange('smoking', checked)}
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
            <div className="row user-preference">
              <div className="col l9 s9 left-align">
                <span>Do you allow pets?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.pets}
                  onChange={(checked, event, id) => onToggleChange('pets', checked)}
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
            <div className="row user-preference">
              <div className="col l9 s9 left-align">
                <span>Do you have or prefer ac?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.car_ac}
                  onChange={(checked, event, id) => onToggleChange('car_ac', checked)}
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
            <div className="row user-preference">
              <div className="col l9 s9 left-align">
                <span>Are you open to traveling with kids?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.kid_friendly}
                  onChange={(checked, event, id) => onToggleChange('kid_friendly', checked)}
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
          </div>
          <div className="col offset-l1 l8 s12 right-side">
            <div className='row alert alert-success'>Review your required profile data in order to request.</div>
      {!has_cards && <div className="row mt20 ml0">
              <ProfileCardSection ignoreButton={true} submitCardForm={submitCardForm}/>
            </div>}
            <div className="mt40 mb20">
              <Button
                variant="contained"
                color='primary'
                className='update-btn'
                disabled={!!profileProcessing}
                onClick={() => handleProfileSave()}
              >
                {profileProcessing ? "Please Wait..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default (RiderChecklist)
