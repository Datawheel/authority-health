import React from "react";
import {sum} from "d3-array";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

class AirQuality extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      meta: this.props.meta,
      dropdownValue: "Air Quality"
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    const {meta} = this.state;
    if (dropdownValue === "Air Pollutants") {
      axios.get(`/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=${meta.id}&Year=latest`)
        .then(resp => {
          this.setState({
            airPollutants: resp.data.data,
            dropdownValue
          });
        });
    }
    else if (dropdownValue === "Median Air Quality Index") {
      axios.get(`/api/data?measures=Median AQI&Geography=${meta.id}&Year=latest`)
        .then(resp => {
          this.setState({
            airQualityMedianAQIs: resp.data.data,
            dropdownValue
          });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {

    const {meta, airQualityDays, airQualityMedianAQIs, airPollutants} = this.props;
    const {dropdownValue} = this.state;

    const dropdownList = ["Air Quality", "Air Pollutants", "Median Air Quality Index"];

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isAirQualityDaysAvailableForCurrentGeography = airQualityDays.source[0].substitutions.length === 0;

    // Get top recent year air polutants data
    const totalNumberOfDays = sum(airQualityDays.data, d => d["Air Quality Days"]);
    airQualityDays.data.forEach(d => d.share = d["Air Quality Days"] / totalNumberOfDays * 100);
    const topRecentYearAirQualityDays = airQualityDays.data.sort((a, b) => b.share - a.share)[0];

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

          {dropdownValue === "Air Quality" && 
          <div>
            <Stat
              title={"Days with good quality"}
              year={topRecentYearAirQualityDays.Year}
              value={formatPercentage(topRecentYearAirQualityDays.share)}
              qualifier={`${topRecentYearAirQualityDays["Air Quality Days"]} of 90 days measured`}
            />
            <p>{topRecentYearAirQualityDays["Air Quality Days"]} of 90 days measured were good quality air in {topRecentYearAirQualityDays.Year}.</p>
          </div>}

          {dropdownValue === "Air Pollutants" &&
          <div>
            <Stat
              title={"Most common air pollutant"}
              year={topRecentYearAirPollutant.Year}
              value={topRecentYearAirPollutant.Pollutant}
              qualifier={`${topRecentYearAirPollutant["Air Pollutant Days"]} days`}
            />
            <p>The most common air pollutants was {topRecentYearAirPollutant.Pollutant} in {topRecentYearAirPollutant.Year}.</p>
          </div>}
          {dropdownValue === "Median Air Quality Index" &&
          <div>
            <Stat
              title={"Median Air Quality Index"}
              year={airQualityMedianAQIs[0].Year}
              value={airQualityMedianAQIs[0]["Median AQI"]}
            />
            <p>The median air quality index was {airQualityMedianAQIs[0]["Median AQI"]} in {airQualityMedianAQIs[0].Geography}.</p>
          </div>}

          <p>The chart here shows the {dropdownValue.toLocaleLowerCase()} over years in Wayne County.</p>

          {!isAirQualityDaysAvailableForCurrentGeography &&
            <Disclaimer>Data is shown for {airQualityDays.data[0].Geography}</Disclaimer>
          }
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Lineplot to show air quality days over the years. */}
        {dropdownValue === "Air Quality" && 
        <LinePlot config={{
          data: `/api/data?measures=Air Quality Days&drilldowns=Category&Geography=${meta.id}&Year=all`,
          discrete: "x",
          height: 400,
          title: d => `Air Quality Over Years in ${d[0].Geography}`,
          legend: false,
          label: d => titleCase(d.Category),
          groupBy: "Category",
          x: "Year",
          y: "Air Quality Days",
          yConfig: {
            title: "Testing Days"
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Quality Days", d => d["Air Quality Days"]], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          return resp.data;
        }}
        />}

        {/* Lineplot to show air pollutants over the years. */}
        {dropdownValue === "Air Pollutants" && 
          <LinePlot config={{
            data: `/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=${meta.id}&Year=all`,
            discrete: "x",
            height: 400,
            title: d => `Air Pollutants Over Years in ${d[0].Geography}`,
            legend: false,
            groupBy: "Pollutant",
            x: "Year",
            y: "Air Pollutant Days",
            yConfig: {
              title: "Testing Days"
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Air Pollutant Days", d => d["Air Pollutant Days"]], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
          />}

        {/* Lineplot to show Median AQI stats over the years in the Waye county. */}
        {dropdownValue === "Median Air Quality Index" && 
        <LinePlot config={{
          data: `/api/data?measures=Median AQI&Geography=${meta.id}&Year=all`,
          discrete: "x",
          height: 400,
          title: d => `Median AQI Over Years in ${d[0].Geography}`,
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
          return resp.data;
        }}
        />
        }
      </SectionColumns>
    );
  }
}

AirQuality.defaultProps = {
  slug: "air-quality"
};

AirQuality.need = [
  fetchData("airQualityDays", "/api/data?measures=Air Quality Days&drilldowns=Category&Geography=<id>&Year=latest"),
  fetchData("airQualityMedianAQIs", "/api/data?measures=Median AQI&Geography=<id>&Year=latest", d => d.data),
  fetchData("airPollutants", "/api/data?measures=Air Pollutant Days&drilldowns=Pollutant&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  airQualityDays: state.data.airQualityDays,
  airQualityMedianAQIs: state.data.airQualityMedianAQIs,
  airPollutants: state.data.airPollutants
});

export default connect(mapStateToProps)(AirQuality);
