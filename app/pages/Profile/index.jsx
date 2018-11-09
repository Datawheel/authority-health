import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
// import Stat from "./components/Stat";
// import {formatAbbreviate} from "d3plus-format";
import "./index.css";

import FoodStats from "./sections/healthBehaviors/FoodStats";
import FoodAccess from "./sections/healthBehaviors/FoodAccess";
import DemographicFoodAccess from "./sections/healthBehaviors/DemographicFoodAccess";
import DrugUse from "./sections/healthBehaviors/DrugUse";
import HealthCenters from "./sections/accessToCare/HealthCenters";
import Coverage from "./sections/accessToCare/Coverage";
import ChildCare from "./sections/specialPopulation/ChildCare";
import Immigrants from "./sections/specialPopulation/Immigrants";
import DomesticPartners from "./sections/specialPopulation/DomesticPartners";
import DisabilityStatus from "./sections/specialPopulation/DisabilityStatus";
import HearingAndVisionDifficulty from "./sections/specialPopulation/HearingAndVisionDifficulty";
import Homeownership from "./sections/builtEnvironment/Homeownership";
import HouseRentals from "./sections/builtEnvironment/HouseRentals";
import Transportation from "./sections/builtEnvironment/Transportation";
import Crime from "./sections/builtEnvironment/Crime";
import DistressScore from "./sections/economy/DistressScore";
import HouseholdIncomeFromPublicAssistance from "./sections/economy/HouseholdIncomeFromPublicAssistance";
import WageDistribution from "./sections/economy/WageDistribution";
import Poverty from "./sections/economy/Poverty";

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
        
        <TopicTitle slug="health-behaviors">Health Behaviors</TopicTitle>
        <FoodStats />
        <FoodAccess />
        <DemographicFoodAccess />
        <DrugUse />
        
        <TopicTitle slug="access-to-care">Access to Care</TopicTitle>
        <HealthCenters />
        <Coverage />
        
        <TopicTitle slug="special-population">Special Population</TopicTitle>
        <ChildCare />
        <Immigrants />
        <DomesticPartners />
        <DisabilityStatus />
        <HearingAndVisionDifficulty />

        <TopicTitle slug="built-environment">Built Environment</TopicTitle>
        <Homeownership />
        <HouseRentals />
        <Transportation />
        <Crime />

        <TopicTitle slug="economy">Economy</TopicTitle>
        <DistressScore />
        <HouseholdIncomeFromPublicAssistance />
        <WageDistribution />
        <Poverty />
        
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
  Homeownership,
  HouseRentals,
  Transportation,
  Crime,
  DistressScore,
  HouseholdIncomeFromPublicAssistance,
  WageDistribution,
  Poverty,
  fetchData("diabetes", "/api/data?measures=Diabetes%20Data%20Value&City=<id>&Year=latest"),
  fetchData("meta", "/api/search?id=<id>"),
  fetchData("population", "https://ironwood.datausa.io/api/data?measures=Population&Geography=<id>&year=latest")
];

const mapStateToProps = state => ({
  diabetes: state.data.diabetes,
  meta: state.data.meta,
  population: state.data.population
});

export default connect(mapStateToProps)(Profile);
