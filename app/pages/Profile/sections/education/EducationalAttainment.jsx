import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

const formatLabels = d => {
  if (d === "No Schooling Completed") return "No Schooling";
  if (d === "12th Grade, No Diploma") return "12th Grade";
  if (d === "High School Graduate (includes Equivalency)") return "High School";
  if (d === "Some College, Less Than 1 Year") return "Some College, < 1 Year";
  if (d === "Some College, 1 Or More Years, No Degree") return "Some College, > 1 Year";
  if (d === "Professional School Degree") return "Professional Degree";
  return d;
};

class EducationalAttainment extends SectionColumns {

  render() {

    const {educationalAttainmentData} = this.props;

    // Format data for public Assistance data.
    const recentYearEducationalAttainment = {};
    nest()
      .key(d => d.Year)
      .entries(educationalAttainmentData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= educationalAttainmentData[0].Year ? Object.assign(recentYearEducationalAttainment, group) : {};
      });

    // Find top recent year Educational attainment stats
    recentYearEducationalAttainment.values.sort((a, b) => b.share - a.share);
    const topEducationalAttainment = recentYearEducationalAttainment.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Educational Attainment</SectionTitle>
        <article>
          {/* Stats about top Educational Attainment. */}
          <Stat
            title="Most common education level"
            year={topEducationalAttainment.Year}
            value={topEducationalAttainment["Educational Attainment"]}
            qualifier={formatPopulation(topEducationalAttainment.share)}
          />
          <p>In {topEducationalAttainment.Year}, the most common education level attained in {topEducationalAttainment.Geography} County was {topEducationalAttainment["Educational Attainment"].toLowerCase()} with a share of {formatPopulation(topEducationalAttainment.share)}.</p>
          <p>The following chart shows educational attainment of male and female in {topEducationalAttainment.Geography} County.</p>
        </article>

        {/* Draw a Barchart to show Educational Attainment for all types of education buckets. */}
        <BarChart config={{
          data: educationalAttainmentData,
          discrete: "x",
          height: 400,
          legend: true,
          label: d => `${d.Sex}`,
          groupBy: "Sex",
          x: "Educational Attainment",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Educational Attainment"] - b["ID Educational Attainment"],
          xConfig: {
            tickFormat: d => formatLabels(d),
            title: "Educational Attainment by Gender"
          },
          yConfig: {
            tickFormat: d => formatPopulation(d),
            title: "Share"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Educational Attainment", d => formatLabels(d["Educational Attainment"])], ["Share", d => formatPopulation(d.share)]]}
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
  fetchData("educationalAttainmentData", "/api/data?measures=Population&drilldowns=Educational Attainment,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("highSchoolDropoutRate", "/api/data?measures=Total Population,High School Dropout Rate&drilldowns=Zip Code&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  educationalAttainmentData: state.data.educationalAttainmentData,
  highSchoolDropoutRate: state.data.highSchoolDropoutRate
});

export default connect(mapStateToProps)(EducationalAttainment);
