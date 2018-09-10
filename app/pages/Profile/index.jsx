import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import Stat from "./components/Stat";
import "./index.css";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {meta} = this.props;
    const location = meta.name;
    const {population} = this.props;
    const {diabetes} = this.props;

    return (
      <div>
        <h1> {location} </h1>
        <Stat 
          title="Population"
          value={population.data[0]["Total Population"]}
        />
        <Stat 
          title="Diabetes Rate"
          value={diabetes.data[0]["Diabetes Data Value"]}
        />
      </div>
    );
  }
}

Profile.need = [
  fetchData("diabetes", "/api/data?measures=Diabetes%20Data%20Value&City=<id>"),
  fetchData("meta", "/api/search?id=<id>"),
  fetchData("population", "https://canon.datausa.io/api/data?measures=Total%20Population&Geography=<id>&year=latest")
];

const mapStateToProps = state => ({
  diabetes: state.data.diabetes,
  meta: state.data.meta,
  population: state.data.population
});

export default connect(mapStateToProps)(Profile);
