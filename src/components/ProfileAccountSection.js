import React, { Component, useState } from "react";
import TextField from "@material-ui/core/TextField";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import DatePicker from "react-datepicker";
import moment from "moment";
import { PrimaryButton } from "../components/Buttons";
import * as actions from "../actions";
import {
  getCurrentUser,
  getCurrentUserErrors,
  getUserUpdated,
  getPasswordUpdated,
  getIsProcessing,
} from "../reducers/SessionReducer";
import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";

const gender = ["Male", "Female", "Other"];

const MAX_DATE = moment()
  .subtract(18, "years")
  .toDate();

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
};

const initial_state = {
  user: {},
  accountProcessing: false,
  passwordProcessing: false,
};

const ProfileAccountSection = (props) => {

  const [state, setState] = useState(initial_state);

  // to-do
  // componentDidMount() {
  //   const { getCurrentUserRequest } = this.props.actions;
  //   getCurrentUserRequest();
  // }

  // to-do
  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   const { resetCurrentUserFlagsRequest } = this.props.actions;
  //   const { user } = this.state;

  //   if (nextProps.currentUser) {
  //     this.setState({ user: nextProps.currentUser.attributes });
  //   }

  //   if (nextProps.userUpdated || nextProps.passwordUpdated) {
  //     resetCurrentUserFlagsRequest();
  //     user["current_password"] = "";
  //     user["password"] = "";
  //     this.setState({ user });
  //   }

  //   if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //     this.setState({
  //       accountProcessing: nextProps.isProcessing,
  //       passwordProcessing: nextProps.isProcessing,
  //     });
  //   }
  // }

  const onFieldChange = (fieldName, event) => {
    const { user } = state;
    user[fieldName] = event.target.value;
    setState({ 
      ...state,
      user 
    });
  };

  const onDateChange = (fieldName, date) => {
    const { user } = state;
    user[fieldName] =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    setState({ 
      ...state,
      user 
    });
  };

  const errorMessageFor = (fieldName) => {
    const { currentUserErrors } = props;
    if (currentUserErrors && currentUserErrors[fieldName]) {
      return currentUserErrors[fieldName];
    }
  };

  const handleAccountSave = () => {
    const { user } = state;
    const { currentUser } = props;
    const { updateUserRequest } = props.actions;
    setState({ 
      ...state,
      accountProcessing: true 
    });
    updateUserRequest(currentUser.id, user);
  }

  const handleUpdatePassword = () => {
    const { user } = state;
    const { changeUserPasswordRequest } = props.actions;
    setState({ 
      ...state, 
      passwordProcessing: true 
    });
    changeUserPasswordRequest(user);
  }

  const { user, accountProcessing, passwordProcessing } = state;

  console.log("user gender", user.gender);

  return (
    <div className="profile-account-section">
      <div className="row">
        <div className="col s12 m12">
          <h5>Account Information</h5>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="firstname"
              type="text"
              label="First Name"
              margin="normal"
              value={user.first_name || ""}
              onChange={(event) => onFieldChange("first_name", event)}
            />
            <span className="error">
              {errorMessageFor("first_name")}
            </span>
          </div>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="lastname"
              type="text"
              label="Last Name"
              margin="normal"
              value={user.last_name || ""}
              onChange={(event) => onFieldChange("last_name", event)}
            />
            <span className="error">{errorMessageFor("last_name")}</span>
          </div>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="email"
              type="text"
              label="Email"
              margin="normal"
              value={user.email || ""}
              onChange={(event) => onFieldChange("email", event)}
            />
            <span className="error">{errorMessageFor("email")}</span>
          </div>
          <div className="mb10">
            <div className="date-label">Date of Birth</div>
            <div className="date-picker-field">
              <DatePicker
                selected={
                  !!user.birthday ? moment(user.birthday).toDate() : ""
                }
                onChange={(date) => onDateChange("birthday", date)}
                maxDate={MAX_DATE}
                showYearDropdown
                dropdownMode="select"
                placeholderText="MM/DD/YYYY"
                className="date-field text-field"
              />
            </div>
            <span className="error">{errorMessageFor("birthday")}</span>
          </div>
          <div className="mb10">
            <FormControl className="selectField">
              <InputLabel className="selectLabel" htmlFor="select-multiple">
                Select Gender
              </InputLabel>
              <Select
                value={user.gender || ""}
                onChange={(event) => onFieldChange("gender", event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                className="selected-menu-field"
              >
                {gender.map((name) => (
                  <MenuItem key={name} value={name} className="menu-field">
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="mt20 mb20">
            <PrimaryButton
              color="primary"
              buttonName={accountProcessing ? "Please Wait..." : "Save"}
              className="lg-primary"
              handleButtonClick={() => handleAccountSave()}
              disabled={!!accountProcessing}
            />
          </div>
          <h5>Change Password</h5>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="current_password"
              type="password"
              label="Current Password"
              margin="normal"
              value={user.current_password || ""}
              onChange={(event) =>
                onFieldChange("current_password", event)
              }
            />
            <span className="error">
              {errorMessageFor("current_password")}
            </span>
          </div>
          <div className="mb10">
            <TextField
              fullWidth
              className="text-field"
              id="password"
              type="password"
              label="New Password"
              margin="normal"
              value={user.password || ""}
              onChange={(event) => onFieldChange("password", event)}
            />
            <span className="error">{errorMessageFor("password")}</span>
          </div>
          <div className="mt20 mb20">
            <PrimaryButton
              color="primary"
              buttonName={
                passwordProcessing ? "Please Wait..." : "Update Password"
              }
              className="lg-primary"
              handleButtonClick={() => handleUpdatePassword()}
              disabled={!!passwordProcessing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    currentUser: getCurrentUser(state),
    currentUserErrors: getCurrentUserErrors(state),
    userUpdated: getUserUpdated(state),
    passwordUpdated: getPasswordUpdated(state),
    isProcessing: getIsProcessing(state),
  };
}

function mapDispatchToProps(dispatch) {
  const {
    getCurrentUserRequest,
    updateUserRequest,
    changeUserPasswordRequest,
    resetCurrentUserFlagsRequest,
    setProcessingRequest,
  } = actions;

  return {
    actions: bindActionCreators(
      {
        getCurrentUserRequest,
        updateUserRequest,
        changeUserPasswordRequest,
        resetCurrentUserFlagsRequest,
        setProcessingRequest,
      },
      dispatch
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileAccountSection);
