import React, { useState } from 'react'
import { Link, withRouter } from 'react-router-dom'

import missingImg from '../images/missing.png'



const Pagination = (props) => {    

  const initial_state = {
    current_page: props.current_page,
    page_count: props.total_pages,
    per_page: props.per_page,
    ride_count: props.total_count,
    page_click_cb: props.onPageNumClick
  }

  const [state, setState] = useState(initial_state)
  
  // static getDerivedStateFromProps(props, state) {
  //   let update = {}
  //   return update
  // }

  const renderPage = (page_num) => {
    console.log(`render page ${page_num}`)
    return <li key={"page"+page_num} className={page_num === props.current_page ? "active" : "waves-effect"}>
                    {/* eslint-disable-next-line */}
             <a href="javascript:void(0)" onClick={(e) => props.onPageNumClick(e, page_num)}>{page_num}</a>
           </li>
  }
  
  const renderSkip= () => {
    return <li>...</li>
  }
  const renderPagination = () => {
    // return <li>"..."</li>
    const cnt = Math.max(props.total_pages, 1)
    const current = props.current_page
    if(cnt < 6){
      let result =  [...Array(cnt-1).keys()].map(
        x => renderPage(x+1)
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
        return renderSkip();
       else
        return renderPage(x);
    });
    return res
  }
  
  
  return <ul className="pagination">
    {renderPagination()}
  </ul> 
}
export default Pagination
