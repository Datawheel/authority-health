import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Stat from "components/Stat";
import CensusTractDefinition from "components/CensusTractDefinition";

const definitions = [
  {term: "Physical Inactivity", definition: "In the Diabetes Atlas application, a person is considered to be physically inactive if he or she reported not participating in physical activity or exercise in the past 30 days."}
];

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class PhysicalInactivity extends SectionColumns {

  render() {

    const {meta, physicalInactivity, physicalInactivityPrevalenceBySex, stateLevelDataBySex} = this.props;
    const isPhysicalInactivityBySexAvailableForCurrentlocation = physicalInactivityPrevalenceBySex.source[0].substitutions.length === 0;

    // We don't find latest year data here (as we usually do for other topics) since we have only 1 year data for physical inactivity and physical health.
    const topRecentYearData = physicalInactivity.sort((a, b) => b["Physical Inactivity"] - a["Physical Inactivity"])[0];

    // Find recent year top data for physicalInactivityPrevalenceBySex.
    const topPhysicalInactivityMaleData = physicalInactivityPrevalenceBySex.data.filter(d => d.Sex === "Male")[0];
    const topPhysicalInactivityFemaleData = physicalInactivityPrevalenceBySex.data.filter(d => d.Sex === "Female")[0];

    // Find recent year data for stateLevelDataBySex.
    const stateLevelMaleData = stateLevelDataBySex.filter(d => d.Sex === "Male")[0];
    const stateLevelFemaleData = stateLevelDataBySex.filter(d => d.Sex === "Female")[0];

    return (
      <SectionColumns>
        <SectionTitle>Physical Inactivity</SectionTitle>
        <article>
          {isPhysicalInactivityBySexAvailableForCurrentlocation ? <div></div> : <div className="disclaimer">data is shown for {physicalInactivityPrevalenceBySex.data[0].Geography}</div>}

          <Stat
            title={"Location with highest prevalence"}
            year={topRecentYearData.Year}
            value={topRecentYearData.Tract}
            qualifier={`${formatPercentage(topRecentYearData["Physical Inactivity"])} of the population of this census tract`}
          />

          {/* Show top stats for the Male and Female Physical Inactivity data. */}
          {/* And write short paragraphs explaining Barchart and top stats for the Physical Inactivity data. */}
          <Stat
            title={"Male Prevalence"}
            year={topPhysicalInactivityMaleData.Year}
            value={formatPercentage(topPhysicalInactivityMaleData["Age-Adjusted Physical Inactivity"])}
            qualifier={`of male population in ${topPhysicalInactivityMaleData.Geography}`}
          />
          <Stat
            title={"Female Prevalence"}
            year={topPhysicalInactivityFemaleData.Year}
            value={formatPercentage(topPhysicalInactivityFemaleData["Age-Adjusted Physical Inactivity"])}
            qualifier={`of female population in ${topPhysicalInactivityFemaleData.Geography}`}
          />
          <p>In {topRecentYearData.Year}, {formatPercentage(topRecentYearData["Physical Inactivity"])} of the population of <CensusTractDefinition text={topRecentYearData.Tract} /> had the highest prevalence of physical inactivity out of all census tracts in Detroit, Livonia, Dearborn and Westland.</p>
          <p>In {topPhysicalInactivityFemaleData.Year}, {formatPercentage(topPhysicalInactivityMaleData["Age-Adjusted Physical Inactivity"])} of the male population and {formatPercentage(topPhysicalInactivityFemaleData["Age-Adjusted Physical Inactivity"])} of the female population in {}
            {topPhysicalInactivityFemaleData.Geography} were physically inactive, as compared to {formatPercentage(stateLevelMaleData["Age-Adjusted Physical Inactivity"])} of the male and {formatPercentage(stateLevelFemaleData["Age-Adjusted Physical Inactivity"])} of the female population in Michigan.</p>

          {/* Draw a BarChart to show data for Physical Inactivity by Sex. */}
          <BarChart config={{
            data: `/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&Geography=${meta.id}&Year=all`,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "Sex",
            label: d => d.Sex,
            x: "Age-Adjusted Physical Inactivity",
            y: "Sex",
            time: "Year",
            title: d => `Physical Inactivity by Gender in ${d[0].Geography}`,
            xConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Physical Inactivity Rate"
            },
            yConfig: {
              barConfig: {stroke: "transparent"},
              ticks: []
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Condition", "Physical Inactivity"],
              ["Prevalence", d => formatPercentage(d["Age-Adjusted Physical Inactivity"])], ["County", d => d.Geography]]}
          }}
          dataFormat={resp => resp.data}
          />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show Physical health and physical Inactivity for tracts in the Wayne County. */}
        <Geomap config={{
          data: physicalInactivity, // only 1 year data available.
          groupBy: "ID Tract",
          label: d => d.Tract,
          colorScale: d => d["Physical Inactivity"],
          colorScaleConfig: {
            axisConfig: {tickFormat: d => formatPercentage(d)}
          },
          time: "Year",
          title: "Physical Inactivity for Census Tracts within Detroit, Livonia, Dearborn and Westland",
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
  slug: "physical-inactivity"
};

PhysicalInactivity.need = [
  fetchData("physicalInactivity", "/api/data?measures=Physical Inactivity&drilldowns=Tract&Year=latest", d => d.data), // only 1 year data available
  fetchData("physicalInactivityPrevalenceBySex", "/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&Geography=<id>&Year=latest"),
  fetchData("stateLevelDataBySex", "/api/data?measures=Age-Adjusted Physical Inactivity&drilldowns=Sex&State=04000US26&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  physicalInactivity: state.data.physicalInactivity,
  physicalInactivityPrevalenceBySex: state.data.physicalInactivityPrevalenceBySex,
  stateLevelDataBySex: state.data.stateLevelDataBySex
});

export default connect(mapStateToProps)(PhysicalInactivity);
