import _ from "underscore";
import React, { useState, useEffect } from "react";
import { Tabs, Tab, TabPanel, TabList } from "react-web-tabs";
import Button from "@material-ui/core/Button";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

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

import missingImg from "../images/missing.png";
import useSessionStore from '../store/SessionStore';
import useTripStore from '../store/TripStore';
import useChatStore from '../store/ChatStore';

const TripDetails = (props) => {

  const sessionStore = useSessionStore();
  const tripStore = useTripStore();
  const chatStore = useChatStore();

  const currentUser = sessionStore.currentUser;
  const trip = tripStore.trip;
  const tripError = tripStore.error;
  const tripErrors = tripStore.errors;
  const tripBooked = tripStore.isBooked;
  const isProcessing = tripStore.isProcessing;

  const initial_state = {
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

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    tripStore.resetTripFlagRequest();
    tripStore.getTripInfoRequest(state.rideId);
  }, [])

  useEffect(() => {
    if (trip && trip.id) {
      setState({ ...state, profile: trip.relationships.profile });
    }
  }, [trip])

  useEffect(() => {
    const { history } = props;
    if (tripError) {
      tripStore.resetTripFlagRequest();
      notify.show(tripError, "error");
      history.push("/");
    }
  }, [tripError])

  useEffect(() => {
    if (tripErrors) {
      setState({ ...state, tripErrors: tripErrors });
    }
  }, [tripErrors])

  useEffect(() => {
    if (tripBooked) {
      const { rideId } = state;
      tripStore.resetTripFlagRequest();
      tripStore.getTripRequest(rideId);
      tripStore.getTripInfoRequest(state.rideId);
      navigateToUrl(trip);
    }
  }, [tripBooked])

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState({ ...state, isProcessing: isProcessing });
    }
  }, [isProcessing])
  
  const navigateToUrl = (trip) => {
    const { history } = props;
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

  const displayImage = () => {
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

  const errorMessageFor = (fieldName) => {
    if (tripErrors && tripErrors[fieldName]) return tripErrors[fieldName];
  };

  const incrementItem = () => {
    if (!trip.attributes.is_expired) {
      setState({
        ...state,
        seats: Math.min.apply(0, [
          state.seats + 1,
          trip.attributes.available_seats,
        ]),
      });
    }
  };

  const decreaseItem = () => {
    if (!trip.attributes.is_expired) {
      setState({ 
        ...state, 
        seats: Math.max.apply(0, [state.seats - 1, 1]) 
      });
    }
  };

  const sendBookTripRequest = () => {
    const { seats } = state;
    const { history } = props;

    localStorage.setItem("prevUrl", `/ride/${trip.attributes.slug}`);

    if (currentUser.id) {
      confirmAlert({
        title: "Alert!",
        message: "Are you sure you want to send request to driver?",
        buttons: [
          {
            label: "Yes",
            onClick: () => {
              setState({ 
                ...state, 
                isProcessing: true 
              });
              tripStore.bookTripRequest(trip.id, { seats, trip_id: trip.id });
            },
          },
          {
            label: "No",
            onClick: () => setState({ ...state, isProcessing: false }),
          },
        ],
      });
    } else {
      history.push("/login");
    }
  }

  const alreadyBooked = (trip) => {
    if (trip.id) {
      const { trip_requests } = trip.relationships;
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

  const alreadyAccepted = (trip) => {
    if (trip.id) {
      const { trip_requests } = trip.relationships;
      return !!_.find(trip_requests, (tr) => {
        return tr.requested_by === currentUser.id && tr.status === "Accepted";
      });
    }
  }

  const pendingRequest = (trip) => {
    if (trip.id) {
      const { trip_requests } = trip.relationships;

      return _.find(trip_requests, (tr) => {
        return tr.requested_by === currentUser.id && tr.status === "Pending";
      });
    }
  }

  const isOwner = () => {
    return trip.attributes.driver_id === currentUser.id;
  }

  const goToChat = (userId) => {
    const { history } = props;
    localStorage.setItem("directChatUserId", userId);
    chatStore.getDirectChatUserRequest(userId, true);

    history.push("/chat");
  }

  const getImage = (passenger) => {
    return passenger?.attributes?.display_image
      ? passenger.attributes.display_image
      : missingImg;
  }

  const goToProfile = (user) => {
    return user?.id === currentUser?.id
      ? `/my_profile`
      : `/profile/${user?.attributes?.slug || user?.id}`;
  }

  const renderDriver = (trip) => {
    const { profile } = trip.relationships;
    const { user } = profile;

    return (
      <Link to={goToProfile(user)} className="rider-list">
        <div className="user-img-block circle">
          <img
            className="responsive-img user-img"
            src={getImage(user)}
            alt=""
          />
        </div>
        <div className="user-name">{user.attributes.name}</div>
        <div className="user-type">Driver</div>
      </Link>
    );
  }

  const renderRiders = (trip) => {
    const { trip_requests } = trip.relationships;

    return _.map(trip_requests, (trip_request, index) => {
      if (trip_request.status === "Accepted") {
        const { passenger } = trip_request;
        return (
          <Link
            to={goToProfile(passenger)}
            className="rider-list"
            key={`tr_${index}`}
            onClick={
              event => {
                if(!passenger) event.preventDefault()
              }
            }
          >
            <div className="user-img-block circle">
              <img
                className="responsive-img user-img"
                src={getImage(passenger)}
                alt=""
                onClick={
                  event => {
                    if(!passenger) event.preventDefault()
                  }
                }
              />
            </div>
            <div className="user-name">
              {
                passenger?.attributes?.name ?
                <Link to={goToProfile(passenger)}>
                  {passenger?.attributes?.name}
                </Link> 
                :
                <div className="user-type">Deleted User</div>
              }
            </div>
            <div className="user-type">Passenger</div>
          </Link>
        );
      }
    });
  }

  const { has_cards, has_completed_rider_profile } = currentUser.attributes;
  const { profile, seats } = state;
  // const { user } = profile ? ;
  const user = profile? profile.user : null;
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
                  {alreadyAccepted(trip) && (
                    <div className="label-status hide-on-med-and-down">
                      <span className="label active-label">It's a go!</span>
                    </div>
                  )}
                  <p className="trip-detail-heading center-align">
                    {trip.attributes.name}
                  </p>
                  <div className="center-align">
                    <span className="label">By </span>
                    <span className="user-val"> {user? user.attributes.name: "Deleted User"} </span>
                    <span className="label">
                      <i className="fa fa-circle"></i>{" "}
                      <span className="label">Event: </span>
                      <span className="user-val">
                        {" "}
                        {trip.attributes.event_name}{" "}
                      </span>{" "}
                      &nbsp;
                    </span>
                    {alreadyAccepted(trip) && (
                      <div className="label-status hide-on-large-only">
                        <span className="label active-label">It's a go!</span>
                      </div>
                    )}
                    {!alreadyAccepted(trip) &&
                      !alreadyBooked(trip) &&
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
                          value={ user?.attributes?.average_rating || 0}
                          editing={false}
                        />
                        {!!user?.attributes?.rating_count &&
                          user?.attributes?.rating_count !== 0 && (
                            <span>{`(${user?.attributes?.rating_count})`}</span>
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
                  {(isOwner() || alreadyAccepted(trip)) && (
                    <div className="trip-detail-rider-list">
                      <h6
                        className={`center pb20 ${!trip.attributes
                          .is_expired && "pt20"}`}
                      >
                        Riders List
                      </h6>
                      <Slider {...settings}>
                        {renderDriver(trip)}
                        {renderRiders(trip)}
                      </Slider>
                    </div>
                  )}
                  {!trip.attributes.is_expired &&
                    !!alreadyBooked(trip) &&
                    !alreadyAccepted(trip) &&
                    !!pendingRequest(trip) && (
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
                                {pendingRequest(trip).seats}
                              </span>
                            </h5>
                          </div>
                          <span className="book-label">
                            Status : {pendingRequest(trip).status}
                          </span>
                          <br />
                          <span className="book-label">
                            Amount : ${pendingRequest(trip).paid_amount}
                          </span>
                        </div>
                      </div>
                    )}
                  {!!trip.id &&
                    !trip.attributes.is_expired &&
                    !alreadyAccepted(trip) &&
                    !alreadyBooked(trip) &&
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
                              onClick={decreaseItem}
                            />
                            <span className="seat-left"> {seats} </span>
                            <i
                              className="fa fa-plus icon-btn"
                              onClick={incrementItem}
                            />
                          </span>
                          <div className="mt20 mb10">
                            <Button
                              variant="contained"
                              className="book-btn"
                              color="primary"
                              disabled={
                                !!state.isProcessing || !!trip.attributes.is_expired
                              }
                              onClick={() => sendBookTripRequest()}
                            >
                              {state.isProcessing
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
                          {errorMessageFor("trip")}
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
                  src={displayImage()}
                  className="user-img responsive-img"
                  alt=""
                />
              </div>
              <div className="star-align">
                <StarRatingComponent
                  name="average_rating"
                  starCount={5}
                  value={user?.attributes.average_rating || 0}
                  editing={false}
                />{" "}
                {!!user?.attributes?.rating_count &&
                  user?.attributes?.rating_count !== 0 && (
                    <span>{`(${user?.attributes?.rating_count})`}</span>
                  )}
              </div>
              <h5 className="mb20">{user?.attributes?.name ?? "Deleted User"}</h5>
              {/* eslint-disable-next-line */}
              {(user && user.id !== currentUser.id) && (
                <a
                  href="javascript:void(0)"
                  className="chatLink"
                  onClick={() => goToChat(user.id)}
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
                  {user?.attributes?.is_email_verified ? (
                    <i className="fa fa-check success"></i>
                  ) : (
                    <i className="fa fa-times danger"></i>
                  )}
                </div>
                <div className="panel-item">
                  {" "}
                  Facebook{" "}
                  {user?.attributes?.facebook ? (
                    <i className="fa fa-check success"></i>
                  ) : (
                    <i className="fa fa-times danger"></i>
                  )}
                </div>
                <div className="panel-item">
                  {" "}
                  Google{" "}
                  {user?.attributes?.google ? (
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
                    {(profile && profile?.user?.id === currentUser.id) && (
                      <Tab tabFor="four">Account</Tab>
                    )}
                    {(profile && profile?.user.id === currentUser.id) && (
                      <Tab tabFor="five">Payout Details</Tab>
                    )}
                    {(profile && profile?.user.id === currentUser.id) && (
                      <Tab tabFor="six">Cards List</Tab>
                    )}
                  </TabList>
                  <TabPanel tabId="one">
                    <div className="mt20">
                      <ProfileMainSection
                        profile={profile}
                        user={profile?.user}
                      />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="two">
                    <div className="mt20">
                      <ProfileImageSection
                        profile={profile}
                        user={profile?.user}
                      />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="three">
                    <div className="mt20">
                      <ProfileCarSection
                        profile={profile}
                        user={profile?.user}
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

export default (TripDetails);
