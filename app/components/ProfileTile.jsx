import React, {Component} from "react";
import {Link} from "react-router";

import "./ProfileTile.css";

class ProfileTile extends Component {
  render() {
    const {classes, filterUrl, item} = this.props;

    // get truncated name & label id
    let titleTruncated = null;
    let labelId = "";
    if (item) {
      titleTruncated = item.name;
      labelId = `${item.name}-label`;
    }

    return (
      <div className={`profile-tile ${classes || ""}`}>
        <Link
          className="cover-link"
          to={item.url}
          title={item.name}
          aria-labelledby={labelId}
        />
        <span className="tile-inner" id={labelId}>
          {/* profile title */}
          <span className="tile-title title font-xs">
            {titleTruncated ? titleTruncated : item.name}
          </span>
        </span>

        {/* explore filter button */}
        {filterUrl &&
          <Link to={filterUrl} className="filter-button font-xxs">
            <span className="filter-button-icon pt-icon pt-icon-multi-select" />
            <span className="filter-button-text inverted-link">
              related profiles
            </span>
          </Link>
        }

        {/* background image */}
        <img className="tile-img" src={`/api/image/${item.id}/thumb`} alt="" />
      </div>
    );
  }
}

export default ProfileTile;
