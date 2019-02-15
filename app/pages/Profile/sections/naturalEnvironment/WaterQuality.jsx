import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {titleCase} from "d3plus-text";
import axios from "axios";

import styles from "style.yml";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatData = d => {
  let value = -1;
  if (d === "unavailable") value = 0;
  if (d === "normal") value = 1;
  if (d === "excessive") value = 2;
  return value;
};

const formatLabel = d => {
  if (d === 0) return "Unavailable";
  else if (d === 1) return "Normal";
  else if (d === 2) return "Excessive";
  return d;
};

const getLeadStats = excessiveLeadData => {
  const stats = [];
  excessiveLeadData.forEach(d => stats.push(<Stat
    title={"Excessive Lead"}
    year={d.Year}
    value={`${d.Tract}`}
  />));
  return stats;
};

const getMercuryStats = excessiveMercuryData => {
  const stats = [];
  excessiveMercuryData.forEach(d => stats.push(<Stat
    title={"Excessive Mercury"}
    year={d.Year}
    value={`${d.Tract}`}
  />));
  return stats;
};

class WaterQuality extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      waterQualityData: this.props.waterQualityData,
      dropdownValue: "Mercury Level"
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    this.setState({dropdownValue: event.target.value});
    axios.get(`/api/data?measures=${event.target.value}&drilldowns=Tract&Year=all`)
      .then(resp => this.setState({waterQualityData: resp.data.data}));
  }

  render() {
    const {waterQualityData, dropdownValue} = this.state;
    const dropdownList = ["Mercury Level", "Lead Level"];
    const leadLevelSelected = dropdownValue === "Lead Level";

    const filteredData = waterQualityData.filter(d => d["ID Tract"].startsWith("14000US26163"));
    const excessiveLeadData = filteredData.filter(d => d["Lead Level"] === "excessive");
    const excessiveMercuryData = filteredData.filter(d => d["Mercury Level"] === "excessive");

    const getStats = leadLevelSelected ? getLeadStats(excessiveLeadData) : getMercuryStats(excessiveMercuryData);

    const chartData = waterQualityData.filter(d => formatData(d[dropdownValue]) !== -1);

    return (
      <SectionColumns>
        <SectionTitle>Water Quality</SectionTitle>
        <article>
          {this.props.meta.level !== "tract" ? <div className="disclaimer">Data only available for tracts.</div> : <div></div>}
          {/* Create a dropdown for lead and mercury level in water. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          {getStats}
        </article>

        {/* Geomap to show Lead and Mercury level in water for all tracts in the Wayne County. */}
        <Geomap config={{
          data: chartData,
          groupBy: "ID Tract",
          label: d => d.Tract,
          colorScale: leadLevelSelected ? d => formatData(d["Lead Level"]) : d => formatData(d["Mercury Level"]),
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatLabel(d)},
            color: styles["terra-cotta"]
          },
          height: 400,
          time: "Year",
          tooltipConfig: leadLevelSelected ? {tbody: [["Year", d => d.Year], ["Lead Level", d => titleCase(d["Lead Level"])]]} : {tbody: [["Year", d => d.Year], ["Mercury Level", d => titleCase(d["Mercury Level"])]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => chartData.find(c => c["ID Tract"] === d.id)
        }}
        />
      </SectionColumns>
    );
  }
}

WaterQuality.defaultProps = {
  slug: "water-quality"
};

WaterQuality.need = [
  fetchData("waterQualityData", "/api/data?measures=Mercury Level&drilldowns=Tract&Year=all", d => d.data) // fetching all years data since we have to find excessive mercury level in all the years.
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  waterQualityData: state.data.waterQualityData
});

export default connect(mapStateToProps)(WaterQuality);
