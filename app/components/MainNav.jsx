import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import "./MainNav.css";

class MainNav extends Component {

  render() {
    const {router} = this.context;
    const search = false;
    const dark = ["charts"].includes(router.location.pathname);
    return (
      <nav className={ `main-nav ${ dark ? "dark" : "" }` } role="nav">
        <div className="main-nav-inner">
          <Link className="main-nav-logo-link" to="/">
            <img className="main-nav-logo-img" src="/images/authority-health-logo.png" srcSet="/images/authority-health-logo.svg 1x" alt=""/>
            <span className="u-visually-hidden">AuthorityHealth</span>
          </Link>

          {/* TODO: replace with actual search component */}
          {search && <span>search</span>}

          <ul className="main-nav-list u-list-reset font-xs">
            <li className="main-nav-item">
              <Link to="/profiles/locations" className="main-nav-link">Locations</Link>
            </li>

            <li className="main-nav-item">
              <Link to="/charts" className="main-nav-link">Chart Builder</Link>
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

MainNav.contextTypes = {
  router: PropTypes.object
};

export default MainNav;
