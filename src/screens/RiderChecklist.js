import _ from 'underscore'
import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import Button from '@material-ui/core/Button'
import Switch from "react-switch"
import ReactLoading from 'react-loading'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ProfileCardSection from '../components/ProfileCardSection'

import * as actions from '../actions'
import { getCurrentUser, getProfileSaved, getProfileErrors, getIsProcessing } from '../reducers/SessionReducer'
import { getCardErrors, getCardSaved, getIsCardProcessing } from '../reducers/CardReducer'

import missingImg from '../images/missing.png'

class RiderChecklist extends Component {

  constructor (props) {
    super(props)
    this.state = {
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
  }

  componentWillMount () {
    if (!localStorage.accessToken) {
      localStorage.setItem('prevUrl', `/profile_details`)
      return window.location.href = `/login`
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { history } = this.props
    const { resetProfileFlagsRequest, resetCardsFlagRequest } = this.props.actions

    if (nextProps.profileSaved && Object.keys(nextProps.profileErrors).length === 0) {
      resetProfileFlagsRequest()
    }

    if (nextProps.cardSaved && Object.keys(nextProps.cardErrors).length === 0) {
      resetCardsFlagRequest()
      this.setState({ submitCardForm: false })

      const prevUrl = localStorage.prevUrl
      localStorage.removeItem('prevUrl')

      if (prevUrl && prevUrl.includes('/ride/')) {
        return window.location.href = prevUrl
      }
    }

    if (nextProps.profileErrors) {
      this.setState({ profileErrors: nextProps.profileErrors, submitCardForm: false })
    }

    if (nextProps.cardErrors) {
      this.setState({ cardErrors: nextProps.cardErrors, submitCardForm: false })
    }

    if (nextProps.currentUser) {
      const { has_cards, has_completed_rider_profile } = nextProps.currentUser.attributes
      const profile = nextProps.currentUser.relationships.profile.attributes
      profile['is_rider'] = true
      this.setState({ profile })

      if (!!has_cards && !!has_completed_rider_profile)
        history.push('/requests')
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ 
        imageProcessing: nextProps.isProcessing,
        cardProcessing: nextProps.isCardProcessing,
        profileProcessing: nextProps.isProcessing || nextProps.isCardProcessing
      })
    }
  }

  displayImage () {
    const { currentUser } = this.props

    const { profile } = currentUser.relationships
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const img = _.find(images, (img) => { return img.attributes.image_type === 'display'})
      return img ? img.attributes.url : missingImg
    }
  }

  handleChange = prop => event => {
    this.setState({ [prop] : event.target.value, });
  }

  onDrop (files) {
    this.uploadImage(files, 'display')
  }

  onCancel() {}

  errorMessageFor = (fieldName) => {
    const { profileErrors } = this.props
    if (profileErrors && profileErrors[fieldName]) {
      return profileErrors[fieldName]
    }
  }

  onFieldChange = (fieldName, event) => {
    const { profile } = this.state
    profile[fieldName] = event.target.value

    if (fieldName === 'car_make') {
      profile['car_model'] = null
      profile['car_year'] = null
      profile['car_color'] = null
    }
    this.setState({ profile })
  }

  onToggleChange = (fieldName, checked) => {
    const { profile } = this.state
    profile[fieldName] = checked

    this.setState({ profile })
  }

  uploadImage (files, imageType) {
    const fileObj = files[0]
    const { uploadProfileImageRequest, setProcessingRequest } = this.props.actions
    this.setState({imageProcessing: true})
    setProcessingRequest()

    let img

    if (fileObj) {
      var FR = new FileReader()

      FR.addEventListener("load", function(e) {
        img = e.target.result
        uploadProfileImageRequest(imageType, img)
      })

      FR.readAsDataURL(fileObj)
    }
  }

  handleProfileSave () {
    const { profile } = this.state
    const { saveProfileRequest } = this.props.actions
    this.setState({ profileProcessing: true })
    saveProfileRequest(profile.id, profile)
    this.setState({ submitCardForm: true })
  }

  render () {
    const { profile, submitCardForm, imageProcessing, profileProcessing } =  this.state
    const { currentUser } = this.props
    const { has_cards } = currentUser.attributes

    return (
      <div className="edit-profile-page">
        <div className="container">
          <div className="row">
            <div className="col l3 s12 center-align">
              <div className="user-img-container">
                <img src={this.displayImage()} className="user-img responsive-img" alt="" />
              </div>
              <span className='error'>{this.errorMessageFor('is_rider')}</span>
              <div className="mt20">
                <div className='bubble-container'>
                  {!!imageProcessing && <ReactLoading type='bubbles' color='#3399ff' height='25%' width='25%' />}
                </div>
                <Dropzone
                  onDrop={(files) => this.uploadImage(files, 'display')}
                  onFileDialogCancel={this.onCancel.bind(this)}
                  className="dropzone"
                >
                  <div>Try dropping image here, or click to select image to upload. Size should be less than 3 MB.</div>
                </Dropzone>
              </div>
              <div className="row mt20 user-preference">
                <div className="col l9 s9 left-align">
                  <span>Do you allow smoking?</span>
                </div>
                <div className="col l3 s3 right-align">
                  <Switch
                    checked={!!profile.smoking}
                    onChange={(checked, event, id) => this.onToggleChange('smoking', checked)}
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
                    onChange={(checked, event, id) => this.onToggleChange('pets', checked)}
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
                    onChange={(checked, event, id) => this.onToggleChange('car_ac', checked)}
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
                    onChange={(checked, event, id) => this.onToggleChange('kid_friendly', checked)}
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
                  onClick={() => this.handleProfileSave()}
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
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    profileErrors: getProfileErrors(state),
    profileSaved: getProfileSaved(state),
    cardErrors: getCardErrors(state),
    cardSaved: getCardSaved(state),
    isProcessing: getIsProcessing(state),
    isCardProcessing: getIsCardProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getCurrentUserRequest, saveProfileRequest, uploadProfileImageRequest, resetProfileFlagsRequest, resetCardsFlagRequest, setProcessingRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        saveProfileRequest,
        resetProfileFlagsRequest,
        uploadProfileImageRequest,
        resetCardsFlagRequest,
        setProcessingRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RiderChecklist)
