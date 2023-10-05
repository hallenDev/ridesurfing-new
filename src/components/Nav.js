import _ from 'underscore'
import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Drawer from '@material-ui/core/Drawer'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Grow from '@material-ui/core/Grow'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuList from '@material-ui/core/MenuList'
import Icon from '@material-ui/core/Icon'
import Badge from '@material-ui/core/Badge'
import MenuIcon from '@material-ui/icons/Menu'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import logo from '../images/rs-logo.png'
import * as actions from '../actions'
import { getNotificationCount, getCurrentUser, getChatsCount } from '../reducers/SessionReducer'
import { getNotifications } from '../reducers/NotificationReducer'

class Nav extends Component {

  constructor (props) {
    super(props)
    this.state = {
      open: false,
      drawerOpen: false,
      notificationDropdown: false,
    }
  }

  componentWillMount () {
    const { getCurrentUserRequest, getNotificationsRequest } = this.props.actions
    if (localStorage.accessToken) {
      getCurrentUserRequest()
      getNotificationsRequest()
    }
  }

  componentDidMount () {
    if (localStorage.accessToken) {
      this.subscribeChannel()
    }
  }

  subscribeChannel() {
    if (this.props.cable) {
      var comp = this
      var cable = this.props.cable
      cable.subscriptions.create({channel: "NotificationsChannel"}, {
        connected: () => {
        },
        disconnected: () => {
        },
        received: function(data) {
          const { setNotificationCountRequest } = comp.props.actions
          if (comp.props.currentUser && data.user_id === comp.props.currentUser.id) {
            setNotificationCountRequest(data)

            const { getTripRequestsRequest, getReceivedTripRequestsRequest } = comp.props.actions
            getReceivedTripRequestsRequest()
            getTripRequestsRequest()
          }
        }
      })
    }
  }

  toggleDrawer = () => {
    this.setState(state => ({ drawerOpen: !this.state.drawerOpen }))
  }

  handleToggle = () => {
    this.setState(state => ({ open: !state.open }))
  }

  handleNotificationToggle = () => {
    const { getNotificationsRequest } = this.props.actions
    getNotificationsRequest()
    this.setState(state => ({ notificationDropdown: !state.notificationDropdown }))
  }

  handleClose = event => {
    if (this.anchorEl.contains(event.target)) { return }
    this.setState({ open: false })
  }

  handleNotiClose = event => {
    if (this.notiAnchorEl.contains(event.target)) { return }
    this.setState({ notificationDropdown: false })
  }

  handleNotificationClick (notification) {
    const { updateNotificationRequest } = this.props.actions
    const { subject_type, for_driver, review_total, review_rated_to, subject_id } = notification.attributes
    const { currentUser, history } = this.props

    if (!notification.attributes.is_read) {
      updateNotificationRequest(notification.id)
    }

    if (subject_type === "TripRequest") {
      if (for_driver) {
        history.push('/requests')
      } else {
        history.push('/my_rides')
      }
    } else {
      if (subject_type === 'Review') {
        if (review_total) {
          if (review_rated_to === currentUser.id) {
            history.push('/my_profile')
          } else {
            history.push(`/profile/${review_rated_to}`)
          }
        } else {
          history.push(`/reviews/${subject_id}`)
        }
      }
    }
    this.setState({ notificationDropdown: false })
  }

  handleMenuClick (url) {
    const { history } = this.props
    history.push(url)
    this.setState({ open: false, notificationDropdown: false })
  }

  handleLogout = () => {
    const { logoutRequest } = this.props.actions
    logoutRequest()
    return window.location.href = `/login`
  }

  renderNotifications () {
    const { notifications } = this.props
    if (notifications.length > 0 ) {
      return _.map(notifications, (noti, index) => {
        return <div className={`notification ${noti.attributes.is_read ? '' : 'unread'}`} onClick={() => this.handleNotificationClick(noti)} key={`noti-${index}`}>
          {noti.attributes.description}
          <div className="time">{noti.attributes.received_at} ago</div>
        </div>
      })
    } else {
      return <div className="no-notification" onClick={this.handleNotiClose}> No unread notifications </div>
    }
  }

