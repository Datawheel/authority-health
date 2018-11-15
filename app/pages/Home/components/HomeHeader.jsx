import React, {Component} from "react";
import Search from "components/Search";
import {Link} from "react-router";
import "./HomeHeader.css";

export default class HomeHeader extends Component {

  render() {
    return (
      <div className="home-header header" role="banner">
        <div className="home-header-inner">
          {/* intro text & search */}
          <div className="home-header-intro">
            <h1 className="home-header-headline font-xxl">Get to know  Wayne County</h1>
            <p className="home-header-intro-text font-lg">
              View our challenges, embrace our strengths, and engage with our opportunities.&thinsp;
              <Link className="home-header-intro-link font-sm u-uppercase" to="/about">
                learn more<span className="pt-icon pt-icon-chevron-right" />
                <span className="u-visually-hidden"> about data in Wayne County, Michigan</span>
              </Link>
            </p>

            <label className="label font-sm" htmlFor="home-search">Search places</label>
            <Search
              id="home-search"
              className="home-search"
              placeholder="i.e., Woodhaven, Romulus, Wayne&hellip;"
              primary={true}
              resultLink={ d => `/profile/${d.geoid}` }
              resultRender={d =>
                <a className="result-link" href={`/profile/${d.geoid}`}>
                  { d.name }
                </a>}
                url="/api/search/"
            />
          </div>

          {/* map */}
          <div className="home-header-map">
            {/* Wayne county map */}
            {/* TODO: replace with d3plus map */}
            <img className="home-header-wayne-map"
              src="/images/wayne-county-map/wayne-map-pacific.png"
              srcSet="/images/wayne-county-map/wayne-map-pacific.png 1x, /images/wayne-county-map/wayne-map-pacific@2x.png 2x"
              alt=""/>
            {/* zoomed out bg map */}
            <img className="home-header-michigan-map"
              src="/images/wayne-county-map/michigan-map.png"
              srcSet="/images/wayne-county-map/michigan-map.svg 1x"
              alt=""/>
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
