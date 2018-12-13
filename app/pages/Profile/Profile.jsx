import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import ProfileHeader from "./components/ProfileHeader";
import "./Profile.css";

import Insecurity from "./sections/foodAccess/Insecurity";
import FoodAvailability from "./sections/foodAccess/FoodAvailability";
import StoreAccessByDemographic from "./sections/foodAccess/StoreAccessByDemographic";
import RiskyBehaviors from "./sections/healthBehaviors/RiskyBehaviors";
import Cancer from "./sections/healthBehaviors/Cancer";
import PhysicalInactivity from "./sections/healthBehaviors/PhysicalInactivity";
import HealthConditonChronicDiseases from "./sections/healthBehaviors/HealthConditonChronicDiseases";
import PreventiveCare from "./sections/healthBehaviors/PreventiveCare";
import ObesityAndDiabetes from "./sections/healthBehaviors/ObesityAndDiabetes";
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

        <TopicTitle slug="food-access">
          <div className="section-container">
            <div className="section-title-stat-container">
              <span className="section-title-inner">Food Access</span>
              <Insecurity />
            </div>
          </div>
        </TopicTitle>

        <div className="section-container">
          <FoodAvailability />
          <StoreAccessByDemographic />
        </div>
        
        <TopicTitle slug="health-behaviors">
          <div className="section-container">Health Behaviors</div>
        </TopicTitle>
        <div className="section-container">
          <HealthConditonChronicDiseases />
          <PreventiveCare />
          <ObesityAndDiabetes />
          <Cancer />
          <RiskyBehaviors />
          <PhysicalInactivity />
        </div>

        <TopicTitle slug="access-to-care">
          <div className="section-container">Access to Care</div>
        </TopicTitle>
        <div className="section-container">
          <HealthCenters />
          <DentistsDemographic />
          <TypesOfDentists />
          <Coverage />
        </div>

        <TopicTitle slug="special-population">
          <div className="section-container">Special Population</div>
        </TopicTitle>
        <div className="section-container">
          <ChildCare />
          <Immigrants />
          <DomesticPartners />
          <DisabilityStatus />
          <HearingAndVisionDifficulty />
          <Homeless />
          <Veterans />
          <Incarceration />
        </div>

        <TopicTitle slug="built-social-environment">
          <div className="section-container">Built/Social Environment</div>
        </TopicTitle>
        <div className="section-container">
          <Homeownership />
          <HouseRentals />
          <Transportation />
          <Crime />
        </div>

        <TopicTitle slug="economy">
          <div className="section-container">Economy</div>
        </TopicTitle>
        <div className="section-container">
          <DistressScore />
          <HouseholdIncomeFromPublicAssistance />
          <WageDistribution />
          <Poverty />
        </div>

        <TopicTitle slug="education">
          <div className="section-container">Education</div>
        </TopicTitle>
        <div className="section-container">
          <EducationalAttainment />
          <StudentPoverty />
          <ReadingAssessment />
        </div>

        <TopicTitle slug="natural-enviornment">
          <div className="section-container">Natural Environment</div>
        </TopicTitle>
        <div className="section-container">
          <WaterQuality />
          <AirQuality />
        </div>
      </div>
    );
  }
}

Profile.need = [
  Insecurity,
  FoodAvailability,
  StoreAccessByDemographic,
  HealthConditonChronicDiseases,
  PreventiveCare,
  ObesityAndDiabetes,
  Cancer,
  RiskyBehaviors,
  PhysicalInactivity,
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
  HouseRentals,
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
