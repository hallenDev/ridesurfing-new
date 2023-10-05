import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class AboutUs extends Component {

  render () {
    return (
      <div className="aboutUs-page">
        <div className="container">
          <h3 className="center-align">ABOUT US</h3>
          <div className="mt20 mb30">
            <h6>Vision</h6>
            <div className="content">
              Our vision is to help unite and connect people by revolutionizing
              the way we travel. At Ridesurfing, we are focused on the journey.
            </div>
          </div>
          <div className="mt20 mb30">
            <h6>What is Ridesurfing?</h6>
            <div className="content">
              Ridesurfing is a virtual marketplace where people connect to make
              travel more accessible. We match passengers We match passengers
              with drivers who share common travel plans. Passengers request
              to ride with drivers, and in turn, drivers can accept or cancel
              requests of their choice. We allow Ridesurfers to interact
              prior to their journey to
              <Link to="safety"> build trust</Link>. We want to help people
              commute long distances while also allowing people to share unique
              experiences with each other.
            </div>
          </div>
          <div className="mt20 mb30">
            <h6>Who is Ridesurfing for?</h6>
            <div className="content">
              Ridesurfing is unique in that it accommodates different travel
              goals people may have. There are two types of rides:
              <div className="ml20 mt10">
                <b>Commute:</b> A "commute" is for those interested in getting
                to a defined destination within a specified period of time.
              </div>
              <div className="ml20">
                <b>Adventure:</b> An "adventure" is for those less concerned
                about defined plans and more interested in the exploration of
                travel. Another reason to use this option is if you’re waiting
                for an ideal traveling partner to be interested in your trip.
              </div>
              <br/>
              Also, Ridesurfing allows drivers to ask for money for the trip,
              or to set the price of their trip to $0, depending on the goals
              and motivations of the driver.
            </div>
          </div>
          <div className="mt20 mb30">
            <h6>How did Ridesurfing come to be?</h6>
            <div className="content">
              We realized that many cars on the road had empty seats, which
              seemed an inefficient way for people to travel. Ridesurfing has
              a goal of minimizing the number of cars on the road, decreasing
              emissions, and most importantly increasing human connection while
              people travel on their journey
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default (AboutUs)
