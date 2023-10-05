import React, { Component } from "react";
import Button from "@material-ui/core/Button";

class PrimaryButton extends Component {
  render() {
    return (
      <Button
        variant="contained"
        color={this.props.color}
        className={this.props.className}
        onClick={this.props.handleButtonClick}
        type="submit"
        disabled={this.props.disabled}
      >
        {this.props.buttonName}
      </Button>
    );
  }
}

class LeftIconButton extends Component {
  render() {
    return (
      <Button
        variant="contained"
        color={this.props.color}
        className={this.props.className}
        onClick={this.props.handleButtonClick}
      >
        {this.props.icon}
        {this.props.buttonName}
      </Button>
    );
  }
}

export { PrimaryButton, LeftIconButton };
