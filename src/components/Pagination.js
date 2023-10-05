import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import * as actions from '../actions'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import missingImg from '../images/missing.png'


class Pagination extends Component {

    constructor (props) {
    super(props)
    this.state = {
      current_page: this.props.current_page,
      page_count: this.props.total_pages,
      per_page: this.props.per_page,
      ride_count: this.props.total_count,
      page_click_cb: this.props.onPageNumClick
    }
  }
  
  static getDerivedStateFromProps(props, state) {
    let update = {}
    return update
  }

  renderPage(page_num){
    console.log(`render page ${page_num}`)
    return <li key={"page"+page_num} className={page_num === this.props.current_page ? "active" : "waves-effect"}>
                    {/* eslint-disable-next-line */}
             <a href="javascript:void(0)" onClick={(e) => this.props.onPageNumClick(e, page_num)}>{page_num}</a>
           </li>
  }
  renderSkip() {
    return <li>...</li>
  }
  renderPagination(){
    // return <li>"..."</li>
    const cnt = Math.max(this.props.total_pages, 1)
    const current = this.props.current_page
    if(cnt < 6){
      let result =  [...Array(cnt-1).keys()].map(
        x => this.renderPage(x+1)
      );
      return result
    }
    let pages = new Set()
    pages.add(1)
    if(current > 3)
      pages.add("... ");
    if(current - 1 > 0)
      pages.add(current - 1);
    
    pages.add(current);
    if(current + 1 < cnt)
      pages.add(current + 1);
    
    if(current + 2 < cnt)
      pages.add(" ...")
    pages.add(cnt);
    let pages_a = [...pages]
    
    let last = 0;
    let res = pages_a.map((x) => {
       if(x == " ..." || x == "... ")
        return this.renderSkip();
       else
        return this.renderPage(x);
    });
    return res
  }
  
  
  render () {
    return <ul className="pagination">
      {this.renderPagination()}
    </ul> 
  }

}
export default Pagination
