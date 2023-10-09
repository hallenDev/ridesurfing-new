import React, { useState } from 'react'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete';

const initial_state = { address: '' }

const SearchField = (props) => {

  const [state, setState] = useState(initial_state);

  const handleChange = (address, updateField=true) => {
    setState({ 
      ...state,
      address 
    })
    if (updateField) { props.setAddress(address, false) }
  };

  const handleSelect = address => {
    handleChange(address, false)
    geocodeByAddress(address).then(results => {
      props.setAddress(results[0].formatted_address, results[0].geometry)
    })
  }

  const keyPress = (event) => {
    const keyName = event.key
    const { address } = state
    if (keyName === 'Tab' || keyName === 'Enter') {
      geocodeByAddress(address).then(results => {
        props.setAddress(results[0].formatted_address, results[0].geometry)
      })
    }
  }
  
  return (
    <PlacesAutocomplete
      value={state.address || props.value}
      onChange={handleChange}
      onSelect={handleSelect}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="autocomplete-container">
          <input
            {...getInputProps({
              placeholder: props.placeholder,
              className: 'location-search-input',
              id: props.inputId || 'search-field',
              onKeyDown: keyPress
            })}
          />
          <div className="autocomplete-dropdown-container">
            <div className="autocomplete-dropdown">
              {suggestions.map(suggestion => {
                const className = suggestion.active
                  ? 'suggestion-item--active'
                  : 'suggestion-item';
                return (
                  <div
                    {...getSuggestionItemProps(suggestion, {
                      className,
                    })}
                  >
                    <span>
                      <i className="fa fa-map-marker map-icon"/>
                      {suggestion.description}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
}

export default (SearchField);
