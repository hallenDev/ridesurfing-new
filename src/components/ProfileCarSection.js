import _ from 'underscore'
import React, { Component } from 'react'
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

class ProfileCarSection extends Component {

  constructor (props) {
    super(props)
    this.state = {
      userId: null,
      lbOpen: false,
      photoIndex: 0,
      isProcessing: false
    }
  }

  componentDidMount () {
    const { getCurrentUserRequest } = this.props.actions
    getCurrentUserRequest()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ isProcessing: nextProps.isProcessing })
    }
  }

  onDrop (files) {
    this.setState({
      files: files.map(file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }))
    });
  }

  uploadImage (files, imageType) {
    const { setProcessingRequest, uploadProfileImageRequest } = this.props.actions
    this.setState({ isProcessing: true })
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

   deleteImage = (imageId) => {
     const { deleteProfileImageRequest } = this.props.actions

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

  carImages () {
    const { profile } = this.props
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const carImages = _.filter(images, (img) => { return img.attributes.image_type === 'car' })
      if (carImages) {
        return carImages
      } else {
        return []
      }
    } else {
      return []
    }
  }

  profileImagesArr () {
    const arr = this.carImages()
    return _.pluck(_.pluck(arr, 'attributes'), 'url')
  }

  onCancel() {
    this.setState({ files: [] })
  }

  renderCarThumbs () {
    const { currentUser, user } = this.props

    const carImages = this.carImages()
    return _.map(carImages, (img, index) => {

      return <div className="imgWrapper" key={`photo${index}`}>
        <img
          src={img.attributes.url}
          className="responsive-img uploadPic"
          alt=""
          onClick={() => this.setState({ lbOpen: true })}
        />
        {/* eslint-disable-next-line */}
        {user.id === currentUser.id && <a href="javascript:void(0)" className="removeImg" onClick={() => this.deleteImage(img.id)} ><img src={close} alt="" className="close-icon" /></a>}
      </div>
    })
  }

  render () {
    const { currentUser, profile, user } = this.props
    const userInfo = profile.attributes
    const { lbOpen, photoIndex, isProcessing } = this.state
    const profileImagesArr = this.profileImagesArr()

    return (
      <div className="profile-car-section">
        <div className="row">
          <div className="col s12 l6 m6">
            <h5>Car Information</h5>
            <table className="table table-user-information">
              <tbody>
                <tr>
                  <td className="info-label"><b>Make</b></td>
                  <td className="info-val">{userInfo.car_make}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Model</b></td>
                  <td className="info-val">{userInfo.car_model}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Color</b></td>
                  <td className="info-val">{userInfo.car_color}</td>
                </tr>
                <tr>
                  <td className="info-label"><b>Year</b></td>
                  <td className="info-val">{userInfo.car_year}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="car-profile-images">
          {this.renderCarThumbs()}
        </div>
        <div className='bubble-container'>
          {!!isProcessing && <ReactLoading type='bubbles' color='#3399ff' height='12%' width='12%' />}
        </div>
        {currentUser.id === user.id && <div className="image image-dash mt20 l6 m6 col">
          <Dropzone
            onDrop={(files) => this.uploadImage(files, 'car')}
            onFileDialogCancel={this.onCancel.bind(this)}
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
            onCloseRequest={() => this.setState({ lbOpen: false })}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex: (photoIndex + profileImagesArr.length - 1) % profileImagesArr.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % profileImagesArr.length,
              })
            }
          />
        )}
      </div>
    )
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileCarSection)
