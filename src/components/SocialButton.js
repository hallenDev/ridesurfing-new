import React from "react";
import SocialLogin from "react-social-login";

import Button from "@material-ui/core/Button";

class SocialButton  extends React.Component {
  render() {
    return (
      <Button
        variant="contained"
        autoCleanUri={true}
        scope={this.props.scope}
        color={this.props.color}
        onClick={this.props.triggerLogin}
        className={this.props.className}
      >
        {this.props.icon}
        {this.props.buttonName}
      </Button>
    ) 
  }
  
}

export default SocialLogin(SocialButton);
