import _ from "underscore";
import $ from "jquery";
import React, { useState, useEffect } from "react";
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

import SearchField from "../components/SearchField";
import Gmap from "../components/Gmap";
import TripCard from "../components/TripCard";
import Pagination from "../components/Pagination";
import useTripStore from '../store/TripStore';
import useSessionStore from '../store/SessionStore';

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

const Dashboard = (props) => {

  const sessionStore = useSessionStore();
  const tripStore = useTripStore();

  const trips = tripStore.searchedTrips;
  const waypoints = tripStore.waypoints;
  const allTrips = tripStore.allTrips;
  const similarTrips = tripStore.similarTrips;
  const pagination = tripStore.pagination;
  const currentUser = sessionStore.currentUser;
  const dataLoaded = tripStore.dataLoaded;

  const today = new Date();
  const initial_state = {
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
    finish_date1: today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear(),
  };

  const [state, setState] = useState(initial_state);
  const [node, setNode] = useState(null)

  useEffect(() => {
    $(".nav-search-btn").hide();
    setCurrentPosition();

    return () => {
      $(".nav-search-btn").show();
    }
  }, [])

  useEffect(() => {
    if (dataLoaded || dataLoaded === false) {
      setState({ 
        ...state, 
        dataLoaded: dataLoaded 
      });
    }
    if(dataLoaded) {
      var elems = document.querySelectorAll(".clicked-page");
      [].forEach.call(elems, function(el) {
        el.classList.remove("clicked-page");
      });
    }
  }, [dataLoaded])

  useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      setState({
        ...state,
        waypoints: waypoints
      })
      markersArr = [];
      _.map(waypoints, (wp) => {
        const lat = wp.start_location_latitude;
        const long = wp.start_location_longitude;
        markersArr.push({ lat: parseFloat(lat), lng: parseFloat(long) });
      });
    }
  }, [waypoints])

  useEffect(() => {
      if (localStorage.accessToken) {
        sessionStore.getCurrentUserRequest();
      }
  }, [])
    
  const setCurrentPosition = () => {
    const { filters } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    $.getJSON(process.env.REACT_APP_GEOLOCATION_URL)
    .done(function(location) {
      tmp["latitude"] = location.latitude;
      tmp["longitude"] = location.longitude;
        setState({
          ...state,
          latitude: location.latitude,
          longitude: location.longitude,
          locationAvailable: true,
          filters: tmp,
        });

        tripStore.resetDataLoadedRequest();
        tripStore.searchTripIdsRequest(tmp);
      })
      .fail(function(error) {
        setState({ 
          ...state, 
          locationAvailable: false 
        });
        tripStore.searchTripIdsRequest(filters);
      });
  }

  const setSelectedTrip = (trip) => {
    const { selected } = state;
    let tmp = JSON.parse(JSON.stringify(selected));
    _.map(["start_location", "destination"], (fieldname) => {
      tmp[fieldname] = trip.attributes[fieldname];
      tmp[`${fieldname}_latitude`] = parseFloat(
        trip.attributes[`${fieldname}_latitude`]
      );
      tmp[`${fieldname}_longitude`] = parseFloat(
        trip.attributes[`${fieldname}_longitude`]
      );
    });
    setState({ 
      ...state, 
      selected: tmp, 
      showTrip: true 
    });
  }

  const unselectTrip = () => {
    setState({ 
      ...state,
      selected: {}, 
      showTrip: false 
    });
  }

  const updateDateFilters = (fieldName, date) => {
    const { filters } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    if (!date) {
      tmp[fieldName] = date;
    } else {
      try {
        if (date < new Date()) {
          date = new Date();
        }
        tmp[fieldName] =
          date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      } catch {
        tmp[fieldName] = date;
      }
    }
    setState({ 
      ...state, 
      filters: tmp
    });

    tripStore.resetDataLoadedRequest();
    tripStore.searchTripIdsRequest(tmp);
  };

  const updateFilters = (fieldName, event) => {
    const { filters } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    tmp[fieldName] = event.target.value;
    setState({ 
      ...state, 
      filters: tmp 
    });

    tripStore.resetDataLoadedRequest();
    tripStore.searchTripIdsRequest(tmp);
  };

  const onMarkerClick = (trip) => {
    const { filters } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    const {
      start_location_latitude,
      start_location_longitude,
      start_location,
    } = trip;

    tmp["start_location"] = start_location;
    tmp["start_location_latitude"] = start_location_latitude;
    tmp["start_location_longitude"] = start_location_longitude;

    setState({ 
      ...state, 
      filters: tmp
    });
    tripStore.resetDataLoadedRequest();
    tripStore.searchTripIdsRequest(filters);
  }

  const updateSlider = (fieldName, value) => {
    const { filters } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    if (value === 351) {
      delete tmp[fieldName];
    } else {
      tmp[fieldName] = value;
    }

    setState({ 
      ...state, 
      filters: tmp
    });

    tripStore.resetDataLoadedRequest();
    tripStore.searchTripIdsRequest(tmp);
  };

  const changePrice = (valArray) => {
    const { filters } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    tmp["start_price"] = valArray[0];
    tmp["end_price"] = valArray[1];
    setState({ 
      ...state, 
      filters: tmp
    });

    tripStore.resetDataLoadedRequest();
    tripStore.searchTripIdsRequest(filters);
  }

  const setAddress = (address, geometry, fieldName) => {
    const { filters, latitude, longitude, locationAvailable } = state;
    let tmp = JSON.parse(JSON.stringify(filters));
    tmp[fieldName] = geometry ? address : undefined;
    tmp[`${fieldName}_latitude`] = geometry
      ? geometry.location.lat()
      : undefined;
      tmp[`${fieldName}_longitude`] = geometry
      ? geometry.location.lng()
      : undefined;

    if (locationAvailable) {
      tmp.latitude = latitude;
      tmp.longitude = longitude;
    } else {
      tmp.latitude = null;
      tmp.longitude = null;
    }

    setState({ 
      ...state, 
      filters: tmp
    });

    if (geometry || address === "") {
      tripStore.resetDataLoadedRequest();
      tripStore.searchTripIdsRequest(filters);
    }
  }

  const handleExpandClick = () => {
    setState((state) => ({ ...state, expanded: !state.expanded }));
  };

  const createCard = (trip, trip_idx) => {
    // getTripInfoRequest(trip.id)
    return (
      <TripCard
        trip={JSON.parse(JSON.stringify(trip))}
        onMouseEnter={(trip_info) => setSelectedTrip(trip_info)}
        onMouseLeave={() => unselectTrip()}
      />
    );
  }

  const renderTrips = () => {
    if (trips.length > 0) {
      return _.map(trips, (trip, index) => {
        return createCard(trip, index);
      });
    } else {
      return "No Ridesurfers available near your location. Please try with filters.";
    }
  }

  const renderSimilarTrips = () => {
    return _.map(similarTrips, (trip, index) => {
      return createCard(trip, index);
    });
  }

  const onPageNumClick = (e, page) => {
    const { filters } = state;

    e.target.parentElement.classList.add("clicked-page");

    tripStore.resetDataLoadedRequest();
    tripStore.searchTripIdsRequest(filters, page, false);
  }

  const renderPagination = () => {
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
              onClick={(e) => onPageNumClick(e, page)}
            >
              {page}
            </a>
          </li>
        );
      });
    }
  }

  const { filters, selected, showTrip, latitude, longitude } = state;
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
                  setAddress(address, geometry, "start_location")
                }
              />
              <ReactSlider
                withBars
                defaultValue={351}
                min={0}
                max={351}
                value={filters.start_location_fence}
                onAfterChange={(value) =>
                  updateSlider("start_location_fence", value)
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
                  setAddress(address, geometry, "destination")
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
                  updateSlider("destination_fence", value)
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
                  onChange={(event) => updateFilters("gender", event)}
                  input={<Input id="select-multiple" />}
                  MenuProps={MenuProps}
                  displayEmpty
                  className="selected-menu-field"
                >
                  {gender.map((data, index) => (
                    <MenuItem key={index} value={data[0]}>
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
                    updateFilters("event_name", event)
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
              setNode(node)
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
                    updateDateFilters("finish_date1", date)
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
                    updateDateFilters("finish_date2", date)
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
                onAfterChange={changePrice}
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
              onClick={handleExpandClick}
              aria-expanded={state.expanded}
            >
              {state.expanded ? (
                <Close className="close-icon" />
              ) : (
                <span className="show-filter">Show more filters</span>
              )}
            </span>
          </div>
          <Collapse in={state.expanded} timeout="auto" unmountOnExit>
            <div className="row">
              <div className="col l4 s12 mt20lg">
                <div className="filter-label">Kid Friendly:</div>
                <FormControl className="selectField">
                  <InputLabel htmlFor="select-multiple"></InputLabel>
                  <Select
                    value={filters.kid_friendly?  filters.kid_friendly : ""}
                    onChange={(event) =>
                      updateFilters("kid_friendly", event)
                    }
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    <MenuItem value={filters.kid_friendly? filters.kid_friendly: ""} disabled>
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
                    value={filters.pets ?? ""}
                    onChange={(event) => updateFilters("pets", event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    <MenuItem value={filters.pets?? ""} disabled>
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
                    value={filters.smoking ?? ""}
                    onChange={(event) => updateFilters("smoking", event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    <MenuItem value={filters.smoking ?? ""} disabled>
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
                    value={filters.car_ac ?? ""}
                    onChange={(event) => updateFilters("car_ac", event)}
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    <MenuItem value={filters.car_ac ?? ""} disabled>
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
                    value={filters.drive_type?? ""}
                    onChange={(event) =>
                      updateFilters("drive_type", event)
                    }
                    input={<Input id="select-multiple" />}
                    MenuProps={MenuProps}
                    displayEmpty
                    className="selected-menu-field"
                  >
                    <MenuItem value={filters.drive_type ?? ""} disabled>
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
              current_page={pagination.current_page}
              per_page={pagination.per_page}
              total_pages={pagination.total_pages}
              total_count={pagination.total_count}
              onPageNumClick={onPageNumClick}
            />
          </div>

          {!!state.dataLoaded ? (
            <div>
              <div className="my-trips">
                <div className="trips-container">{renderTrips()}</div>
              </div>
              {similarTrips.length > 0 && (
                <div>
                  <h4>Similar Trips</h4>
                  <div className="trips-container">
                    {renderSimilarTrips()}
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
          onMarkerClick={(trip) => onMarkerClick(trip)}
          defaultLat={latitude}
          defaultLng={longitude}
          trips={trips}
          allTrips={allTrips}
          waypoints={state.waypoints}
          showTrip={showTrip}
        />
      </div>
    </div>
  );
}

export default (Dashboard);
