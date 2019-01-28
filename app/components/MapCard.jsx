import React, {Component} from "react";
import {Link} from "react-router";

import "./MapCard.css";

class MapCard extends Component {
  render() {
    const {classes, item, t} = this.props;

    const labelId = item.icon;

    // console.log(item);

    return (
      <div className={`map-card ${classes || ""}`}>
        <Link
          className="cover-link"
          to={item.url}
          title={item.name}
          aria-labelledby={labelId}
        />
        <div className="map-card-icon">
          <img className="map-card-icon-img" src={`images/icons/${item.icon}.png`} srcSet={`images/icons/${item.icon}.svg`} alt=""/>
        </div>
        <span className="map-card-caption font-xs">
          {/* profile title */}
          <span className="map-card-title title" id={labelId}>
            {item.name}
          </span>
          <span className="map-card-subtitle">{item.subtitle}</span>
        </span>
      </div>
    );
  }
}

export default MapCard;
