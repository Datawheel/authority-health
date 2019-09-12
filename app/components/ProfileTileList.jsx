import React, {Component} from "react";
import ProfileTile from "./ProfileTile";
import "./ProfileTileList.css";

export default class ProfileTileList extends Component {

  render() {

    const profiles = [
      {
        name: "Wayne County",
        id: "05000US26163"
      },
      {
        name: "Detroit",
        id: "16000US2622000"
      },
      {
        name: "Dearborn",
        id: "16000US2621000"
      },
      {
        name: "Livonia",
        id: "16000US2649000"
      },
      {
        name: "Westland",
        id: "16000US2686000"
      },
      {
        name: "Taylor",
        id: "16000US2679000"
      },
      {
        name: "Dearborn Heights",
        id: "16000US2621020"
      },
      {
        name: "Lincoln Park",
        id: "16000US2647800"
      }
    ];

    return (
      <div className="profile-tile-section section-container u-padding-top-off">

        <div className="profile-tile-header">
          <h2>Top locations</h2>
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
