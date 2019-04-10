import React, {Component} from "react";
import {Link} from "react-router";
import MapCard from "./MapCard";
import "./MapCardList.css";

export default class MapCardList extends Component {

  render() {

    const maps = [
      {
        name: "Economy",
        icon: "economy",
        subtitle: "Child food insecurity",
        link: "/charts?enlarged=c-geomap-1Fhy7q-2iY6oK-Child&groups=0-1Fhy7q&groups=1-2iY6oK-Child&measure=Z20M7DB"
      },
      {
        name: "Demographics",
        icon: "demographics",
        subtitle: "Grandparent caregivers",
        link: "/charts?groups=0-11TnWl-05000US26163&groups=1-Z2hp8qX&measure=1FaqjD"
      },
      {
        name: "Poverty",
        icon: "poverty",
        subtitle: "Poverty by school attainment",
        link: "/charts?groups=0-26N2qd-05000US26163&groups=1-1H1u08&groups=2-oBXTS-0&measure=1S4Nnj"
      },
      {
        name: "Education",
        icon: "education",
        subtitle: "Educational attainment",
        link: "/charts?groups=0-Z2oELM1-05000US26163&groups=1-1Pts5o&measure=Z1D4vNo"
      },
      {
        name: "Housing & transportation",
        icon: "housing",
        subtitle: "Michigan county rent prices",
        link: "/charts?groups=0-ZcdIId&measure=Q87wG"
      },
      {
        name: "Environment, health & safety",
        icon: "environment",
        subtitle: "Air quality over time",
        link: "/charts?groups=0-MTObb&measure=SPl5w"
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
          {/* vizbuilder link */}
          <Link className="profile-tile-link link font-xs u-uppercase" to="/charts">
            Make custom charts
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
