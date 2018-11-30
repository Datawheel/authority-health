import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatDropdownChoiceName = d => {
  const wordsList = d.split(" ");
  return `${wordsList[0]} ${wordsList[1]}`;
};

class PhysicalActivity extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Physical Health Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {physicalActivity} = this.props;
    const {dropdownValue} = this.state;
    const dropdownList = ["Physical Health Data Value", "Physical Inactivity Data Value"];

    // We don't find latest year data here (as we usually do for other topics) since we have only 1 year data for physical inactivity and physical health.
    const topRecentYearData = physicalActivity.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Physical Health and Inactivity</SectionTitle>
        <article>
          {/* Create a dropdown list for Physical Health and Physical Activity options. */}
          <select onChange={this.handleChange}>
            {dropdownList.map((item, i) => <option key={i} value={item}>{formatDropdownChoiceName(item)}</option>)}
          </select>

          <Stat
            title={`Top ${dropdownValue} in ${topRecentYearData.Year}`}
            value={`${topRecentYearData.Tract} ${formatPercentage(topRecentYearData[dropdownValue])}`}
          />
          <p>The Geomap here shows the {dropdownValue} for Tracts in Wayne County, MI.</p>
        </article>

        {/* Geomap to show Physical health and physical Inactivity for tracts in the Wayne County. */}
        <Geomap config={{
          data: physicalActivity,
          groupBy: "ID Tract",
          dropdownValue, // This attribute is added so that the Geomap re-renders and updates when the dropdown value changes.
          label: d => d.Tract,
          colorScale: d => d[dropdownValue],
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => `${formatPercentage(d[dropdownValue])}`]]},
          topojson: "/topojson/tract.json",
          topojsonFilter: d => d.id.startsWith("14000US26163")
        }}
        />
      </SectionColumns>
    );
  }
}

PhysicalActivity.defaultProps = {
  slug: "physical-health-and-inactivity"
};


PhysicalActivity.need = [
  fetchData("physicalActivity", "/api/data?measures=Physical%20Health%20Data%20Value,Physical%20Inactivity%20Data%20Value&drilldowns=Tract&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  physicalActivity: state.data.physicalActivity
});

export default connect(mapStateToProps)(PhysicalActivity);
