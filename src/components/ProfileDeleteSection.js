import _ from 'underscore'
import React, { useState, useEffect } from 'react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import { PrimaryButton } from '../components/Buttons'

import useSessionStore from '../store/SessionStore';


const initial_state = {
  userId: null,
  lbOpen: false,
  photoIndex: 0,
  isProcessing: false
}

const ProfileDeleteSection = (props) => {

  const sessionStore = useSessionStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteAction = () => {
    confirmAlert({
        title: 'Alert!',
        message: 'Are you sure you delete your account?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
                sessionStore.deleteAccountRequest()
                return window.location.href = `/login`
            }
          },
          {
            label: 'No',
            onClick: () => console.log('canceled')
          }
        ]
    })
  }

  return (
    <div className="profile-car-section">
      <div className="row">
        <div class="col s12 m12">
            <PrimaryButton
              color='primary'
              buttonName={isProcessing ? "Please Wait..." : "Delete Account"}
              className="lg-primary"
              handleButtonClick={() => handleDeleteAction()}
              disabled={!!isProcessing}
            />
        </div>
      </div>
    </div>
  )
}

export default ProfileDeleteSection
