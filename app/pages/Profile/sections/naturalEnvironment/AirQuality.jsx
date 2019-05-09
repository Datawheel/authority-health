import React from "react";
import {connect} from "react-redux";
import {BarChart, LinePlot} from "d3plus-react";
import {titleCase} from "d3plus-text";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import Glossary from "components/Glossary";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const definitions = [
  {term: "The Air Quality Index (AQI) is an index for reporting daily air quality. It tells you how clean or polluted your air is, and what associated health effects might be a concern for you. The AQI focuses on health effects you may experience within a few hours or days after breathing polluted air. Following are the types of air quality and their explanation with respect to AQI"},
  {term: "Good", definition: "AQI is 0 to 50. Air quality is considered satisfactory, and air pollution poses little or no risk."},
  {term: "Moderate", definition: "AQI is 51 to 100. Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people. For example, people who are unusually sensitive to ozone may experience respiratory symptoms."},
  {term: "Unhealthy for Sensitive Groups", definition: "AQI is 101 to 150. Although general public is not likely to be affected at this AQI range, people with lung disease, older adults and children are at a greater risk from exposure to ozone, whereas persons with heart and lung disease, older adults and children are at greater risk from the presence of particles in the air."},
  {term: "Unhealthy", definition: "AQI is 151 to 200. Everyone may begin to experience some adverse health effects, and members of the sensitive groups may experience more serious effects."},
  {term: "Very Unhealthy", definition: "AQI is 201 to 300. This would trigger a health alert signifying that everyone may experience more serious health effects."},
  {term: "Hazardous", definition: "AQI greater than 300. This would trigger a health warnings of emergency conditions. The entire population is more likely to be affected."}
];

const pollutantDefinitions = [
  {term: "Common air pollutants and their health effects"},
  {term: "PM10", definition: "PM10 are particles with a diameter of 10 micrometres or less. These particles are small enough to pass through the throat and nose and enter the lungs. Once inhaled, these particles can affect the heart and lungs and cause serious health effects such as irritated eyes, nose and throat, heart attacks and arrhythmias (irregular heart beat) in people with heart disease, reduced lung function, etc."},
  {term: "PM2.5", definition: " PM2.5 are particles with a diameter of 2.5 micrometres or less. These particles are so small they can get deep into the lungs and into the bloodstream. There is sufficient evidence that exposure to PM2.5 over long periods (years) can cause adverse health effects such as irritated eyes, nose and throat, heart attacks and arrhythmias (irregular heart beat) in people with heart disease, reduced lung function, etc. Note that PM10 includes PM2.5."},
  {term: "Nitrogen Dioxide (N02)", definition: "Potential health effects from exposure to nitrogen dioxide are - increased susceptibility to lung infections in people with asthma, increased susceptibility to asthma triggers like pollen and exercise, worsened symptoms of asthma – more frequent asthma attacks, and airway inflammation in healthy people."},
  {term: "Ozone (O3)", definition: "Potential health effects from exposure to ozone are - irritation and inflammation of eyes, nose, throat and lower airways, reduced lung function, exacerbation of asthma and chronic respiratory diseases such as chronic bronchitis (also called chronic obstructive pulmonary disease or COPD), increased susceptibility to respiratory infections, and possible continuation to damage lungs when symptoms have disappeared."},
  {term: "Carbon Monoxide (CO)", definition: "Potential health effects from exposure to carbon monoxide are - flu-like symptoms such as headaches, dizziness, disorientation, nausea and fatigue, chest pain in people with coronary heart disease, at higher concentration: impaired vision and coordination, dizziness and confusion, and potentially serious health effects on unborn babies when exposed to high levels."},
  {term: "Sulphur Dioxide (S02)", definition: "Potential health effects from exposure to sulphur dioxide are - narrowing of the airways leading to wheezing, chest tightness and shortness of breath, more frequent asthma attacks in people with asthma and exacerbation of cardiovascular diseases."}
];

const formatAirQualityDaysName = d => d.replace(" days", "");

