import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {LinePlot} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import Stat from "../../../../components/Stat";

class Test extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Gender"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;
    const dropdownList = ["Gender"];

    // const statDimension = dropdownValue;
    const stat1Value = "Male";
    const stat2Value = "Female";

    const readingScoresData = this.props[`readingScoresBy${dropdownValue}`];
    console.log("readingScoresData: ", readingScoresData);

    // Get the recent year data.
    const recentYearData = {};
    nest()
      .key(d => d.Year)
      .entries(readingScoresData)
      .forEach(group => {
        group.key >= readingScoresData[0].Year ? Object.assign(recentYearData, group) : {};
      });

    // Find top stat1 4th Grade data.
    const stat1ReadingScores = recentYearData.values.filter(d => d[dropdownValue] === stat1Value);
    const stat1FourthGradeReadingScores = stat1ReadingScores.filter(d => d.Grade === "4")[0];
    console.log("stat1ReadingScores: ", stat1ReadingScores);
    console.log("stat1FourthGradeReadingScores: ", stat1FourthGradeReadingScores);
    console.log(`Average Reading Score by ${dropdownValue}`);

    // Find top stat1 8th grade data.
    const stat1EighthGradeReadingScores = stat1ReadingScores.filter(d => d.Grade === "8")[0];

    // Find top stat2 4th Grade data.
    const stat2ReadingScores = recentYearData.values.filter(d => d[dropdownValue] === stat2Value);
    const stat2FourthGradeReadingScores = stat2ReadingScores.filter(d => d.Grade === "4")[0];

    // Find top stat2 8th grade data.
    const stat2EighthGradeReadingScores = stat2ReadingScores.filter(d => d.Grade === "8")[0];

    console.log("stat1: ", stat1FourthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]);

    return (
      <SectionColumns>
        <SectionTitle>Test</SectionTitle>
        <article>
          {/* Create a dropdown for all categoeries of reading assessment. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <p>The following chart shows the average reading assessment score in Detroit by {dropdownValue} over time.</p>
          <Stat
            title={`4TH GRADE ${stat1Value} (DETROIT)`}
            year={stat1FourthGradeReadingScores.Year}
            value={stat1FourthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
          />
          <Stat
            title={`4TH GRADE ${stat2Value} (DETROIT)`}
            year={stat2FourthGradeReadingScores.Year}
            value={stat2FourthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
          />
          <Stat
            title={`8TH GRADE ${stat1Value} (DETROIT)`}
            year={stat1EighthGradeReadingScores.Year}
            value={stat1EighthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
          />
          <Stat
            title={`8TH GRADE ${stat2Value} (DETROIT)`}
            year={stat2EighthGradeReadingScores.Year}
            value={stat2EighthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
          />
        </article>
      </SectionColumns>
    );
  }
}

Test.defaultProps = {
  slug: "test"
};

Test.need = [
  fetchData("readingScoresByGender", "/api/data?measures=Average Reading Score by Gender&drilldowns=Grade,Gender,Place&Year=all", d => d.data),
  fetchData("readingScoresByRace", "/api/data?measures=Average Reading Score by Race&drilldowns=Grade,Race,Place&Year=all", d => d.data),
  fetchData("readingScoresByELL", "/api/data?measures=Average Reading Score by ELL&drilldowns=Grade,ELL,Place&Year=all", d => d.data),
  fetchData("readingScoresByNSLP", "/api/data?measures=Average Reading Score by NSLP&drilldowns=Grade,NSLP,Place&Year=all", d => d.data),
  fetchData("readingScoresByDisability", "/api/data?measures=Average Reading Score by Disability&drilldowns=Grade,Disability,Place&Year=all", d => d.data),
  fetchData("readingScoresByParentsEducation", "/api/data?measures=Average Reading Score by Parents Education&drilldowns=Grade,Parents Education,Place&Year=all", d => d.data),
  fetchData("readingScoresByNation", "/api/data?measures=Average Reading Score&drilldowns=Grade,Nation&Year=all", d => d.data),
  fetchData("readingScoresByCity", "/api/data?measures=Average Reading Score&drilldowns=Grade,Place&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  readingScoresByGender: state.data.readingScoresByGender,
  readingScoresByRace: state.data.readingScoresByRace,
  readingScoresByELL: state.data.readingScoresByELL,
  readingScoresByNSLP: state.data.readingScoresByNSLP,
  readingScoresByDisability: state.data.readingScoresByDisability,
  readingScoresByParentsEducation: state.data.readingScoresByParentsEducation,
  readingScoresByNation: state.data.readingScoresByNation,
  readingScoresByCity: state.data.readingScoresByCity
});

export default connect(mapStateToProps)(Test);
