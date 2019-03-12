import React, {Component} from "react";
import ProfileTile from "./ProfileTile";
import {Link} from "react-router";
import {Tabs2, Tab2} from "@blueprintjs/core";
import "./ProfileTileList.css";

export default class ProfileTileList extends Component {

  render() {

    // TODO: use real data
    const profiles = [
      {
        name: "Detroit",
        id: "16000US2622000"
      },
      {
        name: "Romulus",
        id: "16000US2669420"
      },
      {
        name: "Livonia",
        id: "16000US2649000"
      },
      {
        name: "Dearborn heights",
        id: "16000US2621020"
      }
    ];

    return (
      <div className="profile-tile-section section-container u-padding-top-off">

        <div className="profile-tile-header">
          <h2>Location profiles</h2>
          {/* TODO: make tabs update tiles */}
          {/*<Tabs2>
            <Tab2 title="places" id="profile-tile-places" />
            <Tab2 title="zip codes" id="profile-tile-zip-codes" />
            <Tab2 title="tracts" id="profile-tile-tracts" />
          </Tabs2>*/}
          {/* random location link */}
          {/* TODO: make it functional */}
          <Link className="profile-tile-link link font-xs u-uppercase" to="/profile/16000US2622000">
            Random location
            <span className="profile-tile-link-icon pt-icon pt-icon-random" />
          </Link>
        </div>

        <div className="profile-tile-list g-container">
          {profiles.map(profile =>
            <ProfileTile key={profile.name} item={profile} classes="g-col g-3" />
          )}
        </div>
      </div>
    );
  }
}
