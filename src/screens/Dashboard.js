import _ from "underscore";
import $ from "jquery";
import React, { Component } from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import ReactSlider from "react-slider";
import Close from "@material-ui/icons/Close";
import Collapse from "@material-ui/core/Collapse";
import DatePicker from "react-datepicker";
import ReactLoading from "react-loading";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as actions from "../actions";
import { getCurrentUser } from "../reducers/SessionReducer";
import {
  getAllTrips,
  getSearchedTrips,
  getSearchedTripIds,
  getSimilarTrips,
  getPagination,
  getDataLoaded,
  getWaypoints,
} from "../reducers/TripReducer";

import SearchField from "../components/SearchField";
import Gmap from "../components/Gmap";
import TripCard from "../components/TripCard";
import Pagination from "../components/Pagination";

const basicFilters = [
  ["", "All"],
  ["t", "Yes"],
  ["f", "No"],
];
const driveType = [
  ["", "All"],
  [1, "Commute"],
  [2, "Adventure"],
];
const gender = [
  ["", "Select"],
  [1, "Male"],
  [2, "Female"],
  [3, "Other"],
];
let markersArr = [];

const eventNames = [
  "No Event",
  "Concerts",
  "Music Festivals",
  "Entertainment show",
  "Museum",
  "Cultural Event",
];

