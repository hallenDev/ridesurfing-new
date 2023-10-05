import React from "react";
import SocialLogin from "react-social-login";

import Button from "@material-ui/core/Button";

const SocialButton = (props) => (
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
);

export default SocialLogin(SocialButton);
