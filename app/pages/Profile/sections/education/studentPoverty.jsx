import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;
const formatLabel = d => {
  const nameArr = d.split(" ");
  return nameArr.reduce((acc, currValue, i) => i === 0 || i === 1 ? "" : acc.concat(`${currValue} `), " ");
};

class StudentPoverty extends SectionColumns {

  render() {
    const {levelOfSchoolData} = this.props;

    // Format data for Level Of School.
    const recentYearLevelOfSchoolData = {};
    nest()
      .key(d => d.Year)
      .entries(levelOfSchoolData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= levelOfSchoolData[0].Year ? Object.assign(recentYearLevelOfSchoolData, group) : {};
      });

    // Filter out Not Enrolled In School and above Poverty level data.
    const filteredLevelOfSchoolData = levelOfSchoolData.filter(d => d["ID Level of School"] !== 7 && d["ID Poverty Status"] !== 1);

    // Find top recent year Level of School Data.
    const filteredRecentYearLevelOfSchoolData = recentYearLevelOfSchoolData.values.filter(d => d["ID Level of School"] !== 7 && d["ID Poverty Status"] !== 1);
    filteredRecentYearLevelOfSchoolData.sort((a, b) => b.share - a.share);
    const topLevelOfSchoolData = filteredRecentYearLevelOfSchoolData[0];

    // Find percentage of population that were enrolled in school for the most recent year.
    const recentYearNotEnrolledInSchool = recentYearLevelOfSchoolData.values.filter(d => d["ID Level of School"] === 7);
    const recentYearEnrolledInSchoolPercentage = 100 - recentYearNotEnrolledInSchool[0].share - recentYearNotEnrolledInSchool[1].share;

    return (
      <SectionColumns>
        <SectionTitle>Student Poverty</SectionTitle>
        <article>
          {/* Top stats about Level Of School. */}
          <Stat
            title="Top Level Of School"
            year={topLevelOfSchoolData.Year}
            value={topLevelOfSchoolData["Level of School"]}
            qualifier={formatPopulation(topLevelOfSchoolData.share)}
          />
          <Stat
            title={`Population Enrolled In School in ${topLevelOfSchoolData.Year}`}
            value={`${formatPopulation(recentYearEnrolledInSchoolPercentage)}`}
          />
          <p>In {topLevelOfSchoolData.Year}, students in poverty who attended most level of school in {topLevelOfSchoolData.Geography} County were {topLevelOfSchoolData["Level of School"]} with the share of {formatPopulation(topLevelOfSchoolData.share)}</p>
          <p>In {topLevelOfSchoolData.Year}, {formatPopulation(recentYearEnrolledInSchoolPercentage)} of the total population had enrolled in school in the {topLevelOfSchoolData.Geography} county, MI.</p>
        </article>

        {/* Draw a Barchart to show Level Of School for students in poverty. */}
        <BarChart config={{
          data: filteredLevelOfSchoolData,
          discrete: "x",
          height: 400,
          legend: false,
          label: d => formatLabel(d["Level of School"]),
          groupBy: "Level of School",
          x: "Level of School",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Level of School"] - b["ID Level of School"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatLabel(d)
          },
          yConfig: {tickFormat: d => formatPopulation(d)},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

StudentPoverty.defaultProps = {
  slug: "student-poverty"
};

StudentPoverty.need = [
  fetchData("levelOfSchoolData", "/api/data?measures=Population&drilldowns=Level%20of%20School,Poverty%20Status&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  levelOfSchoolData: state.data.levelOfSchoolData
});

export default connect(mapStateToProps)(StudentPoverty);
