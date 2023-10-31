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

const ProfileCarSection = (props) => {
  const sessionStore = useSessionStore()

  const currentUser = sessionStore.currentUser
  const isProcessing = sessionStore.isProcessing
  // const profileErrors = sessionStore.profileErrors;
  // const profileSaved = sessionStore.profileSaved;
  // const imageDeleted = sessionStore.imageDeleted;
  const imageUploaded = sessionStore.imageUploaded

  useEffect(() => {
    if (imageUploaded) {
      window.location.reload(false)
    }
  }, [imageUploaded])

  const [state, setState] = useState(initial_state)

  useEffect(() => {
    if (localStorage.accessToken) {
      sessionStore.getCurrentUserRequest()
    }
  }, [])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({
        ...state,
        isProcessing: isProcessing,
      })
    }
  }, [isProcessing])

  const onDrop = (files) => {
    setState({
      ...state,
      files: files.map((file) => ({
        ...file,
        preview: URL.createObjectURL(file),
      })),
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

  const carImages = () => {
    const {profile} = props
    if (profile && profile.relationships) {
      const {images} = profile.relationships

      const carImages = _.filter(images, (img) => {
        return img.attributes.image_type === 'car'
      })
      if (carImages) {
        return carImages
      } else {
        return []
      }
    } else {
      return []
    }
  }

  const profileImagesArr = () => {
    const arr = carImages()
    return _.pluck(_.pluck(arr, 'attributes'), 'url')
  }

  const onCancel = () => {
    setState({
      ...state,
      files: [],
    })
  }

  const renderCarThumbs = () => {
    const {user} = props

    const car_images = carImages()
    return _.map(car_images, (img, index) => {
      return (
        <div className="imgWrapper" key={`photo${index}`}>
          <img
            src={img.attributes.url}
            className="responsive-img uploadPic"
            alt=""
            onClick={() => setState({...state, lbOpen: true})}
          />
          {/* eslint-disable-next-line */}
          {user?.id === currentUser?.id && (
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

  const {user, profile} = props
  const userInfo = profile ? profile.attributes : null
  const {lbOpen, photoIndex} = state

  return (
    <div className="profile-car-section">
      <div className="row">
        <div className="col s12 l6 m6">
          <h5>Car Information</h5>
          <table className="table table-user-information">
            <tbody>
              <tr>
                <td className="info-label">
                  <b>Make</b>
                </td>
                <td className="info-val">{userInfo?.car_make}</td>
              </tr>
              <tr>
                <td className="info-label">
                  <b>Model</b>
                </td>
                <td className="info-val">{userInfo?.car_model}</td>
              </tr>
              <tr>
                <td className="info-label">
                  <b>Color</b>
                </td>
                <td className="info-val">{userInfo?.car_color}</td>
              </tr>
              <tr>
                <td className="info-label">
                  <b>Year</b>
                </td>
                <td className="info-val">{userInfo?.car_year}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="car-profile-images">{renderCarThumbs()}</div>
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
      {currentUser?.id === user?.id && (
        <div className="image image-dash mt20 l6 m6 col">
          <Dropzone
            onDrop={(files) => uploadImage(files, 'car')}
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

export default ProfileCarSection
