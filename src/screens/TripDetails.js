import _ from "underscore";
import React, { Component } from "react";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import Button from "@material-ui/core/Button";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";

import { notify } from "react-notify-toast";
import Slider from "react-slick";
import StarRatingComponent from "react-star-rating-component";
import ProfileMainSection from "../components/ProfileMainSection";
import ProfileImageSection from "../components/ProfileImageSection";
import ProfileCarSection from "../components/ProfileCarSection";
import ProfileAccountSection from "../components/ProfileAccountSection";
import ProfilePayoutSection from "../components/ProfilePayoutSection";
import ProfileCardSection from "../components/ProfileCardSection";

import * as actions from "../actions";
import { getCurrentUser } from "../reducers/SessionReducer";
import {
  getTrip,
  getTripErrors,
  getTripBooked,
  getIsProcessing,
  getTripError,
} from "../reducers/TripReducer";
import missingImg from "../images/missing.png";

class TripDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seats: 1,
      rideId: props.match.params.rideId,
      profile: {
        attributes: {},
        relationships: {},
        user: {
          attributes: {},
          relationships: {
            reviews: {},
          },
        },
      },
      tripErrors: {},
      isProcessing: false,
    };
  }

  componentWillMount() {
    const { rideId } = this.state;
    const { getTripInfoRequest, resetTripFlagRequest } = this.props.actions;
    resetTripFlagRequest();
    getTripInfoRequest(rideId);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { history } = this.props;
    const { resetTripFlagRequest } = this.props.actions;

    if (nextProps.trip && nextProps.trip.id) {
      this.setState({ profile: nextProps.trip.relationships.profile });
    }

    if (nextProps.tripError) {
      resetTripFlagRequest();
      notify.show(nextProps.tripError, "error");
      history.push("/");
    }

    if (nextProps.tripErrors) {
      this.setState({ tripErrors: nextProps.tripErrors });
    }

    if (nextProps.tripBooked) {
      const { rideId } = this.state;
      const { resetTripFlagRequest, getTripRequest } = this.props.actions;
      resetTripFlagRequest();
      getTripRequest(rideId);
      this.navigateToUrl(nextProps.trip);
    }

    if (nextProps.isProcessing || nextProps.isProcessing === false) {
      this.setState({ isProcessing: nextProps.isProcessing });
    }
  }

  navigateToUrl(trip) {
    const { currentUser, history } = this.props;
    const { has_cards } = currentUser.attributes;

    const url =
      parseFloat(trip.attributes.price) === 0 ||
      (parseFloat(trip.attributes.price) > 0 && !!has_cards)
        ? null
        : "/profile_details";
    if (url)
      history.push({
        pathname: url,
        state: { rider_requested: true, price: trip.attributes.price },
      });
  }

  displayImage() {
    const { trip } = this.props;
    if (trip) {
      const { profile } = trip.relationships;

      if (profile && profile.relationships) {
        const { images } = profile.relationships;

        const img = _.find(images, (img) => {
          return img.attributes.image_type === "display";
        });
        return img ? img.attributes.url : missingImg;
      }
    }
  }

  errorMessageFor = (fieldName) => {
    const { tripErrors } = this.props;
    if (tripErrors && tripErrors[fieldName]) return tripErrors[fieldName];
  };

  incrementItem = () => {
    const { trip } = this.props;
    if (!trip.attributes.is_expired) {
      this.setState({
        seats: Math.min.apply(0, [
          this.state.seats + 1,
          trip.attributes.available_seats,
        ]),
      });
    }
  };

  decreaseItem = () => {
    const { trip } = this.props;
    if (!trip.attributes.is_expired) {
      this.setState({ seats: Math.max.apply(0, [this.state.seats - 1, 1]) });
    }
  };

  sendBookTripRequest() {
    const { bookTripRequest } = this.props.actions;
    const { seats } = this.state;
    const { trip, currentUser, history } = this.props;

    localStorage.setItem("prevUrl", `/ride/${trip.attributes.slug}`);

    if (currentUser.id) {
      confirmAlert({
        title: "Alert!",
        message: "Are you sure you want to send request to driver?",
        buttons: [
          {
            label: "Yes",
            onClick: () => {
              this.setState({ isProcessing: true });
              bookTripRequest(trip.id, { seats, trip_id: trip.id });
            },
          },
          {
            label: "No",
            onClick: () => this.setState({ isProcessing: false }),
          },
        ],
      });
    } else {
      history.push("/login");
    }
  }

  alreadyBooked(trip) {
    if (trip.id) {
      const { trip_requests } = trip.relationships;
      const { currentUser } = this.props;
      const { has_cards } = currentUser.attributes;

      if (parseFloat(trip.attributes.price) === 0) {
        return !!_.find(trip_requests, (tr) => {
          return tr.requested_by === currentUser.id && tr.status === "Pending";
        });
      } else {
        return (
          !!_.find(trip_requests, (tr) => {
            return (
              tr.requested_by === currentUser.id && tr.status === "Pending"
            );
          }) && !!has_cards
        );
      }
    }
  }

  alreadyAccepted(trip) {
    if (trip.id) {
      const { trip_requests } = trip.relationships;
      const { currentUser } = this.props;
      return !!_.find(trip_requests, (tr) => {
        return tr.requested_by === currentUser.id && tr.status === "Accepted";
      });
    }
  }

  pendingRequest(trip) {
    if (trip.id) {
      const { trip_requests } = trip.relationships;
      const { currentUser } = this.props;

      return _.find(trip_requests, (tr) => {
        return tr.requested_by === currentUser.id && tr.status === "Pending";
      });
    }
  }

  isOwner() {
    const { currentUser, trip } = this.props;
    return trip.attributes.driver_id === currentUser.id;
  }

  goToChat(userId) {
    const { history } = this.props;
    localStorage.setItem("directChatUserId", userId);
    const { getDirectChatUserRequest } = this.props.actions;
    getDirectChatUserRequest(userId, true);

    history.push("/chat");
  }

  getImage(passenger) {
    return passenger.attributes.display_image
      ? passenger.attributes.display_image
      : missingImg;
  }

  goToProfile(user) {
    const { currentUser } = this.props;
    return user.id === currentUser.id
      ? `/my_profile`
      : `/profile/${user.attributes.slug || user.id}`;
  }

  renderDriver(trip) {
    const { profile } = trip.relationships;
    const { user } = profile;

    return (
      <Link to={this.goToProfile(user)} className="rider-list">
        <div className="user-img-block circle">
          <img
            className="responsive-img user-img"
            src={this.getImage(user)}
            alt=""
          />
        </div>
        <div className="user-name">{user.attributes.name}</div>
        <div className="user-type">Driver</div>
      </Link>
    );
  }

  renderRiders(trip) {
    const { trip_requests } = trip.relationships;

    return _.map(trip_requests, (trip_request, index) => {
      if (trip_request.status === "Accepted") {
        const { passenger } = trip_request;
        return (
          <Link
            to={this.goToProfile(passenger)}
            className="rider-list"
            key={`tr_${index}`}
          >
            <div className="user-img-block circle">
              <img
                className="responsive-img user-img"
                src={this.getImage(passenger)}
                alt=""
              />
            </div>
            <div className="user-name">
              <Link to={this.goToProfile(passenger)}>
                {passenger.attributes.name}
              </Link>
            </div>
            <div className="user-type">Passenger</div>
          </Link>
        );
      }
    });
  }

  render() {
    const { currentUser, trip } = this.props;
    const { has_cards, has_completed_rider_profile } = currentUser.attributes;
    const { profile, seats, isProcessing } = this.state;
    const { user } = profile;
    var settings = {
      dots: true,
      infinite: false,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 3,
      initialSlide: 0,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            infinite: false,
            dots: true,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: false,
            dots: true,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            initialSlide: 2,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    };

    return (
      <div className="trip-details">
        <div className="trip-details-tab">
          <div className="container">
            <div className="row">
              <div className="col s12 l8 box-align">
                <div className="card">
                  <div className="left-section">
                    {this.alreadyAccepted(trip) && (
                      <div className="label-status hide-on-med-and-down">
                        <span className="label active-label">It's a go!</span>
                      </div>
                    )}
                    <p className="trip-detail-heading center-align">
                      {trip.attributes.name}
                    </p>
                    <div className="center-align">
                      <span className="label">By </span>
                      <span className="user-val"> {user.attributes.name} </span>
                      <span className="label">
                        <i className="fa fa-circle"></i>{" "}
                        <span className="label">Event: </span>
                        <span className="user-val">
                          {" "}
                          {trip.attributes.event_name}{" "}
                        </span>{" "}
                        &nbsp;
                      </span>
                      {this.alreadyAccepted(trip) && (
                        <div className="label-status hide-on-large-only">
                          <span className="label active-label">It's a go!</span>
                        </div>
                      )}
                      {!this.alreadyAccepted(trip) &&
                        !this.alreadyBooked(trip) &&
                        trip.attributes.driver_id !== currentUser.id && (
                          <div className="avb-seat hide-on-large-only">
                            <span className="seat">
                              Available Seats :{" "}
                              <span className="user-val">
                                {trip.attributes.available_seats}
                              </span>
                            </span>
                          </div>
                        )}
                      <div className="center-align">
                        <div className="star-align">
                          <StarRatingComponent
                            name="average_rating"
                            starCount={5}
                            value={user.attributes.average_rating || 0}
                            editing={false}
                          />
                          {!!user.attributes.rating_count &&
                            user.attributes.rating_count !== 0 && (
                              <span>{`(${user.attributes.rating_count})`}</span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s6 l6 sep-section left-sep-section">
                        <div className="detailsHeading">DEPARTURE</div>
                        <div className="location">
                          <i className="fa fa-map-marker icon" />{" "}
                          {trip.attributes.modified_start_location}
                        </div>
                        <i className="fa fa-long-arrow-right arrow-icon"></i>
                        <div className="travel-date">
                          <span className="user-val">
                            <i className="fa fa-calendar icon cal-icon" />{" "}
                            {trip.attributes.start_date}
                          </span>
                        </div>
                      </div>
                      <div className="col s6 l6 sep-section right-sep-section">
                        <div className="detailsHeading">ARRIVAL</div>
                        <div className="location">
                          <i className="fa fa-map-marker icon" />{" "}
                          {trip.attributes.modified_destination}{" "}
                        </div>
                        <div className="travel-date">
                          <div className="user-val">
                            <i className="fa fa-calendar icon cal-icon" />{" "}
                            {trip.attributes.finish_date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bottom-section">
                    <div className="row">
                      <div className="col s4 l4 center-align">
                        <div className="item-value">
                          $ {trip.attributes.price}
                        </div>
                        <div className="item-label">price</div>
                      </div>
                      <div className="col s4 l4 center-align">
                        <div className="item-value">
                          {trip.attributes.total_distance}
                        </div>
                        <div className="item-label">miles</div>
                      </div>
                      <div className="col s4 l4 center-align">
                        <div className="item-value">
                          {trip.attributes.modified_duration}
                        </div>
                        <div className="item-label">duration</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col s12 l4 box-align">
                <div className="card">
                  <div className="right-section">
                    {!!trip.attributes.is_expired && (
                      <div>
                        <p className="center pt20 error">The trip is expired</p>
                      </div>
                    )}
                    {(this.isOwner() || this.alreadyAccepted(trip)) && (
                      <div className="trip-detail-rider-list">
                        <h6
                          className={`center pb20 ${!trip.attributes
                            .is_expired && "pt20"}`}
                        >
                          Riders List
                        </h6>
                        <Slider {...settings}>
                          {this.renderDriver(trip)}
                          {this.renderRiders(trip)}
                        </Slider>
                      </div>
                    )}
                    {!trip.attributes.is_expired &&
                      !!this.alreadyBooked(trip) &&
                      !this.alreadyAccepted(trip) &&
                      !!this.pendingRequest(trip) && (
                        <div>
                          <div className="seat-book">
                            {(parseFloat(trip.attributes.price) === 0 ||
                              (!!has_cards &&
                                !!has_completed_rider_profile)) && (
                              <div className="book-label">
                                Your request has been sent to the driver.
                              </div>
                            )}
                            <div className="avb-seat">
                              <h5 className="seat">
                                Requested Seats :{" "}
                                <span className="user-val">
                                  {this.pendingRequest(trip).seats}
                                </span>
                              </h5>
                            </div>
                            <span className="book-label">
                              Status : {this.pendingRequest(trip).status}
                            </span>
                            <br />
                            <span className="book-label">
                              Amount : ${this.pendingRequest(trip).paid_amount}
                            </span>
                          </div>
                        </div>
                      )}
                    {!!trip.id &&
                      !trip.attributes.is_expired &&
                      !this.alreadyAccepted(trip) &&
                      !this.alreadyBooked(trip) &&
                      trip.attributes.driver_id !== currentUser.id && (
                        <div>
                          <div className="seat-book">
                            <div className="avb-seat">
                              <h5 className="seat">
                                Available Seats :{" "}
                                <span className="user-val">
                                  {trip.attributes.available_seats}
                                </span>
                              </h5>
                            </div>
                            <span className="book-label">Request Seats : </span>
                            <span
                              className={`icon-container ${!!trip.attributes
                                .is_expired && "disabled"}`}
                            >
                              <i
                                className="fa fa-minus icon-btn"
                                onClick={this.decreaseItem}
                              />
                              <span className="seat-left"> {seats} </span>
                              <i
                                className="fa fa-plus icon-btn"
                                onClick={this.incrementItem}
                              />
                            </span>
                            <div className="mt20 mb10">
                              <Button
                                variant="contained"
                                className="book-btn"
                                color="primary"
                                disabled={
                                  !!isProcessing || !!trip.attributes.is_expired
                                }
                                onClick={() => this.sendBookTripRequest()}
                              >
                                {isProcessing
                                  ? "Please Wait..."
                                  : "Request Now"}
                              </Button>
                            </div>
                          </div>
                          {!trip.attributes.is_expired && (
                            <div className="accept-text">
                              When the driver accepts the booking, $
                              {trip.attributes.price * seats} amount will be
                              charged on your primary card
                            </div>
                          )}
                          <span className="error">
                            {this.errorMessageFor("trip")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-page">
          <div className="container">
            <div className="row">
              <div className="col l3 s12 center-align">
                <div className="user-img-container">
                  <img
                    src={this.displayImage()}
                    className="user-img responsive-img"
                    alt=""
                  />
                </div>
                <div className="star-align">
                  <StarRatingComponent
                    name="average_rating"
                    starCount={5}
                    value={user.attributes.average_rating || 0}
                    editing={false}
                  />{" "}
                  {!!user.attributes.rating_count &&
                    user.attributes.rating_count !== 0 && (
                      <span>{`(${user.attributes.rating_count})`}</span>
                    )}
                </div>
                <h5 className="mb20">{user.attributes.name}</h5>
                {/* eslint-disable-next-line */}
                {user.id !== currentUser.id && (
                  <a
                    href="javascript:void(0)"
                    className="chatLink"
                    onClick={() => this.goToChat(user.id)}
                  >
                    <i className="fa fa-comments chat-icon" />
                    Chat Now
                  </a>
                )}
                <div className="panel-box">
                  <div className="panel-header">Account Verifications</div>
                  <div className="panel-item">
                    {" "}
                    Email{" "}
                    {user.attributes.is_email_verified ? (
                      <i className="fa fa-check success"></i>
                    ) : (
                      <i className="fa fa-times danger"></i>
                    )}
                  </div>
                  <div className="panel-item">
                    {" "}
                    Facebook{" "}
                    {user.attributes.facebook ? (
                      <i className="fa fa-check success"></i>
                    ) : (
                      <i className="fa fa-times danger"></i>
                    )}
                  </div>
                  <div className="panel-item">
                    {" "}
                    Google{" "}
                    {user.attributes.google ? (
                      <i className="fa fa-check success"></i>
                    ) : (
                      <i className="fa fa-times danger"></i>
                    )}
                  </div>
                </div>
              </div>
              <div className="col offset-l1 l8 s12">
                <div className="my-tablist">
                  <Tabs defaultTab="one">
                    <TabList>
                      <Tab tabFor="one">Main</Tab>
                      <Tab tabFor="two">Photos</Tab>
                      <Tab tabFor="three">Car</Tab>
                      {profile.user.id === currentUser.id && (
                        <Tab tabFor="four">Account</Tab>
                      )}
                      {profile.user.id === currentUser.id && (
                        <Tab tabFor="five">Payout Details</Tab>
                      )}
                      {profile.user.id === currentUser.id && (
                        <Tab tabFor="six">Cards List</Tab>
                      )}
                    </TabList>
                    <TabPanel tabId="one">
                      <div className="mt20">
                        <ProfileMainSection
                          profile={profile}
                          user={profile.user}
                        />
                      </div>
                    </TabPanel>
                    <TabPanel tabId="two">
                      <div className="mt20">
                        <ProfileImageSection
                          profile={profile}
                          user={profile.user}
                        />
                      </div>
                    </TabPanel>
                    <TabPanel tabId="three">
                      <div className="mt20">
                        <ProfileCarSection
                          profile={profile}
                          user={profile.user}
                        />
                      </div>
                    </TabPanel>
                    <TabPanel tabId="four">
                      <div className="mt20">
                        <ProfileAccountSection />
                      </div>
                    </TabPanel>
                    <TabPanel tabId="five">
                      <div className="mt20">
                        <ProfilePayoutSection />
                      </div>
                    </TabPanel>
                    <TabPanel tabId="six">
                      <div className="mt20">
                        <ProfileCardSection />
                      </div>
                    </TabPanel>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: getCurrentUser(state),
    tripError: getTripError(state),
    tripErrors: getTripErrors(state),
    trip: getTrip(state),
    tripBooked: getTripBooked(state),
    isProcessing: getIsProcessing(state),
  };
}

function mapDispatchToProps(dispatch) {
  const {
    getCurrentUserRequest,
    getTripRequest,
    getTripInfoRequest,
    bookTripRequest,
    resetTripFlagRequest,
    getDirectChatUserRequest,
    setProcessingRequest,
  } = actions;

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        getTripRequest,
        getTripInfoRequest,
        bookTripRequest,
        resetTripFlagRequest,
        getDirectChatUserRequest,
        setProcessingRequest,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TripDetails);
