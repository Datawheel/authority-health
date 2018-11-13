import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class EducationalAttainment extends SectionColumns {

  render() {

    const {educationalAttainmentData, highSchoolDropoutRate} = this.props;
    // console.log("educationalAttainmentData: ", educationalAttainmentData);

    // Format data for publicAssistanceData.
    const recentYeareducationalAttainment = {};
    nest()
      .key(d => d.Year)
      .entries(educationalAttainmentData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= educationalAttainmentData[0].Year ? Object.assign(recentYeareducationalAttainment, group) : {};
      });

    // console.log("highSchoolDropoutRate: ", highSchoolDropoutRate);
    highSchoolDropoutRate.sort((a, b) => b["High School Dropout Rate"] - a["High School Dropout Rate"]);
    const topDropoutRate = highSchoolDropoutRate[0];

    return (
      <SectionColumns>
        <SectionTitle>Educational Attainment</SectionTitle>
        <article>
          {/* Top stats and short paragraph about High School Dropout rate. */}
          <Stat
            title={`Top High School dropout rate in ${topDropoutRate.Year}`}
            value={`${topDropoutRate["Zip Code"]} ${formatPopulation(topDropoutRate["High School Dropout Rate"])}`}
          />
        </article>

        <BarChart config={{
          data: educationalAttainmentData,
          discrete: "x",
          height: 400,
          // stacked: true,
          legend: false,
          label: d => `${d.Sex} - ${d["Educational Attainment"]}`,
          groupBy: "Sex",
          x: "Educational Attainment",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Educational Attainment"] - b["ID Educational Attainment"],
          xConfig: {
            // labelRotation: false
            // tickFormat: d => rangeFormatter(d)
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

EducationalAttainment.defaultProps = {
  slug: "educational-attainment"
};

EducationalAttainment.need = [
  fetchData("educationalAttainmentData", "/api/data?measures=Population&drilldowns=Educational%20Attainment,Sex&County=<id>&Year=all", d => d.data),
  fetchData("highSchoolDropoutRate", "/api/data?measures=Total%20Population,High%20School%20Dropout%20Rate&drilldowns=Zip%20Code&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  educationalAttainmentData: state.data.educationalAttainmentData,
  highSchoolDropoutRate: state.data.highSchoolDropoutRate
});

export default connect(mapStateToProps)(EducationalAttainment);
