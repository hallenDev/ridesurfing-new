import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import HttpsRedirect from 'react-https-redirect'

import './globaljs'
import '../node_modules/font-awesome/css/font-awesome.min.css'
import './styles/App.css'
import 'react-datepicker/dist/react-datepicker.css'
import 'react-daterange-picker/dist/css/react-calendar.css'
import 'react-image-lightbox/style.css'
import '../node_modules/slick-carousel/slick/slick.css'
import '../node_modules/slick-carousel/slick/slick-theme.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <HttpsRedirect>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HttpsRedirect>,
  document.getElementById('root')
)

serviceWorker.unregister()
