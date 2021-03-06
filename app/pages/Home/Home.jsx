import React, {Component} from "react";
import HomeHeader from "./components/HomeHeader";
import ProfileTileList from "../../components/ProfileTileList";
import MapCardList from "../../components/MapCardList";
import "./Home.css";

export default class Home extends Component {

  render() {
    return (
      <div className="home dark-theme">
        <HomeHeader />
        <ProfileTileList />
        <MapCardList />
      </div>
    );
  }
}
