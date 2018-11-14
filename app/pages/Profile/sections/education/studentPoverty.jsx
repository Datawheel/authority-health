import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

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

    return (
      <SectionColumns>
        <SectionTitle>Student Poverty</SectionTitle>
        <article>
          {/* Top stats about Level Of School. */}
          <Stat
            title={`Top Level Of School in ${topLevelOfSchoolData.Year}`}
            value={`${topLevelOfSchoolData["Level of School"]} ${formatPopulation(topLevelOfSchoolData.share)}`}
          />
          <p>In {topLevelOfSchoolData.Year}, students in poverty who attended most level of school in {topLevelOfSchoolData.County} County were {topLevelOfSchoolData["Level of School"]} with the share of {formatPopulation(topLevelOfSchoolData.share)}</p>
        </article>

        {/* Draw a Barchart to show Level Of School for students in poverty. */}
        <BarChart config={{
          data: filteredLevelOfSchoolData,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Level of School",
          x: "Level of School",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Level of School"] - b["ID Level of School"],
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
  fetchData("levelOfSchoolData", "/api/data?measures=Population&drilldowns=Level%20of%20School,Poverty%20Status&County=<id>&Year=all", d => d.data)
  // fetchData("highSchoolDropoutRate", "/api/data?measures=Total%20Population,High%20School%20Dropout%20Rate&drilldowns=Zip%20Code&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  levelOfSchoolData: state.data.levelOfSchoolData
});

export default connect(mapStateToProps)(StudentPoverty);
