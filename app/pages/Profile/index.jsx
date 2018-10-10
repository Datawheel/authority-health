import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
// import Stat from "./components/Stat";
// import {formatAbbreviate} from "d3plus-format";
import "./index.css";

import FoodAccess from "./sections/food/FoodAccess";
import Dentists from "./sections/health/Dentists";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {meta} = this.props;
    const location = meta.name;
    // const {population} = this.props;
    // const {diabetes} = this.props;

    return (
      <div>
        <h1> {location} </h1>
        {/* <Stat
          title="Population"
          value={formatAbbreviate(population.data[0].Population)}
        />
        <Stat
          title="Diabetes Rate"
          value={`${diabetes.data[0]["Diabetes Data Value"]}%`}
        /> */}
        <TopicTitle slug="food">Food</TopicTitle>
        <FoodAccess />
        <TopicTitle slug="health">Health</TopicTitle>
        <Dentists />
      </div>
    );
  }
}

Profile.need = [
  FoodAccess,
  Dentists,
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
