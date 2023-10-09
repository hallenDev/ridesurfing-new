import React, { Component } from 'react'
import { Link } from 'react-router-dom'

const Trust = () => {

  return (
    <div className="trust-page">
      <div className="container">
        <h3 className="center-align">TRUST & SAFETY</h3>
        <div className="mt20 mb30">
          <div className="content">
            There are three Trust and Safety features that create the
            Ridesurfing network of trust: authenticity, trust, and choice.
            Our goal is to give you the best Ridesurfing experience possible,
            by providing you as much information we can, for you to make a
            sound judgement on who you choose to travel with. At Ridesurfing,
            we focus on the journey.
          </div>
        </div>
        <div className="mt20 mb30">
          <div className="row">
            <div className="col s12 m4">
              <h6>Authenticity</h6>
              <div className="content">
                Ridesurfing's peer-to-peer network of trust is driven by real
                people, using real names and photos. We verify the following
                to maintain authenticity: Facebook accounts, emails, and bank
                information for drivers. Reviews of users also help to ensure
                people maintain identities.
              </div>
            </div>
            <div className="col s12 m4">
              <h6>Trust</h6>
              <div className="content">
                Once a driver has accepted a Ridesurfer's request, both
                parties can communicate via phone, email, or by our internal
                messaging service. After a successful ride, people are
                given the opportunity to give each other feedback and build a
                reputation.
              </div>
            </div>
            <div className="col s12 m4">
              <h6>Choice</h6>
              <div className="content">
                Unlike other transportation apps, Ridesurfing lets you choose
                who you travel with. Passengers request to ride with drivers,
                and in turn, drivers can accept or cancel requests of their
                choice. Ridesurfers also choose their intent
                <Link to="/about"> (commute or adventure)</Link> to help
                find what they're looking for.
              </div>
            </div>
          </div>
        </div>
        <div className="mt20 mb30">
          <h6>Trust & Safety Practices and Recommendations</h6>
          <div className="row">
            <div className="col s12 m6">
              <ul className="list ml20">
                <li>
                  advise others of your travel plans and information of your
                  travel partner(s)
                </li>
                <li>maintain a charged cellphone during your travel</li>
                <li>
                  in case of a vehicle malfunction or unexpected stops, keep
                  food and water handy
                </li>
                <li>
                  check the weather conditions of your route prior to travel
                </li>
              </ul>
            </div>
            <div className="col s12 m6">
              <ul className="list ml20">
                <li>
                  inspect tires (including spare) of vehicle
                </li>
                <li>
                  inspect or replace all fluids (oil, break, coolant, etc.) of
                  vehicle
                </li>
                <li>
                  inspect breaks of vehicle
                </li>
                <li>
                  resolve any check-engine failure codes vehicle may have
                </li>
                <li>
                  inspect or replace filters (oil, fuel, air, etc.) of vehicle
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt20 mb30">
          <h6>Member Relations team</h6>
          <div className="content">
            Ridesurfing has a team that moderates all published content to
            ensure that member interaction is always respectful and responsible. All photos, comments and profiles are scrutinized to increase the trustworthiness of our network, and provide you with a reliable, high quality service.
          </div>
        </div>

      </div>
    </div>
  )
}

export default (Trust)
