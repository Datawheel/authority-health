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
import StatGroup from "components/StatGroup";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

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

  const femaleData = educationalAttainmentData.filter(d => d.Sex === "Female");
  const topFemaleData = femaleData.sort((a, b) => b.share - a.share)[0];

  const maleData = educationalAttainmentData.filter(d => d.Sex === "Male");
  const topMaleData = maleData.sort((a, b) => b.share - a.share)[0];
  return [educationalAttainmentData, topFemaleData, topMaleData];
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
      const topData = formatEducationalAttainmentData(educationalAttainmentData);
      const topFemaleData = topData[1];
      const topMaleData = topData[2];

      return (
        <SectionColumns>
          <SectionTitle>Educational Attainment</SectionTitle>
          <article>
            <StatGroup
              title={"Most common education level by gender"}
              year={topFemaleData.Year}
              stats={[
                {
                  title: "Female",
                  year: topFemaleData.Year,
                  value: formatLabels(topFemaleData["Educational Attainment"]),
                  qualifier: `${formatPopulation(topFemaleData.share)} of the population in ${topFemaleData.Geography}`
                },
                {
                  title: "Male",
                  year: topMaleData.Year,
                  value: formatLabels(topMaleData["Educational Attainment"]),
                  qualifier: `${formatPopulation(topMaleData.share)} of the population in ${topMaleData.Geography}`,
                  color: "terra-cotta"
                }
              ]}
            />
            <p>In {topFemaleData.Year}, the most common education level attained in {topFemaleData.Geography} by female was {formatLabels(topFemaleData["Educational Attainment"]).toLowerCase()} ({formatPopulation(topFemaleData.share)}) {}
             and for male it was {formatLabels(topMaleData["Educational Attainment"]).toLowerCase()} ({formatPopulation(topMaleData.share)}).</p>
            <p>The following chart shows educational attainment of male and female in {topMaleData.Geography}.</p>

            <SourceGroup sources={this.state.sources} />
            <Contact slug={this.props.slug} />
          </article>

          <div className="viz u-text-right">
            <Options
              component={this}
              componentKey="viz"
              dataFormat={resp => resp.data}
              slug={this.props.slug}
              data={ `/api/data?measures=Population by Education Level&drilldowns=Educational Attainment,Sex&Geography=${meta.id}&Year=all` }
              title="Chart of Educational Attainment" />

            {/* Draw a Barchart to show Educational Attainment for all types of education buckets. */}
            <BarChart ref={comp => this.viz = comp } config={{
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
          </div>
        </SectionColumns>
      );
    }
    else return null;
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
