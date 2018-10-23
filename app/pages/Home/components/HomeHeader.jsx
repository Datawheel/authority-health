import React, {Component} from "react";
import Search from "components/Search";
import "./HomeHeader.css";

export default class Home extends Component {

  render() {
    return (
      <div className="home-header header" role="banner">
        Header

        <Search
          className="home-search"
          placeholder="ex. Woodhaven, Romulus, Wayne"
          primary={true}
          resultLink={ d => `/profile/${d.geoid}` }
          resultRender={d =>
            <a className="result-container" href = {`/profile/${d.geoid}`}>
              { d.name }
            </a>}
          url="/api/search/"
        />
      </div>
    );
  }
}
