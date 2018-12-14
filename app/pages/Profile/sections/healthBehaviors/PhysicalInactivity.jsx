import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatDropdownChoiceName = d => d === "Physical Health Data Value" ? "Physical Bad Health" : "Physical Inactivity";

class PhysicalInactivity extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Physical Inactivity Data Value"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {physicalInActivity, physicalInactivityPrevalenceBySex} = this.props;
    const {dropdownValue} = this.state;
    const dropdownList = ["Physical Inactivity Data Value", "Physical Health Data Value"];

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
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{formatDropdownChoiceName(item)}</option>)}
            </select>
          </div>

          <Stat
            title={"Location with highest prevalence"}
            year={topRecentYearData.Year}
            value={topRecentYearData.Tract}
            qualifier={formatPercentage(topRecentYearData[dropdownValue])}
          />

          {/* Show top stats for the Male and Female Physical Inactivity data. */}
          {/* And write short paragraphs explaining Barchart and top stats for the Physical Inactivity data. */}
          {physicalInactivitySelected
            ? <div>
              <Stat
                title={"Male Prevalence"}
                year={topPhysicalInactivityMaleData.Year}
                value={formatPercentage(topPhysicalInactivityMaleData["Adj Percent"])}
              />
              <Stat
                title={"Female Prevalence"}
                year={topPhysicalInactivityFemaleData.Year}
                value={formatPercentage(topPhysicalInactivityFemaleData["Adj Percent"])}
              />
              <p>In {topRecentYearData.Year}, {topRecentYearData.Tract} had the highest prevalence of {formatDropdownChoiceName(dropdownValue).toLowerCase()} ({formatPercentage(topRecentYearData[dropdownValue])}) out of all tracts in Wayne county.</p>
              <p>In {topPhysicalInactivityFemaleData.Year}, {formatDropdownChoiceName(dropdownValue).toLowerCase()} rates for male and female residents of Wayne county were {formatPercentage(topPhysicalInactivityMaleData["Adj Percent"])} and {formatPercentage(topPhysicalInactivityFemaleData["Adj Percent"])} respectively in the {topPhysicalInactivityFemaleData.Geography}, MI.</p>
              <p>The Barchart here shows the {formatDropdownChoiceName(dropdownValue)} data for male and female in {topPhysicalInactivityFemaleData.Geography}.</p>
            </div>
            : <p>In {topRecentYearData.Year}, {topRecentYearData.Tract} had the highest prevalence of {formatDropdownChoiceName(dropdownValue).toLowerCase()} ({formatPercentage(topRecentYearData[dropdownValue])}) out of all tracts in Wayne county.</p>
          }

          <p>The following map shows the {formatDropdownChoiceName(dropdownValue)} for all tracts in Wayne county, MI.</p>

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
              tooltipConfig: {tbody: [["Condition:", `${formatDropdownChoiceName(dropdownValue)}`], ["Prevalence", d => formatPercentage(d["Adj Percent"])]]}
            }}
            />
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
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPercentage(d)}
          },
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Condition:", `${formatDropdownChoiceName(dropdownValue)}`], ["Prevalence:", d => `${formatPercentage(d[dropdownValue])}`]]},
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
  fetchData("physicalInActivity", "/api/data?measures=Physical Health Data Value,Physical Inactivity Data Value&drilldowns=Tract&Year=all", d => d.data),
  fetchData("physicalInactivityPrevalenceBySex", "/api/data?measures=Adj Percent&drilldowns=Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  physicalInActivity: state.data.physicalInActivity,
  physicalInactivityPrevalenceBySex: state.data.physicalInactivityPrevalenceBySex
});

export default connect(mapStateToProps)(PhysicalInactivity);
