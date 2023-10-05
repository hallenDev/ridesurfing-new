import _ from 'underscore'
import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Select from '@material-ui/core/Select'
import Dropzone from 'react-dropzone'
import Button from '@material-ui/core/Button'
import Switch from "react-switch";
import ReactLoading from 'react-loading'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getCurrentUser, getProfileSaved, getProfileErrors, getCarMakeList, getIsProcessing } from '../reducers/SessionReducer'

import missingImg from '../images/missing.png'

const selectChildren = [
  {label: 'Yes', value: "true"},
  {label: 'No', value: "false"}
];

const relationStatus = [
  'Available',
  'Not Available',
];

const carColor = ['Black', 'Blue', 'Red', 'Yellow', 'White', 'Green', 'Brown', 'Gray', 'Gold', 'Other']

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
}

class EditProfile extends Component {

  constructor (props) {
    super(props)
    this.state = {
      children: [],
      make: [],
      model: [],
      year: [],
      color: [],
      status: [],
      files: [],
      profile: {},
      profileErrors: {},
      isProcessing: false,
      imageProcessing: false
    }
  }

  componentDidMount() {
    const {carMakeListRequest} = this.props.actions
    carMakeListRequest()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { history } = this.props
    const { resetProfileFlagsRequest } = this.props.actions

    if (nextProps.currentUser) {
      const profile = nextProps.currentUser.relationships.profile.attributes
      this.setState({ profile })
    }

    if (nextProps.profileSaved) {
      resetProfileFlagsRequest()
      history.push('/my_profile')
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ isProcessing: nextProps.isProcessing })
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ imageProcessing: nextProps.isProcessing, isProcessing: nextProps.isProcessing })
    }

    if (nextProps.profileErrors) {
      this.setState({ profileErrors: nextProps.profileErrors })
    }
  }

  componentWillUnmount() {
    const {files} = this.state
    if (files.length > 0) {
      for (let i = files.length; i >= 0; i--) {
        const file = files[0];
        URL.revokeObjectURL(file.preview);
      }
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

  onDrop(files) {
    this.setState({
      files: files.map(file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))
    });
  }

  onCancel() {
    this.setState({
      files: []
    });
  }

  errorMessageFor = (fieldName) => {
    const { profileErrors } = this.props
    if (profileErrors && profileErrors[fieldName]) {
      return profileErrors[fieldName]
    }
  }

  onFieldChange = (fieldName, event) => {
    const { profile } = this.state
    const { profileErrors } = this.props

    profile[fieldName] = event.target.value

    if (fieldName === 'car_make') {
      profile['car_model'] = null
      profile['car_year'] = null
      profile['car_color'] = null
    }

    if (fieldName === 'bio') {
      profileErrors['bio'] = null
    }
    this.setState({ profile })
  }

  onToggleChange = (fieldName, checked) => {
    const { profile } = this.state
    profile[fieldName] = checked

    this.setState({ profile })
  }

  carModelList () {
    const { car_make } = this.state.profile
    const { carMakeList } = this.props

    if (car_make && carMakeList[car_make]) {
      const models = carMakeList[car_make].car_models
      return _.map(models, (val) => {
        return { value: val.model_name }
      })
    } else {
      return []
    }
  }

  carYearList () {
    const { car_make, car_model } = this.state.profile
    const { carMakeList } = this.props

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

  uploadImage (files, imageType) {
    const fileObj = files[0]
    const { uploadProfileImageRequest, setProcessingRequest } = this.props.actions
    this.setState({ imageProcessing: true })
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
    this.setState({ isProcessing: true })

    if (profile.facebook_link) {
      profile.facebook_link = profile.facebook_link.toLowerCase();
      if (profile.facebook_link.substring(0, 7) !== 'http://' && profile.facebook_link.substring(0, 8) !== 'https://') {
        profile.facebook_link = 'https://' + profile.facebook_link;
      }
    }
    if (profile.instagram_link) {
      profile.instagram_link = profile.instagram_link.toLowerCase();
      if (profile.instagram_link.substring(0, 7) !== 'http://' && profile.instagram_link.substring(0, 8) !== 'https://') {
        profile.instagram_link = 'https://' + profile.instagram_link;
      }
    }
    if (profile.linkedin_link) {
      profile.linkedin_link = profile.linkedin_link.toLowerCase();
      if (profile.linkedin_link.substring(0, 7) !== 'http://' && profile.linkedin_link.substring(0, 8) !== 'https://') {
        profile.linkedin_link = 'https://' + profile.linkedin_link;
      }
    }

    saveProfileRequest(profile.id, profile)
  }

  kidsVal (profile) {
    if (profile.kids === false || profile.kids === 'false') {
      return 'false'
    } else {
      if (profile.kids === true || profile.kids === 'true') {
        return 'true'
      } else {
        return ''
      }
    }
  }

  render () {
    const { profile, isProcessing, imageProcessing } =  this.state
    const { carMakeList, profileErrors } = this.props

    return (
      <div className="edit-profile-page">
        <div className="container">
          <div className="row">
            <div className="col l3 s12 center-align">
              <div className="user-img-container">
                <img src={this.displayImage()} className="user-img responsive-img" alt="" />
              </div>
              <div className='bubble-container'>
                {!!imageProcessing && <ReactLoading type='bubbles' color='#3399ff' height='20%' width='20%' />}
              </div>
              <div className="mt20">
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
              <h5>Profile Info</h5>
              <hr className="hr-line" />
              <div className="row">
                <div className="col l6 m6 s12">
                  <div className="mt5">
                    <TextField
                      fullWidth
                      className='text-field'
                      id='education'
                      type='text'
                      label='Education'
                      margin="normal"
                      value={profile.education || ''}
                      onChange={(event) => this.onFieldChange('education', event)}
                    />
                  </div>
                </div>
                <div className="col l6 m6 s12">
                  <div className="mt5">
                    <TextField
                      fullWidth
                      className='text-field'
                      id='0ccupation'
                      type='text'
                      label='Occupation'
                      margin="normal"
                      value={profile.occupation || ''}
                      onChange={(event) => this.onFieldChange('occupation', event)}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col l6 m6 s12">
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple">Do you currently have children?</InputLabel>
                    <Select
                      value={this.kidsVal(profile)}
                      onChange={(event) => this.onFieldChange('kids', event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      className="selected-menu-field"
                    >
                      {selectChildren.map(children => (
                        <MenuItem
                          key={children.value}
                          value={children.value}
                        >
                          {children.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="col l6 m6 s12">
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple">Relationship</InputLabel>
                    <Select
                      value={profile.relationship_status || ''}
                      onChange={(event) => this.onFieldChange('relationship_status', event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      className="selected-menu-field"
                    >
                      {relationStatus.map(status => (
                        <MenuItem
                          key={status}
                          value={status}
                        >
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className="row">
                <div className="col l12 s12">
                  <TextField
                    fullWidth
                    className='text-field about'
                    id='about'
                    type='text'
                    label='About Me'
                    inputProps={{ maxlength: 2000 }}
                    multiline={true}
                    rowsMax="12"
                    rows={12}
                    margin="normal"
                    variant="outlined"
                    value={profile.bio || ''}
                    onChange={(event) => this.onFieldChange('bio', event)}
                  />
                  {!profileErrors['bio'] && <FormHelperText id="about-helper-text">{profile.bio ? profile.bio.length : 0} / 2000</FormHelperText>}
                  {!!profileErrors['bio'] && <span className='error'>{profileErrors['bio']}</span>}
                </div>
              </div>
              <h5 className="mt30">Social Info</h5>
              <hr className="hr-line" />
              <div className="row">
                <div className="col l4 m6 s12">
                  <TextField
                    fullWidth
                    className='text-field'
                    id='fb'
                    type='text'
                    label='Facebook'
                    margin="normal"
                    value={profile.facebook_link || ''}
                    onChange={(event) => this.onFieldChange('facebook_link', event)}
                  />
                  <span className='error'>{this.errorMessageFor('facebook_link')}</span>
                </div>
                <div className="col l4 m6 s12">
                  <TextField
                    fullWidth
                    className='text-field'
                    id='instagram'
                    type='text'
                    label='Instagram'
                    margin="normal"
                    value={profile.instagram_link || ''}
                    onChange={(event) => this.onFieldChange('instagram_link', event)}
                  />
                  <span className='error'>{this.errorMessageFor('instagram_link')}</span>
                </div>
                <div className="col l4 m6 s12">
                  <TextField
                    fullWidth
                    className='text-field'
                    id='linkedin'
                    type='text'
                    label='Linkedin'
                    margin="normal"
                    value={profile.linkedin_link || ''}
                    onChange={(event) => this.onFieldChange('linkedin_link', event)}
                  />
                  <span className='error'>{this.errorMessageFor('linkedin_link')}</span>
                </div>
              </div>
              <h5 className="mt30">Car info</h5>
              <hr className="hr-line" />
              <div className="row">
                <div className="col l6 m6 s12">
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple">Make</InputLabel>
                    <Select
                      value={profile.car_make || ''}
                      onChange={(event) => this.onFieldChange('car_make', event)}
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
                  </FormControl>
                </div>
                <div className="col l6 m6 s12">
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple">Model</InputLabel>
                    <Select
                      value={profile.car_model || ''}
                      onChange={(event) => this.onFieldChange('car_model', event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      className="selected-menu-field"
                    >
                      {this.carModelList().map((model, index) => (
                        <MenuItem
                          key={`model-${index}`}
                          value={model.value}
                        >
                          {model.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className="row">
                <div className="col l6 m6 s12">
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple">Year</InputLabel>
                    <Select
                      value={profile.car_year || ''}
                      onChange={(event) => this.onFieldChange('car_year', event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      className="selected-menu-field"
                    >
                      {this.carYearList().map((year, index) => (
                        <MenuItem
                          key={`year-${index}`}
                          value={year.value}
                        >
                          {year.value}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="col l6 m6 s12">
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple">Color</InputLabel>
                    <Select
                      value={profile.car_color || ''}
                      onChange={(event) => this.onFieldChange('car_color', event)}
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
                  </FormControl>
                </div>
              </div>
              <div className="mt40 mb20">
                <Button
                  variant="contained"
                  color='primary'
                  className='update-btn'
                  onClick={() => this.handleProfileSave()}
                  disabled={!!isProcessing}
                >
                  {isProcessing ? "Please Wait..." : "Update Profile"}
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
    carMakeList: getCarMakeList(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getCurrentUserRequest, saveProfileRequest, uploadProfileImageRequest, resetProfileFlagsRequest, carMakeListRequest, setProcessingRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        saveProfileRequest,
        resetProfileFlagsRequest,
        carMakeListRequest,
        uploadProfileImageRequest,
        setProcessingRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile)
