import React, { useState, useEffect } from "react";
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

import { PrimaryButton } from "../components/Buttons";
import SocialButton from "../components/SocialButton";
import { getGooglePeople } from "../apis/session";
import { Modal } from "@material-ui/core";
import useUserStore from "../store/UserStore";
import useSessionStore from "../store/SessionStore";

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

const initial_state = {
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
  modalFbOpen: false,
  googleUser: {},
  facebookUser: {},
};

const MAX_DATE = moment()
  .subtract(18, "years")
  .toDate();

const Signup = (props) => {
  const userStore = useUserStore();
  const sessionStore = useSessionStore();

  const userErrors = userStore.errors;
  const isUserSaved = userStore.isSaved;
  const loggedIn = sessionStore.loggedIn;
  const socialLoginError = sessionStore.socialLoginError;
  const isProcessing = sessionStore.isProcessing;
  const errors = sessionStore.errors;

  const [state, setState] = useState(initial_state);
  const [nodes, setNodes] = useState({});

  const composeUserFromGoogleProfile = (provider, profile) => {
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

  const setSocialLoginProfile = () => {
    const { user } = state;
    let tmp = JSON.parse(JSON.stringify(user));
    const socialLoginProvider = localStorage.getItem("socialLoginProvider");

    if (localStorage.socialLoginProfile) {
      const socialLoginProfile = JSON.parse(localStorage.socialLoginProfile);

      tmp.first_name = socialLoginProfile.firstName;
      tmp.last_name = socialLoginProfile.lastName;
      tmp.email = socialLoginProfile.email;

      if (socialLoginProfile.gender) {
        tmp.gender =
          socialLoginProfile.gender.charAt(0).toUpperCase() +
          socialLoginProfile.gender.substr(1);
      }

      if (socialLoginProfile.birthday) {
        tmp.birthday = socialLoginProfile.birthday;
      }

      if (socialLoginProfile.profilePicURL) {
        tmp.profile_image_url = socialLoginProfile.profilePicURL.replace(
          "s96-c",
          "s500-c"
        );
      }

      if (socialLoginProfile.link) {
        tmp.profile_link = socialLoginProfile.link;
      }

      tmp.token = socialLoginProfile.id;
      tmp.provider = socialLoginProvider;

      setState({
        ...state,
        user: tmp,
      });
    }
    return tmp;
  };

  const onFieldChange = (fieldName, event) => {
    const { user } = state;
    let tmp = JSON.parse(JSON.stringify(user));
    tmp[fieldName] = event.target.value;
    setState({
      ...state,
      user: tmp,
    });
  };

  const onKeyPressEnter = (event) => {
    if (event.key === "Enter" || event.keyCode === 13) {
      handleSignup();
    }
  };

  const onDateChange = (fieldName, date) => {
    const { user } = state;
    let tmp = JSON.parse(JSON.stringify(user));
    tmp[fieldName] =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
    setState({
      ...state,
      user: tmp,
    });
  };

  const errorMessageFor = (fieldName) => {
    if (userErrors && userErrors[fieldName]) {
      return userErrors[fieldName];
    }
  };

  const handleSocialLoginFailure = (err) => {
    console.error(err);
    console.log(err.message);

    // to-do
    setState({ ...state, rerender: true }, () => {
      setState({ ...state, rerender: false });
    });
  };

  const handleFbSocialLogin = async (res) => {
    console.log(res);
    if (res.error) {
      handleSocialLoginFailure(res.error);
    } else {
      const { history } = props;

      const user = {
        first_name: res.first_name,
        last_name: res.last_name,
        email: res.email,
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
      const result = await sessionStore.socialLoginRequest(
        "facebook",
        user.token,
        user.email
      );
      console.log(result);

      if (result.errors && result.errors === "Record not found") {
        setState({
          ...state,
          facebookUser: user,
          modalFbOpen: true,
        });
        return;
      } else if (result.data) {
        setState({
          ...state,
          fbProcessing: false,
        });

        history.push("search");
      } else {
        setState({
          ...state,
          fbProcessing: false,
        });
      }
    }
  };

  const handleSocialLogin = async (user) => {
    console.log(user);
    setState({
      ...state,
      googleProcessing: true,
    });

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

    const { history } = props;

    const result = await sessionStore.socialLoginRequest(
      _provider,
      _profile.id,
      _profile.email
    );

    if (result.errors && result.errors === "Record not found") {
      const user = composeUserFromGoogleProfile(_provider, _profile);

      if (!user.gender || !user.birthday) {
        setState({
          ...state,
          googleUser: user,
          modalOpen: true,
        });

        return;
      }

      const createUserResult = await userStore.createUserRequest(user);

      setState({
        ...state,
        googleProcessing: false,
      });

      if (!createUserResult.errors) {
        history.push("search");
      }
    } else if (result.data) {
      history.push("search");
    }
  };

  const continueGoogleSignup = async () => {
    setState({
      ...state,
      modalOpen: false,
    });

    const { googleUser } = state;
    const { history } = props;
    const createUserResult = await userStore.createUserRequest(googleUser);

    if (!createUserResult.errors) {
      history.push("search");
    }
  };

  const continueFacebookSignup = async () => {
    setState({
      ...state,
      modalFbOpen: false,
    });

    const { facebookUser } = state;
    const { history } = props;
    const createUserResult = await userStore.createUserRequest(facebookUser);

    console.log(createUserResult, "createUserResult");

    setState({
      ...state,
      fbProcessing: false,
    });

    if (!createUserResult.errors) {
      history.push("search");
    }
  };

  const handleSignup = async () => {
    const { user } = state;
    const { history } = props;
    setState({ ...state, signupProcessing: true });

    const res = await userStore.createUserRequest(user);

    setState({ ...state, signupProcessing: false });

    if (!res.errors) {
      history.push("verify_email");
    }
  };

  const handleFbReactLoading = () => {
    setState({ ...state, fbProcessing: true });
  };

  const handleGoogleReactLoading = () => {
    setState({ ...state, googleProcessing: true });
  };

  const handleModalClose = () => {
    setState({
      ...state,
      googleProcessing: false,
      modalOpen: false,
    });

    // to-do
    // this.setState({ rerender: true }, () => {
    //   this.setState({ rerender: false });
    // });
  };

  const {
    user,
    fbProcessing,
    googleProcessing,
    signupProcessing,
    modalOpen,
    googleUser,
    rerender,
    modalFbOpen,
    facebookUser,
  } = state;

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
              fields="first_name,last_name,email,picture.width(500).height(500)"
              scope="email,user_birthday,user_gender"
              callback={handleFbSocialLogin}
              textButton={
                fbProcessing ? "Please wait..." : "Sign in with Facebook"
              }
              cssClass="leftIcon-btn fb"
              isMobile={true}
              disableMobileRedirect={true}
              icon={<i className="fa fa-facebook-square icon mr10" />}
              onClick={() => handleFbReactLoading()}
            />
          </div>
          <div className="mb30">
            {!rerender ? (
              <SocialButton
                color="secondary"
                provider="google"
                appId={googleId}
                onLoginSuccess={handleSocialLogin}
                onLoginFailure={handleSocialLoginFailure}
                buttonName={
                  !!googleProcessing ? "Please wait..." : "Sign in with Google"
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
                onChange={(event) => onFieldChange("first_name", event)}
                onKeyPress={(event) => onKeyPressEnter(event)}
              />
              <span className="error">{errorMessageFor("first_name")}</span>
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
                onChange={(event) => onFieldChange("last_name", event)}
                onKeyPress={(event) => onKeyPressEnter(event)}
              />
              <span className="error">{errorMessageFor("last_name")}</span>
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
                onChange={(event) => onFieldChange("email", event)}
                onKeyPress={(event) => onKeyPressEnter(event)}
              />
              <span className="error">{errorMessageFor("email")}</span>
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
                onChange={(event) => onFieldChange("password", event)}
                onKeyPress={(event) => onKeyPressEnter(event)}
              />
              <span className="error">{errorMessageFor("password")}</span>
            </div>
          </div>
          <div className="row">
            <div className="col s12 m6">
              <div className="date-picker-field">
                <DatePicker
                  selected={!!user.birthday ? new Date(user.birthday) : ""}
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
            <div className="col s12 m6 mt5 mb10">
              <FormControl className="selectField">
                <InputLabel className="selectLabel" htmlFor="select-multiple">
                  Select Gender
                </InputLabel>
                <Select
                  value={user.gender}
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
              <span className="error">{errorMessageFor("gender")}</span>
            </div>
          </div>
          <div className="mt40">
            <PrimaryButton
              color="primary"
              buttonName={signupProcessing ? "Please Wait..." : "Signup"}
              className="leftIcon-btn login-btn"
              disabled={!!signupProcessing}
              handleButtonClick={() => handleSignup()}
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
        onClose={handleModalClose}
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
                  setState({
                    ...state,
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
                  setState({
                    ...state,
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
              handleButtonClick={continueGoogleSignup}
            />
          </div>
        </div>
      </Modal>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={modalFbOpen}
        onClose={handleModalClose}
      >
        <div style={style} className="profile-account-section">
          <div style={modalTitle}>Please fill your birthday and gender.</div>
          <div>
            <div className="date-picker-field">
              <DatePicker
                selected={
                  !!facebookUser?.birthday
                    ? new Date(facebookUser.birthday)
                    : ""
                }
                onChange={(date) => {
                  const newFacebookUser = { ...facebookUser };
                  newFacebookUser.birthday =
                    date.getMonth() +
                    1 +
                    "/" +
                    date.getDate() +
                    "/" +
                    date.getFullYear();
                  setState({
                    ...state,
                    facebookUser: newFacebookUser,
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
                value={facebookUser?.gender}
                onChange={(event) => {
                  const newFacebookUser = { ...facebookUser };
                  newFacebookUser.gender = event.target.value;
                  setState({
                    ...state,
                    facebookUser: newFacebookUser,
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
              disabled={!facebookUser?.birthday || !facebookUser?.gender}
              color="primary"
              buttonName="Continue"
              className="leftIcon-btn login-btn"
              handleButtonClick={continueFacebookSignup}
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
};

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

export default Signup;
