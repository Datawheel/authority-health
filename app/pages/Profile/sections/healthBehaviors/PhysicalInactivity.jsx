import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatDropdownChoiceName = d => d === "Physical Health" ? "Physical Bad Health" : "Physical Inactivity";

class PhysicalInactivity extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Physical Inactivity"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {physicalInActivity, physicalInactivityPrevalenceBySex} = this.props;
    const {dropdownValue} = this.state;
    const isPhysicalInactivityBySexAvailableForCurrentlocation =  physicalInactivityPrevalenceBySex.source[0].substitutions.length === 0;

    const dropdownList = ["Physical Inactivity", "Physical Health"];

    const physicalInactivitySelected = dropdownValue === "Physical Inactivity";

    // We don't find latest year data here (as we usually do for other topics) since we have only 1 year data for physical inactivity and physical health.
    const topRecentYearData = physicalInActivity.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    // Find recent year top data for physicalInactivityPrevalenceBySex.
    const recentYearPhysicalInactivityPrevalenceBySex = {};
    nest()
      .key(d => d["End Year"])
      .entries(physicalInactivityPrevalenceBySex.data)
      .forEach(group => {
        group.key >= physicalInactivityPrevalenceBySex.data[0].Year ? Object.assign(recentYearPhysicalInactivityPrevalenceBySex, group) : {};
      });
    const topPhysicalInactivityMaleData = recentYearPhysicalInactivityPrevalenceBySex.values.filter(d => d.Sex === "Male")[0];
    const topPhysicalInactivityFemaleData = recentYearPhysicalInactivityPrevalenceBySex.values.filter(d => d.Sex === "Female")[0];

    return (
      <SectionColumns>
        <SectionTitle>Physical Health and Inactivity</SectionTitle>
        <article>
          {isPhysicalInactivityBySexAvailableForCurrentlocation ? <div></div> : <div className="disclaimer">Showing data for {physicalInactivityPrevalenceBySex.data[0].Geography}.</div>}
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
                value={formatPercentage(topPhysicalInactivityMaleData["Age-Adjusted Physical Inactivity"])}
              />
              <Stat
                title={"Female Prevalence"}
                year={topPhysicalInactivityFemaleData.Year}
                value={formatPercentage(topPhysicalInactivityFemaleData["Age-Adjusted Physical Inactivity"])}
              />
              <p>In {topRecentYearData.Year}, {topRecentYearData.Tract} had the highest prevalence of {formatDropdownChoiceName(dropdownValue).toLowerCase()} ({formatPercentage(topRecentYearData[dropdownValue])}) out of all tracts in Wayne County.</p>
              <p>In {topPhysicalInactivityFemaleData.Year}, {formatDropdownChoiceName(dropdownValue).toLowerCase()} rates for male and female residents of Wayne County were {formatPercentage(topPhysicalInactivityMaleData["Age-Adjusted Physical Inactivity"])} and {formatPercentage(topPhysicalInactivityFemaleData["Age-Adjusted Physical Inactivity"])} respectively in the {topPhysicalInactivityFemaleData.Geography}, MI.</p>
              <p>The barchart here shows the {formatDropdownChoiceName(dropdownValue).toLowerCase()} data for male and female in {topPhysicalInactivityFemaleData.Geography}.</p>
            </div>
            : <p>In {topRecentYearData.Year}, {topRecentYearData.Tract} had the highest prevalence of {formatDropdownChoiceName(dropdownValue).toLowerCase()} ({formatPercentage(topRecentYearData[dropdownValue])}) out of all tracts in Wayne County.</p>
          }

          <p>The following map shows the {formatDropdownChoiceName(dropdownValue)} for all tracts in Wayne County, MI.</p>

          {/* Draw a BarChart to show data for Physical Inactivity by Sex. */}
          {physicalInactivitySelected
            ? <BarChart config={{
              data: physicalInactivityPrevalenceBySex.data,
              discrete: "y",
              height: 250,
              legend: false,
              groupBy: "Sex",
              label: d => d.Sex,
              x: "Age-Adjusted Physical Inactivity",
              y: "Sex",
              time: "Year",
              xConfig: {
                tickFormat: d => formatPercentage(d),
                title: "Physical Inactivity Rate"
              },
              yConfig: {
                ticks: []
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", `${formatDropdownChoiceName(dropdownValue)}`], 
                ["Prevalence", d => formatPercentage(d["Age-Adjusted Physical Inactivity"])], ["Location", d => d.Geography]]}
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", `${formatDropdownChoiceName(dropdownValue)}`], ["Prevalence", d => `${formatPercentage(d[dropdownValue])}`]]},
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
  fetchData("physicalInActivity", "/api/data?measures=Physical Health,Physical Inactivity&drilldowns=Tract&Year=all", d => d.data),
  fetchData("physicalInactivityPrevalenceBySex", "/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&Geography=<id>&Year=all")
];

const mapStateToProps = state => ({
  physicalInActivity: state.data.physicalInActivity,
  physicalInactivityPrevalenceBySex: state.data.physicalInactivityPrevalenceBySex
});

export default connect(mapStateToProps)(PhysicalInactivity);
