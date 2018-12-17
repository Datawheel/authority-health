import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class DentistsWorkStatus extends SectionColumns {

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

    return (
      <SectionColumns>
        <SectionTitle>Dentists Work Status</SectionTitle>
        <article>
          <Stat
            title={"Private Practice"}
            year={topTypeOfActiveDentist.Year}
            value={formatPercentage(topTypeOfActiveDentist.share)}
          />
          <Stat
            title={"Full-time"}
            year={recentYearFullTimeDentists.Year}
            value={formatPercentage(recentYearFullTimeDentists.share)}
          />
          <Stat
            title={"GP and Pediatric"}
            year={recentYearGpPediatricDentists.Year}
            value={formatPercentage(recentYearGpPediatricDentists.share)}
          />
          <Stat
            title={"Other Specialty"}
            year={recentYearOtherSpecialtyDentists.Year}
            value={formatPercentage(recentYearOtherSpecialtyDentists.share)}
          />

          <p>{formatPercentage(topTypeOfActiveDentist.share)} of dentists in {topTypeOfActiveDentist.Geography} County operate out of a private practice and {formatPercentage(recentYearFullTimeDentists.share)} of dentists work full-time.</p>
          <p>In {recentYearGpPediatricDentists.Year}, {formatPercentage(recentYearGpPediatricDentists.share)} of all dentists in {recentYearGpPediatricDentists.Geography} County work in either pediatrics or general practice, with only {formatPercentage(recentYearOtherSpecialtyDentists.share)} practicing a speciality dental field.</p>
          <p>The following chart shows the breakdown of dentists who do not work in a private practice.</p>
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
          tooltipConfig: {tbody: [["Share", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

DentistsWorkStatus.defaultProps = {
  slug: "dentists-work-status"
};

DentistsWorkStatus.need = [
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

export default connect(mapStateToProps)(DentistsWorkStatus);

