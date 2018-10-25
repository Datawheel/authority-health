import React, {Component} from "react";
import ProfileTile from "./ProfileTile";
// import "./ProfileTileList.css";

export default class ProfileTileList extends Component {

  render() {

    // TODO: use real data
    const profiles = [
      {
        name: "Detroit",
        url: "profiles/places/detroit"
      },
      {
        name: "Romulus",
        url: "profiles/places/romulus"
      },
      {
        name: "Livonia",
        url: "profiles/places/livonia"
      },
      {
        name: "Dearborn heights",
        url: "profiles/places/dearborn-heights"
      }
    ];

    // loop through data and create corresponding tiles
    const tiles = profiles.map(profile =>
      <ProfileTile key={profile.name} item={profile} />
    );

    return (
      <div className="home-profile-tiles">
        Profiles

        {tiles}
      </div>
    );
  }
}
