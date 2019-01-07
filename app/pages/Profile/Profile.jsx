import React, {Component} from "react";
import {connect} from "react-redux";
import {Icon} from "@blueprintjs/core";
import {fetchData, TopicTitle} from "@datawheel/canon-core";

import ProfileHeader from "./components/ProfileHeader";
import "./Profile.css";

import Introduction from "./sections/about/Introduction";
import SocioeconomicOutcomes from "./sections/about/SocioeconomicOutcomes";
import HealthOutcomes from "./sections/about/HealthOutcomes";
import Insecurity from "./sections/foodAccess/Insecurity";
import FoodAvailability from "./sections/foodAccess/FoodAvailability";
import StoreAccessByDemographic from "./sections/foodAccess/StoreAccessByDemographic";
import PreventiveCare from "./sections/healthBehaviors/PreventiveCare";
import RiskyBehaviors from "./sections/healthBehaviors/RiskyBehaviors";
import PhysicalInactivity from "./sections/healthBehaviors/PhysicalInactivity";
import Cancer from "./sections/healthConditions/Cancer";
import ObesityAndDiabetes from "./sections/healthConditions/ObesityAndDiabetes";
import ConditionsAndChronicDiseases from "./sections/healthConditions/ConditionsAndChronicDiseases";
import DentistsDemographic from "./sections/accessToCare/DentistsDemographic";
import DentistsWorkStatus from "./sections/accessToCare/DentistsWorkStatus";
import HealthCenters from "./sections/accessToCare/HealthCenters";
import Coverage from "./sections/accessToCare/Coverage";
import GrandparentCaregivers from "./sections/specialPopulation/GrandparentCaregivers";
import Veterans from "./sections/specialPopulation/Veterans";
import Immigrants from "./sections/specialPopulation/Immigrants";
import DomesticPartners from "./sections/specialPopulation/DomesticPartners";
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
import ConsumerPriceIndex from "./sections/economy/ConsumerPriceIndex";
import DistressScore from "./sections/economy/DistressScore";
import HouseholdIncomeFromPublicAssistance from "./sections/economy/HouseholdIncomeFromPublicAssistance";
import WageDistribution from "./sections/economy/WageDistribution";
import Poverty from "./sections/economy/Poverty";
import EducationalAttainment from "./sections/education/EducationalAttainment";
import DropoutRate from "./sections/education/DropoutRate";
import StudentPoverty from "./sections/education/StudentPoverty";
import ReadingAssessment from "./sections/education/ReadingAssessment";
import WaterQuality from "./sections/naturalEnvironment/WaterQuality";
import AirQuality from "./sections/naturalEnvironment/AirQuality";

class Profile extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {name} = this.props.meta;
    const {population, populationByRaceAndEthnicity, populationByAgeAndGender, lifeExpectancy} = this.props;

    return (
      <div className="profile">
        <ProfileHeader
          title={ name }
        />

        <TopicTitle slug="about">
          <div className="section-container">
            <Icon iconName="info-sign" />
            About
          </div>
        </TopicTitle>
        <div className="section-container">
          <Introduction population={population.data} populationByRaceAndEthnicity={populationByRaceAndEthnicity.data} populationByAgeAndGender={populationByAgeAndGender} lifeExpectancy={lifeExpectancy}/>
          <SocioeconomicOutcomes population={population.data} populationByRaceAndEthnicity={populationByRaceAndEthnicity.data} populationByAgeAndGender={populationByAgeAndGender} lifeExpectancy={lifeExpectancy}/>
          <HealthOutcomes />
        </div>

        <TopicTitle slug="access-to-care">
          <div className="section-container">
            <Icon iconName="office" />
            Access to Care
          </div>
        </TopicTitle>
        <div className="section-container">
          <HealthCenters />
          <DentistsDemographic />
          <DentistsWorkStatus />
          <Coverage />
        </div>

        <TopicTitle slug="food-access">
          <div className="section-container">
            <div className="section-title-stat-container">
              <span className="section-title-inner">
                <Icon iconName="shop" />
                Food Access
              </span>
              <Insecurity />
            </div>
          </div>
        </TopicTitle>
        <div className="section-container">
          <FoodAvailability />
          <StoreAccessByDemographic />
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

        <TopicTitle slug="health-conditions">
          <div className="section-container">
            <Icon iconName="pulse" />
            Health Conditions
          </div>
        </TopicTitle>
        <div className="section-container">
          <ConditionsAndChronicDiseases />
          <ObesityAndDiabetes />
          <Cancer />
        </div>

        <TopicTitle slug="special-population">
          <div className="section-container">
            <Icon iconName="people" />
            Special Population
          </div>
        </TopicTitle>
        <div className="section-container">
          <GrandparentCaregivers />
          <Immigrants />
          <DomesticPartners />
          <DisabilityStatus />
          <VisionAndAuditoryDisabilities /> 
          <Homeless population={population.data}/>
          <Veterans />
          <Incarceration />
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

        <TopicTitle slug="economy">
          <div className="section-container">
            <Icon iconName="bank-account" />
            Economy
          </div>
        </TopicTitle>
        <div className="section-container">
          <EmploymentGrowth />
          <Unemployment />
          <ConsumerPriceIndex />
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

        <TopicTitle slug="natural-environment">
          <div className="section-container">
            <Icon iconName="tree" />
            Natural Environment
          </div>
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
  Introduction,
  SocioeconomicOutcomes,
  HealthOutcomes,
  Insecurity,
  FoodAvailability,
  StoreAccessByDemographic,
  ConditionsAndChronicDiseases,
  PreventiveCare,
  ObesityAndDiabetes,
  Cancer,
  RiskyBehaviors,
  PhysicalInactivity,
  HealthCenters,
  DentistsDemographic,
  DentistsWorkStatus,
  Coverage,
  GrandparentCaregivers,
  Immigrants,
  DomesticPartners,
  DisabilityStatus,
  VisionAndAuditoryDisabilities,
  Incarceration,
  Veterans,
  Homeless,
  Homeownership,
  Rentals,
  Transportation,
  ViolentAndPropertyCrimes,
  EmploymentGrowth,
  Unemployment,
  ConsumerPriceIndex,
  DistressScore,
  HouseholdIncomeFromPublicAssistance,
  WageDistribution,
  Poverty,
  EducationalAttainment,
  DropoutRate,
  StudentPoverty,
  ReadingAssessment,
  WaterQuality,
  AirQuality,
  fetchData("meta", "/api/search?id=<id>", resp => resp[0]),
  fetchData("population", "https://niagara.datausa.io/api/data?measures=Population&Geography=<id>&year=all"),
  fetchData("populationByAgeAndGender", "/api/data?measures=Population&drilldowns=Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("lifeExpectancy", "/api/data?measures=Life Expectancy&Geography=<id>", d => d.data), // Year data not available
  fetchData("populationByRaceAndEthnicity", "https://niagara.datausa.io/api/data?measures=Hispanic Population&drilldowns=Race,Ethnicity&Geography=<id>&Year=all")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  population: state.data.population,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  populationByRaceAndEthnicity: state.data.populationByRaceAndEthnicity,
  lifeExpectancy: state.data.lifeExpectancy
});

export default connect(mapStateToProps)(Profile);
