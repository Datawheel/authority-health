import React, {Component} from "react";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";
import {nest} from "d3-collection";
import {Icon} from "@blueprintjs/core";
import {fetchData, TopicTitle} from "@datawheel/canon-core";
import ProfileHeader from "./components/ProfileHeader";
import Subnav from "../../components/Subnav";
import "./Profile.css";

import Introduction from "./sections/about/Introduction";
import FoodInsecurity from "./sections/foodAccess/FoodInsecurity";
import FoodAvailability from "./sections/foodAccess/FoodAvailability";
import PublicFoodAssistance from "./sections/foodAccess/PublicFoodAssistance";
import StoreAccessByDemographic from "./sections/foodAccess/StoreAccessByDemographic";
import PreventiveCare from "./sections/healthBehaviors/PreventiveCare";
import RiskyBehaviors from "./sections/healthBehaviors/RiskyBehaviors";
import PhysicalInactivity from "./sections/healthBehaviors/PhysicalInactivity";
import CancerPrevalenceByDemographics from "./sections/healthConditions/CancerPrevalenceByDemographics";
import OccurrenceByCancerSite from "./sections/healthConditions/OccurrenceByCancerSite";
import ObesityAndDiabetes from "./sections/healthConditions/ObesityAndDiabetes";
import ConditionsAndChronicDiseases from "./sections/healthConditions/ConditionsAndChronicDiseases";
import HealthCenterDemographics from "./sections/accessToCare/HealthCenterDemographics";
import HealthInsuranceCoverage from "./sections/accessToCare/HealthInsuranceCoverage";
import Veterans from "./sections/specialPopulation/Veterans";
import Immigrants from "./sections/specialPopulation/Immigrants";
import DisabilityStatus from "./sections/specialPopulation/DisabilityStatus";
import Homeless from "./sections/specialPopulation/Homeless";
import Incarceration from "./sections/specialPopulation/Incarceration";
import VisionAndAuditoryDisabilities from "./sections/specialPopulation/VisionAndAuditoryDisabilities";
import Homeownership from "./sections/builtSocialEnvironment/Homeownership";
import Rentals from "./sections/builtSocialEnvironment/Rentals";
import Transportation from "./sections/builtSocialEnvironment/Transportation";
import ViolentAndPropertyCrimes from "./sections/builtSocialEnvironment/ViolentAndPropertyCrimes";
import EmploymentGrowth from "./sections/economy/EmploymentGrowth";
import Unemployment from "./sections/economy/Unemployment";
import DistressScore from "./sections/economy/DistressScore";
import HouseholdIncomeFromPublicAssistance from "./sections/economy/HouseholdIncomeFromPublicAssistance";
import WageDistribution from "./sections/economy/WageDistribution";
import Poverty from "./sections/economy/Poverty";
import EducationalAttainment from "./sections/education/EducationalAttainment";
import DropoutRate from "./sections/education/DropoutRate";
import StudentPoverty from "./sections/education/StudentPoverty";
import ReadingAssessment from "./sections/education/ReadingAssessment";
import AirQuality from "./sections/naturalEnvironment/AirQuality";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {id, name, level} = this.props.meta;

    return (
      <div className="profile">
        <Helmet title={level === "zip" ? `Zip Code ${name}` : name} />

        <ProfileHeader
          title={level === "zip" ? `Zip Code ${name}` : name}
          id={id}
        />
        <Subnav />

        <div className="section-container">
          <Introduction />
        </div>

        <TopicTitle slug="health-conditions">
          <div className="section-container">
            <Icon iconName="pulse" />
            Health Conditions
          </div>
        </TopicTitle>
        <div className="section-container">
          <ConditionsAndChronicDiseases />
          <ObesityAndDiabetes />
          <CancerPrevalenceByDemographics />
          <OccurrenceByCancerSite />
        </div>

        <TopicTitle slug="health-behaviors">
          <div className="section-container">
            <Icon iconName="heart" />
            Health Behaviors
          </div>
        </TopicTitle>
        <div className="section-container">
          <PreventiveCare />
          <RiskyBehaviors />
          <PhysicalInactivity />
        </div>

        <TopicTitle slug="access-to-care">
          <div className="section-container">
            <Icon iconName="office" />
            Access to Care
          </div>
        </TopicTitle>
        <div className="section-container">
          <HealthCenterDemographics />
          <HealthInsuranceCoverage />
        </div>

        <TopicTitle slug="food-access">
          <div className="section-container">
            <Icon iconName="shop" />
            Food Access
          </div>
        </TopicTitle>
        <div className="section-container">
          <FoodInsecurity />
          <FoodAvailability />
          <PublicFoodAssistance />
          <StoreAccessByDemographic />
        </div>

        <TopicTitle slug="economy">
          <div className="section-container">
            <Icon iconName="bank-account" />
            Economy
          </div>
        </TopicTitle>
        <div className="section-container">
          <EmploymentGrowth />
          <Unemployment />
          <DistressScore />
          <HouseholdIncomeFromPublicAssistance />
          <WageDistribution />
          <Poverty />
        </div>

        <TopicTitle slug="education">
          <div className="section-container">
            <Icon iconName="lightbulb" />
            Education
          </div>
        </TopicTitle>
        <div className="section-container">
          <EducationalAttainment />
          <DropoutRate />
          <StudentPoverty />
          <ReadingAssessment />
        </div>

        <TopicTitle slug="built-social-environment">
          <div className="section-container">
            <Icon iconName="home" />
            Built/Social Environment
          </div>
        </TopicTitle>
        <div className="section-container">
          <Homeownership />
          <Rentals />
          <Transportation />
          <ViolentAndPropertyCrimes />
        </div>

        <TopicTitle slug="natural-environment">
          <div className="section-container">
            <Icon iconName="tree" />
            Natural Environment
          </div>
        </TopicTitle>
        <div className="section-container">
          <AirQuality />
        </div>

        <TopicTitle slug="special-populations">
          <div className="section-container">
            <Icon iconName="people" />
            Special Populations
          </div>
        </TopicTitle>
        <div className="section-container">
          <Immigrants />
          <DisabilityStatus />
          <VisionAndAuditoryDisabilities />
          <Homeless />
          <Veterans />
          <Incarceration />
        </div>
      </div>
    );
  }
}

