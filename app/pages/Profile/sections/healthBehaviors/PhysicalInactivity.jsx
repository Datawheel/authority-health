import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatDropdownChoiceName = d => {
  const wordsList = d.split(" ");
  return `${wordsList[0]} ${wordsList[1]}`;
};

class PhysicalInactivity extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Physical Health Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {physicalInActivity, physicalInactivityPrevalenceBySex} = this.props;
    const {dropdownValue} = this.state;
    const dropdownList = ["Physical Health Data Value", "Physical Inactivity Data Value"];

    const physicalInactivitySelected = dropdownValue === "Physical Inactivity Data Value";

    // We don't find latest year data here (as we usually do for other topics) since we have only 1 year data for physical inactivity and physical health.
    const topRecentYearData = physicalInActivity.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    // Find recent year top data for physicalInactivityPrevalenceBySex.
    const recentYearPhysicalInactivityPrevalenceBySex = {};
    nest()
      .key(d => d["End Year"])
      .entries(physicalInactivityPrevalenceBySex)
      .forEach(group => {
        group.key >= physicalInactivityPrevalenceBySex[0].Year ? Object.assign(recentYearPhysicalInactivityPrevalenceBySex, group) : {};
      });
    const topPhysicalInactivityMaleData = recentYearPhysicalInactivityPrevalenceBySex.values.filter(d => d.Sex === "Male")[0];
    const topPhysicalInactivityFemaleData = recentYearPhysicalInactivityPrevalenceBySex.values.filter(d => d.Sex === "Female")[0];

    return (
      <SectionColumns>
        <SectionTitle>Physical Health and Inactivity</SectionTitle>
        <article>
          {/* Create a dropdown list for Physical Health and Physical Inactivity options. */}
          <select onChange={this.handleChange}>
            {dropdownList.map(item => <option key={item} value={item}>{formatDropdownChoiceName(item)}</option>)}
          </select>

          <Stat
            title={`Top ${dropdownValue} in ${topRecentYearData.Year}`}
            value={`${topRecentYearData.Tract} ${formatPercentage(topRecentYearData[dropdownValue])}`}
          />
          <p>The Geomap here shows the {dropdownValue} for Tracts in Wayne County, MI.</p>

          {/* Draw a BarChart to show data for Physical Inactivity by Sex. */}
          {physicalInactivitySelected
            ? <BarChart config={{
              data: physicalInactivityPrevalenceBySex,
              discrete: "y",
              height: 250,
              legend: false,
              groupBy: "Sex",
              label: d => d.Sex,
              x: "Adj Percent",
              y: "Sex",
              time: "ID Year",
              xConfig: {
                tickFormat: d => formatPercentage(d),
                title: "Physical Inactivity Rate"
              },
              yConfig: {
                ticks: []
              },
              tooltipConfig: {tbody: [["Value", d => formatPercentage(d["Adj Percent"])]]}
            }}
            />
            : null
          }

          {/* Show top stats for the Male and Female Physical Inactivity data. */}
          {physicalInactivitySelected
            ? <Stat
              title={`Majority Male with ${formatDropdownChoiceName(dropdownValue)} in ${topPhysicalInactivityMaleData.Year}`}
              value={`${topPhysicalInactivityMaleData.Geography} ${formatPercentage(topPhysicalInactivityMaleData["Adj Percent"])}`}
            />
            : null
          }
          {physicalInactivitySelected
            ? <Stat
              title={`Majority Female with ${formatDropdownChoiceName(dropdownValue)} in ${topPhysicalInactivityFemaleData.Year}`}
              value={`${topPhysicalInactivityFemaleData.Geography} ${formatPercentage(topPhysicalInactivityFemaleData["Adj Percent"])}`}
            />
            : null
          }

          {/* Write short paragraphs explaining Barchart and top stats for the Physical Inactivity data. */}
          {physicalInactivitySelected
            ? <p>The Barchart here shows the {formatDropdownChoiceName(dropdownValue)} data for male and female in the {topPhysicalInactivityFemaleData.Geography}.</p>
            : null
          }
          {physicalInactivitySelected
            ? <p>In {topPhysicalInactivityFemaleData.Year}, top {formatDropdownChoiceName(dropdownValue)} rate for Male and Female were {formatPercentage(topPhysicalInactivityMaleData["Adj Percent"])} and {formatPercentage(topPhysicalInactivityFemaleData["Adj Percent"])} respectively in the {topPhysicalInactivityFemaleData.Geography}, MI.</p>
            : null
          }
        </article>

        {/* Geomap to show Physical health and physical Inactivity for tracts in the Wayne County. */}
        <Geomap config={{
          data: physicalInActivity,
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

PhysicalInactivity.defaultProps = {
  slug: "physical-health-and-inactivity"
};

PhysicalInactivity.need = [
  fetchData("physicalInActivity", "/api/data?measures=Physical%20Health%20Data%20Value,Physical%20Inactivity%20Data%20Value&drilldowns=Tract&Year=all", d => d.data),
  fetchData("physicalInactivityPrevalenceBySex", "/api/data?measures=Adj%20Percent&drilldowns=Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  physicalInActivity: state.data.physicalInActivity,
  physicalInactivityPrevalenceBySex: state.data.physicalInactivityPrevalenceBySex
});

export default connect(mapStateToProps)(PhysicalInactivity);
