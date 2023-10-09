import React from "react";
import SocialLogin from "react-social-login";
import ReactDOM from 'react-dom';

import Button from "@material-ui/core/Button";

const SocialButton = (props) => {
  return (
    <Button
      variant="contained"
      autoCleanUri={true}
      scope={props.scope}
      color={props.color}
      onClick={props.triggerLogin}
      className={props.className}
    >
      {props.icon}
      {props.buttonName}
    </Button>
  )
}

export default SocialLogin(SocialButton);
