import React from 'react'
import PlacesAutocomplete, {geocodeByAddress} from 'react-places-autocomplete';

class SearchField extends React.Component {
  constructor(props) {
    super(props);
    this.state = { address: '' }
  }

  handleChange = (address, updateField=true) => {
    this.setState({ address })
    if (updateField) { this.props.setAddress(address, false) }
  };

  handleSelect = address => {
    this.handleChange(address, false)
    geocodeByAddress(address).then(results => {
      this.props.setAddress(results[0].formatted_address, results[0].geometry)
    })
  }

  keyPress = (event) => {
    const keyName = event.key
    const { address } = this.state
    if (keyName === 'Tab' || keyName === 'Enter') {
      geocodeByAddress(address).then(results => {
        this.props.setAddress(results[0].formatted_address, results[0].geometry)
      })
    }
  }

  render() {
    return (
      <PlacesAutocomplete
        value={this.state.address || this.props.value}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="autocomplete-container">
            <input
              {...getInputProps({
                placeholder: this.props.placeholder,
                className: 'location-search-input',
                id: this.props.inputId || 'search-field',
                onKeyDown: this.keyPress
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
}

export default (SearchField);
