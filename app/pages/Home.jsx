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
          resultRender={d => <div className="result-container">
            <div className="result-text">
              <div className="title">{ d.name }</div>
            </div>
          </div>}
          url="/api/search/"
        />
      </div>
    );
  }

}
