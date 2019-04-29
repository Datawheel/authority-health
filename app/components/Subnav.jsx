import React, {Component} from "react";
import PropTypes from "prop-types";
import {Icon} from "@blueprintjs/core";
import {AnchorLink} from "@datawheel/canon-core";
import {PROFILE_SECTIONS} from "utils/consts.js";
import "./Subnav.css";

class Subnav extends Component {
  constructor() {
    super();
    this.state = {
      currentSection: "home"
    };
  }

  selectSection(e) {
    const {router} = this.context;
    const hash = e.target.value;
    router.push({
      ...router.location,
      state: "HASH",
      hash: `#${hash}`
    });
    this.setState({currentSection: hash});

    // this.context.router.replace(`/profile/16000US2622000#${e.target.value}`);
  }

  render() {
    const {currentSection} = this.state;

    return (
      <nav className="subnav">
        {/* list of icons (big screens) */}
        <ul className="subnav-list u-list-reset u-hide-below-md">
          {PROFILE_SECTIONS.map(section =>
            <li className="subnav-item" key={`${section.link}-anchor-link`}>
              <AnchorLink to={section.link} className="subnav-link link title">
                <Icon className="subnav-icon" iconName={section.icon} />
                <span className="subnav-text u-hide-below-md">{section.title}</span>
              </AnchorLink>
            </li>
          )}
        </ul>
        {/* select menu (small screens) */}
        <label className="subnav-select-label font-md">
          <span className="subnav-select-text">Scroll to section </span>
          <select
            className="subnav-select u-hide-above-md"
            onChange={e => this.selectSection(e)}
            value={currentSection}
          >
            {PROFILE_SECTIONS.map(section =>
              <option key={`${section.link}-option-link`} value={section.link}>
                {section.title}
              </option>
            )}
          </select>
        </label>
      </nav>
    );
  }
}

Subnav.contextTypes = {
  router: PropTypes.object
};

export default Subnav;
