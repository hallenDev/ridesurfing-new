import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import Card from "@material-ui/core/Card";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import FacebookLogin from "react-facebook-login";
import moment from "moment";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import * as actions from "../actions";
import { getUserErrors, getUserSaved } from "../reducers/UserReducer";
import {
  getLoggedIn,
  getSocialLoginError,
  getIsProcessing,
} from "../reducers/SessionReducer";

import { PrimaryButton } from "../components/Buttons";
import SocialButton from "../components/SocialButton";
import { getGooglePeople } from "../apis/session";
import { Modal } from "@material-ui/core";

const gender = ["Male", "Female", "Other"];
const facebookId = process.env.REACT_APP_FACEBOOK_ID;
const googleId = process.env.REACT_APP_GOOGLE_ID;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 300,
    },
  },
};

const MAX_DATE = moment()
  .subtract(18, "years")
  .toDate();

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: "",
        last_name: "",
        email: "",
        birthday: "",
        password: "",
        gender: "",
      },
      userErrors: {},
      fbProcessing: false,
      googleProcessing: false,
      signupProcessing: false,
      modalOpen: false,
      googleUser: {},
    };

    this.nodes = {};
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      createUserRequest,
      getCurrentUserRequest,
      resetCurrentUserFlagsRequest,
    } = this.props.actions;
    const { history } = this.props;
    const { loggedIn } = nextProps;

    // if (nextProps.socialLoginError) {
    //   resetCurrentUserFlagsRequest();
    //   const user = this.setSocialLoginProfile();

    //   this.setState({
    //     isProcessing: false,
    //     googleProcessing: false,
    //     fbProcessing: false,
    //   });
    //   createUserRequest(user);
    // }

    // if (nextProps.isUserSaved) {
    //   localStorage.removeItem("socialLoginProfile");
    //   localStorage.removeItem("socialLoginProvider");

    //   resetCurrentUserFlagsRequest();
    //   getCurrentUserRequest();

    //   this.setState({
    //     isProcessing: false,
    //     googleProcessing: false,
    //     fbProcessing: false,
    //   });
    //   history.push(localStorage.accessToken ? "search" : "verify_email");
    // }

    // if (nextProps.userErrors)
    //   this.setState({ userErrors: nextProps.userErrors });

    // if (loggedIn) {
    //   const prevUrl = localStorage.prevUrl;
    //   localStorage.removeItem("prevUrl");

    //   getCurrentUserRequest();
    //   this.setState({ googleProcessing: false, fbProcessing: false });

    //   return (window.location.href = prevUrl || `/search`);
    // }

    // if (nextProps.isProcessing || nextProps.isProcessing === false) {
    //   this.setState({ signupProcessing: nextProps.isProcessing });
    // }
  }

  composeUserFromGoogleProfile = (provider, profile) => {
    const user = {
      first_name: profile.firstName,
      last_name: profile.lastName,
      email: profile.email,
      gender: profile.gender,
      birthday: profile.birthday,
      profile_image_url: profile.profilePicURL.replace("s96-c", "s500-c"),
      profile_link: profile.link,
      token: profile.id,
      provider: provider,
    };
    return user;
  };

  setSocialLoginProfile() {
    const { user } = this.state;
    const socialLoginProvider = localStorage.getItem("socialLoginProvider");

    if (localStorage.socialLoginProfile) {
      const socialLoginProfile = JSON.parse(localStorage.socialLoginProfile);

      user.first_name = socialLoginProfile.firstName;
      user.last_name = socialLoginProfile.lastName;
      user.email = socialLoginProfile.email;

      if (socialLoginProfile.gender) {
        user.gender =
          socialLoginProfile.gender.charAt(0).toUpperCase() +
          socialLoginProfile.gender.substr(1);
      }

      if (socialLoginProfile.birthday) {
        user.birthday = socialLoginProfile.birthday;
      }

      if (socialLoginProfile.profilePicURL) {
        user.profile_image_url = socialLoginProfile.profilePicURL.replace(
          "s96-c",
          "s500-c"
        );
      }

      if (socialLoginProfile.link) {
        user.profile_link = socialLoginProfile.link;
      }

      user.token = socialLoginProfile.id;
      user.provider = socialLoginProvider;

      this.setState({ user });
    }
    return user;
  }

  onFieldChange = (fieldName, event) => {
    const { user } = this.state;
    user[fieldName] = event.target.value;
    this.setState({ user });
  };

  onKeyPressEnter = (event) => {
    if (event.key === "Enter" || event.keyCode === 13) {
      this.handleSignup();
    }
  };

  onDateChange = (fieldName, date) => {
    const { user } = this.state;
    user[fieldName] =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    this.setState({ user });
  };

  errorMessageFor = (fieldName) => {
    const { userErrors } = this.props;
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName];
    }
  };

  handleSocialLoginFailure = (err) => {
    console.error(err);
    console.log(err.message);

    this.setState({ rerender: true }, () => {
      this.setState({ rerender: false });
    });
  };

  handleFbSocialLogin = async (res) => {
    console.log(res);
    if (res.error) {
      this.handleSocialLoginFailure(res.error);
    } else {
      const { socialLoginRequest, createUserRequest } = this.props.actions;
      const { history } = this.props;

      const user = {
        first_name: res.first_name,
        last_name: res.last_name,
        email: res.email,
        gender: res.gender.charAt(0).toUpperCase() + res.gender.substr(1),
        birthday: res.birthday,
        profile_image_url:
          res.picture && res.picture.data && res.picture.data.url
            ? res.picture &&
              res.picture.data &&
              res.picture.data.url.replace("s96-c", "s500-c")
            : "",
        profile_link: "",
        token: res.id,
        provider: "facebook",
      };

      console.log(user);
      const result = await socialLoginRequest(
        "facebook",
        user.token,
        user.email
      );
      console.log(result);

      if (result.errors && result.errors === "Record not found") {
        console.log("error happened");
        const createUserResult = await createUserRequest(user);

        console.log(createUserResult, "createUserResult");

        this.setState({
          fbProcessing: false,
        });

        if (!createUserResult.errors) {
          history.push("search");
        }
      } else if (result.data) {
        this.setState({
          fbProcessing: false,
        });

        history.push("search");
      } else {
        this.setState({
          fbProcessing: false,
        });
      }
    }
  };

  handleSocialLogin = async (user) => {
    console.log(user);
    this.setState({ googleProcessing: true });

    if (!user._profile.birthday || !user._profile.gender) {
      const peopleInfo = await getGooglePeople(
        user._profile.id,
        user._token.accessToken
      );

      const { birthdays, genders } = peopleInfo || {};
      if (birthdays && birthdays.length > 0 && birthdays[0].date) {
        const { day, month, year } = birthdays[0].date;
        user._profile.birthday = month + "/" + day + "/" + year;
      }

      if (genders && genders.length > 0) {
        if (
          genders[0].formattedValue === "Male" ||
          genders[0].formattedValue === "Female"
        ) {
          user._profile.gender = genders[0].formattedValue;
        } else {
          user._profile.gender = "Other";
        }
      }
    }

    const { _provider, _profile } = user;

    const { socialLoginRequest, createUserRequest } = this.props.actions;
    const { history } = this.props;

    const result = await socialLoginRequest(
      _provider,
      _profile.id,
      _profile.email
    );

    if (result.errors && result.errors === "Record not found") {
      const user = this.composeUserFromGoogleProfile(_provider, _profile);

      if (!user.gender || !user.birthday) {
        this.setState({
          googleUser: user,
          modalOpen: true,
        });

        return;
      }

      const createUserResult = await createUserRequest(user);

      this.setState({
        googleProcessing: false,
      });

      if (!createUserResult.errors) {
        history.push("search");
      }
    } else if (result.data) {
      history.push("search");
    }
  };

  continueGoogleSignup = async () => {
    this.setState({
      modalOpen: false,
    });

    const { googleUser } = this.state;
    const { createUserRequest } = this.props.actions;
    const { history } = this.props;
    const createUserResult = await createUserRequest(googleUser);

    if (!createUserResult.errors) {
      history.push("search");
    }
  };

  handleSignup = async () => {
    const { user } = this.state;
    const { createUserRequest } = this.props.actions;
    const { history } = this.props;
    this.setState({ signupProcessing: true });

    const res = await createUserRequest(user);

    this.setState({ signupProcessing: false });

    if (!res.errors) {
      history.push("verify_email");
    }
  };

  handleFbReactLoading() {
    this.setState({ fbProcessing: true });
  }

  handleGoogleReactLoading() {
    this.setState({ googleProcessing: true });
  }

  handleModalClose = () => {
    this.setState({
      googleProcessing: false,
      modalOpen: false,
    });

    this.setState({ rerender: true }, () => {
      this.setState({ rerender: false });
    });
  };

  render() {
    const {
      user,
      fbProcessing,
      googleProcessing,
      signupProcessing,
      modalOpen,
      googleUser,
      rerender,
    } = this.state;

    return (
      <div className="login-container signup-container">
        <div className="container">
          <Card className="cardContainer">
            <h3 className="center-align">Sign up</h3>
            <div className="subHeading">
              As a Ridesurfing member, I will support an accepting environment
              that nurtures safety, trust, and friendship.
            </div>
            <div className="mb10">
              <FacebookLogin
                appId={facebookId}
                fields="first_name,last_name,email,picture.width(500).height(500),gender,birthday"
                scope="email,user_birthday,user_gender"
                callback={this.handleFbSocialLogin}
                textButton={
                  fbProcessing ? "Please wait..." : "Sign in with Facebook"
                }
                cssClass="leftIcon-btn fb"
                isMobile={true}
                disableMobileRedirect={true}
                icon={<i className="fa fa-facebook-square icon mr10" />}
                onClick={() => this.handleFbReactLoading()}
              />
            </div>
            <div className="mb30">
              {!rerender ? (
                <SocialButton
                  color="secondary"
                  provider="google"
                  appId={googleId}
                  onLoginSuccess={this.handleSocialLogin}
                  onLoginFailure={this.handleSocialLoginFailure}
                  buttonName={
                    !!googleProcessing
                      ? "Please wait..."
                      : "Sign in with Google"
                  }
                  icon={<i className="fa fa-google icon mr10" />}
                  className="leftIcon-btn ggl"
                  scope="email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/userinfo.profile"
                />
              ) : null}
            </div>
            <div className="row">
              <div className="col s12 m6">
                <TextField
                  fullWidth
                  className="text-field"
                  id="first_name"
                  type="text"
                  label="First Name"
                  margin="normal"
                  value={user.first_name || ""}
                  onChange={(event) => this.onFieldChange("first_name", event)}
                  onKeyPress={(event) => this.onKeyPressEnter(event)}
                />
                <span className="error">
                  {this.errorMessageFor("first_name")}
                </span>
              </div>
              <div className="col s12 m6">
                <TextField
                  fullWidth
                  className="text-field"
                  id="last_name"
                  type="text"
                  label="Last Name"
                  margin="normal"
                  value={user.last_name || ""}
                  onChange={(event) => this.onFieldChange("last_name", event)}
                  onKeyPress={(event) => this.onKeyPressEnter(event)}
                />
                <span className="error">
                  {this.errorMessageFor("last_name")}
                </span>
              </div>
            </div>
            <div className="row">
              <div className="col s12 m12">
                <TextField
                  fullWidth
                  className="text-field"
                  id="email"
                  type="text"
                  label="Email"
                  margin="normal"
                  value={user.email || ""}
                  onChange={(event) => this.onFieldChange("email", event)}
                  onKeyPress={(event) => this.onKeyPressEnter(event)}
                />
                <span className="error">{this.errorMessageFor("email")}</span>
              </div>
            </div>
            <div className="row">
              <div className="col s12 m12">
                <TextField
                  fullWidth
                  className="text-field"
                  id="password"
                  type="password"
                  label="Password"
                  margin="normal"
                  onChange={(event) => this.onFieldChange("password", event)}
                  onKeyPress={(event) => this.onKeyPressEnter(event)}
                />
                <span className="error">
                  {this.errorMessageFor("password")}
                </span>
              </div>
            </div>
            <div className="row">
              <div className="col s12 m6">
                <div className="date-picker-field">
                  <DatePicker
                    selected={!!user.birthday ? new Date(user.birthday) : ""}
                    onChange={(date) => this.onDateChange("birthday", date)}
                    maxDate={MAX_DATE}
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="MM/DD/YYYY"
                    className="date-field text-field"
                  />
                </div>
                <span className="error">
                  {this.errorMessageFor("birthday")}
                </span>
              </div>
              <div className="col s12 m6 mt5 mb10">
                <FormControl className="selectField">
                  <InputLabel className="selectLabel" htmlFor="select-multiple">
                    Select Gender
                  </InputLabel>
                  <Select
                    value={user.gender}
                    onChange={(event) => this.onFieldChange("gender", event)}
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
                <span className="error">{this.errorMessageFor("gender")}</span>
              </div>
            </div>
            <div className="mt40">
              <PrimaryButton
                color="primary"
                buttonName={signupProcessing ? "Please Wait..." : "Signup"}
                className="leftIcon-btn login-btn"
                disabled={!!signupProcessing}
                handleButtonClick={() => this.handleSignup()}
              />
            </div>
            <div className="signup-link">
              <Link className="login-link" to="/login">
                I already have an account
              </Link>
            </div>
            <div className="terms-n-policy">
              I agree to the{" "}
              <Link className="underline" to="/terms">
                terms of service{" "}
              </Link>
              and
              <Link className="underline" to="/policies">
                {" "}
                privacy policy
              </Link>
            </div>
          </Card>
        </div>

        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={modalOpen}
          onClose={this.handleModalClose}
        >
          <div style={style} className="profile-account-section">
            <div style={modalTitle}>Please fill your birthday and gender.</div>
            <div>
              <div className="date-picker-field">
                <DatePicker
                  selected={
                    !!googleUser.birthday ? new Date(googleUser.birthday) : ""
                  }
                  onChange={(date) => {
                    const newGoogleUser = { ...googleUser };
                    newGoogleUser.birthday =
                      date.getMonth() +
                      1 +
                      "/" +
                      date.getDate() +
                      "/" +
                      date.getFullYear();
                    this.setState({
                      googleUser: newGoogleUser,
                    });
                  }}
                  maxDate={MAX_DATE}
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText="MM/DD/YYYY"
                  className="date-field text-field"
                />
              </div>
            </div>
            <div>
              <FormControl className="selectField">
                <InputLabel className="selectLabel" htmlFor="select-multiple">
                  Select Gender
                </InputLabel>
                <Select
                  value={googleUser.gender}
                  onChange={(event) => {
                    const newGoogleUser = { ...googleUser };
                    newGoogleUser.gender = event.target.value;
                    this.setState({
                      googleUser: newGoogleUser,
                    });
                  }}
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

            <div style={modalActionWrap}>
              <PrimaryButton
                disabled={!googleUser.birthday || !googleUser.gender}
                color="primary"
                buttonName="Continue"
                className="leftIcon-btn login-btn"
                handleButtonClick={this.continueGoogleSignup}
              />
            </div>

            {/* <div style={modalActionWrap1}>
              <PrimaryButton
                color="secondary"
                buttonName="Close"
                className="leftIcon-btn"
                handleButtonClick={() => {
                  this.handleSocialLoginFailure();
                  this.handleModalClose();
                  this.setState({
                    googleUser: {},
                    googleProcessing: false,
                  });
                }}
                // disabled={!!signupProcessing}
                // handleButtonClick={() => this.handleSignup()}
              />
            </div> */}
          </div>
        </Modal>
      </div>
    );
  }
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  backgroundColor: "white",
  padding: 20,
  outline: "none",
};

const modalTitle = {
  letterSpacing: "1px",
  textAlign: "center",
  maxWidth: "100%",
  fontSize: 13,
  fontWeight: 600,
  color: "#002654",
  margin: "0 auto",
  marginBottom: 30,
};

const modalActionWrap = {
  marginTop: 20,
};

// const modalActionWrap1 = {
//   marginTop: 10,
// };

function mapStateToProps(state) {
  return {
    userErrors: getUserErrors(state),
    isUserSaved: getUserSaved(state),
    loggedIn: getLoggedIn(state),
    socialLoginError: getSocialLoginError(state),
    isProcessing: getIsProcessing(state),
  };
}

function mapDispatchToProps(dispatch) {
  const {
    createUserRequest,
    socialLoginRequest,
    getCurrentUserRequest,
    resetCurrentUserFlagsRequest,
    setProcessingRequest,
  } = actions;

  return {
    actions: bindActionCreators(
      {
        createUserRequest,
        socialLoginRequest,
        getCurrentUserRequest,
        resetCurrentUserFlagsRequest,
        setProcessingRequest,
      },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
