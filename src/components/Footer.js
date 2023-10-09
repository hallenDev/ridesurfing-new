import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'

import logo from '../images/rs-logo.png'

const Nav = () => {

  return (
    <footer id="footer">
      <div className="container">
        <div className="heading">
          <img className="responsive-img logo" src={logo} alt="" />
        </div>
        <div className="row">
          <div className="col s12 l6 clearfix">
            <div className="social-container">
              <a className="media-link" target="blank" href="https://www.facebook.com/ridesurfing_/"><i className="fa fa-facebook"></i></a>
              <a className="media-link" target="blank" href="https://twitter.com/ridesurfing_"><i className="fa fa-twitter"></i></a>
              <a className="media-link" target="blank" href="https://www.instagram.com/ridesurfing_/"><i className="fa fa-instagram"></i></a>
            </div>
            <div className="text-center">
              <ul className="list">
                <li><Link to="/about" className="footer-link">About</Link></li>
                <li><Link to="/help" className="footer-link">Help</Link></li>
                <li><Link to="/careers" className="footer-link">Career</Link></li>
                <li><Link to="/policies" className="footer-link">Policies</Link></li>
                <li><Link to="/terms" className="footer-link">Terms <span className="hide-mb"> &amp; Conditions</span></Link></li>
              </ul>
            </div>
          </div>
          <div className="col s12 l6 right-box">
            <p className='powered-by'>Copyright © 2015-2019 ridesurfing.com</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default withRouter(Nav);
