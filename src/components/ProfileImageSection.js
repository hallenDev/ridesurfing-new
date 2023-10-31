import _ from 'underscore'
import React, {useState, useEffect} from 'react'
import Dropzone from 'react-dropzone'
import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import Lightbox from 'react-image-lightbox'
import ReactLoading from 'react-loading'

import close from '../images/close.png'
import useSessionStore from '../store/SessionStore'

const initial_state = {
  userId: null,
  lbOpen: false,
  photoIndex: 0,
  isProcessing: false,
}

const ProfileImageSection = (props) => {
  const sessionStore = useSessionStore()

  const currentUser = sessionStore.currentUser
  const isProcessing = sessionStore.isProcessing
  // const profileErrors = sessionStore.profileErrors;
  // const profileSaved = sessionStore.profileSaved;
  const imageDeleted = sessionStore.imageDeleted
  const imageUploaded = sessionStore.imageUploaded

  const [state, setState] = useState(initial_state)
  const [profileImagesArr, setProfileImageArr] = useState([])

  useEffect(() => {
    if (imageDeleted) {
      window.location.reload(false)
    }
  }, [imageDeleted])

  useEffect(() => {
    if (imageUploaded) {
      window.location.reload(false)
    }
  }, [imageUploaded])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      updateProfileImageState()
      setState({
        ...state,
        isProcessing: isProcessing,
      })
    }
  }, [isProcessing])

  useEffect(() => {
    updateProfileImageState()
  }, [props])

  const onDrop = (files) => {
    setState({
      ...state,
      files: files.map((file) => ({
        ...file,
        preview: URL.createObjectURL(file),
      })),
    })
  }

  const onCancel = () => {
    setState({
      ...state,
      files: [],
    })
  }

  const uploadImage = (files, imageType) => {
    setState({
      ...state,
      isProcessing: true,
    })
    sessionStore.setProcessingRequest()

    const fileObj = files[0]
    let img
    if (fileObj) {
      var FR = new FileReader()

      FR.addEventListener('load', function (e) {
        img = e.target.result
        sessionStore.uploadProfileImageRequest(imageType, img)
      })

      FR.readAsDataURL(fileObj)
    }
  }

  const profileImages = () => {
    const {profile} = props
    if (profile && profile.relationships) {
      const {images} = profile.relationships

      const profileImages = _.filter(images, (img) => {
        return (
          img.attributes.image_type === 'profile' ||
          img.attributes.image_type === 'display'
        )
      })
      if (profileImages) {
        return profileImages
      } else {
        return []
      }
    } else {
      return []
    }
  }

  const updateProfileImageState = () => {
    const arr = profileImages()
    setProfileImageArr(_.pluck(_.pluck(arr, 'attributes'), 'url'))
  }

  // const profileImagesArr = () => {
  //   const arr = profileImages()
  //   return _.pluck(_.pluck(arr, 'attributes'), 'url')
  // }

  const deleteImage = (imageId) => {
    confirmAlert({
      title: 'Alert!',
      message: 'Are you sure you want to delete this image?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => sessionStore.deleteProfileImageRequest(imageId),
        },
        {
          label: 'No',
          onClick: () => console.log('canceled'),
        },
      ],
    })
  }

  const renderProfileThumbs = () => {
    const {user} = props
    const profile_images = profileImages()
    return _.map(profile_images, (img, index) => {
      return (
        <div className="imgWrapper" key={`photo${index}`}>
          <img
            src={img.attributes.url}
            alt=""
            className="responsive-img uploadPic"
            onClick={() =>
              setState({
                ...state,
                lbOpen: true,
              })
            }
          />
          {/* eslint-disable-next-line */}
          {user?.id == currentUser?.id &&
            img.attributes.image_type !== 'display' && (
              <a
                href="javascript:void(0)"
                className="removeImg"
                onClick={() => deleteImage(img?.id)}>
                <img src={close} alt="" className="close-icon" />
              </a>
            )}
        </div>
      )
    })
  }

  const {user} = props
  const {lbOpen, photoIndex} = state

  return (
    <div className="profile-photo-section">
      <div className="car-profile-images">{renderProfileThumbs()}</div>
      <div className="bubble-container">
        {!!state.isProcessing && (
          <ReactLoading
            type="bubbles"
            color="#3399ff"
            height="12%"
            width="12%"
          />
        )}
      </div>
      {currentUser?.id == user?.id && (
        <div className="image image-dash mt40">
          <Dropzone
            onDrop={(files) => uploadImage(files, 'profile')}
            onFileDialogCancel={() => onCancel()}
            className="dropzone">
            {({getRootProps, getInputProps}) => (
              <section className="dropzone">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <div>
                    Try dropping image here, or click to select image to upload.
                  </div>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
      )}
      {lbOpen && (
        <Lightbox
          mainSrc={profileImagesArr[photoIndex]}
          nextSrc={profileImagesArr[(photoIndex + 1) % profileImagesArr.length]}
          prevSrc={
            profileImagesArr[
              (photoIndex + profileImagesArr.length - 1) %
                profileImagesArr.length
            ]
          }
          onCloseRequest={() => setState({...state, lbOpen: false})}
          onMovePrevRequest={() =>
            setState({
              ...state,
              photoIndex:
                (photoIndex + profileImagesArr.length - 1) %
                profileImagesArr.length,
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

export default ProfileImageSection
