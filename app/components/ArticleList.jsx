import React, {Component} from "react";
import {Link} from "react-router";
import ArticleLink from "./ArticleLink";
import "./ArticleList.css";

export default class ArticleList extends Component {

  render() {

    // TODO: use real data
    const articles = [
      {
        name: "Article title",
        date: "June 17, 2018"
      },
      {
        name: "Another article with a very long title that wraps",
        date: "February 9, 2018"
      },
      {
        name: "Another short article title",
        date: "September 13, 2017"
      }
    ];

    // loop through data and create corresponding tiles
    const articleList = articles.map(article =>
      <ArticleLink key={article.icon} item={article} classes="g-col g-4" />
    );

    return (
      <div className="profile-tile-section section-container u-padding-top-off">

        <div className="profile-tile-header">
          <h2>News & insights</h2>
          {/* explore map link */}
          {/* TODO: make it functional */}
          <Link className="profile-tile-link link font-xs u-uppercase">
            Explore map data
            <span className="profile-tile-link-icon pt-icon pt-icon-compass" />
          </Link>
        </div>

        <div className="profile-tile-list g-container">
          {articleList}
        </div>
      </div>
    );
  }
}
