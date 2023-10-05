import React, { Component } from 'react'

class NoScreen extends Component {

  componentDidMount () {
    this.props.history.push('/')
  }

  render () {
    return <span></span>
  }
}

export default NoScreen
