import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

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

    const {meta, physicalInActivity, physicalInactivityPrevalenceBySex} = this.props;
    const {dropdownValue} = this.state;
    const isPhysicalInactivityBySexAvailableForCurrentlocation = physicalInactivityPrevalenceBySex.source[0].substitutions.length === 0;

    const dropdownList = ["Physical Inactivity", "Physical Health"];

    const physicalInactivitySelected = dropdownValue === "Physical Inactivity";

    // We don't find latest year data here (as we usually do for other topics) since we have only 1 year data for physical inactivity and physical health.
    const topRecentYearData = physicalInActivity.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    // Find recent year top data for physicalInactivityPrevalenceBySex.
    const topPhysicalInactivityMaleData = physicalInactivityPrevalenceBySex.data.filter(d => d.Sex === "Male")[0];
    const topPhysicalInactivityFemaleData = physicalInactivityPrevalenceBySex.data.filter(d => d.Sex === "Female")[0];

    return (
      <SectionColumns>
        <SectionTitle>Physical Health and Inactivity</SectionTitle>
        <article>
          {isPhysicalInactivityBySexAvailableForCurrentlocation ? <div></div> : <div className="disclaimer">Showing data for {physicalInactivityPrevalenceBySex.data[0].Geography}.</div>}
          {/* Create a dropdown list for Physical Health and Physical Inactivity options. */}
          <label className="pt-label pt-inline" htmlFor="physical-inactivity-dropdown">
            Show data for
            <div className="pt-select">
              <select id="physical-inactivity-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{formatDropdownChoiceName(item)}</option>)}
              </select>
            </div>
          </label>

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
              <p>In {topPhysicalInactivityFemaleData.Year}, {formatDropdownChoiceName(dropdownValue).toLowerCase()} rates for male and female residents of Wayne County were {formatPercentage(topPhysicalInactivityMaleData["Age-Adjusted Physical Inactivity"])} and {formatPercentage(topPhysicalInactivityFemaleData["Age-Adjusted Physical Inactivity"])} respectively in the {topPhysicalInactivityFemaleData.Geography}.</p>
              <p>The barchart here shows the {formatDropdownChoiceName(dropdownValue).toLowerCase()} data for male and female in {topPhysicalInactivityFemaleData.Geography}.</p>
            </div>
            : <p>In {topRecentYearData.Year}, {topRecentYearData.Tract} had the highest prevalence of {formatDropdownChoiceName(dropdownValue).toLowerCase()} ({formatPercentage(topRecentYearData[dropdownValue])}) out of all tracts in Wayne County.</p>
          }

          <p>The following map shows the {formatDropdownChoiceName(dropdownValue)} for all tracts in Wayne County.</p>

          {/* Draw a BarChart to show data for Physical Inactivity by Sex. */}
          {physicalInactivitySelected
            ? <BarChart config={{
              data: `/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&Geography=${meta.id}&Year=all`,
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
                ["Prevalence", d => formatPercentage(d["Age-Adjusted Physical Inactivity"])], ["County", d => d.Geography]]}
            }}
            dataFormat={resp => resp.data}
            />
            : null
          }
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show Physical health and physical Inactivity for tracts in the Wayne County. */}
        <Geomap config={{
          data: physicalInActivity,
          groupBy: "ID Tract",
          dropdownValue, // This attribute is added so that the geomap re-renders and updates when the dropdown value changes.
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
  fetchData("physicalInActivity", "/api/data?measures=Physical Health,Physical Inactivity&drilldowns=Tract&Year=all", d => d.data), // physicalInActivity has only 1 year data (so Year=all is just 1 year data). 
  fetchData("physicalInactivityPrevalenceBySex", "/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  physicalInActivity: state.data.physicalInActivity,
  physicalInactivityPrevalenceBySex: state.data.physicalInactivityPrevalenceBySex
});

export default connect(mapStateToProps)(PhysicalInactivity);
