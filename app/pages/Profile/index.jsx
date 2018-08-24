import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import "./index.css";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    
    const {locations} = this.props;
    const location = locations.name;

    return (
      <div>
        <h1> {location} </h1>
      </div>
    );
  }
}

Profile.need = [
  fetchData("profiles", "/api/search?id=<id>")
];

export default connect(state => ({locations: state.data.profiles}))(Profile);
