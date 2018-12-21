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

class DentistsDemographic extends SectionColumns {

  render() {
    const {dentistsByAge, dentistsByGender} = this.props;

    const recentYearDentistsByAgeData = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByAge)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByAge[0].Year ? Object.assign(recentYearDentistsByAgeData, group) : {};
      });
    recentYearDentistsByAgeData.values.sort((a, b) => b.share - a.share);
    const topDentistsAgeData = recentYearDentistsByAgeData.values[0];

    // Get data for dentists by Gender.
    const recentYearDentistsByGender = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByGender)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByGender[0].Year ? Object.assign(recentYearDentistsByGender, group) : {};
      });

    recentYearDentistsByGender.values.sort((a, b) => b.share - a.share);
    const topDentistsByGender = recentYearDentistsByGender.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Dentist Demographics</SectionTitle>
        <article>
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

          <p>In {topDentistsAgeData.Year}, the most common age group of dentists in {topDentistsAgeData.Geography} County was {topDentistsAgeData["Age Group"]} years ({formatPercentage(topDentistsAgeData.share)}) and most common gender group was {topDentistsByGender.Sex} ({formatPercentage(topDentistsByGender.share)}).</p>
          <p>The barchart here shows dentists age group share in {topDentistsAgeData.Geography} County.</p>
          <p>The following barchart shows dentists gender share in {topDentistsByGender.Geography} County.</p>

          {/* Draw a Treemap for Dentists by Gender. */}
          <Treemap config={{
            data: dentistsByGender,
            height: 200,
            sum: d => d["Number of Dentists"],
            legend: false,
            groupBy: "Sex",
            time: "Year",
            tooltipConfig: {tbody: [["Share", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        {/* Draw a BarChart to show data for health center data by race */}
        <BarChart config={{
          data: dentistsByAge,
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

DentistsDemographic.defaultProps = {
  slug: "dentists-demographic"
};

DentistsDemographic.need = [
  fetchData("dentistsByAge", "/api/data?measures=Number of Dentists&drilldowns=Age Group&Geography=<id>&Year=all", d => d.data),
  fetchData("dentistsByGender", "/api/data?measures=Number of Dentists&drilldowns=Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  dentistsByAge: state.data.dentistsByAge,
  dentistsByGender: state.data.dentistsByGender
});

export default connect(mapStateToProps)(DentistsDemographic);