  goToLogin () {
    const { history } = this.props

    localStorage.setItem('prevUrl', `/new_ride`)
    history.push('/login')
  }

  render() {
    const { currentUser, notificationCount, chatsCount } = this.props
    const { open, notificationDropdown } = this.state

    return (
      <div className="nav-container">
        <AppBar position="fixed" className="home-nav">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.toggleDrawer}
              className="hide-on-med-and-up menu-btn"
            >
              <MenuIcon/>
            </IconButton>
            <div className='logo-container'>
              <Link id="main-logo" to="/">
                <img className="responsive-img logo" src={logo} alt="" />
              </Link>
            </div>
            <Link to="/search" className="nav-search-btn">
              <Typography variant="body2" color="inherit" className="hide-on-small-only left-links">
                <i className="fa fa-search  nav-icon"></i> Search
              </Typography>
            </Link>
            <Typography color="inherit" className="flex partner-name">
            </Typography>
            { !!currentUser.id &&
              <div style={{display: 'inline-flex'}}>
                <Link to="/new_ride" style={{alignSelf: 'center'}}>
                  <Typography variant="body2" color="inherit" className="left-links hide-on-small-only create-btn">
                    Create a Ride
                  </Typography>
                </Link>
                <Link to="/safety" style={{alignSelf: 'center'}}>
                  <Typography variant="body2" color="inherit" className=" hide-on-med-and-down left-links">
                    Trust & Safety
                  </Typography>
                </Link>
                <div style={{position: 'inherite'}}>
                  <IconButton
                    buttonRef={notiNode => { this.notiAnchorEl = notiNode }}
                    aria-owns={notificationDropdown ? 'notification-list' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleNotificationToggle}
                    className="noti-icon"
                  >
                    {!!notificationCount && notificationCount > 0 && <Badge className="badge" badgeContent={notificationCount} color="primary">
                      <i className="fa fa-bell nav-icon"/>
                    </Badge>}
                    {(!notificationCount || notificationCount === 0) && <i className="fa fa-bell nav-icon"/>}
                  </IconButton>
                  <Popper
                    open={notificationDropdown}
                    anchorEl={this.notiAnchorEl}
                    transition disablePortal
                    placement={'bottom-end'}
                  >
                    {({ TransitionProps, placement }) => (
                      <Grow
                        {...TransitionProps}
                        id="notification-list"
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                      >
                        <Paper>
                          <ClickAwayListener onClickAway={this.handleNotiClose}>
                            <div className="notification-container">
                              {this.renderNotifications()}
                            </div>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
                <Link to="/chatList" style={{ alignSelf: 'center' }}>
                  {!!chatsCount && chatsCount > 0 && <Badge className="badge" badgeContent={chatsCount} color="primary">
                    <i className="fa fa-comments nav-icon"/>
                  </Badge>}
                  {(!chatsCount || chatsCount === 0) && <i className="fa fa-comments nav-icon"/>}
                </Link>
                {/* eslint-disable-next-line */}
                <IconButton
                  buttonRef={node => { this.anchorEl = node }}
                  aria-owns={open ? 'menu-list-grow' : undefined}
                  aria-haspopup="true"
                  onClick={this.handleToggle}
                  className="dropdown hide-on-small-only"
                >
                  <Typography variant="body2" color="inherit" className="left-links">
                    {currentUser.attributes.name}
                  </Typography>
                </IconButton>
                <Popper open={open} anchorEl={this.anchorEl} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      id="menu-list-grow"
                      style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={this.handleClose}>
                          <MenuList>
                            <a className="dropdown-menu" href='/my_profile' ><Icon className="menu-icon">account_circle</Icon> Profile</a>
                            <MenuItem onClick={() => this.handleMenuClick(`/requests`)}><Icon className="menu-icon">mail</Icon>Requests</MenuItem>
                            <MenuItem onClick={() => this.handleMenuClick(`/my_rides`)}><Icon className="menu-icon">directions_car</Icon>My Rides</MenuItem>
                            <MenuItem onClick={() => this.handleMenuClick(`/reviews`)}><Icon className="menu-icon">rate_review</Icon>Reviews</MenuItem>
                            <MenuItem onClick={this.handleLogout}><Icon className="menu-icon">logout</Icon>Logout</MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </div>
            }
            { !currentUser.id &&
              <div style={{display: 'inline-flex'}}>
                {/* eslint-disable-next-line */}
                <a to="#" style={{alignSelf: 'center'}} onClick={() => this.goToLogin()}>
                  <Typography variant="body2" color="inherit" className="left-links hide-on-small-only create-btn">
                    Create a Ride
                  </Typography>
                </a>
                <Link to="/safety" style={{alignSelf: 'center'}}>
                  <Typography variant="body2" color="inherit" className=" hide-on-med-and-down left-links">
                    Trust & Safety
                  </Typography>
                </Link>
                <Link to="/signup" style={{alignSelf: 'center'}}>
                  <Typography variant="body2" color="inherit" className="hide-on-small-only left-links ml15">
                    Sign Up
                  </Typography>
                </Link>
                <Link to="/login" style={{alignSelf: 'center'}}>
                  <Typography variant="body2" color="inherit" className="hide-on-small-only left-links ml15">
                    Login
                  </Typography>
                </Link>
              </div>
            }
          </Toolbar>
        </AppBar>
        <Drawer
          open={this.state.drawerOpen}
          onClose={this.toggleDrawer}
        >
          { !!currentUser.id &&
            <div className="drawer-container">
              <div className="user-name">Hi {currentUser.attributes.name}</div>
              <Link to="/search" onClick={this.toggleDrawer} className="nav-search-btn">
                <div className="left-links">
                  <i className="fa fa-search  nav-icon"/> Search
                </div>
              </Link>
              <Link to="/new_ride" onClick={this.toggleDrawer}>
                <div className="create-btn">
                  Create a Ride
                </div>
              </Link>
              <Link to="/safety"  onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-handshake-o nav-icon"/ > Trust & Safety
                </div>
              </Link>
              <Link to="/my_profile" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-user nav-icon"/ >
                  Profile
                </div>
              </Link>
              <Link to="/requests" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-envelope nav-icon"/ > Requests
                </div>
              </Link>
              <Link to="/my_rides" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-car nav-icon"/ > My Rides
                </div>
              </Link>
              <Link to="/reviews" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-pencil-square-o nav-icon"/ > Reviews
                </div>
              </Link>
              <Link to="/" onClick={this.handleLogout}>
                <div className="left-links">
                  <i className="fa fa-sign-out nav-icon"/ > Logout
                </div>
              </Link>
            </div>
          }
          { !currentUser.id &&
            <div className="drawer-container">
              <Link to="/search" className="nav-search-btn" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-search  nav-icon"/> Search
                </div>
              </Link>
              <Link to="/login" onClick={this.toggleDrawer}>
                <div className="create-btn">
                  Create a Ride
                </div>
              </Link>
              <Link to="/safety" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-handshake-o nav-icon"/ > Trust & Safety
                </div>
              </Link>
              <Link to="/signup" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-street-view nav-icon"/ > Sign Up
                </div>
              </Link>
              <Link to="/login" onClick={this.toggleDrawer}>
                <div className="left-links">
                  <i className="fa fa-sign-in nav-icon"/ > Login
                </div>
              </Link>
            </div>
          }
        </Drawer>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    currentUser: getCurrentUser(state),
    notifications: getNotifications(state),
    notificationCount: getNotificationCount(state),
    chatsCount: getChatsCount(state)
  }
}

function mapDispatchToProps (dispatch) {
  const { getCurrentUserRequest, logoutRequest, getNotificationsRequest,
    setNotificationCountRequest, updateNotificationRequest, getTripRequestsRequest,
    getReceivedTripRequestsRequest } = actions

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        logoutRequest,
        getNotificationsRequest,
        setNotificationCountRequest,
        updateNotificationRequest,
        getTripRequestsRequest,
        getReceivedTripRequestsRequest
      },
      dispatch
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Nav))
