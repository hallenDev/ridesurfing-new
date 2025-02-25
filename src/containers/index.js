import React from 'react'
import { withRouter } from 'react-router-dom'
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles'
import Notifications from 'react-notify-toast'

import Nav from '../components/Nav'
import Footer from '../components/Footer'

const theme = createTheme ({
  palette: {
    primary: {
      light: '#000',
      main: '#3399ff',
      dark: '#3399ff',
      contrastText: "#fff"
    },
    danger: {
      light: '#000',
      main: 'red',
      dark: 'red',
      contrastText: "#fff"
    },
    secondary: {
      main: '#3b5998',
      contrastText: "#fff",
      dark: '#3b5998',
    },
    action: {
      hoverOpacity: 0.08,
      active: "rgba(0, 0, 0, 0.54)",
      hover: "rgba(0, 0, 0, 0.08)",
      selected: "rgba(0, 0, 0, 0.14)",
      disabled: "rgba(0, 0, 0, 0.26)",
      disabledBackground: "rgba(0, 0, 0, 0.12)"
    },
    text: {
      primary: '#4a4a4a',
      secondary: '#9a9a9a',
      disabled: '#eaeaea',
      hint: "#f9f9f9",
    },
  },
  typography: {
    useNextVariants: true,
    fontSize: 14,
    buttonNext: {
      fontSize: 14,
      color: "#fff",
      textTransform: 'initial'
    },
    button: {
      fontSize: 14,
      color: "#fff",
      textTransform: 'initial'
    },
  },
});


const SharedContainer = (props) => {

  return (
    <MuiThemeProvider theme={theme}>
      <div className="root-container">
        <div style={{'minHeight': '670px'}}>
          <Nav cable={props.cable} />
          <Notifications options={{zIndex: 1200}} />
          {props.children}
          <Footer />
        </div>
      </div>
    </MuiThemeProvider>
  )
}

export default withRouter(SharedContainer)
