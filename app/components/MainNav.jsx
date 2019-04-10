import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import Search from "components/Search";
import "./MainNav.css";

class MainNav extends Component {

  render() {
    const {bg} = this.props;
    const {router} = this.context;
    const search = router.location.pathname !== "/";
    return (
      <nav className={ `main-nav${ bg ? " solid" : "" }` } role="nav">
        <div className="main-nav-inner">
          <Link className="main-nav-logo-link" to="/">
            <img className="main-nav-logo-img" src="/images/authority-health-logo.png" srcSet="/images/authority-health-logo.svg 1x" alt=""/>
            <span className="u-visually-hidden">Authority Health</span>
          </Link>

          {search && <Search
            className="nav-search u-hide-below-sm"
            placeholder="Search locations&hellip;"
            primary={true}
            resultLink={ d => `/profile/${d.id}` }
            resultRender={d =>
              <a className="result-link" href={`/profile/${d.id}`}>
                { d.name }
              </a>}
            url="/api/search/"
          />}

          <ul className="main-nav-list u-list-reset font-xs">
            <li className="main-nav-item">
              <Link to="/profile/05000US26163" className="main-nav-link">Locations</Link>
            </li>

            <li className="main-nav-item">
              <Link to="/charts" className="main-nav-link">Charts</Link>
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
