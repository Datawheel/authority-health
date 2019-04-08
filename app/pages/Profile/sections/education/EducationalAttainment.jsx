import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

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

const formatEducationalAttainmentData = educationalAttainmentData => {
  nest()
    .key(d => d.Year)
    .entries(educationalAttainmentData)
    .forEach(group => {
      const total = sum(group.values, d => d["Population by Education Level"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Population by Education Level"] / total * 100 :  d.share = 0);
    });
  // Find top recent year Educational attainment stats
  const topEducationalAttainment = educationalAttainmentData.sort((a, b) => b.share - a.share)[0];

  return [educationalAttainmentData, topEducationalAttainment];
};

class EducationalAttainment extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, educationalAttainmentData} = this.props;

    const educationalAttainmentDataAvailable = educationalAttainmentData.length !== 0;

    if (educationalAttainmentDataAvailable) {
    // Find share for topEducationalAttainment data.
      const  topEducationalAttainment = formatEducationalAttainmentData(educationalAttainmentData)[1];

      return (
        <SectionColumns>
          <SectionTitle>Educational Attainment</SectionTitle>
          <article>
            {/* Stats about top Educational Attainment. */}
            <Stat
              title="Most common education level"
              year={topEducationalAttainment.Year}
              value={topEducationalAttainment["Educational Attainment"]}
              qualifier={`${formatPopulation(topEducationalAttainment.share)} of the population in ${topEducationalAttainment.Geography}`}
            />
            <p>In {topEducationalAttainment.Year}, the most common education level attained in {topEducationalAttainment.Geography} was {topEducationalAttainment["Educational Attainment"].toLowerCase()} with a share of {formatPopulation(topEducationalAttainment.share)}.</p>
            <p>The following chart shows educational attainment of male and female in {topEducationalAttainment.Geography}.</p>

            <SourceGroup sources={this.state.sources} />
            <Contact slug={this.props.slug} />
          </article>

          {/* Draw a Barchart to show Educational Attainment for all types of education buckets. */}
          <BarChart config={{
            data: `/api/data?measures=Population by Education Level&drilldowns=Educational Attainment,Sex&Geography=${meta.id}&Year=all`,
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
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Educational Attainment", d => formatLabels(d["Educational Attainment"])], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return formatEducationalAttainmentData(resp.data)[0];
          }}
          />
        </SectionColumns>
      );
    }
    else return <div></div>;
  }
}

EducationalAttainment.defaultProps = {
  slug: "educational-attainment"
};

EducationalAttainment.need = [
  fetchData("educationalAttainmentData", "/api/data?measures=Population by Education Level&drilldowns=Educational Attainment,Sex&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  educationalAttainmentData: state.data.educationalAttainmentData
});

export default connect(mapStateToProps)(EducationalAttainment);
