import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class TypesOfDentists extends SectionColumns {

  render() {

    const {dentistsByWorkingHours, dentistsByEmploymentStatus, dentistsBySpecialty, typesOfActiveDentists} = this.props;

    // Get data for Types of Active Dentists.
    const recentYearTypesOfActiveDentists = {};
    nest()
      .key(d => d.Year)
      .entries(typesOfActiveDentists)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= typesOfActiveDentists[0].Year ? Object.assign(recentYearTypesOfActiveDentists, group) : {};
      });

    // Filter out Private Practice Dentists data since it holds maximun percentage. Data for it is shown in stats.
    const filteredActiveDentistsData = typesOfActiveDentists.filter(d => d.Work !== "Private Practice");

    // Find recent year active dentists data for stats.
    recentYearTypesOfActiveDentists.values.sort((a, b) => b.share - a.share);
    const topTypeOfActiveDentist = recentYearTypesOfActiveDentists.values[0];

    // Get data for dentists by their Employment Status.
    const recentYearDentistsByEmploymentStatus = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByEmploymentStatus)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByEmploymentStatus[0].Year ? Object.assign(recentYearDentistsByEmploymentStatus, group) : {};
      });
    const filteredDentistsEmployementStatus = dentistsByEmploymentStatus.filter(d => d.Status !== "Active" && d.Status !== "Unknown");

    const filteredRecentYearEmployementStatus = recentYearDentistsByEmploymentStatus.values.filter(d => d.Status !== "Active");
    filteredRecentYearEmployementStatus.sort((a, b) => b.share - a.share);
    const topDentistsByEmploymentStatus = filteredRecentYearEmployementStatus[0];

    // Get data for Dentists by their Specialty.
    const recentYearDentistsBySpeciality = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsBySpecialty)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsBySpecialty[0].Year ? Object.assign(recentYearDentistsBySpeciality, group) : {};
      });
    const recentYearGpPediatricDentists = recentYearDentistsBySpeciality.values[0];
    const recentYearOtherSpecialtyDentists = recentYearDentistsBySpeciality.values[1];

    // Get data for Part-time and Full-time Dentists.
    const recentYearDentistsByWorkingHours = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByWorkingHours)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByWorkingHours[0].Year ? Object.assign(recentYearDentistsByWorkingHours, group) : {};
      });
    const recentYearFullTimeDentists = recentYearDentistsByWorkingHours.values[0];
    const recentYearPartTimeDentists = recentYearDentistsByWorkingHours.values[1];

    return (
      <SectionColumns>
        <SectionTitle>Types of Dentists</SectionTitle>
        <article>
          <Stat
            title={"Majority Active Dentist"}
            year={topTypeOfActiveDentist.Year}
            value={topTypeOfActiveDentist.Work}
            qualifier={formatPercentage(topTypeOfActiveDentist.share)}
          />
          <Stat
            title={"Majority dentists Employment status"}
            year={topDentistsByEmploymentStatus.Year}
            value={topDentistsByEmploymentStatus.Status}
            qualifier={formatPercentage(topDentistsByEmploymentStatus.share)}
          />
          <Stat
            title={"Full-time Dentists"}
            year={recentYearFullTimeDentists.Year}
            value={""}
            qualifier={formatPercentage(recentYearFullTimeDentists.share)}
          />
          <Stat
            title={"Part-time Dentists"}
            year={recentYearPartTimeDentists.Year}
            value={""}
            qualifier={formatPercentage(recentYearPartTimeDentists.share)}
          />
          <Stat
            title={"GP and Pediatric Dentists"}
            year={recentYearGpPediatricDentists.Year}
            value={""}
            qualifier={formatPercentage(recentYearGpPediatricDentists.share)}
          />
          <Stat
            title={"Other Specialty Dentists"}
            year={recentYearOtherSpecialtyDentists.Year}
            value={""}
            qualifier={formatPercentage(recentYearOtherSpecialtyDentists.share)}
          />

          <p>The Barchart on right shows the Types of Active Dentists in {topTypeOfActiveDentist.Geography} county, MI.</p>
          <p>The mini Barchart below shows the Dentists Employmemt Status in {topDentistsByEmploymentStatus.Geography} county, MI.</p>

          {/* Draw a BarChart to show data for Dentists by their Employement Status. */}
          <BarChart config={{
            data: filteredDentistsEmployementStatus,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "Status",
            y: "Status",
            x: "share",
            time: "ID Year",
            ySort: (a, b) => a["ID Status"] - b["ID Status"],
            yConfig: {
              labelRotation: false,
              title: "Employment Status"
            },
            xConfig: {
              ticks: [],
              labelRotation: false,
              tickFormat: d => formatPercentage(d)
            },
            shapeConfig: {label: false},
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        {/* Draw a BarChart to show data for Types of Active Dentists */}
        <BarChart config={{
          data: filteredActiveDentistsData,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Work",
          x: "Work",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Work"] - b["ID Work"],
          xConfig: {
            labelRotation: false,
            title: "Types of Active Dentists"
          },
          yConfig: {
            ticks: [],
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

TypesOfDentists.defaultProps = {
  slug: "types-of-dentists"
};

TypesOfDentists.need = [
  fetchData("dentistsByWorkingHours", "/api/data?measures=Number of Dentists&drilldowns=Hours&Geography=<id>&Year=all", d => d.data),
  fetchData("dentistsByEmploymentStatus", "/api/data?measures=Number of Dentists&drilldowns=Status&Geography=<id>&Year=all", d => d.data),
  fetchData("dentistsBySpecialty", "/api/data?measures=Number of Dentists&drilldowns=Specialty&Geography=<id>&Year=all", d => d.data),
  fetchData("typesOfActiveDentists", "/api/data?measures=Number of Dentists&drilldowns=Work&Status=Active&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  dentistsByWorkingHours: state.data.dentistsByWorkingHours,
  dentistsByEmploymentStatus: state.data.dentistsByEmploymentStatus,
  dentistsBySpecialty: state.data.dentistsBySpecialty,
  typesOfActiveDentists: state.data.typesOfActiveDentists
});

export default connect(mapStateToProps)(TypesOfDentists);

