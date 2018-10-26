import React, {Component} from "react";
import HomeHeader from "./components/HomeHeader";
import ProfileTileList from "../../components/ProfileTileList";
import MapCardList from "../../components/MapCardList";
import "./Home.css";

export default class Home extends Component {

  render() {

    // <ProfileTile key={item.name} item={item} classes="g-col g-3" />

    return (
      <div className="home dark-theme">
        <HomeHeader />
        <ProfileTileList />
        <MapCardList />
        {/* TODO: articles component */}
      </div>
    );
  }
}
