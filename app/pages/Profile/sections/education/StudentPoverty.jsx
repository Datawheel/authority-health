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
import Options from "components/Options";

const formatPopulation = d => `${formatAbbreviate(d)}%`;
const formatLabel = d => {
  const newStr = d.replace("Enrolled In ", "");
  if (newStr.includes("To Grade")) return newStr.replace("To Grade", "-");
  if (newStr === "Nursery School, Preschool") return "Preschool";
  if (newStr === "College Undergraduate Years") return "Undergraduate";
  if (newStr === "Graduate Or Professional School") return "Graduate";
  return newStr;
};

const formatLevelOfSchoolData = levelOfSchoolData => {
  nest()
    .key(d => d.Year)
    .entries(levelOfSchoolData)
    .forEach(group => {
      nest()
        .key(d => d["ID Level of School"])
        .entries(group.values)
        .forEach(grade => {
          const total = sum(grade.values, d => d["Poverty by Schooling"]);
          grade.values.forEach(d => total !== 0 ? d.share = d["Poverty by Schooling"] / total * 100 : d.share = 0);
        });
    });
  // Filter out Not Enrolled In School and above Poverty level data.
  const filteredLevelOfSchoolData = levelOfSchoolData.filter(d => d["ID Level of School"] !== 7 && d["ID Poverty Status"] === 0);
  const topLevelOfSchoolData = filteredLevelOfSchoolData.sort((a, b) => b.share - a.share)[0];
  return [filteredLevelOfSchoolData, topLevelOfSchoolData];
};

// Find percentage of population that were enrolled in school for the most recent year.
const findEnrolledInSchoolPercentage = data => {
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d["Poverty by Schooling"]);
      group.values.forEach(d => total !== 0 ? d.enrolledShare = d["Poverty by Schooling"] / total * 100 : d.enrolledShare = 0);
    });
  const notEnrolledInSchool = data.filter(d => d["ID Level of School"] === 7);
  return notEnrolledInSchool[0].enrolledShare === 0 && notEnrolledInSchool[1].enrolledShare === 0 ? 0 : 100 - notEnrolledInSchool[0].enrolledShare - notEnrolledInSchool[1].enrolledShare;
};

class StudentPoverty extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {
    const {meta, levelOfSchoolData} = this.props;

    const levelOfSchoolDataAvailable = levelOfSchoolData.length !== 0;

    if (levelOfSchoolDataAvailable) {
      const topLevelOfSchoolData = formatLevelOfSchoolData(levelOfSchoolData)[1];
      const enrolledInSchoolPercentage = findEnrolledInSchoolPercentage(levelOfSchoolData);

      return (
        <SectionColumns>
          <SectionTitle>Student Poverty</SectionTitle>
          <article>
            {/* Top stats about Level Of School. */}
            <Stat
              title="Most impoverished level"
              year={topLevelOfSchoolData.Year}
              value={formatLabel(topLevelOfSchoolData["Level of School"])}
              qualifier={`${formatPopulation(topLevelOfSchoolData.share)} of the population enrolled in this grade in ${topLevelOfSchoolData.Geography}`}
            />
            <Stat
              title={"Enrolled Population"}
              year={topLevelOfSchoolData.Year} // topLevelOfSchoolData share same data as enrolledInSchoolPercentage, hence topLevelOfSchoolData can be used here to get Year, etc.
              value={formatPopulation(enrolledInSchoolPercentage)}
              qualifier={`of the population in ${topLevelOfSchoolData.Geography}`}
            />
            <p>In {topLevelOfSchoolData.Year}, the most common education level of students in {topLevelOfSchoolData.Geography} living in poverty were enrolled in {formatLabel(topLevelOfSchoolData["Level of School"]).toLowerCase()} ({formatPopulation(topLevelOfSchoolData.share)} of the population enrolled in this grade) and {formatPopulation(enrolledInSchoolPercentage)} of the total population was enrolled in school in {topLevelOfSchoolData.Geography}.</p>
            <p>The following chart shows each level of school and the share of students in poverty that were enrolled.</p>

            <SourceGroup sources={this.state.sources} />
            <Contact slug={this.props.slug} />
          </article>

          <div className="viz u-text-right">
            <Options
              component={this}
              componentKey="viz"
              dataFormat={resp => resp.data}
              slug={this.props.slug}
              data={ `/api/data?measures=Poverty by Schooling&drilldowns=Level of School,Poverty Status&Geography=${meta.id}&Year=all` }
              title="Chart of Student Poverty" />

            {/* Draw a Barchart to show Level Of School for students in poverty. */}
            <BarChart ref={comp => this.viz = comp} config={{
              data: `/api/data?measures=Poverty by Schooling&drilldowns=Level of School,Poverty Status&Geography=${meta.id}&Year=all`,
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
                tickFormat: d => formatLabel(d),
                title: "Level of School"
              },
              yConfig: {
                tickFormat: d => formatPopulation(d),
                title: "Share"
              },
              shapeConfig: {
                label: false
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPopulation(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatLevelOfSchoolData(resp.data)[0];
            }}
            />
          </div>
        </SectionColumns>
      );
    }
    else return null;
  }
}

StudentPoverty.defaultProps = {
  slug: "student-poverty"
};

StudentPoverty.need = [
  fetchData("levelOfSchoolData", "/api/data?measures=Poverty by Schooling&drilldowns=Level of School,Poverty Status&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  levelOfSchoolData: state.data.levelOfSchoolData
});

export default connect(mapStateToProps)(StudentPoverty);
