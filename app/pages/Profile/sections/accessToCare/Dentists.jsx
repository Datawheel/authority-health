import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Dentists extends SectionColumns {

  render() {

    const {dentistsByAge, dentistsByGender, dentistsByWorkingHours, dentistsByEmploymentStatus, dentistsBySpecialty} = this.props;
    console.log("dentistsByAge: ", dentistsByAge);

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
    console.log("dentistsByGender: ", dentistsByGender);
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

    // Get data for Dentists working hours.
    console.log("dentistsByWorkingHours: ", dentistsByWorkingHours);
    const recentYearDentistsByWorkingHours = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByWorkingHours)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByWorkingHours[0].Year ? Object.assign(recentYearDentistsByWorkingHours, group) : {};
      });

    recentYearDentistsByWorkingHours.values.sort((a, b) => b.share - a.share);
    const topDentistsByHours = recentYearDentistsByWorkingHours.values[0];

    // Get data for dentists by Status.
    console.log("dentistsByEmploymentStatus: ", dentistsByEmploymentStatus);
    const recentYearDentistsByEmploymentStatus = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByEmploymentStatus)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByEmploymentStatus[0].Year ? Object.assign(recentYearDentistsByEmploymentStatus, group) : {};
      });

    recentYearDentistsByEmploymentStatus.values.sort((a, b) => b.share - a.share);
    const topDentistsByEmploymentStatus = recentYearDentistsByEmploymentStatus.values[0];

    // Get data for dentists by specialty.
    console.log("dentistsBySpecialty: ", dentistsBySpecialty);
    const recentYearDentistsBySpeciality = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsBySpecialty)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsBySpecialty[0].Year ? Object.assign(recentYearDentistsBySpeciality, group) : {};
      });

    recentYearDentistsBySpeciality.values.sort((a, b) => b.share - a.share);
    const topDentistsBySpeciality = recentYearDentistsBySpeciality.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Dentists</SectionTitle>
        <article>
          <Stat 
            title={`Majority Age group in ${topDentistsAgeData.Year}`}
            value={`${topDentistsAgeData["Age Group"]} ${formatPercentage(topDentistsAgeData.share)}`}
          />
          <Stat 
            title={`Majority Gender in ${topDentistsByGender.Year}`}
            value={`${topDentistsByGender.Sex} ${formatPercentage(topDentistsByGender.share)}`}
          />
          <Stat 
            title={`Majority Working hours dentists in ${topDentistsByHours.Year}`}
            value={`${topDentistsByHours.Hours} ${formatPercentage(topDentistsByHours.share)}`}
          />
          <p>The Barchart here shows the number of dentists by Age Group in {topDentistsAgeData.County} county, MI.</p>
          <p>In {topDentistsAgeData.Year}, the major dentists age group was {topDentistsAgeData["Age Group"]} years with {formatPercentage(topDentistsAgeData.share)}.</p>
          <p>In {topDentistsByGender.Year}, the major dentists gender group was {topDentistsAgeData.Sex} with {formatPercentage(topDentistsByGender.share)}.</p>

          {/* Draw a BarChart to show data for health center data by race */}
          {/* <BarChart config={{
            data: dentistsByGender,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "Sex",
            x: "share",
            y: "Sex",
            time: "ID Year",
            xConfig: {
              labelRotation: false,
              title: "Percentage of Dentists",
              tickFormat: d => formatPercentage(d)
            },
            yConfig: {
              ticks: [],
              title: "Gender"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          /> */}

          <LinePlot config={{
            data: dentistsByGender,
            discrete: "x",
            height: 175,
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

          {/* Lineplot to show occupacy status over the years at current location */}
          <LinePlot config={{
            data: dentistsByWorkingHours,
            discrete: "x",
            height: 175,
            groupBy: "Hours",
            legend: false,
            x: "Year",
            xConfig: {
              title: "Year",
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Dentists by Hours"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />

          {/* Lineplot to show occupacy status over the years at current location */}
          <LinePlot config={{
            data: dentistsBySpecialty,
            discrete: "x",
            height: 150,
            groupBy: "Specialty",
            legend: false,
            x: "Year",
            xConfig: {
              title: "Year",
              labelRotation: false
            },
            y: "share",
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Dentists by Speciality"
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

        {/* Draw a BarChart to show data for health center data by race */}
        <BarChart config={{
          data: dentistsByEmploymentStatus,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Status",
          x: "Status",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Status"] - b["ID Status"],
          xConfig: {
            labelRotation: false,
            title: "Employment Status"
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

Dentists.defaultProps = {
  slug: "dentists"
};

Dentists.need = [
  fetchData("dentistsByAge", "/api/data?measures=Number%20of%20Dentists&drilldowns=Age%20Group&County=<id>&Year=all", d => d.data),
  fetchData("dentistsByGender", "/api/data?measures=Number%20of%20Dentists&drilldowns=Sex&County=<id>&Year=all", d => d.data),
  fetchData("dentistsByWorkingHours", "/api/data?measures=Number%20of%20Dentists&drilldowns=Hours&County=<id>&Year=all", d => d.data),
  fetchData("dentistsByEmploymentStatus", "/api/data?measures=Number%20of%20Dentists&drilldowns=Status&County=<id>&Year=all", d => d.data),
  fetchData("dentistsBySpecialty", "/api/data?measures=Number%20of%20Dentists&drilldowns=Specialty&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  dentistsByAge: state.data.dentistsByAge,
  dentistsByGender: state.data.dentistsByGender,
  dentistsByWorkingHours: state.data.dentistsByWorkingHours,
  dentistsByEmploymentStatus: state.data.dentistsByEmploymentStatus,
  dentistsBySpecialty: state.data.dentistsBySpecialty
});

export default connect(mapStateToProps)(Dentists);

