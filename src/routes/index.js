import React from "react";
import { Switch, Route } from "react-router-dom";
import ActionCable from "actioncable";

import Container from "../containers";
import Login from "../screens/Login";
import Signup from "../screens/Signup";
import ForgotPassword from "../screens/ForgotPassword";
import ResetPassword from "../screens/ResetPassword";
import VerifyEmail from "../screens/VerifyEmail";
import ProfileDetails from "../screens/ProfileDetails";
import EditProfile from "../screens/EditProfile";
import Home from "../screens/Home";
import Dashboard from "../screens/Dashboard";
import NewRide from "../screens/NewRide";
import EditRide from "../screens/EditRide";
import ProfileChecklist from "../screens/ProfileChecklist";
import RiderChecklist from "../screens/RiderChecklist";
import TripDetails from "../screens/TripDetails";
import MyTrips from "../screens/MyTrips";
import Requests from "../screens/Requests";
import Chat from "../screens/Chat";
import ChatList from "../screens/ChatList";
import Reviews from "../screens/Reviews";
import ReviewForm from "../screens/ReviewForm";
import AboutUs from "../screens/AboutUs";
import Trust from "../screens/Trust";
import Help from "../screens/Help";
import Careers from "../screens/Careers";
import Policies from "../screens/Policies";
import Terms from "../screens/Terms";
import NoScreen from "../screens/NoScreen";

const accessToken = localStorage.getItem("accessToken");
const cable = ActionCable.createConsumer(
  process.env.REACT_APP_ACTION_CABLE_LINK + accessToken? accessToken: ''
);

export default (
  <Container cable={cable}>
    <Switch>
      <Route
        startsWith
        exact
        strict
        path="/"
        render={(props) => <Home {...props} cable={cable} />}
      />
      <Route exact path="/login" component={Login} />
      <Route exact path="/signup" component={Signup} />
      
      <Route exact path="/safety" component={Trust} />
      <Route exact path="/about" component={AboutUs} />
      <Route exact path="/careers" component={Careers} />
      <Route exact path="/help" component={Help} />
      <Route exact path="/policies" component={Policies} />
      <Route exact path="/terms" component={Terms} />
      
      <Route exact path="/forgot_password" component={ForgotPassword} />
      <Route exact path="/reset_password" component={ResetPassword} />
      <Route exact path="/verify_email" component={VerifyEmail} />
      <Route exact path="/search" render={(props) => <Dashboard {...props} cable={cable} />} />
      <Route exact path="/chatList" render={(props) => <ChatList {...props} cable={cable} />} />
      <Route exact path="/my_profile" component={ProfileDetails} />
      <Route path="/my_rides" component={MyTrips} />
      <Route exact path="/new_ride" component={NewRide} />
      <Route exact path="/requests" component={Requests} />
      <Route path="/reviews" component={Reviews} />
      <Route exact path="/profile/:userId" component={ProfileDetails} />
      <Route exact path="/complete_profile" component={ProfileChecklist} />
      <Route exact path="/profile_details" component={RiderChecklist} />
      <Route exact path="/edit_profile" component={EditProfile} />
      <Route exact path="/chat" render={(props) => <Chat {...props} cable={cable} />} />
      <Route path="/reviews/:reviewId" component={ReviewForm} />
      <Route path="/ride/:rideId/edit" component={EditRide} />
      <Route path="/ride/:rideId" component={TripDetails} />
      
      <Route component={NoScreen} />
    </Switch>
  </Container>
);
