import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import {AnchorLink} from "@datawheel/canon-core";
import {PROFILE_SECTIONS} from "utils/consts.js";
import "./Subnav.css";

export default class Subnav extends Component {
  render() {
    return (
      <nav className="subnav">
        <ul className="subnav-list u-list-reset">
          {PROFILE_SECTIONS.map(section =>
            <li className="subnav-item" key={`${section.link}-anchor-link`}>
              <AnchorLink to={section.link} className="subnav-link link title">
                <Icon className="subnav-icon" iconName={section.icon} />
                <span className="subnav-text u-hide-below-md">{section.title}</span>
              </AnchorLink>
            </li>
          )}
        </ul>
      </nav>
    );
  }
}
