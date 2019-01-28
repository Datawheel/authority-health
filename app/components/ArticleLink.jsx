import React, {Component} from "react";
import {Link} from "react-router";

import "./ArticleLink.css";

class ArticleLink extends Component {
  render() {
    const {classes, item, t} = this.props;

    // console.log(item);

    return (
      <Link
        className={`article-link ${classes || ""}`}
        to={item.url}
      >
        {/* article title */}
        <span className="article-link-title title font-sm">
          {item.name}
        </span>
        {/* screen reader text */}
        <span className="u-visually-hidden">, posted on </span>
        {/* date */}
        <span className="article-link-meta font-xs">
          {item.date}
        </span>
      </Link>
    );
  }
}

export default ArticleLink;
