import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
// import Stat from "./components/Stat";
// import {formatAbbreviate} from "d3plus-format";
import "./index.css";

import FoodStats from "./sections/food/FoodStats";
import FoodAccess from "./sections/food/FoodAccess";
import DemographicFoodAccess from "./sections/food/DemographicFoodAccess";
import DrugUse from "./sections/health/DrugUse";
import HealthCenters from "./sections/health/HealthCenters";
import Coverage from "./sections/health/Coverage";
import ChildCare from "./sections/demographics/ChildCare";
import Immigrants from "./sections/demographics/Immigrants";
import DomesticPartners from "./sections/demographics/DomesticPartners";
import DisabilityStatus from "./sections/demographics/DisabilityStatus";
import HearingAndVisionDifficulty from "./sections/demographics/HearingAndVisionDifficulty";
import OwnedHouses from "./sections/housingAndLiving/OwnedHouses";
import HouseRentals from "./sections/housingAndLiving/HouseRentals";

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
        <FoodStats />
        <FoodAccess />
        <DemographicFoodAccess />
        
        <TopicTitle slug="health">Health</TopicTitle>
        <DrugUse />
        <HealthCenters />
        <Coverage />
        
        <TopicTitle slug="demographics">Demographics</TopicTitle>
        <ChildCare />
        <Immigrants />
        <DomesticPartners />
        <DisabilityStatus />
        <HearingAndVisionDifficulty />

        <TopicTitle slug="housing-and-living">Housing and Living</TopicTitle>
        <OwnedHouses />
        <HouseRentals />
        
      </div>
    );
  }
}

Profile.need = [
  FoodStats,
  FoodAccess,
  DemographicFoodAccess,
  DrugUse,
  HealthCenters,
  Coverage,
  ChildCare,
  Immigrants,
  DomesticPartners,
  DisabilityStatus,
  HearingAndVisionDifficulty,
  OwnedHouses,
  HouseRentals,
  fetchData("diabetes", "/api/data?measures=Diabetes%20Data%20Value&City=<id>&Year=latest"),
  fetchData("meta", "/api/search?id=<id>"),
  fetchData("population", "https://fossil-lake.datausa.io/api/data?measures=Population&Geography=<id>&year=latest")
];

const mapStateToProps = state => ({
  diabetes: state.data.diabetes,
  meta: state.data.meta,
  population: state.data.population
});

export default connect(mapStateToProps)(Profile);
