import { create } from "zustand";
import callApi from "../util/apiCaller";
import { notify } from "react-notify-toast";

const useUserStore = create((set) => ({
  user: {
    attributes: {},
    relationships: {
      profile: {
        attributes: {},
        user: {},
      },
      reviews: [],
    },
  },
  errors: [],
  isSaved: false,
  isReset: false,
  otpError: "",
  codeSent: false,
  emailVerified: false,
  isProcessing: false,

  createUserRequest: async (user) => {
    const res = await callApi(`signup`, "post", { user });
    if (res.errors) {
      set({
        errors: res.errors || {},
        isProcessing: false,
      });
    } else {
      if (res?.data?.attributes?.token) {
        localStorage.setItem(`accessToken`, res.data.attributes.token);
      }
      set({
        user: res.data,
        isSaved: true,
        errors: [],
        isProcessing: false,
      });
    }
    return res;
  },
  getUserRequest: (userId) => {
    callApi(`users/${userId}`).then((res) => {
      if (res.errors) {
        set({
          errors: res.errors || {},
          isProcessing: false,
        });
      } else {
        set({
          user: res.data,
          errors: [],
          isProcessing: false,
        });
      }
    });
  },
  forgotPasswordRequest: (identity) => {
    set({ isProcessing: true });
    callApi(`users/resend_otp`, "post", { identity }).then((res) => {
      if (res.errors) {
        set({
          errors: res.errors || {},
          isProcessing: false,
        });
      } else {
        notify.show(
          "We have sent a verification code on your registered mobile number or email.",
          "success"
        );
        set({
          codeSent: true,
          isProcessing: false,
        });
      }
    });
  },
  resetPasswordRequest: (otp, password) => {
    set({ isProcessing: true });
    callApi(`users/reset_password`, "put", { otp, password }).then((res) => {
      if (res.errors) {
        set({
          errors: res.errors || {},
          isProcessing: false,
        });
      } else {
        notify.show("Your password has been reset successfully.", "success");
        set({
          isReset: true,
          isProcessing: false,
        });
      }
    });
  },
  verifyOtpRequest: (params) => {
    set({ isProcessing: true });
    callApi(`users/verify_otp.json`, "post", params).then((res) => {
      if (!res || res.errors) {
        set({
          errors: res?.errors || {},
          isProcessing: false,
        });
      } else {
        notify.show("Your email has been verified. Please login.", "success");
        set({
          emailVerified: true,
          isProcessing: false,
        });
      }
    });
  },
  resetUserFlagsRequest: () => {
    set({
      isSaved: false,
      codeSent: false,
      isReset: false,
      emailVerified: false,
      isProcessing: false,
      errors: [],
      otpError: "",
    });
  },
  setProcessingRequest: () => {
    set({ isProcessing: true });
  },
}));

export default useUserStore;