class AirQuality extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      meta: this.props.meta,
      dropdownValue: "Air Quality Days",
      airQualityMedianAQIs: [],
      airPollutants: [],
      sensitiveGroupData: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    const {meta} = this.state;
    if (dropdownValue === "Air Pollutants") {
      // Fetching data for 2017 since 2018 data is not available for all 365 days.
      axios.get(`/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=${meta.id}&Year=2017`)
        .then(resp => {
          this.setState({
            airPollutants: resp.data.data,
            dropdownValue
          });
        });
    }
    else if (dropdownValue === "Median Air Quality Index") {
      // Fetching data for 2017 since 2018 data is not available for all 365 days.
      axios.get(`/api/data?measures=Median AQI&Geography=${meta.id}&Year=2017`)
        .then(resp => {
          this.setState({
            airQualityMedianAQIs: resp.data.data,
            dropdownValue
          });
        });
    }
    else if (dropdownValue === "Unhealthy Air for Sensitive Groups") {
      // Fetching data for 2017 since 2018 data is not available for all 365 days.
      axios.get(`/api/data?measures=Air Quality Days&Category=2&Geography=${meta.id}&Year=2017`)
        .then(resp => {
          this.setState({
            sensitiveGroupData: resp.data.data,
            dropdownValue
          });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {

    const {meta, airQualityDays} = this.props;
    const {dropdownValue, airQualityMedianAQIs, airPollutants, sensitiveGroupData} = this.state;

    const dropdownList = ["Air Quality Days", "Air Pollutants", "Median Air Quality Index", "Unhealthy Air for Sensitive Groups"];

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isAirQualityDaysAvailableForCurrentGeography = airQualityDays.source[0].substitutions.length === 0;

    const topAirQualityDays = airQualityDays.data.sort((a, b) => b["Air Quality Days"] - a["Air Quality Days"])[0];

    // Get top air polutants data.
    const topRecentYearAirPollutant = airPollutants.sort((a, b) => b["Air Pollutant Days"] - a["Air Pollutant Days"])[0];

    return (
      <SectionColumns>
        <SectionTitle>Air Quality</SectionTitle>
        <article>
          <label className="pt-label pt-inline" htmlFor="store-access-dropdown">
            Show data for
            <select id="store-access-dropdown" onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          {!isAirQualityDaysAvailableForCurrentGeography &&
            <Disclaimer>Data is shown for {airQualityDays.data[0].Geography}</Disclaimer>
          }
          {dropdownValue === "Air Quality Days" &&
          <div className="article-inner-container">
            <Stat
              title={"Most common air quality days"}
              year={topAirQualityDays.Year}
              value={titleCase(formatAirQualityDaysName(topAirQualityDays.Category))}
              qualifier={`${topAirQualityDays["Air Quality Days"]} of 365 days in Wayne County`}
            />
            <p>In {topAirQualityDays.Year}, {topAirQualityDays["Air Quality Days"]} of 365 days were {formatAirQualityDaysName(topAirQualityDays.Category)} quality air in {topAirQualityDays.Geography}.</p>
            <p>The glossary below explains air quality with respect to air quality index (AQI).</p>
          </div>}

          {dropdownValue === "Air Pollutants" &&
          <div className="article-inner-container">
            <Stat
              title={"Most common air pollutant"}
              year={topRecentYearAirPollutant.Year}
              value={topRecentYearAirPollutant.Pollutant}
              qualifier={`${topRecentYearAirPollutant["Air Pollutant Days"]} days`}
            />
            <p>In {topRecentYearAirPollutant.Year}, the most common air pollutant was {topRecentYearAirPollutant.Pollutant} in {topRecentYearAirPollutant.Geography}.</p>
            <p>The EPA has identified six pollutants as “criteria” air pollutants because it regulates them by developing human health-based and/or environmentally-based criteria for setting permissible levels. These six pollutants are carbon monoxide, lead, nitrogen oxides, ground-level ozone, particle pollution (often referred to as particulate matter), and sulfur oxides.</p>
            <p>The glossary below gives further details about common air pollutants and their health effects.</p>
          </div>}
          {dropdownValue === "Median Air Quality Index" &&
          <div className="article-inner-container">
            <Stat
              title={"Median Air Quality Index"}
              year={airQualityMedianAQIs[0].Year}
              value={airQualityMedianAQIs[0]["Median AQI"]}
            />
            <p>In {airQualityMedianAQIs[0].Year}, the median air quality index was {airQualityMedianAQIs[0]["Median AQI"]} in {airQualityMedianAQIs[0].Geography}.</p>
            <p>The glossary below explains air quality index (AQI) and different types of air quality with respect to AQI.</p>
          </div>}
          {dropdownValue === "Unhealthy Air for Sensitive Groups" &&
          <div className="article-inner-container">
            <Stat
              title={"unhealthy air for sensitive groups"}
              year={sensitiveGroupData[0].Year}
              value={sensitiveGroupData[0]["Air Quality Days"]}
              qualifier={`of 365 days in ${sensitiveGroupData[0].Geography}`}
            />
            <p>In {sensitiveGroupData[0].Year}, {sensitiveGroupData[0]["Air Quality Days"]} days were unhealthy air for sensitive groups in {sensitiveGroupData[0].Geography}.</p>
            <p>Air quality is unhealthy for sensitive groups when the AQI is between 101 to 150. Although general public is not likely to be affected at this AQI range, people with lung disease, older adults and children are at a greater risk from exposure to ozone, whereas persons with heart and lung disease, older adults and children are at greater risk from the presence of particles in the air.</p>
          </div>}

          <p>The chart here shows the {dropdownValue === "Air Pollutants" ? "most common" : ""} {dropdownValue.toLocaleLowerCase()} {dropdownValue !== "Air Quality Days" ? "over years" : ""} in {airQualityDays.data[0].Geography}.</p>

          <SourceGroup sources={this.state.sources} />
          {dropdownValue !== "Air Pollutants" ? <Glossary definitions={definitions} /> : <Glossary definitions={pollutantDefinitions} />}
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          {dropdownValue === "Air Quality Days" &&
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Air Quality Days&drilldowns=Category&Geography=${meta.id}&Year=all` }
            title="Chart of Air Quality Days" />
          }


          {/* Lineplot to show air quality days over the years. */}
          {dropdownValue === "Air Quality Days" &&
        <BarChart ref={comp => this.viz = comp} config={{
          data: `/api/data?measures=Air Quality Days&drilldowns=Category&Geography=${meta.id}&Year=all`,
          groupBy: "Category",
          height: 400,
          label: d => titleCase(d.Category),
          x: "Category",
          y: "Air Quality Days",
          time: "Year",
          xSort: (a, b) => a["ID Category"] - b["ID Category"],
          xConfig: {
            tickFormat: d => titleCase(formatAirQualityDaysName(d)),
            // hide vertical grid lines
            gridConfig: {
              opacity: 0
            }
          },
          yConfig: {
            tickFormat: d => titleCase(d),
            title: "Air Quality Days"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Quality Days", d => d["Air Quality Days"]], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          const data = resp.data.filter(d => d.Year !== "2018");
          console.log(data);
          return data;
        }}
        />}

          {dropdownValue === "Air Pollutants" &&
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=${meta.id}&Year=all` }
            title="Chart of Air Pollutants" />
          }
          {/* Lineplot to show air pollutants over the years. */}
          {dropdownValue === "Air Pollutants" &&
          <LinePlot ref={comp => this.viz = comp } config={{
            data: `/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            groupBy: "Pollutant",
            x: "Year",
            y: "Air Pollutant Days",
            yConfig: {
              title: "Air Pollutant Days"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Pollutant Days", d => d["Air Pollutant Days"]], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            const data = resp.data.filter(d => d.Year !== "2018");
            // console.log(data);
            return data;
          }}
          />}

          {dropdownValue === "Median Air Quality Index" &&
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Median AQI&Geography=${meta.id}&Year=all` }
            title="Chart of Median Air Quality Index" />
          }
          {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
          {dropdownValue === "Median Air Quality Index" &&
        <LinePlot ref={comp => this.viz = comp } config={{
          data: `/api/data?measures=Median AQI&Geography=${meta.id}&Year=all`,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Geography",
          x: "Year",
          y: "Median AQI",
          yConfig: {
            title: "Median AQI"
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Median AQI", d => d["Median AQI"]], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          const data = resp.data.filter(d => d.Year !== "2018");
          return data;
        }}
        />}

          {dropdownValue === "Unhealthy Air for Sensitive Groups" &&
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=Air Quality Days&Category=2&Geography=${meta.id}&Year=all` }
            title="Chart of Unhealthy for Sensitive Groups Days" />
          }
          {/* Lineplot to show air pollutants over the years. */}
          {dropdownValue === "Unhealthy Air for Sensitive Groups" &&
          <LinePlot ref={comp => this.viz = comp } config={{
            data: `/api/data?measures=Air Quality Days&Category=2&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            legend: false,
            groupBy: "Geography",
            x: "Year",
            y: "Air Quality Days",
            yConfig: {
              title: "Unhealthy for Sensitive Groups Days"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Unhealthy Air for Sensitive Groups Days", d => d["Air Quality Days"]], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            const data = resp.data.filter(d => d.Year !== "2018");
            return data;
          }}
          />}
        </div>
      </SectionColumns>
    );
  }
}

AirQuality.defaultProps = {
  slug: "air-quality"
};

AirQuality.need = [
  // Fetching data for 2017 since 2018 data is not available for all 365 days.
  fetchData("airQualityDays", "/api/data?measures=Air Quality Days&drilldowns=Category&Geography=<id>&Year=2017")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  airQualityDays: state.data.airQualityDays
});

export default connect(mapStateToProps)(AirQuality);
