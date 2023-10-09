import _ from 'underscore'
import React, { Component, useState } from 'react'
import Dropzone from 'react-dropzone'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import Lightbox from 'react-image-lightbox'
import ReactLoading from 'react-loading'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getCurrentUser, getProfileSaved, getProfileErrors, getImageDeleted, getIsProcessing } from '../reducers/SessionReducer'
import close from '../images/close.png'

const initial_state = {
  userId: null,
  lbOpen: false,
  photoIndex: 0,
  isProcessing: false
}

const ProfileImageSection = (props) => {

  const [state, setState] = useState(initial_state);

  // to-do
  // UNSAFE_componentWillReceiveProps (nextProps) {
  //   if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //     this.setState({ isProcessing: nextProps.isProcessing })
  //   }
  // }

  const onDrop= (files) => {
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
    })
  }

  const uploadImage = (files, imageType) => {
    const { uploadProfileImageRequest, setProcessingRequest } = props.actions
    setState ({ 
      ...state,
      isProcessing: true 
    })
    setProcessingRequest()

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

  const profileImages = () => {
    const { profile } = props
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const profileImages = _.filter(images, (img) => { return img.attributes.image_type === 'profile' || img.attributes.image_type === 'display' })
      if (profileImages) {
        return profileImages
      } else {
        return []
      }
    } else {
      return []
    }
  }

  const profileImagesArr = () => {
    const arr = profileImages()
    return _.pluck(_.pluck(arr, 'attributes'), 'url')
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

  const renderProfileThumbs = () => {
    const { currentUser, user } = props
    const profileImages = profileImages()
    return _.map(profileImages, (img, index) => {

      return <div className="imgWrapper" key={`photo${index}`}>
        <img
          src={img.attributes.url}
          alt=""
          className="responsive-img uploadPic"
          onClick={() => setState({ 
            ...state,
            lbOpen: true 
          })}
        />
        {/* eslint-disable-next-line */}
        {user.id === currentUser.id && img.attributes.image_type !== 'display' && <a href="javascript:void(0)" className="removeImg" onClick={() => deleteImage(img.id)} ><img src={close} alt="" className="close-icon" /></a>}
      </div>
    })
  }

  const { currentUser, user } = props
  const { lbOpen, photoIndex, isProcessing } = state

  return (
    <div className="profile-photo-section">
      <div className="car-profile-images">
        {renderProfileThumbs()}
      </div>
      <div className='bubble-container'>
        {!!isProcessing && <ReactLoading type='bubbles' color='#3399ff' height='12%' width='12%' />}
      </div>
      {currentUser.id === user.id && <div className="image image-dash mt40">
        <Dropzone
          onDrop={(files) => uploadImage(files, 'profile')}
          onFileDialogCancel={() => onCancel()}
          className="dropzone"
        >
          <div>Try dropping image here, or click to select image to upload.</div>
        </Dropzone>
      </div>}
      {lbOpen && (
        <Lightbox
          mainSrc={profileImagesArr[photoIndex]}
          nextSrc={profileImagesArr[(photoIndex + 1) % profileImagesArr.length]}
          prevSrc={profileImagesArr[(photoIndex + profileImagesArr.length - 1) % profileImagesArr.length]}
          onCloseRequest={() => setState({ ...state, lbOpen: false })}
          onMovePrevRequest={() =>
            setState({
              ...state,
              photoIndex: (photoIndex + profileImagesArr.length - 1) % profileImagesArr.length,
            })
          }
          onMoveNextRequest={() =>
            setState({
              ...state,
              photoIndex: (photoIndex + 1) % profileImagesArr.length,
            })
          }
        />
      )}
    </div>
  )
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    profileErrors: getProfileErrors(state),
    profileSaved: getProfileSaved(state),
    imageDeleted: getImageDeleted(state),
    isProcessing: getIsProcessing(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getCurrentUserRequest, uploadProfileImageRequest, deleteProfileImageRequest, setProcessingRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        uploadProfileImageRequest,
        deleteProfileImageRequest,
        setProcessingRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileImageSection)
