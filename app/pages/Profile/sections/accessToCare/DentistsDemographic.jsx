import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
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

    console.log("topDentistsAgeData: ", topDentistsAgeData);
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

          <p>In {topDentistsAgeData.Year}, the most common age group of Dentists in was {topDentistsAgeData["Age Group"]} years with {formatPercentage(topDentistsAgeData.share)}.</p>
          <p>In {topDentistsByGender.Year}, the major dentists gender group was {topDentistsAgeData.Sex} with {formatPercentage(topDentistsByGender.share)}.</p>
          <p>The Barchart here shows the number of dentists by Age Group in the {topDentistsAgeData.Geography} county, MI.</p>

          <LinePlot config={{
            data: dentistsByGender,
            discrete: "x",
            height: 140,
            groupBy: "Sex",
            legend: false,
            x: "Year",
            xConfig: {
              title: "Year",
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Dentists by Gender"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
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
          time: "ID Year",
          xSort: (a, b) => a["ID Age Group"] - b["ID Age Group"],
          xConfig: {
            tickFormat: d => rangeFormatter(d) === "None" ? "Unknown Age" : rangeFormatter(d),
            labelRotation: false,
            title: "Age Group"
          },
          yConfig: {
            ticks: [],
            title: "Percentage of Dentists",
            tickFormat: d => formatPercentage(d)
          },
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
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
  fetchData("dentistsByAge", "/api/data?measures=Number%20of%20Dentists&drilldowns=Age%20Group&Geography=<id>&Year=all", d => d.data),
  fetchData("dentistsByGender", "/api/data?measures=Number%20of%20Dentists&drilldowns=Sex&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  dentistsByAge: state.data.dentistsByAge,
  dentistsByGender: state.data.dentistsByGender
});

export default connect(mapStateToProps)(DentistsDemographic);
