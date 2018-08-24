import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import "./index.css";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {meta} = this.props;
    const location = meta.name;

    return (
      <div>
        <h1> {location} </h1>
      </div>
    );
  }
}

Profile.need = [
  fetchData("meta", "/api/search?id=<id>")
];

export default connect(state => ({meta: state.data.meta}))(Profile);
