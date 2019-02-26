import React, {Component} from "react";
import {Icon} from "@blueprintjs/core";
import {AnchorLink} from "@datawheel/canon-core";
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

        {/* profile section anchor links */}
        <div className="profile-header-sections">
          <AnchorLink to="health-conditions" className="section-header-anchor">
            <Icon iconName="pulse" />
            Health Conditions
          </AnchorLink>
          <AnchorLink to="health-behaviors" className="section-header-anchor">
            <Icon iconName="heart" />
            Health Behaviors
          </AnchorLink>
          <AnchorLink to="access-to-care" className="section-header-anchor">
            <Icon iconName="office" />
            Access to Care
          </AnchorLink>
          <AnchorLink to="food-access" className="section-header-anchor">
            <Icon iconName="shop" />
            Food Access
          </AnchorLink>
          <AnchorLink to="economy" className="section-header-anchor">
            <Icon iconName="bank-account" />
            Economy
          </AnchorLink>
          <AnchorLink to="education" className="section-header-anchor">
            <Icon iconName="lightbulb" />
            Education
          </AnchorLink>
          <AnchorLink to="built-social-environment" className="section-header-anchor">
            <Icon iconName="home" />
            Built/Social Environment
          </AnchorLink>
          <AnchorLink to="natural-environment" className="section-header-anchor">
            <Icon iconName="tree" />
            Natural Environment
          </AnchorLink>
          <AnchorLink to="special-population" className="section-header-anchor">
            <Icon iconName="people" />
            Special Population
          </AnchorLink>
        </div>

        <div className="profile-header-background">
          <img className="profile-header-background-img" src={`/api/image/${id}/splash`} alt=""/>
        </div>
      </div>
    );
  }
}
