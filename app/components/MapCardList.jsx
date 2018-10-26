import React, {Component} from "react";
import MapCard from "./MapCard";
import {Link} from "react-router";
import "./MapCardList.css";

export default class MapCardList extends Component {

  render() {

    // TODO: use real data
    const maps = [
      {
        name: "Economy",
        icon: "economy",
        subtitle: "Income per capita"
      },
      {
        name: "Demographics",
        icon: "demographics",
        subtitle: "Population"
      },
      {
        name: "Poverty",
        icon: "poverty",
        subtitle: "Public assistance"
      },
      {
        name: "Education",
        icon: "education",
        subtitle: "Educational attainment"
      },
      {
        name: "Housing & transportation",
        icon: "housing",
        subtitle: "Occupancy status"
      },
      {
        name: "Environment, health & safety",
        icon: "environment",
        subtitle: "Median household income"
      }
    ];

    // loop through data and create corresponding tiles
    const tiles = maps.map(map =>
      <MapCard key={map.icon} item={map} classes="g-col g-4" />
    );

    return (
      <div className="profile-tile-section section-container u-padding-top-off">

        <div className="profile-tile-header">
          <h2>Interactive Maps</h2>
          {/* explore map link */}
          {/* TODO: make it functional */}
          <Link className="profile-tile-link link font-xs u-uppercase">
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
