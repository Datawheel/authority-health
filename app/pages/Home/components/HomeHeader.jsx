import React, {Component} from "react";
import Search from "components/Search";
import {Link} from "react-router";
import {Button} from "@blueprintjs/core";
import "./HomeHeader.css";

export default class HomeHeader extends Component {

  render() {
    return (
      <div className="home-header header" role="banner">
        <div className="home-header-inner">
          {/* intro text & search */}
          <div className="home-header-intro">
            <h1 className="home-header-headline font-xxxl">Get to know<br />Wayne County</h1>
            <p className="home-header-intro-text font-lg">
            Explore how social factors influence health, and discover the resources available to our communities.&thinsp;
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
              resultLink={ d => `/profile/${d.id}` }
              resultRender={d =>
                <a className="result-link" href={`/profile/${d.id}`}>
                  { d.name }
                </a>}
              url="/api/search/"
            />
            <a href="http://navigateresources.net/tici/" className="portal-button" target="_blank" rel="noopener noreferrer">
              <Button className="glossary-button pt-minimal font-xxs" iconName="book">
                Community Resource Portal
              </Button>
            </a>
          </div>

          {/* map */}
          <div className="home-header-map">
            {/* Wayne county map */}
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
          <img className="home-header-background-img" src="/images/profile/splash/76.jpg" alt=""/>
        </div>
      </div>
    );
  }
}
