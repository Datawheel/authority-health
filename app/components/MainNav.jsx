import React, {Component} from "react";
import {Link} from "react-router";
import "./MainNav.css";

export default class MainNav extends Component {

  render() {
    const search = false;
    return (
      <nav className="main-nav" role="nav">
        <div className="main-nav-inner">
          <Link to="/">
            <img src="/images/authority-health-logo.png" srcSet="/images/authority-health-logo.svg 1x" alt=""/>
            <span className="u-visually-hidden">AuthorityHealth</span>
          </Link>

          {/* TODO: true everywhere but home page */}
          {/* TODO: replace with actual search component */}
          {search && <span>search</span>}

          <ul className="main-nav-list u-list-reset font-xs">
            <li className="main-nav-item">
              <Link to="/profiles/locations" className="main-nav-link">Locations</Link>
            </li>

            <li className="main-nav-item">
              <Link to="/map" className="main-nav-link">Map</Link>
            </li>

            <li className="main-nav-item">
              <Link to="/about" className="main-nav-link">About</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}
