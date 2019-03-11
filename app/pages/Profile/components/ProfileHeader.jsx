import React, {Component} from "react";
import "./ProfileHeader.css";

export default class ProfileHeader extends Component {
  render() {
    const {id, title} = this.props;

    return (
      <div className="profile-header header dark-theme" role="banner">

        {/* profile title */}
        <div className="profile-header-inner">
          <div className="profile-header-intro">
            <h1 className="profile-header-headline font-xxl">{ title }</h1>
          </div>
        </div>

        <div className="profile-header-background">
          <img className="profile-header-background-img" src={`/api/image/${id}/splash`} alt=""/>
        </div>
      </div>
    );
  }
}
