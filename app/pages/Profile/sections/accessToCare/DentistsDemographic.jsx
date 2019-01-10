import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatDentistsByAge = dentistsByAge => {
  nest()
    .key(d => d.Year)
    .entries(dentistsByAge)
    .forEach(group => {
      const total = sum(group.values, d => d["Number of Dentists"]);
      group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
    });
  const topDentistsAgeData = dentistsByAge.sort((a, b) => b.share - a.share)[0];
  return [dentistsByAge, topDentistsAgeData];
};

const formatDentistsByGender = dentistsByGender => {
  nest()
    .key(d => d.Year)
    .entries(dentistsByGender)
    .forEach(group => {
      const total = sum(group.values, d => d["Number of Dentists"]);
      group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
    });
  const topDentistsByGender = dentistsByGender.sort((a, b) => b.share - a.share)[0];
  return [dentistsByGender, topDentistsByGender];
};

class DentistsDemographic extends SectionColumns {

  render() {
    const {dentistsByAge, dentistsByGender} = this.props;
    const isDentistsByAgeAvailableForCurrentGeography = dentistsByAge.source[0].substitutions.length === 0;
    const isDentistsByGenderAvailableForCurrentGeography = dentistsByGender.source[0].substitutions.length === 0;

    const topDentistsAgeData = formatDentistsByAge(dentistsByAge.data)[1];
    const ageGeoId = formatDentistsByAge(dentistsByAge.data)[1]["ID Geography"];
    const topDentistsByGender = formatDentistsByGender(dentistsByGender.data)[1];
    const genderGeoId = formatDentistsByAge(dentistsByGender.data)[1]["ID Geography"];

    return (
      <SectionColumns>
        <SectionTitle>Dentist Demographics</SectionTitle>
        <article>
          {isDentistsByAgeAvailableForCurrentGeography && isDentistsByGenderAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {dentistsByAge.data[0].Geography}.</div>}
          <Stat
            title={"Common Age Group"}
            year={topDentistsAgeData.Year}
            value={`${topDentistsAgeData["Age Group"]}`}
            qualifier={formatPercentage(topDentistsAgeData.share)}
          />
          <Stat
            title={"Common Gender"}
            year={topDentistsByGender.Year}
            value={`${topDentistsByGender.Sex}`}
            qualifier={formatPercentage(topDentistsByGender.share)}
          />

          <p>In {topDentistsAgeData.Year}, the most common age group of dentists in {topDentistsAgeData.Geography} was {topDentistsAgeData["Age Group"]} years ({formatPercentage(topDentistsAgeData.share)}) and most common gender group was {topDentistsByGender.Sex} ({formatPercentage(topDentistsByGender.share)}).</p>
          <p>The chart on the right shows dentists age group share in {topDentistsAgeData.Geography}.</p>
          <p>The following chart shows dentists gender share in {topDentistsByGender.Geography}.</p>

          {/* Draw a Treemap for Dentists by Gender. */}
          <Treemap config={{
            data: `/api/data?measures=Number of Dentists&drilldowns=Sex&Geography=${genderGeoId}&Year=all`,
            height: 200,
            sum: d => d["Number of Dentists"],
            legend: false,
            groupBy: "Sex",
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["Location", d => d.Geography]]}
          }}
          dataFormat={resp => formatDentistsByGender(resp.data)[0]}
          />
        </article>

        {/* Draw a BarChart to show data for health center data by race */}
        <BarChart config={{
          data: `/api/data?measures=Number of Dentists&drilldowns=Age Group&Geography=${ageGeoId}&Year=all`,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Age Group",
          x: "Age Group",
          y: "share",
          time: "Year",
          xSort: (a, b) => a["ID Age Group"] - b["ID Age Group"],
          xConfig: {
            tickFormat: d => rangeFormatter(d) === "None" ? "Unknown Age" : rangeFormatter(d),
            labelRotation: false,
            title: "Age Group"
          },
          yConfig: {
            ticks: [],
            title: "Share",
            tickFormat: d => formatPercentage(d)
          },
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["Location", d => d.Geography]]}
        }}
        dataFormat={resp => formatDentistsByAge(resp.data)[0]}
        />
      </SectionColumns>
    );
  }
}

DentistsDemographic.defaultProps = {
  slug: "dentists-demographic"
};

DentistsDemographic.need = [
  fetchData("dentistsByAge", "/api/data?measures=Number of Dentists&drilldowns=Age Group&Geography=<id>&Year=latest"),
  fetchData("dentistsByGender", "/api/data?measures=Number of Dentists&drilldowns=Sex&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  dentistsByAge: state.data.dentistsByAge,
  dentistsByGender: state.data.dentistsByGender
});

export default connect(mapStateToProps)(DentistsDemographic);
