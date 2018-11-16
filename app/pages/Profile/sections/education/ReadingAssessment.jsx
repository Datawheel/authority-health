import React from "react";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class ReadingAssessment extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Gender"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;
    console.log("dropdownValue: ", dropdownValue);

    const {readingScoresByGender} = this.props;
    console.log("readingScoresByGender: ", readingScoresByGender);

    // Get the recent year male and female 4th and 8th grade data.
    const recentYearReadingScoresByGender = {};
    nest()
      .key(d => d.Year)
      .entries(readingScoresByGender)
      .forEach(group => {
        group.key >= readingScoresByGender[0].Year ? Object.assign(recentYearReadingScoresByGender, group) : {};
      });

    // Find top male 4th Grade data.
    const maleReadingScores = recentYearReadingScoresByGender.values.filter(d => d.Gender === "Male");
    const maleFourthGradeReadingScores = maleReadingScores.filter(d => d.Grade === "4");

    // Find top male 8th grade data.
    const maleEighthGradeReadingScores = maleReadingScores.filter(d => d.Grade === "8");

    // Find top female 4th Grade data.
    const femaleReadingScores = recentYearReadingScoresByGender.values.filter(d => d.Gender === "Female");
    const femaleFourthGradeReadingScores = femaleReadingScores.filter(d => d.Grade === "4");

    // Find top female 8th grade data.
    const femaleEighthGradeReadingScores = femaleReadingScores.filter(d => d.Grade === "8");

    const readingAssessmentChoices = ["Gender"];

    return (
      <SectionColumns>
        <SectionTitle>Reading Assessment</SectionTitle>
        <article>
          <select onChange={this.handleChange}>
            {readingAssessmentChoices.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>
          <Stat
            title={`Average 4th Grade Score in ${maleFourthGradeReadingScores[0].Year}`}
            value={`${maleFourthGradeReadingScores[0].Gender} ${maleFourthGradeReadingScores[0]["Average Reading Score"]}`}
          />
          <Stat
            title={`Average 8th Grade Score in ${maleEighthGradeReadingScores[0].Year}`}
            value={`${maleEighthGradeReadingScores[0].Gender} ${maleEighthGradeReadingScores[0]["Average Reading Score"]}`}
          />
          <Stat
            title={`Average 4th Grade Score in ${femaleFourthGradeReadingScores[0].Year}`}
            value={`${femaleFourthGradeReadingScores[0].Gender} ${femaleFourthGradeReadingScores[0]["Average Reading Score"]}`}
          />
          <Stat
            title={`Average 8th Grade Score in ${femaleEighthGradeReadingScores[0].Year}`}
            value={`${femaleEighthGradeReadingScores[0].Gender} ${femaleEighthGradeReadingScores[0]["Average Reading Score"]}`}
          />
        </article>

        {/* Lineplot to show the Reading assessment for different years in the Detroit City. */}
        <LinePlot config={{
          data: readingScoresByGender,
          discrete: "x",
          height: 250,
          groupBy: d => `${d.Grade} ${d.Gender}`,
          label: d => `${d.Grade}th Grade ${d.Gender}`,
          x: "Year",
          xConfig: {
            title: "Year"
          },
          y: "Average Reading Score",
          yConfig: {
            title: "Average Reading Score"
          },
          tooltipConfig: {tbody: [["Score", d => d["Average Reading Score"]]]}
        }}
        />
      </SectionColumns>
    );
  }
}

ReadingAssessment.defaultProps = {
  slug: "reading-assessment"
};


ReadingAssessment.need = [
  fetchData("readingScoresByGender", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Gender,City&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  readingScoresByGender: state.data.readingScoresByGender
});
  
export default connect(mapStateToProps)(ReadingAssessment);
