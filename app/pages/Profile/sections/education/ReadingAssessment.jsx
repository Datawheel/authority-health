import React from "react";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, LinePlot} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

class ReadingAssessment extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Parents Education"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;
    console.log("dropdownValue: ", dropdownValue);

    const {readingScoresByGender, readingScoresByELL, readingScoresByDisability, readingScoresByParentsEducation} = this.props;
    console.log("readingScoresByGender: ", readingScoresByGender);
    console.log("readingScoresByELL: ", readingScoresByELL);
    console.log("readingScoresByDisability: ", readingScoresByDisability);
    console.log("readingScoresByParentsEducation: ", readingScoresByParentsEducation);

    const readingAssessmentChoices = ["Gender", "ELL", "Disability", "Parents Education"];

    // const drawVisualization = (vizData) => {

    // }

    if (dropdownValue === "Gender") {
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

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            <select onChange={this.handleChange}>
              {readingAssessmentChoices.map((item, i) => <option key={i} value={item}>{item}</option>)}
            </select>
            <p>Average Score by Gender</p>
            <Stat
              title={`4th Grade Score in ${maleFourthGradeReadingScores[0].Year}`}
              value={`${maleFourthGradeReadingScores[0].Gender} ${maleFourthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`8th Grade Score in ${maleEighthGradeReadingScores[0].Year}`}
              value={`${maleEighthGradeReadingScores[0].Gender} ${maleEighthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`4th Grade Score in ${femaleFourthGradeReadingScores[0].Year}`}
              value={`${femaleFourthGradeReadingScores[0].Gender} ${femaleFourthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`8th Grade Score in ${femaleEighthGradeReadingScores[0].Year}`}
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
            // shapeConfig: {strokeDasharray: "4 1"},
            tooltipConfig: {tbody: [["Score", d => d["Average Reading Score"]]]}
          }}
          />
        </SectionColumns>
      );
    }
    else if (dropdownValue === "ELL") {
      // Get the recent year ELL scores for 4th and 8th grade.
      const recentYearReadingScoresByELL = {};
      nest()
        .key(d => d.Year)
        .entries(readingScoresByELL)
        .forEach(group => {
          group.key >= readingScoresByELL[0].Year ? Object.assign(recentYearReadingScoresByELL, group) : {};
        });

      // Find top with ELL 4th Grade data.
      const withELLReadingScores = recentYearReadingScoresByELL.values.filter(d => d.ELL === "Yes");
      const withELLFourthGradeReadingScores = withELLReadingScores.filter(d => d.Grade === "4");

      // Find top male 8th grade data.
      const withELLEighthGradeReadingScores = withELLReadingScores.filter(d => d.Grade === "8");

      // Find top female 4th Grade data.
      const noELLReadingScores = recentYearReadingScoresByELL.values.filter(d => d.ELL === "No");
      const noELLFourthGradeReadingScores = noELLReadingScores.filter(d => d.Grade === "4");

      // Find top female 8th grade data.
      const noELLEighthGradeReadingScores = noELLReadingScores.filter(d => d.Grade === "8");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            <select onChange={this.handleChange}>
              {readingAssessmentChoices.map((item, i) => <option key={i} value={item}>{item}</option>)}
            </select>
            <p>Average Score by ELL</p>
            <Stat
              title={`4th Grade Score With ELL in ${withELLFourthGradeReadingScores[0].Year}`}
              value={`${withELLFourthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`8th Grade Score With ELL in ${withELLEighthGradeReadingScores[0].Year}`}
              value={`${withELLEighthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`4th Grade Score with No ELL in ${noELLFourthGradeReadingScores[0].Year}`}
              value={`${noELLFourthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`8th Grade Score with No ELL in ${noELLEighthGradeReadingScores[0].Year}`}
              value={`${noELLEighthGradeReadingScores[0]["Average Reading Score"]}`}
            />
          </article>
    
          {/* Lineplot to show the Reading assessment for different years in the Detroit City. */}
          <LinePlot config={{
            data: readingScoresByELL,
            discrete: "x",
            height: 250,
            groupBy: d => `${d.Grade} ${d.ELL}`,
            label: d => `${d.Grade}th Grade ${d.ELL === "Yes" ? "With ELL" : "No ELL"}`,
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
    else if (dropdownValue === "Disability") {
      // Get the recent year ELL scores for 4th and 8th grade.
      const recentYearReadingScoresByDisability = {};
      nest()
        .key(d => d.Year)
        .entries(readingScoresByDisability)
        .forEach(group => {
          group.key >= readingScoresByDisability[0].Year ? Object.assign(recentYearReadingScoresByDisability, group) : {};
        });

      // Find top with Disability 4th Grade data.
      const withDisabilityReadingScores = recentYearReadingScoresByDisability.values.filter(d => d.Disability === "Yes");
      const withDisabilityFourthGradeReadingScores = withDisabilityReadingScores.filter(d => d.Grade === "4");

      // Find top with Disability 8th grade data.
      const withDisabilityEighthGradeReadingScores = withDisabilityReadingScores.filter(d => d.Grade === "8");

      // Find top no Disability 4th Grade data.
      const noDisabilityReadingScores = recentYearReadingScoresByDisability.values.filter(d => d.Disability === "No");
      const noDisabilityFourthGradeReadingScores = noDisabilityReadingScores.filter(d => d.Grade === "4");

      // Find top no Disability 8th grade data.
      const noDisabilityEighthGradeReadingScores = noDisabilityReadingScores.filter(d => d.Grade === "8");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            <select onChange={this.handleChange}>
              {readingAssessmentChoices.map((item, i) => <option key={i} value={item}>{item}</option>)}
            </select>
            <p>Average Score by Disability</p>
            <Stat
              title={`4th Grade Score With Disability in ${withDisabilityFourthGradeReadingScores[0].Year}`}
              value={`${withDisabilityFourthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`8th Grade Score With Disability in ${withDisabilityEighthGradeReadingScores[0].Year}`}
              value={`${withDisabilityEighthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`4th Grade Score with No Disability in ${noDisabilityFourthGradeReadingScores[0].Year}`}
              value={`${noDisabilityFourthGradeReadingScores[0]["Average Reading Score"]}`}
            />
            <Stat
              title={`8th Grade Score with No Disability in ${noDisabilityEighthGradeReadingScores[0].Year}`}
              value={`${noDisabilityEighthGradeReadingScores[0]["Average Reading Score"]}`}
            />
          </article>
    
          {/* Lineplot to show the Reading assessment with and without disability for different years in the Detroit City. */}
          <LinePlot config={{
            data: readingScoresByDisability,
            discrete: "x",
            height: 250,
            groupBy: d => `${d.Grade} ${d.Disability}`,
            label: d => `${d.Grade}th Grade ${d.Disability === "Yes" ? "With Disability" : "No Disability"}`,
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
    else if (dropdownValue === "Parents Education") {
      // Get the recent year ELL scores for 4th and 8th grade.
      const recentYearReadingScoresByParentsEdu = {};
      nest()
        .key(d => d.Year)
        .entries(readingScoresByParentsEducation)
        .forEach(group => {
          group.key >= readingScoresByParentsEducation[0].Year ? Object.assign(recentYearReadingScoresByParentsEdu, group) : {};
        });

      // Find top reading score by Parent's Education for 8th Grade data.
      const readingScoresForEighthGrade = recentYearReadingScoresByParentsEdu.values.filter(d => d.Grade === "8");
      readingScoresForEighthGrade.sort((a, b) => b["Average Reading Score"] - a["Average Reading Score"]);
      const topReadingScoreForEighthGrade = readingScoresForEighthGrade[0];

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            <select onChange={this.handleChange}>
              {readingAssessmentChoices.map((item, i) => <option key={i} value={item}>{item}</option>)}
            </select>
            <p>Average Score by Parents Education</p>
            <Stat
              title={`8th Grade Score in ${topReadingScoreForEighthGrade.Year}`}
              value={`${topReadingScoreForEighthGrade["Parents Education"]} ${topReadingScoreForEighthGrade["Average Reading Score"]}`}
            />
          </article>
    
          {/* Lineplot to show the Reading assessment with and without disability for different years in the Detroit City. */}
          <BarChart config={{
            data: readingScoresByParentsEducation,
            discrete: "x",
            height: 250,
            groupBy: d => `${d.Grade} ${d["Parents Education"]}`,
            legend: false,
            x: "Parents Education",
            xConfig: {
              labelRotation: false,
              title: "Parents Education"
            },
            y: "Average Reading Score",
            yConfig: {
              title: "Average Reading Score"
            },
            shapeConfig: {label: false},
            time: "Year",
            tooltipConfig: {tbody: [["Score", d => d["Average Reading Score"]]]}
          }}
          />
        </SectionColumns>
      );
    }

    return (
      <div>No dropdown selected</div>
    );
    
  }
}

ReadingAssessment.defaultProps = {
  slug: "reading-assessment"
};


ReadingAssessment.need = [
  fetchData("readingScoresByGender", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Gender,City&Year=all", d => d.data),
  fetchData("readingScoresByELL", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,ELL,City&Year=all", d => d.data),
  fetchData("readingScoresByDisability", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Disability,City&Year=all", d => d.data),
  fetchData("readingScoresByParentsEducation", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Parents%20Education,City&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  readingScoresByGender: state.data.readingScoresByGender,
  readingScoresByELL: state.data.readingScoresByELL,
  readingScoresByDisability: state.data.readingScoresByDisability,
  readingScoresByParentsEducation: state.data.readingScoresByParentsEducation
});
  
export default connect(mapStateToProps)(ReadingAssessment);
