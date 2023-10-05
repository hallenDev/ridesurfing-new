import _ from "underscore";
import React, { Component } from "react";
import * as actions from "../actions";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
import Dialog from "@material-ui/core/Dialog";
import { getCurrentUser } from "../reducers/SessionReducer";

class TripMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.trip.id,
      anchorEl: null,
      trip: this.props.trip,
      is_open: false,
      is_dialog_open: false,
      trip_cancelled: false,
      menu_open_cb: this.props.on_menu_open || (() => {}),
      menu_closed_cb: this.props.on_menu_closed || (() => {}),
      trip_cancelled_cb: this.props.on_trip_cancelled || (() => {}),
      request_cancelled_cb: this.props.on_request_cancelled || (() => {}),
    };
  }

  componentWillMount() {
    const { getCurrentUserRequest } = this.props.actions;
    getCurrentUserRequest();
    if (!localStorage.accessToken) {
      localStorage.setItem("prevUrl", `/my_rides`);
      return (window.location.href = `/login`);
    }
  }

  handleClick = (event) => {
    this.setState({ is_open: true, anchorEl: event.currentTarget });
    this.state.menu_open_cb(this.props.index);
    // don't forward to parent
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.preventDefault();
  };

  handleClose = () => {
    this.state.menu_closed_cb(this.props.index);
    this.setState({ is_open: false, anchorEl: null });
  };

  handleDialogOpen = () => {
    this.state.menu_open_cb(this.props.index);
    this.setState({ is_dialog_open: true, is_open: false, anchorEl: null });
  };

  handleDialogClose = (event, reason) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.preventDefault();
    this.state.menu_closed_cb(this.props.index);
    this.setState({ is_dialog_open: false });
  };

  handleMenuClick = () => {
    this.props.history.push(this.props.trip_link);
  };

  sendCancelTripRequest = () => {
    const { cancelTripRequest } = this.props.actions;
    cancelTripRequest(this.props.trip.id);
    this.setState({ is_open: false, trip_cancelled: true });
    this.props.on_trip_cancelled(this.props.trip.id);
  };

  sendCancelRiderTripRequest = () => {
    const { current_user } = this.props;
    const { cancelTripRequestRequest } = this.props.actions;
    const request = this.props.trip.relationships.trip_requests.requests.find(
      (x) => {
        return x.requested_by === current_user.id;
      }
    );
    const id = request.id;
    cancelTripRequestRequest(id);
    this.setState({ is_open: false });
    this.props.on_request_cancelled(id);
  };
  renderDriver = () => {
    // const {driver_profile, driver_pfp, driver_name } = this.props;
    const driver_profile = `/profile/${this.state.trip.attributes.driver_id}`;
    const driver_pfp = this.state.trip.relationships.profile.user.attributes
      .display_image;
    const driver_name = this.state.trip.relationships.profile.user.attributes
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
  renderRiders = () => {
    const trip_requests = this.state.trip.attributes.requests;

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

  render() {
    if (!this.state.trip) return <div></div>;
    const { index, trip } = this.props;
    const { can_edit, can_cancel, is_expired, is_cancelled } = trip.attributes;
    return (
      <div
        className="right"
        onMouseEnter={this.props.on_menu_open}
        onMouseLeave={this.props.on_menu_closed}
      >
        <IconButton
          aria-owns={this.is_open ? `simple-menu${index}` : undefined}
          aria-haspopup="true"
          onClick={(event) => this.handleClick(event)}
          className="dropdown"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={`simple-menu${index}`}
          open={this.state.is_open}
          anchorEl={this.state.anchorEl}
          onClose={() => this.handleClose()}
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
          <MenuItem onClick={() => this.handleDialogOpen()}>
            <Icon className="menu-icon">list</Icon>View Riders
          </MenuItem>
          {can_edit && !this.state.trip_cancelled && (
            <Link
              style={{ textDecoration: "none", color: "#4a4a4a" }}
              to={`/ride/${this.props.trip.id}/edit`}
            >
              <MenuItem>
                <Icon className="menu-icon">edit</Icon>Edit Ride
              </MenuItem>
            </Link>
          )}
          {can_cancel && !this.state.trip_cancelled && (
            <MenuItem onClick={() => this.sendCancelTripRequest()}>
              <Icon className="menu-icon">delete</Icon>Cancel Ride
            </MenuItem>
          )}
          {!is_expired && !can_cancel && !can_edit && !is_cancelled && (
            <MenuItem onClick={() => this.sendCancelRiderTripRequest()}>
              <Icon className="menu-icon">delete</Icon>Opt Out
            </MenuItem>
          )}
        </Menu>
        <Dialog
          open={this.state.is_dialog_open || false}
          onClose={this.handleDialogClose}
          className="dialog-box"
          maxWidth="sm"
          fullWidth={true}
        >
          <div className="dialog-heading">
            <Icon className="close-icon right" onClick={this.handleDialogClose}>
              close
            </Icon>
            <h3>Riders list</h3>
          </div>
          <div className="dialog-body">
            {this.renderDriver(trip)}
            {this.renderRiders(trip)}
          </div>
        </Dialog>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  if (
    !(
      state.trips.trip &&
      state.trips.trip.driver_details &&
      state.trips.trip.attributes
    )
  )
    return {};

  return {
    index: state.trips.trip.id,
    driver: state.trips.trip.driver_details,
    requests: state.trips.trip.attributes.requests,
    is_dialog_open: state.is_dialog_open,
    can_edit: state.trips.trip.attributes.can_edit,
    can_cancel: state.trips.trip.attributes.can_cancel,
    is_expired: state.trips.trip.attributes.is_expired,
    driver_id: state.trips.trip.attributes.driver_id,
    driver_pfp: state.trips.trip.driver_details.display_image,
    driver_name: state.trips.trip.driver_details.name,
    driver_profile: `/profile/${state.trips.trip.attributes.driver_id}`,
    trip_link: `/ride/${state.trips.trip.attributes.slug ||
      state.trips.trip.id}/edit`,
    current_user: getCurrentUser(state),
  };
}
function mapDispatchToProps(dispatch) {
  const {
    cancelTripRequest,
    cancelTripRequestRequest,
    getCurrentUserRequest,
  } = actions;

  return {
    actions: bindActionCreators(
      {
        cancelTripRequest,
        cancelTripRequestRequest,
        getCurrentUserRequest,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TripMenu);
