import React, {Component} from "react";
import LazyLoad from "react-lazyload";
import {Link} from "react-router";
import {translate} from "react-i18next";
import ReactImageFallback from "react-image-fallback";

import "./ProfileTile.css";

class ProfileTile extends Component {
  render() {
    const {classes, filterUrl, item, t} = this.props;

    // get truncated name & label id
    let titleTruncated = null;
    let labelId = "";
    if (item) {
      titleTruncated = item.name;
      labelId = `${item.name}-label`;
    }

    // console.log(item);

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
              {" "}{t("related profiles")}
            </span>
          </Link>
        }

        {/* background image */}
        <LazyLoad offset={100}>
          <ReactImageFallback
            className="tile-img"
            src={`/images/${item.url}-thumb.jpg`}
            fallbackImage={
              item.parentUrl
                ? `/images/${item.parentUrl}-thumb.jpg`
                : "/images/profiles/places/detroit-thumb.jpg"
            }
            alt=""
          />
        </LazyLoad>
      </div>
    );
  }
}

export default translate()(ProfileTile);
