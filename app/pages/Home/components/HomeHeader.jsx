import React, {Component} from "react";
import Search from "components/Search";
import {Link} from "react-router";
import "./HomeHeader.css";

export default class Home extends Component {

  render() {
    return (
      <div className="home-header header" role="banner">

        {/* intro text & search */}
        <div className="home-header-intro">
          <h1 className="home-header-headline">Get to know  Wayne County</h1>
          <p className="home-header-intro-text">View our challenges, embrace our strengths, and engage with our opportunities. <Link to="/about">learn more</Link></p>
          <Search
            className="home-search"
            placeholder="ex. Woodhaven, Romulus, Wayne"
            primary={true}
            resultLink={ d => `/profile/${d.geoid}` }
            resultRender={d =>
              <a className="result-container" href = {`/profile/${d.geoid}`}>
                { d.name }
              </a>}
              url="/api/search/"
          />
        </div>

        {/* map */}
        <div className="home-header-map">
          <img src="/images/wayne-county-map/wayne-map.svg" alt=""/>
        </div>

      </div>
    );
  }
}
