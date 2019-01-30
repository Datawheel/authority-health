import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

// Get data for Part-time and Full-time Dentists.
const formatDentistsByWorkingHours = dentistsByWorkingHours => {
  nest()
    .key(d => d.Year)
    .entries(dentistsByWorkingHours)
    .forEach(group => {
      const total = sum(group.values, d => d["Dentists in Private Practice by Hours"]);
      group.values.forEach(d => d.share = d["Dentists in Private Practice by Hours"] / total * 100);
    });
  return dentistsByWorkingHours;
};

// Get data for Dentists by their Specialty.
const formatDentistsBySpecialty = dentistsBySpecialty => {
  nest()
    .key(d => d.Year)
    .entries(dentistsBySpecialty)
    .forEach(group => {
      const total = sum(group.values, d => d["Dentists in Private Practice by Specialty"]);
      group.values.forEach(d => d.share = d["Dentists in Private Practice by Specialty"] / total * 100);
    });
  const recentYearGpPediatricDentists = dentistsBySpecialty[0];
  const recentYearOtherSpecialtyDentists = dentistsBySpecialty[1];
  return [dentistsBySpecialty, recentYearGpPediatricDentists, recentYearOtherSpecialtyDentists];
};

// Get data for Types of Active Dentists.
const formatTypesOfActiveDentists = typesOfActiveDentists => {
  nest()
    .key(d => d.Year)
    .entries(typesOfActiveDentists)
    .forEach(group => {
      const total = sum(group.values, d => d["Number of Dentists"]);
      group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
    });
  // Filter out Private Practice Dentists data since it holds maximun percentage. Data for it is shown in stats.
  const filteredActiveDentistsData = typesOfActiveDentists.filter(d => d.Work !== "Private Practice");
  
  // Find recent year top active dentists data for stats.
  const topTypeOfActiveDentist = typesOfActiveDentists.sort((a, b) => b.share - a.share)[0];
  return [filteredActiveDentistsData, topTypeOfActiveDentist];
};

class DentistsWorkStatus extends SectionColumns {

  render() {

    const {dentistsByWorkingHours, dentistsBySpecialty, typesOfActiveDentists} = this.props;

    // Check if the data is available for current profile or if it falls back to the parent geography.
    const isDataAvailableForCurrentGeography = dentistsByWorkingHours.source[0].substitutions.length === 0;

    const recentYearFullTimeDentists = formatDentistsByWorkingHours(dentistsByWorkingHours.data)[0];

    const recentYearGpPediatricDentists = formatDentistsBySpecialty(dentistsBySpecialty.data)[1];
    const recentYearOtherSpecialtyDentists = formatDentistsBySpecialty(dentistsBySpecialty.data)[2];

    const topTypeOfActiveDentist = formatTypesOfActiveDentists(typesOfActiveDentists.data)[1];
    const geoId = topTypeOfActiveDentist["ID Geography"];

    return (
      <SectionColumns>
        <SectionTitle>Dentists Work Status</SectionTitle>
        <article>
          {isDataAvailableForCurrentGeography ? <div></div> : <div className="disclaimer">Showing data for {dentistsByWorkingHours.data[0].Geography}.</div>}
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

          <p>{formatPercentage(topTypeOfActiveDentist.share)} of dentists in {topTypeOfActiveDentist.Geography} operate out of a private practice and {formatPercentage(recentYearFullTimeDentists.share)} of dentists work full-time.</p>
          <p>In {recentYearGpPediatricDentists.Year}, {formatPercentage(recentYearGpPediatricDentists.share)} of all dentists in {recentYearGpPediatricDentists.Geography} work in either pediatrics or general practice, with only {formatPercentage(recentYearOtherSpecialtyDentists.share)} practicing a speciality dental field.</p>
          <p>The following chart shows the breakdown of dentists who do not work in a private practice.</p>
        </article>

        {/* Draw a BarChart to show data for Types of Active Dentists */}
        <BarChart config={{
          data: `/api/data?measures=Number of Dentists&drilldowns=Work&Status=Active&Geography=${geoId}&Year=all`,
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
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => formatTypesOfActiveDentists(resp.data)[0]}
        />
      </SectionColumns>
    );
  }
}

DentistsWorkStatus.defaultProps = {
  slug: "dentists-work-status"
};

DentistsWorkStatus.need = [
  fetchData("dentistsByWorkingHours", "/api/data?measures=Dentists in Private Practice by Hours&drilldowns=Hours&Geography=<id>&Year=latest"),
  fetchData("dentistsBySpecialty", "/api/data?measures=Dentists in Private Practice by Specialty&drilldowns=Specialty&Geography=<id>&Year=latest"),
  fetchData("typesOfActiveDentists", "/api/data?measures=Number of Dentists&drilldowns=Work&Status=Active&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  dentistsByWorkingHours: state.data.dentistsByWorkingHours,
  dentistsBySpecialty: state.data.dentistsBySpecialty,
  typesOfActiveDentists: state.data.typesOfActiveDentists
});

export default connect(mapStateToProps)(DentistsWorkStatus);

