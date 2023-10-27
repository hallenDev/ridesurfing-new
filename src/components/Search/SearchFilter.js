import React from 'react'
import SearchField from '../../ui/SearchField/SearchField'
import Slider from '../../ui/Slider/Slider'

const SearchFilter = ({filters, setFilters}) => {
  const setAddress = (address, geometry, fieldName) => {
    const {filters, latitude, longitude, locationAvailable} = state
    let tmp = JSON.parse(JSON.stringify(filters))
    tmp[fieldName] = geometry ? address : undefined
    tmp[`${fieldName}_latitude`] = geometry
      ? geometry.location.lat()
      : undefined
    tmp[`${fieldName}_longitude`] = geometry
      ? geometry.location.lng()
      : undefined

    if (locationAvailable) {
      tmp.latitude = latitude
      tmp.longitude = longitude
    } else {
      tmp.latitude = null
      tmp.longitude = null
    }

    setState({
      ...state,
      filters: tmp,
    })

    if (geometry || address === '') {
      tripStore.resetDataLoadedRequest()
      tripStore.searchTripIdsRequest(filters)
    }
  }

  const updateSlider = (fieldName, value) => {
    const {filters} = state
    let tmp = JSON.parse(JSON.stringify(filters))
    if (value === 351) {
      delete tmp[fieldName]
    } else {
      tmp[fieldName] = value
    }

    setState({
      ...state,
      filters: tmp,
    })

    tripStore.resetDataLoadedRequest()
    tripStore.searchTripIdsRequest(tmp)
  }

  return (
    <>
      <div className="row">
        <div className="col l2 m2 s12 singleSlider">
          <div className="label search-label">Journey</div>
        </div>
        <div className="col l5 m5 s12 singleSlider">
          <SearchField
            placeholder="Enter start location"
            value={filters.start_location || ''}
            setAddress={(address, geometry) =>
              setAddress(address, geometry, 'start_location')
            }
          />
          <Slider
            defaultValue={351}
            min={0}
            max={351}
            value={filters.start_location_fence}
            renderThumb={() => <div>aaa</div>}
            onAfterChange={value => updateSlider('start_location_fence', value)}
          />
          <p className="slide-value">
            <span id="origin_fence_val">
              {filters.start_location_fence === 351
                ? ''
                : filters.start_location_fence}
            </span>{' '}
            miles
          </p>
        </div>
        <div className="col l5 m5 s12 singleSlider">
          <SearchField
            placeholder="Enter destination"
            value={filters.destination || ''}
            setAddress={(address, geometry) =>
              setAddress(address, geometry, 'destination')
            }
          />
          <Slider
            withBars
            defaultValue={351}
            min={0}
            max={351}
            value={
              filters.destination_fence === 351 ? '' : filters.destination_fence
            }
            onAfterChange={value => updateSlider('destination_fence', value)}>
            <div className="slider-handle"></div>
          </Slider>

          <p className="slide-value">
            <span id="destination_fence_val">{filters.destination_fence}</span>{' '}
            miles
          </p>
        </div>
      </div>
      <div className="row">
        <div className="col l2 m2 s12">
          <div className="label gender-label">Gender</div>
        </div>
        <div className="col l5 m5 s12">
          <FormControl className="selectField">
            <InputLabel htmlFor="select-multiple"></InputLabel>
            <Select
              value={filters.gender || ''}
              onChange={event => updateFilters('gender', event)}
              input={<Input id="select-multiple" />}
              MenuProps={MenuProps}
              displayEmpty
              className="selected-menu-field">
              {gender.map((data, index) => (
                <MenuItem key={index} value={data[0]}>
                  {data[1]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="col l5 m5 s12 mt20ml">
          <FormControl className="selectField">
            <InputLabel htmlFor="select-multiple">Events</InputLabel>
            <Select
              value={filters.event_name || []}
              onChange={event => updateFilters('event_name', event)}
              input={<Input id="select-multiple" />}
              MenuProps={MenuProps}
              multiple={true}
              displayEmpty
              className="selected-menu-field">
              {eventNames.map(name => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
      <div
        style={{position: 'relative'}}
        ref={node => {
          setNode(node)
        }}>
        <div className="row">
          <div className="col l2 m2 s12">
            <div className="label date-range search-label">Date Range</div>
          </div>
          <div className="col l5 m5 s12">
            <DatePicker
              selected={
                filters.finish_date1 ? new Date(filters.finish_date1) : ''
              }
              onChange={date => updateDateFilters('finish_date1', date)}
              minDate={new Date()}
              maxDate={
                filters.finish_date2
                  ? new Date(filters.finish_date2)
                  : addDays(new Date(), 1000)
              }
              placeholderText="Departure Date Range #1"
              className="text-field"
            />
          </div>
          <div className="col l5 m5 s12">
            <DatePicker
              selected={
                filters.finish_date2 ? new Date(filters.finish_date2) : ''
              }
              onChange={date => updateDateFilters('finish_date2', date)}
              minDate={new Date()}
              placeholderText="Departure Date Range #2"
              className="text-field"
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col l2 m2 s12">
          <div className="label search-label">Price</div>
        </div>
        <div className="col l10 m10 s12">
          <Slider
            withBars
            defaultValue={[0, 250]}
            min={0}
            max={250}
            onAfterChange={changePrice}>
            <div className="slider-handle"></div>
            <div className="slider-handle"></div>
          </Slider>
          <span className="slide-value pull-left">${filters.start_price}</span>
          <span className="slide-value pull-right">${filters.end_price}</span>
        </div>
      </div>
      <div className="more-filter">
        <span onClick={handleExpandClick} aria-expanded={state.expanded}>
          {state.expanded ? (
            <Close className="close-icon" />
          ) : (
            <span className="show-filter">Show more filters</span>
          )}
        </span>
      </div>
      <Collapse in={state.expanded} timeout="auto" unmountOnExit>
        <div className="row">
          <div className="col l4 s12 mt20lg">
            <div className="filter-label">Kid Friendly:</div>
            <FormControl className="selectField">
              <InputLabel htmlFor="select-multiple"></InputLabel>
              <Select
                value={filters.kid_friendly ? filters.kid_friendly : ''}
                onChange={event => updateFilters('kid_friendly', event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                displayEmpty
                className="selected-menu-field">
                <MenuItem
                  value={filters.kid_friendly ? filters.kid_friendly : ''}
                  disabled>
                  Select
                </MenuItem>
                {basicFilters.map(data => (
                  <MenuItem key={`kid-${data[0]}`} value={data[0]}>
                    {data[1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col l4 s12 mt20lg">
            <div className="filter-label">Pets:</div>
            <FormControl className="selectField">
              <InputLabel htmlFor="select-multiple"></InputLabel>
              <Select
                value={filters.pets ?? ''}
                onChange={event => updateFilters('pets', event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                displayEmpty
                className="selected-menu-field">
                <MenuItem value={filters.pets ?? ''} disabled>
                  Select
                </MenuItem>
                {basicFilters.map(data => (
                  <MenuItem key={`pet-${data[0]}`} value={data[0]}>
                    {data[1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col l4 s12">
            <div className="filter-label">Smoking:</div>
            <FormControl className="selectField">
              <InputLabel htmlFor="select-multiple"></InputLabel>
              <Select
                value={filters.smoking ?? ''}
                onChange={event => updateFilters('smoking', event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                displayEmpty
                className="selected-menu-field">
                <MenuItem value={filters.smoking ?? ''} disabled>
                  Select
                </MenuItem>
                {basicFilters.map(data => (
                  <MenuItem key={`smoke-${data[0]}`} value={data[0]}>
                    {data[1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="row">
          <div className="col l4 s12">
            <div className="filter-label">Car AC:</div>
            <FormControl className="selectField">
              <InputLabel htmlFor="select-multiple"></InputLabel>
              <Select
                value={filters.car_ac ?? ''}
                onChange={event => updateFilters('car_ac', event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                displayEmpty
                className="selected-menu-field">
                <MenuItem value={filters.car_ac ?? ''} disabled>
                  Select
                </MenuItem>
                {basicFilters.map(data => (
                  <MenuItem key={`carAc-${data[0]}`} value={data[0]}>
                    {data[1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col l4 s12">
            <div className="filter-label">Drive Type:</div>
            <FormControl className="selectField">
              <InputLabel htmlFor="select-multiple"></InputLabel>
              <Select
                value={filters.drive_type ?? ''}
                onChange={event => updateFilters('drive_type', event)}
                input={<Input id="select-multiple" />}
                MenuProps={MenuProps}
                displayEmpty
                className="selected-menu-field">
                <MenuItem value={filters.drive_type ?? ''} disabled>
                  Select
                </MenuItem>
                {driveType.map(data => (
                  <MenuItem key={data[0]} value={data[0]}>
                    {data[1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </Collapse>
    </>
  )
}

export default SearchFilter
