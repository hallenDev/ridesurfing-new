import { create } from 'zustand';
import callApi from "../util/apiCaller";
import { notify } from 'react-notify-toast';

const useSessionStore = create((set) => ({
    accessToken: localStorage.getItem("accessToken") || null,
    loggedIn: !!(localStorage.getItem("accessToken") || null),
    errors: "",
    currentUser: {
        attributes: {},
        relationships: { 
            profile: { 
                attributes: {}, 
                user: {} 
            }, 
            reviews: [] 
        },
    },
    userUpdated: false,
    userErrors: {},
    socialLoginError: false,
    passwordUpdated: false,
    profileSaved: false,
    profileErrors: {},
    carMakeList: {},
    imageDeleted: false,
    imageUploaded: false,
    notificationCount: 0,
    chatsCount: 0,
    dataLoaded: false,
    isProcessing: false,
    resendEmailVerification: false,
    accountUpdated: false,
    getIsCarImageProcessing: false,
    isPayoutProcessing: false,

    loginRequest: async (email, password) => {
      const res = await callApi(`login`, "post", { email, password });
      if (!res || res.errors) {
        set({
            accessToken: null,
            loggedIn: false,
            errors: "Invalid Credentials",
            isProcessing: false,
            isCarImageProcessing: false,
            isPayoutProcessing: false,
        })
      } else {
        if(res.data.attributes.token) {
          localStorage.setItem(`accessToken`, res.data.attributes.token);
        }
        set({
          accessToken: res.data.attributes.token,
          loggedIn: !!res.data.attributes.token,
          errors: null,
          isProcessing: false,
          isCarImageProcessing: false,
          isPayoutProcessing: false,
        })
      }
      return res;
    }, 
    logoutRequest: () => {
        callApi(`logout`, "delete").then((res) => {
            localStorage.removeItem(`accessToken`);
            set({
                loggedIn: false,
                accessToken: null,
            })
        });
    },
    getCurrentUserRequest: () => {
        callApi(`users/current`).then((res) => {
            if (!res || res.errors) {
              set({
                accessToken: null,
                loggedIn: false,
                errors: null,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            } else {
              set({
                currentUser: res.data,
                notificationCount: res.data.attributes.unread_notifications_count,
                chatsCount: res.data.attributes.chat_count,
                loggedIn: true,
              })
            }
        });
    },
    updateUserRequest: (userId, user) => {
        set({isProcessing: true})
        callApi(`users/${userId}`, "put", { user }).then((res) => {
            if (res.errors) {
              set({
                userErrors: res.errors,
                userUpdated: false,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            } else {
                notify.show("Information has been updated", "success");
                set({
                    currentUser: res.data,
                    userUpdated: true,
                    isProcessing: false
                })
            }
        });
    },
    changeUserPasswordRequest: (params) => {
      set({isProcessing: true})
      callApi(`sessions/update_password`, "post", params).then((res) => {
          if (res.errors) {
            set({
              userErrors: res.errors,
              userUpdated: false,
              isProcessing: false,
              isCarImageProcessing: false,
              isPayoutProcessing: false,
            })
          } else {
            notify.show("Your password has been updated", "success");
            set({ 
              isProcessing: false,
              passwordUpdated: true 
            })
          }
      });
    },
    resetCurrentUserFlagsRequest: () => {
        set({
            userErrors: {},
            userUpdated: false,
            passwordUpdated: false,
            socialLoginError: false,
            resendEmailVerification: false,
            accountUpdated: false,
            imageUploaded: false,
        })
    },
    saveProfileRequest: (profileId, profile) => {
        callApi(`profiles/${profileId}`, "put", profile).then((res) => {
            if (res.errors) {
              set({
                profileErrors: res.errors,
                profileSaved: false,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            } else {
              if (profile && !profile.is_rider && !profile.is_driver) {
                notify.show("Information has been saved.", "success");
              }
              set({
                currentUser: res.data,
                profileErrors: {},
                profileSaved: true,
                isProcessing: false,
                isCarImageProcessing: false,
                accountUpdated: false,
              })
                
            }
        });
    },
    resetProfileFlagsRequest: () => {
        set({
            profileErrors: {},
            profileSaved: false,
            isProcessing: false,
            isCarImageProcessing: false,
            accountUpdated: false,
        })
    },
    carMakeListRequest: () => {
        callApi(`car_make_list`).then((res) => {
            set({ carMakeList: res })
        });
    },
    socialLoginRequest: async (social_type, token, email) => {
        const res = await callApi(`sessions/check_provider.json`, "post", { social_type, token, email });
        if (res && res.data) {
          if (res.data.attributes.token) {
            localStorage.setItem(`accessToken`, res.data.attributes.token);
            set({
                accessToken: res.data.attributes.token,
                loggedIn: !!res.data.attributes.token,
                errors: null,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
            })
          }
        } else {
          set({ socialLoginError: true })
        }
        return res;
    },
    saveAccountRequest: (account_params, address_params, ip) => {
        callApi(`users/save_account`, "post", { account_params, address_params, ip }).then((res) => {
            if (res.errors) {
              set({
                profileErrors: res.errors,
                profileSaved: false,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            } else {
              set({
                currentUser: res.data,
                profileErrors: {},
                profileSaved: true,
                isPayoutProcessing: false,
                accountUpdated: true,
                isProcessing: false
              })
            }
        });
    },
    uploadProfileImageRequest: (image_type, file) => {
        callApi(`profiles/image/upload`, "post", { image_type, file }).then((res) => {
            if (res.errors) {
              set({
                profileErrors: res.errors,
                profileSaved: false,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            } else {
              set({
                currentUser: res.data,
                imageUploaded: true,
                imageDeleted: false,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            }
        });
    },
    deleteProfileImageRequest: (imageId) => {
        callApi(`profiles/image/${imageId}/delete`, "delete").then((res) => {
            if (res.errors) {
                set({
                    profileErrors: res.errors,
                    profileSaved: false,
                    isProcessing: false,
                    isCarImageProcessing: false,
                    isPayoutProcessing: false,
                })
            } else {
              notify.show("Information has been saved.", "success");
              set({
                currentUser: res.data,
                profileErrors: {},
                profileSaved: true,
                isProcessing: false,
                isCarImageProcessing: false,
                accountUpdated: false
              })
            }
        });
    },
    resendEmailVerificationRequest: (params) => {
        callApi(`users/resend_email.json`, "post", params).then((res) => {
            if (res.errors) {
              set({
                userErrors: res.errors,
                userUpdated: false,
                isProcessing: false,
                isCarImageProcessing: false,
                isPayoutProcessing: false,
              })
            } else {
              set({ resendEmailVerification: true })
            }
        });
    },
    setNotificationCountRequest: (hash) => {
        if (hash.chat_count > 0) {
            document.title = `(${hash.chat_count}) Ridesurfing - Peer to Peer Road Tripping Community`;
        } else {
            document.title = `Ridesurfing - Peer to Peer Road Tripping Community`;
        }
        set({
            notificationCount: hash.count,
            chatsCount: hash.chat_count,
        })
    },
    resetDataLoadedRequest: () => {
        set({ dataLoaded: false })
    },
    setProcessingRequest: (processType = null) => {
        set({
            isProcessing: true,
            isCarImageProcessing: processType === "car" ? true : false,
            isPayoutProcessing: processType === "payout" ? true : false,
        })
    },
    setAccountProcessingRequest: (processType = null) => {
        set({
            isProcessing: processType === "display" ? true : false,
            isCarImageProcessing: processType === "car" ? true : false,
            isPayoutProcessing: processType === "payout" ? true : false,
        })
    },
    resetProcessingRequest: () => {
        set({
            isProcessing: false,
            isCarImageProcessing: false,
            isPayoutProcessing: false,
        })
    }
}))

export default useSessionStore;