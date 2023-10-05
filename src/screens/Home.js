import $ from 'jquery'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import DatePicker from 'react-datepicker'

import SearchField from '../components/SearchField'

import logo from '../images/rs-logo.png'
import findRide from '../images/FAR3.png'
import buySeat from '../images/BYS2.png'
import enjoyTrip from '../images/EYT1.png'
import jamie from '../images/jamie.jpg'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import * as actions from '../actions'
import { getTrip, getTripErrors } from '../reducers/TripReducer'

class Home extends Component {

  constructor (props) {
    super(props)
    this.state = {
      selectedDate: '',
      filters: {
        start_price: 0,
        end_price: 250
      }
    }
  }

  componentDidMount() {
    $('.home-nav').addClass('nav-bg')
    $('.nav-search-btn').hide()
    $(window).scroll(function() {
      var scrollTop = $(window).scrollTop()
      if (scrollTop > 30) {
        $('.home-nav').removeClass('nav-bg')
      } else {
        $('.home-nav').addClass('nav-bg')
      }
    })
  }

  componentWillUnmount() {
    $('.home-nav').removeClass('nav-bg')
    $('.nav-search-btn').show()
    $(window).unbind("scroll")
  }

  onDateChange = (fieldName, date) => {
    const { filters } = this.state
    if (!date) {
      filters[fieldName] = date
    } else {
      try {
        if (date < new Date()) { date = new Date() }
        filters[fieldName] = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear()
      } catch {
        filters[fieldName] = date
      }
    }
    this.setState({ filters })
  }

  setAddress (address, geometry, fieldName) {
    const { filters } = this.state
    filters[fieldName] = address
    if (geometry) {
      filters[`${fieldName}_latitude`] = geometry.location.lat()
      filters[`${fieldName}_longitude`] = geometry.location.lng()
    }
    this.setState({ filters })
  }

  goToSearch () {
    const { history } = this.props
    const { filters } = this.state
    history.push({ pathname: '/search', state: { filters: JSON.stringify(filters) } })
  }

  render () {
    const { filters } = this.state
    return (
      <div className="home-container">
        <div className="section-one">
          <div className="container center-align">
            <p className="heading">Share a Ride and Have Authentic Travel Experiences</p>
            <p className="subheading">A peer to peer road tripping community</p>
            <p className="how-it-works">
              <Link to='/#how'>How It Works</Link>
            </p>
            <div className="inline-form">
              <Button
                variant="contained"
                color='primary'
                className='search-ride'
                onClick={() => this.goToSearch()}
              >
                <i className="fa fa-car icon mr10"/>
                Search Ride
              </Button>
            </div>
            <div className="center-align">

            </div>
          </div>
        </div>
        <div id="how" className="section-two">
          <div className="container">
            <div className="how-it-works-section">
              <h1 className="hiw-heading">
                How <img className="responsive-img logo-img" src={logo} alt="" /> works
              </h1>
              <div className="row landing-steps">
                <div className="col s12 l4">
                  <Card className="landing-step">
                    <img className="responsive-img step-icon img-thumbnail img-circle" src={findRide} alt="" />
                    <h5 className="step-title">Find a ride</h5>
                    <hr className="hr-line"/>
                    <p className="des">Either create a ride or search for a ride. If you're a driver you get paid by us, otherwise it's free.</p>
                  </Card>
                </div>

                <div className="col s12 l4">
                  <Card className="landing-step">
                    <img className="responsive-img step-icon img-thumbnail img-circle" src={buySeat} alt="" />
                    <h5 className="step-title">Book your seat</h5>
                    <hr className="hr-line"/>
                    <p className="des">Connect with travelers and be inspired. Confirm your shared ride through the Ridesurfing platform.</p>
                  </Card>
                </div>

                <div className="col s12 l4">
                  <Card className="landing-step">
                    <img className="responsive-img step-icon img-thumbnail img-circle" src={enjoyTrip} alt="" />
                    <h5 className="step-title">Enjoy your trip</h5>
                    <hr className="hr-line"/>
                    <p className="des">Travel and share unique traveling experiences with others.</p>
                  </Card>
                </div>
              </div>
              <hr className="mt40 mb20"/>
            </div>
          </div>
        </div>
        <div className="section-three">
          <div className="container">
            <div className="how-it-works-section">
              <h1 className="hiw-heading">
                Testimonials
              </h1>
            </div>
            <i className="fa fa-quote-left quote-icon-left" aria-hidden="true"></i>
            <p className="testimonial-content">
              I have always enjoyed meeting new people. Ridesurfing is an ideal way to meet new people while
              traveling and saving some money! The ride was safe and fast the driver was extremely friendly and helpful and the conversation was very entertaining and interesting.
              Overall, my first experience with Ridesurfing was perfect! I am definitely traveling with Ridesurfing again. 100% recommended!!
            </p>
            <h5 className="user-name"> Jamie </h5>
            <img className="user-img responsive-img " src={jamie} alt=""/>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    trip: getTrip(state),
    tripErrors: getTripErrors(state),
  }
}

function mapDispatchToProps (dispatch) {
  const { getTripRequest, resetDataLoadedRequest, resetTripFlagRequest, searchTripsRequest
  } = actions

  return {
    actions: bindActionCreators(
      {
        getTripRequest,
        resetDataLoadedRequest,
        resetTripFlagRequest,
        searchTripsRequest
      },
      dispatch
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
