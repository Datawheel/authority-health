import React, {Component} from "react";
import Search from "components/Search";
import "./Home.css";

export default class Home extends Component {

  render() {
    return (
      <div id="Home">
        <Search
          className="home-search"
          placeholder="ex. Woodhaven, Romulus, Wayne"
          primary={true}
          resultLink={ d => `/profile/${d.geoid}` }
          resultRender={d => <a className="result-container" href = {`/profile/${d.geoid}`}>
            <div className="result-text">
              <div className="title">{ d.name }</div>
            </div>
          </a>}
          url="/api/search/"
        />
      </div>
    );
  }

}
