import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
import Stat from "./components/Stat";
import {formatAbbreviate} from "d3plus-format";
import "./index.css";

import FoodAccess from "./components/FoodAccess";

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
        <TopicTitle slug="food">Food</TopicTitle>
        <h1> {location} </h1>
        <Stat
          title="Population"
          value={formatAbbreviate(population.data[0].Population)}
        />
        <Stat
          title="Diabetes Rate"
          value={`${diabetes.data[0]["Diabetes Data Value"]}%`}
        />
        <FoodAccess />
      </div>
    );
  }
}

Profile.need = [
  FoodAccess,
  fetchData("diabetes", "/api/data?measures=Diabetes%20Data%20Value&City=<id>&Year=latest"),
  fetchData("meta", "/api/search?id=<id>"),
  fetchData("population", "https://canon.datausa.io/api/data?measures=Population&Geography=<id>&year=latest")
];

const mapStateToProps = state => ({
  diabetes: state.data.diabetes,
  meta: state.data.meta,
  population: state.data.population
});

export default connect(mapStateToProps)(Profile);
