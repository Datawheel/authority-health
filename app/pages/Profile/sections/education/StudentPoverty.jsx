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
  const newStr = d.replace("Enrolled In ", "");
  if (newStr.includes("To Grade")) return newStr.replace("To Grade", "-");
  if (newStr === "Nursery School, Preschool") return "Preschool";
  if (newStr === "College Undergraduate Years") return "Undergraduate";
  if (newStr === "Graduate Or Professional School") return "Graduate";
  return newStr;
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
            title="Most impoverished level"
            year={topLevelOfSchoolData.Year}
            value={topLevelOfSchoolData["Level of School"]}
            qualifier={formatPopulation(topLevelOfSchoolData.share)}
          />
          <Stat
            title={"Enrolled Population"}
            year={topLevelOfSchoolData.Year}
            value={formatPopulation(recentYearEnrolledInSchoolPercentage)}
          />
          <p>In {topLevelOfSchoolData.Year}, the most common education level of students in {topLevelOfSchoolData.Geography} County living in poverty were {topLevelOfSchoolData["Level of School"].toLowerCase()} ({formatPopulation(topLevelOfSchoolData.share)}) and {formatPopulation(recentYearEnrolledInSchoolPercentage)} of the total population was enrolled in school in {topLevelOfSchoolData.Geography} County.</p>
          <p>The following chart shows the level of school and the share of population in poverty that were enrolled in school.</p>
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
          time: "Year",
          xSort: (a, b) => a["ID Level of School"] - b["ID Level of School"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatLabel(d)
          },
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Share"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)]]}
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
  fetchData("levelOfSchoolData", "/api/data?measures=Population&drilldowns=Level of School,Poverty Status&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  levelOfSchoolData: state.data.levelOfSchoolData
});

export default connect(mapStateToProps)(StudentPoverty);
