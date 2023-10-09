import React, { Component, useEffect } from 'react'

const NoScreen = (props) => {

  useEffect(() => {
    props.history.push('/')
  }, []);

    return <span></span>
}

export default NoScreen