Profile.need = [
  Introduction,
  FoodAvailability,
  PublicFoodAssistance,
  FoodInsecurity,
  StoreAccessByDemographic,
  CancerPrevalenceByDemographics,
  OccurrenceByCancerSite,
  ConditionsAndChronicDiseases,
  ObesityAndDiabetes,
  PhysicalInactivity,
  PreventiveCare,
  RiskyBehaviors,
  HealthCenterDemographics,
  HealthInsuranceCoverage,
  Homeless,
  Immigrants,
  DisabilityStatus,
  VisionAndAuditoryDisabilities,
  Incarceration,
  Veterans,
  Homeownership,
  Rentals,
  Transportation,
  ViolentAndPropertyCrimes,
  DistressScore,
  EmploymentGrowth,
  HouseholdIncomeFromPublicAssistance,
  Poverty,
  Unemployment,
  WageDistribution,
  DropoutRate,
  EducationalAttainment,
  ReadingAssessment,
  StudentPoverty,
  AirQuality,
  fetchData("topStats", "/api/stats/<id>"),
  fetchData("meta", "/api/search?id=<id>", resp => resp[0]),
  fetchData("childrenTractIds", "/api/geo/children/<id>/?level=Tract"),
  fetchData("childrenZipIds", "/api/geo/children/<id>/?level=Zip"),
  fetchData("population", "https://acs.datausa.io/api/data?measures=Population&Geography=<id>&year=all"),
  fetchData("currentLevelOverallCoverage", "/api/data?measures=Population Size by Insurance Coverage Status&drilldowns=Health Insurance Coverage Status&Geography=<id>&Year=latest", d => d.data),
  fetchData("sortedCancerTypes", "/api/data?measures=Cancer Diagnosis&drilldowns=Cancer Site&Year=all&order=Cancer Site&sort=asc", d => {
    const cancerList = [];
    nest().key(d => d["Cancer Site"]).entries(d.data).forEach(group => cancerList.push(group.key));
    return cancerList;
  })
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  childrenTractIds: state.data.childrenTractIds,
  childrenZipIds: state.data.childrenZipIds,
  population: state.data.population,
  currentLevelOverallCoverage: state.data.currentLevelOverallCoverage
});

export default connect(mapStateToProps)(Profile);
