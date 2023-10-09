import _ from 'underscore'
import React, { Component, useState } from 'react'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import Dropzone from 'react-dropzone'
import Button from '@material-ui/core/Button'
import Switch from "react-switch"
import ReactLoading from 'react-loading'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import ProfilePayoutSection from '../components/ProfilePayoutSection'

import * as actions from '../actions'
import { getCurrentUser, getProfileSaved, getProfileErrors, getCarMakeList, getIsProcessing,
  getImageUploaded, getAccountUpdated, getIsCarImageProcessing, getIsPayoutProcessing
} from '../reducers/SessionReducer'

import missingImg from '../images/missing.png'

const carColor = ['Black', 'Blue', 'Red', 'Yellow', 'White', 'Green', 'Brown', 'Gray', 'Gold', 'Other']
const MenuProps = { PaperProps: { style: { maxHeight: 300 } } }

const ProfileChecklist = (props) => {

  
  const initial_state = {
    submitAccountForm: false,
    imageProcessing: false,
    carImageProcessing: false,
    profileProcessing: false,
    drive_created: !!props.location.state && !!props.location.state.drive_created ? true : false,
    price: !!props.location.state && props.location.state.price,
    profileErrors: {},
    profile: {
      is_driver: true
    }
  }

  const [state, setState] = useState(initial_state);
  
  // to-do
  // componentWillMount () {
  //   if (!localStorage.accessToken) {
  //     localStorage.setItem('prevUrl', `/complete_profile`)
  //     return window.location.href = `/login`
  //   }
  // }

  // to-do
  // componentDidMount() {
  //   const {carMakeListRequest} = this.props.actions
  //   carMakeListRequest()
  // }

  // to-do
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   const { history } = this.props
  //   const { resetProfileFlagsRequest } = this.props.actions

  //   if (nextProps.currentUser && !nextProps.imageUploaded && !nextProps.accountUpdated) {
  //     const profile = nextProps.currentUser.relationships.profile.attributes
  //     profile['is_driver'] = true
  //     this.setState({ profile })
  //   }

  //   if (nextProps.profileSaved && Object.keys(nextProps.profileErrors).length === 0) {
  //     resetProfileFlagsRequest()
  //     this.setState({ submitAccountForm: false })
  //   }

  //   if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //     this.setState({
  //       imageProcessing: nextProps.isProcessing,
  //       carImageProcessing: nextProps.isCarImageProcessing,
  //       payoutProcessing: nextProps.isPayoutProcessing,
  //       profileProcessing: nextProps.isProcessing || nextProps.isCarImageProcessing || nextProps.isPayoutProcessing
  //     })
  //   }

  //   if (nextProps.profileErrors) {
  //     this.setState({ profileErrors: nextProps.profileErrors, submitAccountForm: false })
  //   }

  //   const { has_payout_details } = nextProps.currentUser ? nextProps.currentUser.attributes : this.props.currentUser.attributes
  //   const { price } = this.state

  //   if (nextProps.imageUploaded) {
  //     this.setState({ carImageProcessing: false })
  //   }

  //   // eslint-disable-next-line
  //   if (this.hasCarInfo() && this.hasDisplayImage() && (price == 0 || (!!has_payout_details && price > 0))) {
  //     history.push('/my_rides')
  //   }
  // }

  const displayImage = (imageType) => {
    const { currentUser } = props

    const { profile } = currentUser.relationships
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const img = _.find(images, (img) => { return img.attributes.image_type === imageType})
      return img ? img.attributes.url : missingImg
    }
  }

  const hasCarImage = () => {
    const { currentUser } = props

    const { profile } = currentUser.relationships
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const img = _.find(images, (img) => { return img.attributes.image_type === 'car'})
      return !!img
    }
  }

  const hasDisplayImage = () => {
    const { currentUser } = props

    const { profile } = currentUser.relationships
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const img = _.find(images, (img) => { return img.attributes.image_type === 'display'})
      return !!img
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

  const onCancel = () => {}

  const errorMessageFor = (fieldName) => {
    const { profileErrors } = props
    if (profileErrors && profileErrors[fieldName]) {
      return profileErrors[fieldName]
    }
  }

  const onFieldChange = (fieldName, event) => {
    const { profile } = state
    profile[fieldName] = event.target.value

    if (fieldName === 'car_make') {
      profile['car_model'] = null
      profile['car_year'] = null
      profile['car_color'] = null
    }
    setState({ 
      ...state, 
      profile 
    })
  }

  const onToggleChange = (fieldName, checked) => {
    const { profile } = state
    profile[fieldName] = checked

    setState({ 
      ...state, 
      profile 
    })
  }

  const carModelList = () => {
    const { car_make } = state.profile
    const { carMakeList } = props

    if (car_make && carMakeList[car_make]) {
      const models = carMakeList[car_make].car_models
      return _.map(models, (val) => {
        return { value: val.model_name }
      })
    } else {
      return []
    }
  }

  const carYearList = () => {
    const { car_make, car_model } = state.profile
    const { carMakeList } = props

    if (car_make && carMakeList[car_make]) {
      const models = carMakeList[car_make].car_models
      const selectedModel = _.find(models, {model_name: car_model})

      if (selectedModel) {
        return _.map(selectedModel.years, (val) => {
          return { value: val }
        })
      } else {
        return []
      }
    } else {
      return []
    }
  }

  const uploadImage = (files, imageType) => {
    const { setProcessingRequest, uploadProfileImageRequest } = props.actions
    if (imageType === 'car') {
      setState({
        ...state, 
        carImageProcessing: true
      })
    }
    if (imageType === 'display') {
      setState({
        ...state, 
        imageProcessing: true
      })
    }
    setProcessingRequest(imageType)
    const fileObj = files[0]
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

  const handleProfileSave = () => {
    const { profile } = state
    const { saveProfileRequest } = props.actions
    setState({ 
      ...state, 
      profileProcessing: true 
    })
    saveProfileRequest(profile.id, profile)
    setState({ 
      ...state, 
      submitAccountForm: true 
    })
  }

  const deleteImage = (imageId) => {
    const { deleteProfileImageRequest } = props.actions

    confirmAlert({
      title: 'Alert!',
      message: 'Are you sure you want to delete this image?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => deleteProfileImageRequest(imageId)
        },
        {
          label: 'No',
          onClick: () => console.log('canceled')
        }
      ]
    })
  }

  const hasCarInfo = () => {
    const { profile } = state

    return !!profile.car_make && !!profile.car_model && !!profile.car_year && !!profile.car_color && !!hasCarImage()
  }

  const hasCarBasicInfo = () => {
    const { profile } = state
    return !!profile.car_make && !!profile.car_model && !!profile.car_year && !!profile.car_color
  }

  const originalyHasCarBasicInfo = () => {
    const { currentUser } = props

    return !!currentUser.relationships.profile.car_make && !!currentUser.relationships.profile.car_model && !!currentUser.relationships.profile.car_year && !!currentUser.relationships.profile.car_color
  }

  const carInfoSaved = () => {
    const { profile } = props.currentUser.relationships

    return !!profile.car_make && !!profile.car_model && !!profile.car_year && !!profile.car_color && !!hasCarImage()
  }

  const { profile, submitAccountForm, drive_created, imageProcessing, profileProcessing, price, carImageProcessing } =  state
  const { carMakeList, currentUser } = props
  const { has_payout_details } = currentUser.attributes

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="row">
          <div className="col l3 s12 center-align">
            <div className="user-img-container">
              <img src={displayImage('display')} className="user-img responsive-img" alt="" />
            </div>
            <span className='error'>{errorMessageFor('is_driver')}</span>
            <div className="mt20">
              <div className='bubble-container'>
                {!!imageProcessing && <ReactLoading type='bubbles' color='#3399ff' height='25%' width='25%' />}
              </div>
              <Dropzone
                onDrop={(files) => uploadImage(files, 'display')}
                onFileDialogCancel={onCancel}
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
            {!!drive_created && <div className='alert alert-success'>Review your required profile data in order to be listed.</div>}
            {!carInfoSaved() && <div>
              <h5 className="mt30">Car Info</h5>
              <hr className="hr-line" />
              <div className="mt20">
                <div className='bubble-container'>
                  {!!carImageProcessing && <ReactLoading type='bubbles' color='#3399ff' height='20%' width='20%' />}
                </div>
                {hasCarImage() ? <div className="imgWrapper carImgWrapper">
                  <img src={displayImage('car')} className="responsive-img uploadPic" alt="" />
                </div> : <Dropzone
                  onDrop={(files) => uploadImage(files, 'car')}
                  onFileDialogCancel={onCancel}
                  className="dropzone"
                >
                  <div>Try dropping car image here, or click to select image to upload. Size should be less than 3 MB.</div>
                </Dropzone>}
                <span className='error'>{errorMessageFor('has_car_image')}</span>
              </div>
              {!originalyHasCarBasicInfo() && <div>
                <div className="row">
                  <div className="col l6 m6 s12">
                    <FormControl className="selectField">
                      <InputLabel htmlFor="select-multiple">Make* </InputLabel>
                      <Select
                        value={profile.car_make || ''}
                        onChange={(event) => onFieldChange('car_make', event)}
                        input={<Input id="select-multiple" />}
                        MenuProps={MenuProps}
                        className="selected-menu-field"
                      >
                        {_.map(carMakeList, (make, index) => {
                          return <MenuItem
                            key={`make-${index}`}
                            value={make.car_make}
                          >{make.car_make}</MenuItem>
                        })}
                      </Select>
                      <span className='error'>{errorMessageFor('car_make')}</span>
                    </FormControl>
                  </div>
                  <div className="col l6 m6 s12">
                    <FormControl className="selectField">
                      <InputLabel htmlFor="select-multiple">Model*</InputLabel>
                      <Select
                        value={profile.car_model || ''}
                        onChange={(event) => onFieldChange('car_model', event)}
                        input={<Input id="select-multiple" />}
                        MenuProps={MenuProps}
                        className="selected-menu-field"
                      >
                        {carModelList().map((model, index) => (
                          <MenuItem
                            key={`model-${index}`}
                            value={model.value}
                          >
                            {model.value}
                          </MenuItem>
                        ))}
                      </Select>
                      <span className='error'>{errorMessageFor('car_model')}</span>
                    </FormControl>
                  </div>
                </div>
                <div className="row">
                  <div className="col l6 m6 s12">
                    <FormControl className="selectField">
                      <InputLabel htmlFor="select-multiple">Year*</InputLabel>
                      <Select
                        value={profile.car_year || ''}
                        onChange={(event) => onFieldChange('car_year', event)}
                        input={<Input id="select-multiple" />}
                        MenuProps={MenuProps}
                        className="selected-menu-field"
                      >
                        {carYearList().map((year, index) => (
                          <MenuItem
                            key={`year-${index}`}
                            value={year.value}
                          >
                            {year.value}
                          </MenuItem>
                        ))}
                      </Select>
                      <span className='error'>{errorMessageFor('car_year')}</span>
                    </FormControl>
                  </div>
                  <div className="col l6 m6 s12">
                    <FormControl className="selectField">
                      <InputLabel htmlFor="select-multiple">Color*</InputLabel>
                      <Select
                        value={profile.car_color || ''}
                        onChange={(event) => onFieldChange('car_color', event)}
                        input={<Input id="select-multiple" />}
                        MenuProps={MenuProps}
                        className="selected-menu-field"
                      >
                        {carColor.map(color => (
                          <MenuItem
                            key={color}
                            value={color}
                          >
                            {color}
                          </MenuItem>
                        ))}
                      </Select>
                      <span className='error'>{errorMessageFor('car_color')}</span>
                    </FormControl>
                  </div>
                </div>
              </div>}
            </div>}
            {!has_payout_details && price > 0 && <div className="row mt20 ml0">
              <ProfilePayoutSection ignoreButton={true} submitAccountForm={submitAccountForm}/>
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

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    profileErrors: getProfileErrors(state),
    profileSaved: getProfileSaved(state),
    carMakeList: getCarMakeList(state),
    isProcessing: getIsProcessing(state),
    isCarImageProcessing: getIsCarImageProcessing(state),
    isPayoutProcessing: getIsPayoutProcessing(state),
    imageUploaded: getImageUploaded(state),
    accountUpdated: getAccountUpdated(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getCurrentUserRequest, saveProfileRequest, uploadProfileImageRequest, resetProfileFlagsRequest, carMakeListRequest, setProcessingRequest,
  deleteProfileImageRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        saveProfileRequest,
        resetProfileFlagsRequest,
        carMakeListRequest,
        uploadProfileImageRequest,
        setProcessingRequest,
        deleteProfileImageRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileChecklist)
