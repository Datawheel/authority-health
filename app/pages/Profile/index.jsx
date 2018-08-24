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
    const location = locations.find(location => location.geoid === this.props.router.params.id).name;
    return (
      <div>
        <h1> {location} </h1>
      </div>
    );
  }
}

Profile.need = [
  fetchData("profiles", "/api/search")
];  

export default connect(state => ({locations: state.data.profiles}))(Profile);
