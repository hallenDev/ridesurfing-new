import _ from 'underscore'
import React, { Component } from 'react'
import { Tabs, Tab, TabPanel, TabList } from 'react-web-tabs'
import { Link } from 'react-router-dom'
import StarRatingComponent from 'react-star-rating-component'

import ProfileMainSection from '../components/ProfileMainSection'
import ProfileImageSection from '../components/ProfileImageSection'
import ProfileCarSection from '../components/ProfileCarSection'
import ProfileAccountSection from '../components/ProfileAccountSection'
import ProfilePayoutSection from '../components/ProfilePayoutSection'
import ProfileCardSection from '../components/ProfileCardSection'

import { notify } from 'react-notify-toast'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getUserErrors } from '../reducers/UserReducer'
import { getCurrentUser, getErrors } from '../reducers/SessionReducer'
import { getUser } from '../reducers/UserReducer'
import missingImg from '../images/missing.png'

class ProfileDetails extends Component {

  constructor (props) {
    super(props)
    this.state = {
      userId: props.match.params.userId
    }
  }

  componentWillMount () {
    const { getUserRequest } = this.props.actions
    const { userId } = this.state
    if (userId) {
      getUserRequest(userId)
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { history } = this.props
    const { resetUserFlagsRequest } = this.props.actions

    if (nextProps.userErrors && nextProps.userErrors.length > 0) {
      resetUserFlagsRequest()
      notify.show(nextProps.userErrors, 'error')
      history.push('/')
    }
  }

  displayImage (user) {
    const { profile } = user.relationships
    if (profile && profile.relationships) {
      const { images } = profile.relationships

      const img = _.find(images, (img) => { return img.attributes.image_type === 'display'})
      return img ? img.attributes.url : missingImg
    }
  }

  goToChat (userId) {
    const { history } = this.props
    const { getDirectChatUserRequest } = this.props.actions

    localStorage.setItem("directChatUserId", userId)
    getDirectChatUserRequest(userId, true)

    history.push('/chat')
  }

  render () {
    const { userId } = this.state
    const { currentUser } = this.props
    const user = userId ? this.props.user : currentUser
    const { profile } = user.relationships

    return (
      <div className="profile-page">
        <div className="container">
          <div className="row">
            <div className="col l3 s12 center-align">
              <div className="user-img-container">
                <img src={this.displayImage(user)} className="user-img responsive-img" alt="" />
              </div>
              <div className='star-align'>
                <StarRatingComponent
                  name="average_rating"
                  starCount={5}
                  value={user.attributes.average_rating || 0}
                  editing={false}
                /> {(!!user.attributes.rating_count && user.attributes.rating_count !== 0) && <span>{`(${user.attributes.rating_count})`}</span>}</div>
              <h5 className="mb20">{user.attributes.name}</h5>
              {user.id === currentUser.id && <Link to="/edit_profile" className="uploadImgLink">Edit Profile</Link>}
              {/* eslint-disable-next-line */}
              {user.id !== currentUser.id && <a href='javascript:void(0)' className="chatLink" onClick={() => this.goToChat(user.id)}><i className="fa fa-comments chat-icon"/>Chat Now</a>}
              <div className="panel-box">
                <div className="panel-header">Account Verifications</div>
                <div className="panel-item"> Email {user.attributes.is_email_verified ? <i className="fa fa-check success"></i> : <i className="fa fa-times danger"></i>}</div>
                <div className="panel-item"> Facebook {user.attributes.facebook ? <i className="fa fa-check success"></i> : <i className="fa fa-times danger"></i>}</div>
                <div className="panel-item"> Google {user.attributes.google ? <i className="fa fa-check success"></i> : <i className="fa fa-times danger"></i>}</div>
              </div>
            </div>
            <div className="col offset-l1 l8 s12">
              <div className="my-tablist">
                <Tabs defaultTab="one">
                  <TabList>
                    <Tab tabFor="one">Main</Tab>
                    <Tab tabFor="two">Photos</Tab>
                    <Tab tabFor="three">Car</Tab>
                    {(!userId || (userId === currentUser.id)) && <Tab tabFor="four">Account</Tab>}
                    {(!userId || (userId === currentUser.id)) && <Tab tabFor="five">Payout</Tab>}
                    {(!userId || (userId === currentUser.id)) && <Tab tabFor="six">Payment Method</Tab>}
                  </TabList>
                  <TabPanel tabId="one">
                    <div className="mt20">
                      <ProfileMainSection profile={profile} user={user}/>
                    </div>
                  </TabPanel>
                  <TabPanel tabId="two">
                    <div className="mt20">
                      <ProfileImageSection profile={profile} user={user} />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="three">
                    <div className="mt20">
                      <ProfileCarSection profile={profile} user={user} />
                    </div>
                  </TabPanel>
                  {(!userId || (user.id === currentUser.id)) &&
                  <TabPanel tabId="four">
                    <div className="mt20">
                      <ProfileAccountSection/>
                    </div>
                  </TabPanel>}
                  {(!userId || (user.id === currentUser.id)) &&
                  <TabPanel tabId="five">
                    <div className="mt20">
                      <ProfilePayoutSection/>
                    </div>
                  </TabPanel>}
                  {(!userId || (user.id === currentUser.id)) &&
                  <TabPanel tabId="six">
                    <div className="mt20">
                      <ProfileCardSection/>
                    </div>
                  </TabPanel>}
                </Tabs>
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
    user: getUser(state),
    error: getErrors(state),
    userErrors: getUserErrors(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getUserRequest, getDirectChatUserRequest, resetUserFlagsRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getUserRequest,
        resetUserFlagsRequest,
        getDirectChatUserRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDetails)
