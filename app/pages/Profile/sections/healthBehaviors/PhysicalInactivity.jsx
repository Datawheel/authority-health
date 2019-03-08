import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class PhysicalInactivity extends SectionColumns {

  render() {

    const {meta, physicalInActivity, physicalInactivityPrevalenceBySex} = this.props;
    const isPhysicalInactivityBySexAvailableForCurrentlocation = physicalInactivityPrevalenceBySex.source[0].substitutions.length === 0;

    // We don't find latest year data here (as we usually do for other topics) since we have only 1 year data for physical inactivity and physical health.
    const topRecentYearData = physicalInActivity.sort((a, b) => b["Physical Inactivity"] - a["Physical Inactivity"])[0];

    // Find recent year top data for physicalInactivityPrevalenceBySex.
    const topPhysicalInactivityMaleData = physicalInactivityPrevalenceBySex.data.filter(d => d.Sex === "Male")[0];
    const topPhysicalInactivityFemaleData = physicalInactivityPrevalenceBySex.data.filter(d => d.Sex === "Female")[0];

    return (
      <SectionColumns>
        <SectionTitle>Physical Health and Inactivity</SectionTitle>
        <article>
          {isPhysicalInactivityBySexAvailableForCurrentlocation ? <div></div> : <div className="disclaimer">Showing data for {physicalInactivityPrevalenceBySex.data[0].Geography}.</div>}
 
          <Stat
            title={"Location with highest prevalence"}
            year={topRecentYearData.Year}
            value={topRecentYearData.Tract}
            qualifier={formatPercentage(topRecentYearData["Physical Inactivity"])}
          />

          {/* Show top stats for the Male and Female Physical Inactivity data. */}
          {/* And write short paragraphs explaining Barchart and top stats for the Physical Inactivity data. */}
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
          <p>In {topRecentYearData.Year}, {topRecentYearData.Tract} had the highest prevalence of physical inactivity ({formatPercentage(topRecentYearData["Physical Inactivity"])}) out of all tracts in Wayne County.</p>
          <p>In {topPhysicalInactivityFemaleData.Year}, physical inactivity rates for male and female residents of Wayne County were {formatPercentage(topPhysicalInactivityMaleData["Age-Adjusted Physical Inactivity"])} and {formatPercentage(topPhysicalInactivityFemaleData["Age-Adjusted Physical Inactivity"])} respectively in the {topPhysicalInactivityFemaleData.Geography}.</p>
          <p>The barchart here shows the physical inactivity data for male and female in {topPhysicalInactivityFemaleData.Geography}.</p>

          <p>The following map shows the physical inactivity for all tracts in Wayne County.</p>

          {/* Draw a BarChart to show data for Physical Inactivity by Sex. */}
          <BarChart config={{
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", "Physical Inactivity"],
              ["Prevalence", d => formatPercentage(d["Age-Adjusted Physical Inactivity"])], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => resp.data}
          />
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show Physical health and physical Inactivity for tracts in the Wayne County. */}
        <Geomap config={{
          data: physicalInActivity, // only 1 year data available.
          groupBy: "ID Tract",
          label: d => d.Tract,
          colorScale: d => d["Physical Inactivity"],
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPercentage(d)}
          },
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", "Physical Inactivity"], ["Prevalence", d => `${formatPercentage(d["Physical Inactivity"])}`]]},
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
  fetchData("physicalInActivity", "/api/data?measures=Physical Inactivity&drilldowns=Tract&Year=latest", d => d.data), // only 1 year data available
  fetchData("physicalInactivityPrevalenceBySex", "/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  physicalInActivity: state.data.physicalInActivity,
  physicalInactivityPrevalenceBySex: state.data.physicalInactivityPrevalenceBySex
});

export default connect(mapStateToProps)(PhysicalInactivity);
