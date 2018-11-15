import React, {Component} from "react";
import Stat from "../../../components/Stat";
import "./ProfileHeader.css";

export default class ProfileHeader extends Component {

  render() {

    const { diabetes, population, title } = this.props;

    return (
      <div className="profile-header header dark-theme" role="banner">
        <div className="profile-header-inner">
          {/* profile title & stats */}
          <div className="profile-header-intro">
            <h1 className="profile-header-headline font-xxl">
              {title ? title : "Error: missing meta prop in Profile.jsx"}
            </h1>
            {/* show splash stats if we got 'em */}
            {population &&
              <Stat title="Population" value={ population } />
            }
            {diabetes &&
              <Stat title="Diabetes Rate" value={ diabetes } />
            }
          </div>

          {/* map */}
          {/* NOTE: copied in from home page for now */}
          {/* TODO: replace with d3plus map */}
          <div className="profile-header-map">
            {/* Wayne county map */}
            <img className="profile-header-wayne-map"
              src="/images/wayne-county-map/wayne-map-pacific.png"
              srcSet="/images/wayne-county-map/wayne-map-pacific.png 1x, /images/wayne-county-map/wayne-map-pacific@2x.png 2x"
              alt=""/>
            {/* zoomed out bg map */}
            <img className="profile-header-michigan-map"
              src="/images/wayne-county-map/michigan-map.png"
              srcSet="/images/wayne-county-map/michigan-map.svg 1x"
              alt=""/>
          </div>
        </div>

        {/* bg image */}
        {/* TODO: replace with profile image */}
        <div className="profile-header-background">
          <img className="profile-header-background-img" src="/images/profiles/places/detroit.jpg" alt=""/>
        </div>
      </div>
    );
  }
}
