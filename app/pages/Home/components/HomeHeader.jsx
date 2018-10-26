import React, {Component} from "react";
import Search from "components/Search";
import {Link} from "react-router";
import "./HomeHeader.css";

export default class Home extends Component {

  render() {
    return (
      <div className="home-header header" role="banner">
        <div className="home-header-inner">
          {/* intro text & search */}
          <div className="home-header-intro">
            <h1 className="home-header-headline font-xxl">Get to know  Wayne County</h1>
            <p className="home-header-intro-text font-lg">
              View our challenges, embrace our strengths, and engage with our opportunities.
              <Link className="home-header-intro-link font-sm u-uppercase" to="/about">
                learn more<span className="pt-icon pt-icon-chevron-right" />
                <span className="u-visually-hidden"> about data in Wayne County, Michigan</span>
              </Link>
            </p>
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
          {/* TODO: add other map image */}
          <div className="home-header-map">
            <img src="/images/wayne-county-map/wayne-map.svg" alt=""/>
          </div>
        </div>

        {/* bg image */}
        <div className="home-header-background">
          <img className="home-header-background-img" src="/images/profiles/places/detroit.jpg" alt=""/>
        </div>
      </div>
    );
  }
}
