import _ from 'underscore'
import React, { useState, useEffect } from 'react'
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

import missingImg from '../images/missing.png'
import useSessionStore from '../store/SessionStore';

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

const initial_state = {
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

const EditProfile = (props) => {

  const sessionStore = useSessionStore();

  const currentUser = sessionStore.currentUser;
  const profileErrors = sessionStore.profileErrors;
  const profileSaved = sessionStore.profileSaved;
  const carMakeList = sessionStore.carMakeList;
  const isProcessing = sessionStore.isProcessing;

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    sessionStore.carMakeListRequest()

    return () => {
      const {files} = state
      if (files.length > 0) {
        for (let i = files.length; i >= 0; i--) {
          const file = files[0];
          URL.revokeObjectURL(file.preview);
        }
      }
    }
  }, [])

  useEffect(() => {
  if (currentUser) {
      const profile = currentUser.relationships.profile.attributes
      setState({ 
        ...state, 
        profile 
      })
    }
  }, [currentUser])

  useEffect(() => {
    if(profileSaved) {
      const { history } = props;
      sessionStore.resetProfileFlagsRequest()
      history.push('/my_profile')
    }
  }, [profileSaved])

  useEffect(() => {
    if (profileErrors) {
      setState({ ...state, profileErrors: profileErrors })
    }
  }, [profileErrors])

  useEffect(() => {
   if (isProcessing || isProcessing === false) {
      setState({ ...state, isProcessing: isProcessing })
    }

    if (isProcessing || isProcessing === false) {
      setState({ 
        ...state, 
        imageProcessing: isProcessing, isProcessing: isProcessing 
      })
    }
  }, [isProcessing])

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
    setState({
      ...state,
      files: files.map(file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))
    });
  }

  const onCancel = () => {
    setState({
      ...state,
      files: []
    });
  }

  const errorMessageFor = (fieldName) => {
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

    if (fieldName === 'bio') {
      profileErrors['bio'] = null
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
    const fileObj = files[0]
    setState({ 
      ...state, 
      imageProcessing: true 
    })
    sessionStore.setProcessingRequest('display');

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
      isProcessing: true 
    })

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

    sessionStore.saveProfileRequest(profile.id, profile)
  }

  const kidsVal = (profile) => {
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

  const { profile, imageProcessing } =  state

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="row">
          <div className="col l3 s12 center-align">
            <div className="user-img-container">
              <img src={displayImage()} className="user-img responsive-img" alt="" />
            </div>
            <div className='bubble-container'>
              {!!imageProcessing && <ReactLoading type='bubbles' color='#3399ff' height='20%' width='20%' />}
            </div>
            <div className="mt20">
              <Dropzone
                onDrop={(files) => uploadImage(files, 'display')}
                onFileDialogCancel={onCancel}
                className="dropzone"
              >
                {({getRootProps, getInputProps}) => (
                  <section>
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
                    onChange={(event) => onFieldChange('education', event)}
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
                    onChange={(event) => onFieldChange('occupation', event)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col l6 m6 s12">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Do you currently have children?</InputLabel>
                  <Select
                    value={kidsVal(profile)}
                    onChange={(event) => onFieldChange('kids', event)}
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
                    onChange={(event) => onFieldChange('relationship_status', event)}
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
                  onChange={(event) => onFieldChange('bio', event)}
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
                  onChange={(event) => onFieldChange('facebook_link', event)}
                />
                <span className='error'>{errorMessageFor('facebook_link')}</span>
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
                  onChange={(event) => onFieldChange('instagram_link', event)}
                />
                <span className='error'>{errorMessageFor('instagram_link')}</span>
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
                  onChange={(event) => onFieldChange('linkedin_link', event)}
                />
                <span className='error'>{errorMessageFor('linkedin_link')}</span>
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
                </FormControl>
              </div>
              <div className="col l6 m6 s12">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Model</InputLabel>
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
                </FormControl>
              </div>
            </div>
            <div className="row">
              <div className="col l6 m6 s12">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Year</InputLabel>
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
                </FormControl>
              </div>
              <div className="col l6 m6 s12">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Color</InputLabel>
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
                </FormControl>
              </div>
            </div>
            <div className="mt40 mb20">
              <Button
                variant="contained"
                color='primary'
                className='update-btn'
                onClick={() => handleProfileSave()}
                disabled={!!state.isProcessing}
              >
                {state.isProcessing ? "Please Wait..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default (EditProfile)
