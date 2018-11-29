import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import ProfileHeader from "./components/ProfileHeader";
import "./Profile.css";

import Insecurity from "./sections/foodAccess/Insecurity";
import FoodAvailability from "./sections/foodAccess/FoodAvailability";
import StoreAccessByDemographic from "./sections/foodAccess/StoreAccessByDemographic";
import DrugUse from "./sections/healthBehaviors/DrugUse";
import PhysicalActivity from "./sections/healthBehaviors/PhysicalActivity";
import DentistsDemographic from "./sections/accessToCare/DentistsDemographic";
import TypesOfDentists from "./sections/accessToCare/TypesOfDentists";
import HealthCenters from "./sections/accessToCare/HealthCenters";
import Coverage from "./sections/accessToCare/Coverage";
import ChildCare from "./sections/specialPopulation/ChildCare";
import Veterans from "./sections/specialPopulation/Veterans";
import Immigrants from "./sections/specialPopulation/Immigrants";
import DomesticPartners from "./sections/specialPopulation/DomesticPartners";
import DisabilityStatus from "./sections/specialPopulation/DisabilityStatus";
import Homeless from "./sections/specialPopulation/Homeless";
import Incarceration from "./sections/specialPopulation/Incarceration";
import HearingAndVisionDifficulty from "./sections/specialPopulation/HearingAndVisionDifficulty";
import Homeownership from "./sections/builtSocialEnvironment/Homeownership";
import HouseRentals from "./sections/builtSocialEnvironment/HouseRentals";
import Transportation from "./sections/builtSocialEnvironment/Transportation";
import Crime from "./sections/builtSocialEnvironment/Crime";
import DistressScore from "./sections/economy/DistressScore";
import HouseholdIncomeFromPublicAssistance from "./sections/economy/HouseholdIncomeFromPublicAssistance";
import WageDistribution from "./sections/economy/WageDistribution";
import Poverty from "./sections/economy/Poverty";
import EducationalAttainment from "./sections/education/EducationalAttainment";
import StudentPoverty from "./sections/education/StudentPoverty";
import ReadingAssessment from "./sections/education/ReadingAssessment";
import WaterQuality from "./sections/naturalEnvironment/WaterQuality";
import AirQuality from "./sections/naturalEnvironment/AirQuality";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {diabetes, meta, population} = this.props;
    const location = meta.name;

    return (
      <div className="profile">
        <ProfileHeader
          title={ location }
          population={ population.data[0] &&
            formatAbbreviate(population.data[0].Population)
          }
          diabetes={ diabetes.data[0] &&
            `${diabetes.data[0]["Diabetes Data Value"]}%`
          }
        />

        <TopicTitle slug="food-access">Food Access</TopicTitle>
        <Insecurity />
        <FoodAvailability />
        <StoreAccessByDemographic />

        <TopicTitle slug="health-behaviors">Health Behaviors</TopicTitle>
        <DrugUse />
        <PhysicalActivity />

        <TopicTitle slug="access-to-care">Access to Care</TopicTitle>
        <HealthCenters />
        <DentistsDemographic />
        <TypesOfDentists />
        <Coverage />

        <TopicTitle slug="special-population">Special Population</TopicTitle>
        <ChildCare />
        <Immigrants />
        <DomesticPartners />
        <DisabilityStatus />
        <HearingAndVisionDifficulty />
        <Homeless />
        <Veterans />
        <Incarceration />

        <TopicTitle slug="built-social-environment">Built/Social Environment</TopicTitle>
        <Homeownership />
        {/* <HouseRentals /> */}
        <Transportation />
        <Crime />

        <TopicTitle slug="economy">Economy</TopicTitle>
        <DistressScore />
        <HouseholdIncomeFromPublicAssistance />
        <WageDistribution />
        <Poverty />

        <TopicTitle slug="education">Education</TopicTitle>
        <EducationalAttainment />
        <StudentPoverty />
        <ReadingAssessment />

        <TopicTitle slug="natural-enviornment">Natural Environment</TopicTitle>
        <WaterQuality />
        <AirQuality />
      </div>
    );
  }
}

Profile.need = [
  Insecurity,
  FoodAvailability,
  StoreAccessByDemographic,
  DrugUse,
  PhysicalActivity,
  HealthCenters,
  DentistsDemographic,
  TypesOfDentists,
  Coverage,
  ChildCare,
  Immigrants,
  DomesticPartners,
  DisabilityStatus,
  HearingAndVisionDifficulty,
  Incarceration,
  Veterans,
  Homeless,
  Homeownership,
  // HouseRentals,
  Transportation,
  Crime,
  DistressScore,
  HouseholdIncomeFromPublicAssistance,
  WageDistribution,
  Poverty,
  EducationalAttainment,
  StudentPoverty,
  ReadingAssessment,
  WaterQuality,
  AirQuality,
  fetchData("diabetes", "/api/data?measures=Diabetes%20Data%20Value&City=<id>&Year=latest"),
  fetchData("meta", "/api/search?id=<id>"),
  fetchData("population", "https://katahdin.datausa.io/api/data?measures=Population&Geography=<id>&year=latest")
];

const mapStateToProps = state => ({
  diabetes: state.data.diabetes,
  meta: state.data.meta,
  population: state.data.population
});

export default connect(mapStateToProps)(Profile);
