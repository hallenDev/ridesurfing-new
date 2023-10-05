import React, { Component } from 'react'
import { Provider } from 'react-redux'

import routes from './routes'
import configureStore from './store'

const store = configureStore()
// Debug console logs
const unsubscribe = store.subscribe(
  () => console.log('State after dispatch: ', store.getState()) 
)
                                    
class App extends Component {

  componentDidUpdate() {
    window.scrollTo(0, 0)
  }

  render() {
    return (
        <Provider store={store}>
          { routes }
        </Provider>
    );
  }
}

export default App
