import _ from "underscore";
import React, { useState, useEffect, useCallback } from "react";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import Dropzone from "react-dropzone";
import Button from "@material-ui/core/Button";
import Switch from "react-switch";
import ReactLoading from "react-loading";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import ProfilePayoutSection from "../components/ProfilePayoutSection";
import useSessionStore from "../store/SessionStore";

import missingImg from "../images/missing.png";

const carColor = [
  "Black",
  "Blue",
  "Red",
  "Yellow",
  "White",
  "Green",
  "Brown",
  "Gray",
  "Gold",
  "Other",
];
const MenuProps = { PaperProps: { style: { maxHeight: 300 } } };

const ProfileChecklist = (props) => {
  const sessionStore = useSessionStore();

  const currentUser = sessionStore.currentUser;
  const profileErrors = sessionStore.profileErrors;
  const carMakeList = sessionStore.carMakeList;
  const profileSaved = sessionStore.profileSaved;
  const isProcessing = sessionStore.isProcessing;
  const isCarImageProcessing = sessionStore.isCarImageProcessing;
  const isPayoutProcessing = sessionStore.isPayoutProcessing;
  const imageUploaded = sessionStore.imageUploaded;
  const accountUpdated = sessionStore.accountUpdated;

  const has_payout_details = currentUser?.attributes?.has_payout_details;
  console.log("has_payout_details", has_payout_details, currentUser);

  const hasCarImage = useCallback(() => {
    const images =
      currentUser?.relationships?.profile?.relationships?.images || [];

    return images.find((image) => image?.attributes?.image_type === "car");
  }, [currentUser]);

  const hasDisplayImage = useCallback(() => {
    const images =
      currentUser?.relationships?.profile?.relationships?.images || [];
    return images.find((image) => image?.attributes?.image_type === "display");
  }, [currentUser]);

  const hasCarInfo =
    currentUser?.relationships?.profile?.attributes?.has_car_info;

  const initial_state = {
    submitAccountForm: false,
    imageProcessing: false,
    carImageProcessing: false,
    profileProcessing: false,
    drive_created:
      !!props.location.state && !!props.location.state.drive_created
        ? true
        : false,
    price: !!props.location.state && props.location.state.price,
    profileErrors: {},
    profile: {
      is_driver: true,
    },
  };

  const [state, setState] = useState(initial_state);

  useEffect(() => {
    sessionStore.carMakeListRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(
      "currentUser changed",
      currentUser,
      currentUser?.relationships?.profile?.attributes?.car_make
    );
    setState((s) => ({
      ...s,
      profile: {
        ...s.profile,
        car_make: currentUser?.relationships?.profile?.attributes?.car_make,
        car_model: currentUser?.relationships?.profile?.attributes?.car_model,
        car_year: currentUser?.relationships?.profile?.attributes?.car_year,
        car_color: currentUser?.relationships?.profile?.attributes?.car_color,
      },
    }));
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && !imageUploaded && !accountUpdated) {
      const profile = currentUser.relationships.profile.attributes;
      profile["is_driver"] = true;
      setState((s) => ({ ...s, profile }));
    }
  }, [currentUser, imageUploaded, accountUpdated]);

  useEffect(() => {
    if (profileSaved && Object.keys(profileErrors).length === 0) {
      sessionStore.resetProfileFlagsRequest();
      setState((s) => ({ ...s, submitAccountForm: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileSaved, profileErrors]);

  useEffect(() => {
    if (isProcessing || isProcessing === false) {
      setState((s) => ({
        ...s,
        imageProcessing: isProcessing,
        carImageProcessing: isCarImageProcessing,
        payoutProcessing: isPayoutProcessing,
        // profileProcessing: isProcessing || isCarImageProcessing || isPayoutProcessing
        profileProcessing: false,
      }));
    }
  }, [isProcessing, isCarImageProcessing, isPayoutProcessing]);

  useEffect(() => {
    if (profileErrors) {
      setState((s) => ({
        ...s,
        profileErrors: profileErrors,
        submitAccountForm: false,
      }));
    }
  }, [profileErrors]);

  useEffect(() => {
    if (imageUploaded) {
      setState((s) => ({ ...s, carImageProcessing: false }));
    }
  }, [imageUploaded]);

  useEffect(() => {
    const { history } = props;

    console.log(!!hasDisplayImage(), "aaa");
    if (
      hasCarInfo &&
      !!hasCarImage() &&
      !!hasDisplayImage() &&
      (state.price === 0 || (!!has_payout_details && state.price > 0))
    ) {
      history.push("/my_rides");
    }
  }, [
    has_payout_details,
    props,
    hasCarInfo,
    hasCarImage,
    hasDisplayImage,
    state.price,
  ]);

  if (!localStorage.accessToken) {
    localStorage.setItem("prevUrl", `/complete_profile`);
    return (window.location.href = `/login`);
  }

  const displayImage = (imageType) => {
    const images =
      currentUser?.relationships?.profile?.relationships?.images || [];
    const image = images.find(
      (image) => image?.attributes?.image_type === imageType
    );
    return image ? image?.attributes?.url : missingImg;
  };

  const onCancel = () => {};

  const errorMessageFor = (fieldName) => {
    if (profileErrors && profileErrors[fieldName]) {
      return profileErrors[fieldName];
    }
  };

  const onFieldChange = (fieldName, event) => {
    const { profile } = state;
    let tmp = { ...profile };
    tmp[fieldName] = event.target.value;

    if (fieldName === "car_make") {
      tmp["car_model"] = null;
      tmp["car_year"] = null;
      tmp["car_color"] = null;
    }
    setState({
      ...state,
      profile: tmp,
    });
  };

  const onToggleChange = (fieldName, checked) => {
    const { profile } = state;
    let tmp = JSON.parse(JSON.stringify(profile));
    tmp[fieldName] = checked;

    setState({
      ...state,
      profile: tmp,
    });
  };

  const carModelList = () => {
    const { car_make } = state.profile;

    if (car_make && carMakeList[car_make]) {
      const models = carMakeList[car_make].car_models;
      return _.map(models, (val) => {
        return { value: val.model_name };
      });
    } else {
      return [];
    }
  };

  const carYearList = () => {
    const { car_make, car_model } = state.profile;

    if (car_make && carMakeList[car_make]) {
      const models = carMakeList[car_make].car_models;
      const selectedModel = _.find(models, { model_name: car_model });

      if (selectedModel) {
        return _.map(selectedModel.years, (val) => {
          return { value: val };
        });
      } else {
        return [];
      }
    } else {
      return [];
    }
  };

  const uploadImage = (files, imageType) => {
    if (imageType === "car") {
      setState({
        ...state,
        carImageProcessing: true,
      });
    }
    if (imageType === "display") {
      setState({
        ...state,
        imageProcessing: true,
      });
    }
    sessionStore.setProcessingRequest(imageType);
    const fileObj = files[0];
    let img;

    if (fileObj) {
      var FR = new FileReader();

      FR.addEventListener("load", function(e) {
        img = e.target.result;
        sessionStore.uploadProfileImageRequest(imageType, img);
      });

      FR.readAsDataURL(fileObj);
    }
  };

  const handleProfileSave = () => {
    const { profile } = state;
    setState({
      ...state,
      profileProcessing: true,
    });

    console.log(profile);
    sessionStore.saveProfileRequest(currentUser.id, profile);
    setState({
      ...state,
      submitAccountForm: true,
    });
  };

  const deleteImage = (imageId) => {
    confirmAlert({
      title: "Alert!",
      message: "Are you sure you want to delete this image?",
      buttons: [
        {
          label: "Yes",
          onClick: () => sessionStore.deleteProfileImageRequest(imageId),
        },
        {
          label: "No",
          onClick: () => console.log("canceled"),
        },
      ],
    });
  };

  const hasCarBasicInfo = () => {
    const { profile } = state;
    return (
      !!profile.car_make &&
      !!profile.car_model &&
      !!profile.car_year &&
      !!profile.car_color
    );
  };

  const originalyHasCarBasicInfo = () => {
    return (
      !!currentUser.relationships.profile.car_make &&
      !!currentUser.relationships.profile.car_model &&
      !!currentUser.relationships.profile.car_year &&
      !!currentUser.relationships.profile.car_color
    );
  };

  const carInfoSaved = () => {
    const profile = currentUser.relationships?.profile?.attributes;

    return (
      profile?.car_make &&
      profile?.car_model &&
      profile?.car_year &&
      profile?.car_color &&
      !!hasCarImage()
    );
  };

  const {
    profile,
    submitAccountForm,
    drive_created,
    imageProcessing,
    profileProcessing,
    price,
    carImageProcessing,
  } = state;

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="row">
          <div className="col l3 s12 center-align">
            <div className="user-img-container">
              <img
                src={displayImage("display")}
                className="user-img responsive-img"
                alt=""
              />
            </div>
            <span className="error">{errorMessageFor("is_driver")}</span>
            <div className="mt20">
              <div className="bubble-container">
                {!!imageProcessing && (
                  <ReactLoading
                    type="bubbles"
                    color="#3399ff"
                    height="25%"
                    width="25%"
                  />
                )}
              </div>
              <Dropzone
                onDrop={(files) => uploadImage(files, "display")}
                onFileDialogCancel={onCancel}
                className="dropzone"
              >
                {({ getRootProps, getInputProps }) => (
                  <section className="dropzone">
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <div>
                        Try dropping image here, or click to select image to
                        upload. Size should be less than 3 MB.
                      </div>
                    </div>
                  </section>
                )}
              </Dropzone>
            </div>
            <div className="row mt20 user-preference">
              <div className="col l9 s9 left-align">
                <span>Do you allow smoking?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.smoking}
                  onChange={(checked, event, id) =>
                    onToggleChange("smoking", checked)
                  }
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
            <div className="row user-preference">
              <div className="col l9 s9 left-align">
                <span>Do you allow pets?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.pets}
                  onChange={(checked, event, id) =>
                    onToggleChange("pets", checked)
                  }
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
            <div className="row user-preference">
              <div className="col l9 s9 left-align">
                <span>Do you have or prefer ac?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.car_ac}
                  onChange={(checked, event, id) =>
                    onToggleChange("car_ac", checked)
                  }
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
            <div className="row user-preference">
              <div className="col l9 s9 left-align">
                <span>Are you open to traveling with kids?</span>
              </div>
              <div className="col l3 s3 right-align">
                <Switch
                  checked={!!profile.kid_friendly}
                  onChange={(checked, event, id) =>
                    onToggleChange("kid_friendly", checked)
                  }
                  className="check-box"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
          </div>
          <div className="col offset-l1 l8 s12 right-side">
            {!!drive_created && (
              <div className="alert alert-success">
                Review your required profile data in order to be listed.
              </div>
            )}
            {!carInfoSaved() && (
              <div>
                <h5 className="mt30">Car Info</h5>
                <hr className="hr-line" />
                <div className="mt20">
                  <div className="bubble-container">
                    {!!carImageProcessing && (
                      <ReactLoading
                        type="bubbles"
                        color="#3399ff"
                        height="20%"
                        width="20%"
                      />
                    )}
                  </div>
                  {hasCarImage() ? (
                    <div className="imgWrapper carImgWrapper">
                      <img
                        src={displayImage("car")}
                        className="responsive-img uploadPic"
                        alt=""
                      />
                    </div>
                  ) : (
                    <Dropzone
                      onDrop={(files) => uploadImage(files, "car")}
                      onFileDialogCancel={onCancel}
                      className="dropzone"
                    >
                      {({ getRootProps, getInputProps }) => (
                        <section className="dropzone">
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <div>
                              Try dropping car image here, or click to select
                              image to upload. Size should be less than 3 MB.
                            </div>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  )}
                  <span className="error">
                    {errorMessageFor("has_car_image")}
                  </span>
                </div>
                {!originalyHasCarBasicInfo() && (
                  <div>
                    <div className="row">
                      <div className="col l6 m6 s12">
                        <FormControl className="selectField">
                          <InputLabel htmlFor="select-multiple">
                            Make*{" "}
                          </InputLabel>
                          <Select
                            value={profile.car_make || ""}
                            onChange={(event) =>
                              onFieldChange("car_make", event)
                            }
                            input={<Input id="select-multiple" />}
                            MenuProps={MenuProps}
                            className="selected-menu-field"
                          >
                            {_.map(carMakeList, (make, index) => {
                              return (
                                <MenuItem
                                  key={`make-${index}`}
                                  value={make.car_make}
                                >
                                  {make.car_make}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          <span className="error">
                            {errorMessageFor("car_make")}
                          </span>
                        </FormControl>
                      </div>
                      <div className="col l6 m6 s12">
                        <FormControl className="selectField">
                          <InputLabel htmlFor="select-multiple">
                            Model*
                          </InputLabel>
                          <Select
                            value={profile.car_model || ""}
                            onChange={(event) =>
                              onFieldChange("car_model", event)
                            }
                            input={<Input id="select-multiple" />}
                            MenuProps={MenuProps}
                            className="selected-menu-field"
                          >
                            {carModelList().map((model, index) => (
                              <MenuItem
                                key={`model-${index}`}
                                value={model.value}
                              >
                                {model.value}
                              </MenuItem>
                            ))}
                          </Select>
                          <span className="error">
                            {errorMessageFor("car_model")}
                          </span>
                        </FormControl>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col l6 m6 s12">
                        <FormControl className="selectField">
                          <InputLabel htmlFor="select-multiple">
                            Year*
                          </InputLabel>
                          <Select
                            value={profile.car_year || ""}
                            onChange={(event) =>
                              onFieldChange("car_year", event)
                            }
                            input={<Input id="select-multiple" />}
                            MenuProps={MenuProps}
                            className="selected-menu-field"
                          >
                            {carYearList().map((year, index) => (
                              <MenuItem
                                key={`year-${index}`}
                                value={year.value}
                              >
                                {year.value}
                              </MenuItem>
                            ))}
                          </Select>
                          <span className="error">
                            {errorMessageFor("car_year")}
                          </span>
                        </FormControl>
                      </div>
                      <div className="col l6 m6 s12">
                        <FormControl className="selectField">
                          <InputLabel htmlFor="select-multiple">
                            Color*
                          </InputLabel>
                          <Select
                            value={profile.car_color || ""}
                            onChange={(event) =>
                              onFieldChange("car_color", event)
                            }
                            input={<Input id="select-multiple" />}
                            MenuProps={MenuProps}
                            className="selected-menu-field"
                          >
                            {carColor.map((color, index) => (
                              <MenuItem key={index} value={color}>
                                {color}
                              </MenuItem>
                            ))}
                          </Select>
                          <span className="error">
                            {errorMessageFor("car_color")}
                          </span>
                        </FormControl>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!has_payout_details && price > 0 && (
              <div className="row mt20 ml0">
                <ProfilePayoutSection
                  ignoreButton={true}
                  submitAccountForm={submitAccountForm}
                />
              </div>
            )}
            <div className="mt40 mb20">
              <Button
                variant="contained"
                color="primary"
                className="update-btn"
                disabled={!!profileProcessing}
                onClick={() => handleProfileSave()}
              >
                {profileProcessing ? "Please Wait..." : "Update Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileChecklist;
