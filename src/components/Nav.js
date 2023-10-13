import _ from 'underscore'
import React, { useState, useEffect } from 'react'
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

import logo from '../images/rs-logo.png'

import useNotificationStore from '../store/NotificationStore';
import useSessionStore from '../store/SessionStore';
import useTripRequestStore from '../store/TripRequestStore';

const initial_state = {
  open: false,
  drawerOpen: false,
  notificationDropdown: false,
};

const Nav = (props) => {

  const notificationStore = useNotificationStore();
  const sessionStore = useSessionStore();
  const tripRequestStore = useTripRequestStore();

  const currentUser = sessionStore.currentUser;
  const notifications = notificationStore.notifications;
  const notificationCount = sessionStore.notificationCount;
  const chatsCount = sessionStore.chatsCount;


  const [state, setState] = useState(initial_state);
  const [notiAnchorEl, setNotiAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (localStorage.accessToken) {
      sessionStore.getCurrentUserRequest()
      notificationStore.getNotificationsRequest()
      subscribeChannel()
    }
  }, [])

  const subscribeChannel = () => {
    if (props.cable) {
      var cable = props.cable
      cable.subscriptions.create({channel: "NotificationsChannel"}, {
        connected: () => {
        },
        disconnected: () => {
        },
        received: function(data) {
          if (currentUser && data.user_id === currentUser.id) {
            sessionStore.setNotificationCountRequest(data)

            tripRequestStore.getReceivedTripRequestsRequest()
            tripRequestStore.getTripRequestsRequest()
          }
        }
      })
    }
  }

  const toggleDrawer = () => {
    setState(state => ({ drawerOpen: !state.drawerOpen }))
  }

  const handleToggle = () => {
    setState(state => ({ open: !state.open }))
  }

  const handleNotificationToggle = () => {
    notificationStore.getNotificationsRequest()
    setState(state => ({ notificationDropdown: !state.notificationDropdown }))
  }

  const handleClose = event => {
    if (anchorEl.contains(event.target)) { return }
    setState({ 
      ...state,
      open: false 
    })
  }

  const handleNotiClose = event => {
    if (notiAnchorEl.contains(event.target)) { return }
    setState({ 
      ...state,
      notificationDropdown: false 
    })
  }

  const handleNotificationClick = (notification) => {
    const { subject_type, for_driver, review_total, review_rated_to, subject_id } = notification.attributes
    const { history } = props

    if (!notification.attributes.is_read) {
      notificationStore.updateNotificationRequest(notification.id)
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
    setState({ 
      ...state,
      notificationDropdown: false 
    })
  }

  const handleMenuClick = (url) => {
    const { history } = props
    history.push(url)
    setState({ 
      ...state,
      open: false, 
      notificationDropdown: false 
    })
  }

  const handleLogout = () => {
    sessionStore.logoutRequest()
    return window.location.href = `/login`
  }

  const renderNotifications = () => {
    if (notifications.length > 0 ) {
      return _.map(notifications, (noti, index) => {
        return <div className={`notification ${noti.attributes.is_read ? '' : 'unread'}`} onClick={() => handleNotificationClick(noti)} key={`noti-${index}`}>
          {noti.attributes.description}
          <div className="time">{noti.attributes.received_at} ago</div>
        </div>
      })
    } else {
      return <div className="no-notification" onClick={handleNotiClose}> No unread notifications </div>
    }
  }

  const goToLogin = () => {
    const { history } = props

    localStorage.setItem('prevUrl', `/new_ride`)
    history.push('/login')
  }
  const { open, notificationDropdown } = state

  return (
    <div className="nav-container">
      <AppBar position="fixed" className="home-nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={toggleDrawer}
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
                  ref={notiNode => { setNotiAnchorEl(notiNode) }}
                  aria-owns={notificationDropdown ? 'notification-list' : undefined}
                  aria-haspopup="true"
                  onClick={handleNotificationToggle}
                  className="noti-icon"
                >
                  {!!notificationCount && notificationCount > 0 && <Badge className="badge" badgeContent={notificationCount} color="primary">
                    <i className="fa fa-bell nav-icon"/>
                  </Badge>}
                  {(!notificationCount || notificationCount === 0) && <i className="fa fa-bell nav-icon"/>}
                </IconButton>
                <Popper
                  open={notificationDropdown}
                  anchorEl={notiAnchorEl}
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
                        <ClickAwayListener onClickAway={handleNotiClose}>
                          <div className="notification-container">
                            {renderNotifications()}
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
                ref={node => { setAnchorEl(node) }}
                aria-owns={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                className="dropdown hide-on-small-only"
              >
                <Typography variant="body2" color="inherit" className="left-links">
                  {currentUser.attributes.name}
                </Typography>
              </IconButton>
              <Popper open={open} anchorEl={anchorEl} transition disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    id="menu-list-grow"
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList>
                          <a className="dropdown-menu" href='/my_profile' ><Icon className="menu-icon">account_circle</Icon> Profile</a>
                          <MenuItem onClick={() => handleMenuClick(`/requests`)}><Icon className="menu-icon">mail</Icon>Requests</MenuItem>
                          <MenuItem onClick={() => handleMenuClick(`/my_rides`)}><Icon className="menu-icon">directions_car</Icon>My Rides</MenuItem>
                          <MenuItem onClick={() => handleMenuClick(`/reviews`)}><Icon className="menu-icon">rate_review</Icon>Reviews</MenuItem>
                          <MenuItem onClick={handleLogout}><Icon className="menu-icon">logout</Icon>Logout</MenuItem>
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
              <a to="#" style={{alignSelf: 'center'}} onClick={() => goToLogin()}>
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
        open={state.drawerOpen}
        onClose={toggleDrawer}
      >
        { !!currentUser.id &&
          <div className="drawer-container">
            <div className="user-name">Hi {currentUser.attributes.name}</div>
            <Link to="/search" onClick={toggleDrawer} className="nav-search-btn">
              <div className="left-links">
                <i className="fa fa-search  nav-icon"/> Search
              </div>
            </Link>
            <Link to="/new_ride" onClick={toggleDrawer}>
              <div className="create-btn">
                Create a Ride
              </div>
            </Link>
            <Link to="/safety"  onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-handshake-o nav-icon"/ > Trust & Safety
              </div>
            </Link>
            <Link to="/my_profile" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-user nav-icon"/ >
                Profile
              </div>
            </Link>
            <Link to="/requests" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-envelope nav-icon"/ > Requests
              </div>
            </Link>
            <Link to="/my_rides" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-car nav-icon"/ > My Rides
              </div>
            </Link>
            <Link to="/reviews" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-pencil-square-o nav-icon"/ > Reviews
              </div>
            </Link>
            <Link to="/" onClick={handleLogout}>
              <div className="left-links">
                <i className="fa fa-sign-out nav-icon"/ > Logout
              </div>
            </Link>
          </div>
        }
        { !currentUser.id &&
          <div className="drawer-container">
            <Link to="/search" className="nav-search-btn" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-search  nav-icon"/> Search
              </div>
            </Link>
            <Link to="/login" onClick={toggleDrawer}>
              <div className="create-btn">
                Create a Ride
              </div>
            </Link>
            <Link to="/safety" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-handshake-o nav-icon"/ > Trust & Safety
              </div>
            </Link>
            <Link to="/signup" onClick={toggleDrawer}>
              <div className="left-links">
                <i className="fa fa-street-view nav-icon"/ > Sign Up
              </div>
            </Link>
            <Link to="/login" onClick={toggleDrawer}>
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

export default withRouter(Nav)
