import React, { useState, useEffect } from "react";
import TextField from "@material-ui/core/TextField";
import Card from "@material-ui/core/Card";
import { Link, withRouter } from "react-router-dom";
import FacebookLogin from "react-facebook-login";
import DatePicker from "react-datepicker";
import moment from "moment";

import { PrimaryButton } from "../components/Buttons";
import SocialButton from "../components/SocialButton";
import { getGooglePeople } from "../apis/session";
import {
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from "@material-ui/core";
import useUserStore from '../store/UserStore';
import useSessionStore from '../store/SessionStore';

const facebookId = process.env.REACT_APP_FACEBOOK_ID;
const googleId = process.env.REACT_APP_GOOGLE_ID;

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

const gender = ["Male", "Female", "Other"];

const initial_state = {
  email: "",
  password: "",
  loggedIn: false,
  loginCheck: false,
  user: {
    first_name: "",
    last_name: "",
    email: "",
    birthday: "",
    password: "",
    gender: "",
  },
  fbProcessing: false,
  googleProcessing: false,
  loginProcessing: false,
  modalOpen: false,
  googleUser: {},
};

const Login = (props) => {

  const userStore = useUserStore();
  const sessionStore = useSessionStore();

  const isUserSaved = userStore.isSaved;
  const loggedIn = sessionStore.loggedIn;
  // const error = sessionStore.errors;
  const socialLoginError = sessionStore.socialLoginError;
  const resendEmailVerification = sessionStore.resendEmailVerification;
  const isProcessing = sessionStore.isProcessing;
  const userErrors = userStore.errors;

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    // setSocialLoginProfile();
  }, []);

  // to-do
  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   // const {
  //   //   createUserRequest,
  //   //   getCurrentUserRequest,
  //   //   resetCurrentUserFlagsRequest,
  //   //   resetUserFlagsRequest,
  //   //   resetProcessingRequest,
  //   // } = this.props.actions;
  //   // const { loginCheck } = this.state;
  //   // const { loggedIn, error } = nextProps;
  //   const { history } = this.props;

  //   // if (loginCheck && error)
  //   //   this.setState({
  //   //     error: error || "Invalid credentials",
  //   //     loginCheck: false,
  //   //     loginProcessing: false,
  //   //   });

  //   // if (loggedIn) {
  //   //   const prevUrl = localStorage.prevUrl;

  //   //   localStorage.removeItem("socialLoginProfile");
  //   //   localStorage.removeItem("socialLoginProvider");
  //   //   localStorage.removeItem("prevUrl");
  //   //   this.setState({
  //   //     googleProcessing: false,
  //   //     fbProcessing: false,
  //   //     loginProcessing: false,
  //   //   });

  //   //   return (window.location.href = prevUrl || `/search`);
  //   // }

  //   // if (nextProps.socialLoginError) {
  //   //   resetCurrentUserFlagsRequest();
  //   //   const user = this.setSocialLoginProfile();

  //   //   this.setState({
  //   //     loginProcessing: false,
  //   //     googleProcessing: false,
  //   //     fbProcessing: false,
  //   //   });
  //   //   createUserRequest(user);
  //   // }

  //   // if (nextProps.isUserSaved) {
  //   //   localStorage.removeItem("socialLoginProfile");
  //   //   localStorage.removeItem("socialLoginProvider");

  //   //   resetUserFlagsRequest();
  //   //   resetCurrentUserFlagsRequest();
  //   //   getCurrentUserRequest();
  //   //   this.setState({
  //   //     googleProcessing: false,
  //   //     fbProcessing: false,
  //   //     loginProcessing: false,
  //   //   });
  //   // }

  //   // if (nextProps.isProcessing || nextProps.isProcessing === false) {
  //   //   this.setState({ loginProcessing: nextProps.isProcessing });
  //   //   resetProcessingRequest();
  //   // }

  //   if (nextProps.resendEmailVerification) return history.push("/verify_email");
  // }

  const setSocialLoginProfile = () => {
    const { user } = state;
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

      setState({ ...state, user });
    }
    return user;
  }

  const onFieldChange = (fieldName, event) => {
    setState({ 
      ...state, 
      [fieldName]: event.target.value 
    });
  };

  const onKeyPressEnter = (event) => {
    if (event.key === "Enter" || event.keyCode === 13) {
      handleLogin();
    }
  };

  const handleSocialLoginFailure = (err) => {
    console.error(err);

    // to-do
    // this.setState({ rerender: true }, () => {
    //   this.setState({ rerender: false });
    // });
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
      const result = await sessionStore.socialLoginRequest(
        "facebook",
        user.token,
        user.email
      );
      console.log(result);

      if (result.errors && result.errors === "Record not found") {
        console.log("error happened");
        const createUserResult = await userStore.createUserRequest(user);

        console.log(createUserResult, "createUserResult");

        setState({
          ...state,
          fbProcessing: false,
        });

        if (!createUserResult.errors) {
          history.push("search");
        }
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
    setState({ 
      ...state, 
      googleProcessing: true 
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
      setState({
        ...state,
        googleProcessing: false,
      });

      history.push("search");
    } else {
      setState({
        ...state,
        googleProcessing: false,
      });
    }
  };

  

  const handleLogin = async () => {
    const { email, password } = state;
    console.log(email, password);
    const { history } = props;
    setState({ loginCheck: true, loginProcessing: true });

    sessionStore.setProcessingRequest();
    const result = await sessionStore.loginRequest(email, password);
    if (result.errors) {
      setState({
        ...state,
        loginCheck: false,
        loginProcessing: false,
        error: result.errors || "Invalid credentials",
      });
    } else {
      setState({
        ...state,
        loginCheck: false,
        loginProcessing: false,
        error: "",
      });

      history.push("search");
    }
  };

  const sendVerificationEmail = () => {
    const { email } = state;
    setState({ 
      ...state,
      emailError: null 
    });
    if (!email) {
      setState({ 
        ...state, 
        emailError: "Please enter a valid email." 
      });
    } else {
      sessionStore.resendEmailVerificationRequest({ identity: email });
    }
  }

  const handleFbReactLoading = () => {
    setState({ 
      ...state, 
      fbProcessing: true 
    });
  }

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
    email,
    password,
    emailError,
    fbProcessing,
    googleProcessing,
    loginProcessing,
    modalOpen,
    googleUser,
    rerender,
    error
  } = state;
  return (
    <div className="login-container">
      <div className="container">
        <Card className="cardContainer">
          <h3 className="center-align">Login</h3>
          <div className="subHeading">
            As a Ridesurfing member, I will support an accepting environment
            that nurtures safety, trust, and friendship.
          </div>
          <div className="mb10">
            <FacebookLogin
              appId={facebookId}
              fields="first_name,last_name,email,picture.width(500).height(500),gender,birthday"
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
          <div className="mb20">
            {!rerender ? (
              <SocialButton
                color="secondary"
                provider="google"
                appId={googleId}
                onLoginSuccess={handleSocialLogin}
                onLoginFailure={handleSocialLoginFailure}
                buttonName={
                  !!googleProcessing
                    ? "Please wait..."
                    : "Sign in with Google"
                }
                icon={<i className="fa fa-google icon mr10" />}
                className="leftIcon-btn ggl"
                scope="email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/userinfo.profile"
              />
            ) : null}
          </div>
          <TextField
            fullWidth
            className="text-field"
            id="email"
            type="text"
            label="Email"
            margin="normal"
            value={email}
            onChange={(event) => onFieldChange("email", event)}
            onKeyPress={(event) => onKeyPressEnter(event)}
          />
          {!!emailError && <span className="error">{emailError}</span>}
          <TextField
            fullWidth
            className="text-field"
            id="password"
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={(event) => onFieldChange("password", event)}
            onKeyPress={(event) => onKeyPressEnter(event)}
          />
          {!!error && <span className="error">{error}</span>}
          {!!error && (
            <div className="terms-n-policy">
              If you have not verified your email yet,{" "}
              <a
                className="underline"
                href="#/"
                onClick={() => sendVerificationEmail()}
              >
                click here
              </a>{" "}
              to receive a valid verification code.
            </div>
          )}
          <div className="forgot-link">
            <Link className="underline" to="/forgot_password">
              Forgot password?
            </Link>
          </div>
          <div className="mt40">
            <PrimaryButton
              color="primary"
              buttonName={loginProcessing ? "Please Wait..." : "Login"}
              disabled={!!loginProcessing}
              className="leftIcon-btn login-btn"
              handleButtonClick={() => handleLogin()}
            />
          </div>
          <div className="signup-link">
            Don't have an account? Register{" "}
            <Link className="underline" to="/signup">
              here
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
                  !!googleUser?.birthday ? new Date(googleUser.birthday) : ""
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
                value={googleUser?.gender}
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
              disabled={!googleUser?.birthday || !googleUser?.gender}
              color="primary"
              buttonName="Continue"
              className="leftIcon-btn login-btn"
              handleButtonClick={continueGoogleSignup}
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

export default withRouter(Login);
