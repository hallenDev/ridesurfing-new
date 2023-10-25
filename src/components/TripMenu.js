import _ from "underscore";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Dialog from "@material-ui/core/Dialog";
import useTripStore from '../store/TripStore';
import useTripRequestStore from '../store/TripRequestStore';
import useSessionStore from '../store/SessionStore';

const TripMenu = (props) => {

  const tripStore = useTripStore();
  const tripRequestStore = useTripRequestStore();
  const sessionStore = useSessionStore();

  const index = tripStore.trips?.trip?.id;
  const trip_link = `/edit_ride/${tripStore.trips.trip?.attributes?.slug ||
    tripStore.trips?.trip?.id}`;
  const current_user = sessionStore.currentUser;
  //   driver: state.trips.trip.driver_details,
  //   requests: state.trips.trip.attributes.requests,
  //   is_dialog_open: state.is_dialog_open,
  //   can_edit: state.trips.trip.attributes.can_edit,
  //   can_cancel: state.trips.trip.attributes.can_cancel,
  //   is_expired: state.trips.trip.attributes.is_expired,
  //   driver_id: state.trips.trip.attributes.driver_id,
  //   driver_pfp: state.trips.trip.driver_details.display_image,
  //   driver_name: state.trips.trip.driver_details.name,
  //   driver_profile: `/profile/${state.trips.trip.attributes.driver_id}`,
  //   trip_link: `/ride/${state.trips.trip.attributes.slug ||
  //     state.trips.trip.id}/edit`,
  //   current_user: getCurrentUser(state),

  const initial_state = {
    id: props.trip.id,
    anchorEl: null,
    trip: props.trip,
    is_open: false,
    is_dialog_open: false,
    trip_cancelled: false,
    menu_open_cb: props.on_menu_open || (() => {}),
    menu_closed_cb: props.on_menu_closed || (() => {}),
    trip_cancelled_cb: props.on_trip_cancelled || (() => {}),
    request_cancelled_cb: props.on_request_cancelled || (() => {}),
  }

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    if (!localStorage.accessToken) {
      localStorage.setItem("prevUrl", `/my_rides`);
      return (window.location.href = `/login`);
    } else {
      sessionStore.getCurrentUserRequest();
    }
  }, [])

  const handleClick = (event) => {
    setState({ 
      ...state,
      is_open: true, 
      anchorEl: event.currentTarget 
    });
    state.menu_open_cb(index);
    // don't forward to parent
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.preventDefault();
  };

  const handleClose = () => {
    state.menu_closed_cb(index);
    setState({ 
      ...state,
      is_open: false, 
      anchorEl: null 
    });
  };

  const handleDialogOpen = () => {
    state.menu_open_cb(index);
    setState({ 
      ...state,
      is_dialog_open: true, 
      is_open: false, 
      anchorEl: null 
    });
  };

  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.preventDefault();
    state.menu_closed_cb(index);
    setState({ 
      ...state, 
      is_dialog_open: false 
    });
  };

  const handleMenuClick = () => {
    props.history.push(trip_link);
  };

  const sendCancelTripRequest = () => {
    tripStore.cancelTripRequest(props.trip.id);
    setState({ 
      ...state, 
      is_open: false, 
      trip_cancelled: true 
    });
    props.on_trip_cancelled(props.trip.id);
  };

  const sendCancelRiderTripRequest = () => {
    const request = props.trip.relationships.trip_requests.find(
      (x) => {
        return x.requested_by === current_user.id;
      }
    );
    const id = request.id;
    tripRequestStore.cancelTripRequestRequest(id);
    setState({ 
      ...state,
      is_open: false 
    });
    props.on_request_cancelled(id);
  };

  const renderDriver = () => {
    // const {driver_profile, driver_pfp, driver_name } = this.props;
    const driver_profile = `/profile/${props.trip.attributes.driver_id}`;
    const driver_pfp = props.trip.relationships.profile.user.attributes
      .display_image;
    const driver_name = props.trip.relationships.profile.user.attributes
      .name;

    return (
      <div className="rider-list">
        <Link to={driver_profile}>
          <div className="rider-img-container">
            <img
              className="responsive-img circle user-img"
              src={driver_pfp}
              alt=""
            />
          </div>
          <div className="user-name">
            <Link to={driver_profile}>{driver_name}</Link>
          </div>
          <div className="user-type">Driver</div>
        </Link>
      </div>
    );
  };

  const renderRiders = () => {
    const trip_requests = state.trip.attributes.requests;

    return _.map(trip_requests, (trip_request, index) => {
      if (trip_request.status === "accepted") {
        const { first_name, last_name, url, requested_by } = trip_request;
        const profile_url = `/profile/${requested_by}`;
        const name = `${first_name} ${last_name}`;
        return (
          <div className="rider-list" key={`tr_${index}`}>
            <Link to={profile_url}>
              <div className="rider-img-container">
                <img
                  className="responsive-img circle user-img"
                  src={url}
                  alt=""
                />
              </div>
              <div className="user-name">
                <Link to={profile_url}>{name}</Link>
              </div>
              <div className="user-type">Passenger</div>
            </Link>
          </div>
        );
      }
    });
  };

  if (!state.trip) return <div></div>;
  const { trip } = props;
  const { can_edit, can_cancel, is_expired, is_cancelled } = trip.attributes;
  return (
    <div
      className="right"
      onMouseEnter={props.on_menu_open}
      onMouseLeave={props.on_menu_closed}
    >
      <IconButton
        aria-owns={state.is_open ? `simple-menu${index}` : undefined}
        aria-haspopup="true"
        onClick={(event) => handleClick(event)}
        className="dropdown"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`simple-menu${index}`}
        open={state.is_open}
        anchorEl={state.anchorEl}
        onClose={() => handleClose()}
        PaperProps={{
          style: {
            transform: "translateX(-10%)",
            width: 150,
            padding: 0,
          },
        }}
        MenuListProps={{ style: { padding: 0 } }}
        className="trip-dropdown"
      >
        <MenuItem onClick={() => handleDialogOpen()}>
          <Icon className="menu-icon">list</Icon>View Riders
        </MenuItem>
        {can_edit && !state.trip_cancelled && (
          <Link
            style={{ textDecoration: "none", color: "#4a4a4a" }}
            to={`/edit_ride/${props.trip.id}`}
          >
            <MenuItem>
              <Icon className="menu-icon">edit</Icon>Edit Ride
            </MenuItem>
          </Link>
        )}
        {can_cancel && !state.trip_cancelled && (
          <MenuItem onClick={() => sendCancelTripRequest()}>
            <Icon className="menu-icon">delete</Icon>Cancel Ride
          </MenuItem>
        )}
        {!is_expired && !can_cancel && !can_edit && !is_cancelled && (
          <MenuItem onClick={() => sendCancelRiderTripRequest()}>
            <Icon className="menu-icon">delete</Icon>Opt Out
          </MenuItem>
        )}
      </Menu>
      <Dialog
        open={state.is_dialog_open || false}
        onClose={handleDialogClose}
        className="dialog-box"
        maxWidth="sm"
        fullWidth={true}
      >
        <div className="dialog-heading">
          <Icon className="close-icon right" onClick={handleDialogClose}>
            close
          </Icon>
          <h3>Riders list</h3>
        </div>
        <div className="dialog-body">
          {renderDriver(trip)}
          {renderRiders(trip)}
        </div>
      </Dialog>
    </div>
  );
}


export default (TripMenu);
