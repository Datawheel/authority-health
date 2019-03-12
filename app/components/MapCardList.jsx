import React, {Component} from "react";
import {Link} from "react-router";
import MapCard from "./MapCard";
import "./MapCardList.css";

export default class MapCardList extends Component {

  render() {

    // TODO: use real data
    const maps = [
      {
        name: "Economy",
        icon: "economy",
        subtitle: "Income per capita",
        link: "/charts"
      },
      {
        name: "Demographics",
        icon: "demographics",
        subtitle: "Population",
        link: "/charts"
      },
      {
        name: "Poverty",
        icon: "poverty",
        subtitle: "Public assistance",
        link: "/charts"
      },
      {
        name: "Education",
        icon: "education",
        subtitle: "Educational attainment",
        link: "/charts"
      },
      {
        name: "Housing & transportation",
        icon: "housing",
        subtitle: "Occupancy status",
        link: "/charts"
      },
      {
        name: "Environment, health & safety",
        icon: "environment",
        subtitle: "Median household income",
        link: "/charts"
      }
    ];

    // loop through data and create corresponding tiles
    const tiles = maps.map(tile =>
      <MapCard key={tile.icon} item={tile} classes="g-col g-4" link={tile.link} />
    );

    return (
      <div className="profile-tile-section section-container u-padding-top-off">

        <div className="profile-tile-header">
          <h2>Custom charts</h2>
          {/* explore map link */}
          <Link className="profile-tile-link link font-xs u-uppercase" to="/charts">
            Explore map data
            <span className="profile-tile-link-icon pt-icon pt-icon-compass" />
          </Link>
        </div>

        <div className="profile-tile-list g-container">
          {tiles}
        </div>
      </div>
    );
  }
}