const addDays = (date, days) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const MenuProps = { PaperProps: { style: { maxHeight: 300 } } };

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: 39.73915,
      longitude: -104.9847,
      locationAvailable: false,
      expanded: false,
      showTrip: false,
      dataLoaded: false,
      filters:
        !!props.location.state && !!props.location.state.filters
          ? JSON.parse(props.location.state.filters)
          : {
              start_price: 0,
              end_price: 250,
              event_name: [],
            },
      waypoints: [],
      trip_cache: {},
      selected: {},
    };
    const today = new Date();
    this.state["finish_date1"] =
      today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear();
  }

  componentWillMount() {
    const { getCurrentUserRequest } = this.props.actions;

    if (localStorage.accessToken) {
      getCurrentUserRequest();
    }
  }

  componentDidMount() {
    $(".nav-search-btn").hide();
    this.setCurrentPosition();
  }

  componentWillUnmount() {
    $(".nav-search-btn").show();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { getTripInfoRequest } = this.props.actions;
    if (nextProps.dataLoaded || nextProps.dataLoaded === false) {
      this.setState({ dataLoaded: nextProps.dataLoaded });
    }

    if (nextProps.dataLoaded) {
      var elems = document.querySelectorAll(".clicked-page");
      [].forEach.call(elems, function(el) {
        el.classList.remove("clicked-page");
      });
    }

    if (nextProps.waypoints && nextProps.waypoints.length > 0) {
      this.state.waypoints = [...nextProps.waypoints];
      markersArr = [];
      _.map(this.state.waypoints, (wp) => {
        const lat = wp.start_location_latitude;
        const long = wp.start_location_longitude;
        markersArr.push({ lat: parseFloat(lat), lng: parseFloat(long) });
      });
    }
  }

  setCurrentPosition() {
    const { filters } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;
    const comp = this;

    $.getJSON(process.env.REACT_APP_GEOLOCATION_URL)
      .done(function(location) {
        filters["latitude"] = location.latitude;
        filters["longitude"] = location.longitude;
        comp.setState({
          latitude: location.latitude,
          longitude: location.longitude,
          locationAvailable: true,
          filters,
        });

        resetDataLoadedRequest();
        searchTripIdsRequest(filters);
      })
      .fail(function(error) {
        comp.setState({ locationAvailable: false });
        searchTripIdsRequest(filters);
      });
  }

  setSelectedTrip(trip) {
    const { selected } = this.state;
    _.map(["start_location", "destination"], (fieldname) => {
      selected[fieldname] = trip.attributes[fieldname];
      selected[`${fieldname}_latitude`] = parseFloat(
        trip.attributes[`${fieldname}_latitude`]
      );
      selected[`${fieldname}_longitude`] = parseFloat(
        trip.attributes[`${fieldname}_longitude`]
      );
    });
    this.setState({ selected, showTrip: true });
  }

  unselectTrip() {
    this.setState({ selected: {}, showTrip: false });
  }

  updateDateFilters = (fieldName, date) => {
    const { filters } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;

    if (!date) {
      filters[fieldName] = date;
    } else {
      try {
        if (date < new Date()) {
          date = new Date();
        }
        filters[fieldName] =
          date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      } catch {
        filters[fieldName] = date;
      }
    }
    this.setState({ filters });

    resetDataLoadedRequest();
    searchTripIdsRequest(filters);
  };

  updateFilters = (fieldName, event) => {
    const { filters } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;

    filters[fieldName] = event.target.value;
    this.setState({ filters });

    resetDataLoadedRequest();
    searchTripIdsRequest(filters);
  };

  onMarkerClick(trip) {
    const { filters } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;
    const {
      start_location_latitude,
      start_location_longitude,
      start_location,
    } = trip;

    filters["start_location"] = start_location;
    filters["start_location_latitude"] = start_location_latitude;
    filters["start_location_longitude"] = start_location_longitude;

    this.setState({ filters });
    resetDataLoadedRequest();
    searchTripIdsRequest(filters);
  }

  updateSlider = (fieldName, value) => {
    const { filters } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;

    if (value === 351) {
      delete filters[fieldName];
    } else {
      filters[fieldName] = value;
    }

    this.setState({ filters });

    resetDataLoadedRequest();
    searchTripIdsRequest(filters);
  };

  changePrice(valArray) {
    const { filters } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;

    filters["start_price"] = valArray[0];
    filters["end_price"] = valArray[1];
    this.setState({ filters });

    resetDataLoadedRequest();
    searchTripIdsRequest(filters);
  }

  setAddress(address, geometry, fieldName) {
    const { filters, latitude, longitude, locationAvailable } = this.state;
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;

    filters[fieldName] = geometry ? address : undefined;
    filters[`${fieldName}_latitude`] = geometry
      ? geometry.location.lat()
      : undefined;
    filters[`${fieldName}_longitude`] = geometry
      ? geometry.location.lng()
      : undefined;

    if (locationAvailable) {
      filters.latitude = latitude;
      filters.longitude = longitude;
    } else {
      filters.latitude = null;
      filters.longitude = null;
    }

    this.setState({ filters });

    if (geometry || address === "") {
      resetDataLoadedRequest();
      searchTripIdsRequest(filters);
    }
  }

  handleExpandClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
  };

  createCard(trip, trip_idx) {
    const { getTripInfoRequest } = this.props.actions;
    // getTripInfoRequest(trip.id)
    return (
      <TripCard
        trip={JSON.parse(JSON.stringify(trip))}
        onMouseEnter={(trip_info) => this.setSelectedTrip(trip_info)}
        onMouseLeave={() => this.unselectTrip()}
      />
    );
  }

  renderTrips() {
    const { trips } = this.props;
    if (trips.length > 0) {
      return _.map(trips, (trip, index) => {
        return this.createCard(trip, index);
      });
    } else {
      return "No Ridesurfers available near your location. Please try with filters.";
    }
  }

  renderSimilarTrips() {
    const { similarTrips } = this.props;
    return _.map(similarTrips, (trip, index) => {
      return this.createCard(trip, index);
    });
  }

  onPageNumClick(e, page) {
    const { resetDataLoadedRequest, searchTripIdsRequest } = this.props.actions;
    const { filters } = this.state;

    e.target.parentElement.classList.add("clicked-page");

    resetDataLoadedRequest();
    searchTripIdsRequest(filters, page, false);
  }

  renderPagination() {
    const { pagination } = this.props;
    if (pagination.total_pages > 1) {
      var arr = [...Array(pagination.total_pages).keys()].map((x) => ++x);
      return _.map(arr, (page) => {
        return (
          <li
            key={"page" + page}
            className={
              page === pagination.current_page ? "active" : "waves-effect"
            }
          >
            {/* eslint-disable-next-line */}
            <a
              href="javascript:void(0)"
              onClick={(e) => this.onPageNumClick(e, page)}
            >
              {page}
            </a>
          </li>
        );
      });
    }
  }

  render() {
    const {
      filters,
      selected,
      showTrip,
      latitude,
      longitude,
      dataLoaded,
    } = this.state;
    const { allTrips, similarTrips, trips } = this.props;
    return (
      <div className="dashboard-container">
        <div className="formSection">
          <div className="container">
            <div className="row">
              <div className="col l2 m2 s12 singleSlider">
                <div className="label search-label">Journey</div>
              </div>
              <div className="col l5 m5 s12 singleSlider">
                <SearchField
                  placeholder="Enter start location"
                  value={filters.start_location || ""}
                  setAddress={(address, geometry) =>
                    this.setAddress(address, geometry, "start_location")
                  }
                />
                <ReactSlider
                  withBars
                  defaultValue={351}
                  min={0}
                  max={351}
                  value={filters.start_location_fence}
                  onAfterChange={(value) =>
                    this.updateSlider("start_location_fence", value)
                  }
                >
                  <div className="slider-handle"></div>
                </ReactSlider>
                <p className="slide-value">
                  <span id="origin_fence_val">
                    {filters.start_location_fence === 351
                      ? ""
                      : filters.start_location_fence}
                  </span>{" "}
                  miles
                </p>
              </div>
              <div className="col l5 m5 s12 singleSlider">
                <SearchField
                  placeholder="Enter destination"
                  value={filters.destination || ""}
                  setAddress={(address, geometry) =>
                    this.setAddress(address, geometry, "destination")
                  }
                />
                <ReactSlider
                  withBars
                  defaultValue={351}
                  min={0}
                  max={351}
                  value={
                    filters.destination_fence === 351
                      ? ""
                      : filters.destination_fence
                  }
                  onAfterChange={(value) =>
                    this.updateSlider("destination_fence", value)
                  }
                >
                  <div className="slider-handle"></div>
                </ReactSlider>
                <p className="slide-value">
                  <span id="destination_fence_val">
                    {filters.destination_fence}
                  </span>{" "}
                  miles
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col l2 m2 s12">
                <div className="label gender-label">Gender</div>
              </div>
              <div className="col l5 m5 s12">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple"></InputLabel>
                  <Select
                    value={filters.gender || ""}
                    onChange={(event) => this.updateFilters("gender", event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    {gender.map((data) => (
                      <MenuItem key={data[0]} value={data[0]}>
                        {data[1]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col l5 m5 s12 mt20ml">
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple">Events</InputLabel>
                  <Select
                    value={filters.event_name || []}
                    onChange={(event) =>
                      this.updateFilters("event_name", event)
                    }
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    multiple={true}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    {eventNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div
              style={{ position: "relative" }}
              ref={(node) => {
                this.node = node;
              }}
            >
              <div className="row">
                <div className="col l2 m2 s12">
                  <div className="label date-range search-label">
                    Date Range
                  </div>
                </div>
                <div className="col l5 m5 s12">
                  <DatePicker
                    selected={
                      filters.finish_date1 ? new Date(filters.finish_date1) : ""
                    }
                    onChange={(date) =>
                      this.updateDateFilters("finish_date1", date)
                    }
                    minDate={new Date()}
                    maxDate={
                      filters.finish_date2
                        ? new Date(filters.finish_date2)
                        : addDays(new Date(), 1000)
                    }
                    placeholderText="Departure Date Range #1"
                    className="text-field"
                  />
                </div>
                <div className="col l5 m5 s12">
                  <DatePicker
                    selected={
                      filters.finish_date2 ? new Date(filters.finish_date2) : ""
                    }
                    onChange={(date) =>
                      this.updateDateFilters("finish_date2", date)
                    }
                    minDate={new Date()}
                    placeholderText="Departure Date Range #2"
                    className="text-field"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col l2 m2 s12">
                <div className="label search-label">Price</div>
              </div>
              <div className="col l10 m10 s12">
                <ReactSlider
                  withBars
                  defaultValue={[0, 250]}
                  min={0}
                  max={250}
                  onAfterChange={this.changePrice.bind(this)}
                >
                  <div className="slider-handle"></div>
                  <div className="slider-handle"></div>
                </ReactSlider>
                <span className="slide-value pull-left">
                  ${filters.start_price}
                </span>
                <span className="slide-value pull-right">
                  ${filters.end_price}
                </span>
              </div>
            </div>
            <div className="more-filter">
              <span
                onClick={this.handleExpandClick}
                aria-expanded={this.state.expanded}
              >
                {this.state.expanded ? (
                  <Close className="close-icon" />
                ) : (
                  <span className="show-filter">Show more filters</span>
                )}
              </span>
            </div>
            <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
              <div className="row">
                <div className="col l4 s12 mt20lg">
                  <div className="filter-label">Kid Friendly:</div>
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple"></InputLabel>
                    <Select
                      value={filters.kid_friendly}
                      onChange={(event) =>
                        this.updateFilters("kid_friendly", event)
                      }
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      displayEmpty
                      className="selected-menu-field"
                    >
                      <MenuItem value={filters.kid_friendly} disabled>
                        Select
                      </MenuItem>
                      {basicFilters.map((data) => (
                        <MenuItem key={`kid-${data[0]}`} value={data[0]}>
                          {data[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="col l4 s12 mt20lg">
                  <div className="filter-label">Pets:</div>
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple"></InputLabel>
                    <Select
                      value={filters.pets}
                      onChange={(event) => this.updateFilters("pets", event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      displayEmpty
                      className="selected-menu-field"
                    >
                      <MenuItem value={filters.pets} disabled>
                        Select
                      </MenuItem>
                      {basicFilters.map((data) => (
                        <MenuItem key={`pet-${data[0]}`} value={data[0]}>
                          {data[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="col l4 s12">
                  <div className="filter-label">Smoking:</div>
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple"></InputLabel>
                    <Select
                      value={filters.smoking}
                      onChange={(event) => this.updateFilters("smoking", event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      displayEmpty
                      className="selected-menu-field"
                    >
                      <MenuItem value={filters.smoking} disabled>
                        Select
                      </MenuItem>
                      {basicFilters.map((data) => (
                        <MenuItem key={`smoke-${data[0]}`} value={data[0]}>
                          {data[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
              <div className="row">
                <div className="col l4 s12">
                  <div className="filter-label">Car AC:</div>
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple"></InputLabel>
                    <Select
                      value={filters.car_ac}
                      onChange={(event) => this.updateFilters("car_ac", event)}
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      displayEmpty
                      className="selected-menu-field"
                    >
                      <MenuItem value={filters.car_ac} disabled>
                        Select
                      </MenuItem>
                      {basicFilters.map((data) => (
                        <MenuItem key={`carAc-${data[0]}`} value={data[0]}>
                          {data[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="col l4 s12">
                  <div className="filter-label">Drive Type:</div>
                  <FormControl className="selectField">
                    <InputLabel htmlFor="select-multiple"></InputLabel>
                    <Select
                      value={filters.drive_type}
                      onChange={(event) =>
                        this.updateFilters("drive_type", event)
                      }
                      input={<Input id="select-multiple" />}
                      MenuProps={MenuProps}
                      displayEmpty
                      className="selected-menu-field"
                    >
                      <MenuItem value={filters.drive_type} disabled>
                        Select
                      </MenuItem>
                      {driveType.map((data) => (
                        <MenuItem key={data[0]} value={data[0]}>
                          {data[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            </Collapse>

            <div>
              <Pagination
                current_page={this.props.pagination.current_page}
                per_page={this.props.pagination.per_page}
                total_pages={this.props.pagination.total_pages}
                total_count={this.props.pagination.total_count}
                onPageNumClick={this.onPageNumClick.bind(this)}
              />
            </div>

            {!!dataLoaded ? (
              <div>
                <div className="my-trips">
                  <div className="trips-container">{this.renderTrips()}</div>
                </div>
                {similarTrips.length > 0 && (
                  <div>
                    <h4>Similar Trips</h4>
                    <div className="trips-container">
                      {this.renderSimilarTrips()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="loading">
                <ReactLoading
                  type="bubbles"
                  color="#3399ff"
                  height="10%"
                  width="10%"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mapSection">
          <Gmap
            start_location={selected.start_location}
            start_location_latitude={selected.start_location_latitude}
            start_location_longitude={selected.start_location_longitude}
            destination={selected.destination}
            destination_latitude={selected.destination_latitude}
            destination_longitude={selected.destination_longitude}
            onMarkerClick={(trip) => this.onMarkerClick(trip)}
            defaultLat={latitude}
            defaultLng={longitude}
            trips={trips}
            allTrips={allTrips}
            waypoints={this.state.waypoints}
            showTrip={showTrip}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    trips: getSearchedTripIds(state),
    waypoints: getWaypoints(state),
    allTrips: getAllTrips(state),
    similarTrips: getSimilarTrips(state),
    pagination: getPagination(state),
    currentUser: getCurrentUser(state),
    dataLoaded: getDataLoaded(state),
  };
}

function mapDispatchToProps(dispatch) {
  const {
    searchTripIdsRequest,
    searchTripsRequest,
    getCurrentUserRequest,
    resetDataLoadedRequest,
    getTripInfoRequest,
  } = actions;

  return {
    actions: bindActionCreators(
      {
        searchTripIdsRequest,
        searchTripsRequest,
        getCurrentUserRequest,
        resetDataLoadedRequest,
        getTripInfoRequest,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
