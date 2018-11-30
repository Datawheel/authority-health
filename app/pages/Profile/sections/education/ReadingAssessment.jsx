import React from "react";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";

class ReadingAssessment extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Geography"};
  }

  // Handler function for dropdown onChange.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  getStatsForGender = (maleFourthGradeReadingScores, femaleFourthGradeReadingScores,
    maleEighthGradeReadingScores, femaleEighthGradeReadingScores) => {
    const stats = [];
    stats.push(<Stat
      title={`4th Grade Score in ${maleFourthGradeReadingScores.Year}`}
      value={`${maleFourthGradeReadingScores.Gender} ${maleFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`4th Grade Score in ${femaleFourthGradeReadingScores.Year}`}
      value={`${femaleFourthGradeReadingScores.Gender} ${femaleFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score in ${maleEighthGradeReadingScores.Year}`}
      value={`${maleEighthGradeReadingScores.Gender} ${maleEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score in ${femaleEighthGradeReadingScores.Year}`}
      value={`${femaleEighthGradeReadingScores.Gender} ${femaleEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    return stats;
  }

  getStatsForELL = (withELLFourthGradeReadingScores, withELLEighthGradeReadingScores,
    noELLFourthGradeReadingScores, noELLEighthGradeReadingScores) => {
    const stats = [];
    stats.push(<Stat
      title={`4th Grade Score With ELL in ${withELLFourthGradeReadingScores.Year}`}
      value={`${withELLFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score With ELL in ${withELLEighthGradeReadingScores.Year}`}
      value={`${withELLEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`4th Grade Score with No ELL in ${noELLFourthGradeReadingScores.Year}`}
      value={`${noELLFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score with No ELL in ${noELLEighthGradeReadingScores.Year}`}
      value={`${noELLEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    return stats;
  };

  getStatsForDisability = (withDisabilityFourthGradeReadingScores, withDisabilityEighthGradeReadingScores,
    noDisabilityFourthGradeReadingScores, noDisabilityEighthGradeReadingScores) => {
    const stats = [];
    stats.push(<Stat
      title={`4th Grade Score With Disability in ${withDisabilityFourthGradeReadingScores.Year}`}
      value={`${withDisabilityFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score With Disability in ${withDisabilityEighthGradeReadingScores.Year}`}
      value={`${withDisabilityEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`4th Grade Score with No Disability in ${noDisabilityFourthGradeReadingScores.Year}`}
      value={`${noDisabilityFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score with No Disability in ${noDisabilityEighthGradeReadingScores.Year}`}
      value={`${noDisabilityEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    return stats;
  }

  getStatsByParentsEducation = topReadingScoreForEighthGrade => {
    const stats = [];
    stats.push(<Stat
      title={`8th Grade Score in ${topReadingScoreForEighthGrade.Year}`}
      value={`${topReadingScoreForEighthGrade["Parents Education"]} ${topReadingScoreForEighthGrade["Average Reading Score"]}`}
    />);
    return stats;
  }

  getStatsForGeography = (nationalFourthGradeReadingScores, nationalEighthGradeReadingScores,
    fourthGradeReadingScoresbyCity, eighthGradeReadingScoresbyCity) => {
    const stats = [];
    stats.push(<Stat
      title={`4th Grade Score in ${nationalFourthGradeReadingScores.Year}`}
      value={`${nationalFourthGradeReadingScores.Nation} ${nationalFourthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score in ${nationalEighthGradeReadingScores.Year}`}
      value={`${nationalEighthGradeReadingScores.Nation} ${nationalEighthGradeReadingScores["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`4th Grade Score in ${fourthGradeReadingScoresbyCity.Year}`}
      value={`${fourthGradeReadingScoresbyCity.City} ${fourthGradeReadingScoresbyCity["Average Reading Score"]}`}
    />);
    stats.push(<Stat
      title={`8th Grade Score in ${eighthGradeReadingScoresbyCity.Year}`}
      value={`${eighthGradeReadingScoresbyCity.City} ${eighthGradeReadingScoresbyCity["Average Reading Score"]}`}
    />);
    return stats;
  }

  getDropdownComponents = readingAssessmentChoices => {
    const dropdownComponents = [];
    dropdownComponents.push(<select onChange={this.handleChange}>
      {readingAssessmentChoices.map((item, i) => <option key={i} value={item}>{item}</option>)}
    </select>);
    return dropdownComponents;
  }

  getShortDescription = str => <p>The Lineplot here shows the Average Reading Assessment Score {str} in Detroit City, MI over the years.</p>;

  drawLinePlot = (readingScoresData, categoryName, xTitle) => {
    console.log("readingScoresData: ", readingScoresData);
    const lineplot = [];
    lineplot.push(<LinePlot config={{
      data: readingScoresData,
      discrete: "x",
      height: 400,
      groupBy: d => `${d.Grade} ${d[categoryName]}`,
      label: d => `${d.Grade}th Grade ${d[categoryName]}`,
      x: "Year",
      xConfig: {
        title: xTitle
      },
      y: "Average Reading Score",
      yConfig: {
        title: "Average Reading Score"
      },
      tooltipConfig: {tbody: [["Score", d => d["Average Reading Score"]]]}
    }}
    />);

    return lineplot;
  }

  render() {
    const {dropdownValue} = this.state;

    const data = this.props[`readingScoresBy${dropdownValue}`];

    const {readingScoresByParentsEducation, readingScoresByNation, readingScoresByCity} = this.props;
    // console.log("readingScoresByGender: ", readingScoresByGender);
    // console.log("readingScoresByELL: ", readingScoresByELL);
    // console.log("readingScoresByDisability: ", readingScoresByDisability);
    // console.log("readingScoresByParentsEducation: ", readingScoresByParentsEducation);
    // console.log("readingScoresByNation: ", readingScoresByNation);
    // console.log("readingScoresByCity: ", readingScoresByCity);

    const readingAssessmentChoices = ["Geography", "Gender", "ELL", "Disability", "Parents Education"];

    if (dropdownValue === "Gender") {
      // Get the recent year male and female 4th and 8th grade data.
      const recentYearReadingScoresByGender = {};
      nest()
        .key(d => d.Year)
        .entries(data)
        .forEach(group => {
          group.key >= data[0].Year ? Object.assign(recentYearReadingScoresByGender, group) : {};
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

      // Get stats for Gender.
      const stats = this.getStatsForGender(maleFourthGradeReadingScores[0], femaleFourthGradeReadingScores[0], 
        maleEighthGradeReadingScores[0], femaleEighthGradeReadingScores[0]);

      const dropdownComponents = this.getDropdownComponents(readingAssessmentChoices);
      const paragraph = this.getShortDescription("by Gender");
      // const linePlot = this.drawLinePlot(data, "Gender", "Scores by Gender");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            {dropdownComponents}
            {paragraph}
            {stats}
          </article>
  
          {/* Lineplot to show the Reading assessment for different years in the Detroit City. */}
          {/* {linePlot} */}

          <LinePlot config={{
            data,
            discrete: "x",
            height: 400,
            groupBy: d => `${d.Grade} ${d.Gender}`,
            label: d => `${d.Grade}th Grade ${d.Gender}`,
            x: "Year",
            xConfig: {
              title: "Scores by Gender"
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
    else if (dropdownValue === "ELL") {
      // Get the recent year ELL scores for 4th and 8th grade.
      const recentYearReadingScoresByELL = {};
      nest()
        .key(d => d.Year)
        .entries(data)
        .forEach(group => {
          group.key >= data[0].Year ? Object.assign(recentYearReadingScoresByELL, group) : {};
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

      // Get stats for ELL.
      const stats = this.getStatsForELL(withELLFourthGradeReadingScores[0], withELLEighthGradeReadingScores[0], 
        noELLFourthGradeReadingScores[0], noELLEighthGradeReadingScores[0]);

      const dropdownComponents = this.getDropdownComponents(readingAssessmentChoices);

      const paragraph = this.getShortDescription("by ELL");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            {dropdownComponents}
            {paragraph}
            {stats}
          </article>
    
          {/* Lineplot to show the Reading assessment for different years in the Detroit City. */}
          <LinePlot config={{
            data,
            discrete: "x",
            height: 400,
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
        .entries(data)
        .forEach(group => {
          group.key >= data[0].Year ? Object.assign(recentYearReadingScoresByDisability, group) : {};
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

      // Get stats for Disability.
      const stats = this.getStatsForDisability(withDisabilityFourthGradeReadingScores[0], withDisabilityEighthGradeReadingScores[0], 
        noDisabilityFourthGradeReadingScores[0], noDisabilityEighthGradeReadingScores[0]);

      const dropdownComponents = this.getDropdownComponents(readingAssessmentChoices);
      const paragraph = this.getShortDescription("by ELL");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            {dropdownComponents}
            {paragraph}
            {stats}
          </article>
    
          {/* Lineplot to show the Reading assessment with and without disability for different years in the Detroit City. */}
          <LinePlot config={{
            data,
            discrete: "x",
            height: 400,
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

      // Get stats for scores based on Parents Education.
      const stats = this.getStatsByParentsEducation(topReadingScoreForEighthGrade);
      
      const dropdownComponents = this.getDropdownComponents(readingAssessmentChoices);
      const paragraph = this.getShortDescription("based on Parents Education");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            {dropdownComponents}
            {paragraph}
            {stats}
          </article>

          {/* Lineplot to show the Reading assessment for different years in the Detroit City based on Parents Education. */}
          <LinePlot config={{
            data: readingScoresByParentsEducation,
            discrete: "x",
            height: 400,
            groupBy: d => `${d.Grade} ${d["Parents Education"]}`,
            label: d => `${d["Parents Education"]}`,
            x: "Year",
            xConfig: {
              title: "Reading scores based on Parents Education"
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
    else if (dropdownValue === "Geography") {
      // Merge readingScoresByNation and readingScoresByCity arrays to readingScoresByGeography array.
      const readingScoresByGeography = [];
      readingScoresByNation.forEach(d => {
        d.Geography = "Nation";
        readingScoresByGeography.push(d);
      });
      readingScoresByCity.forEach(d => {
        d.Geography = "City";
        readingScoresByGeography.push(d);
      });

      // Get the recent year 4th and 8th grade data for reading scores by Nation.
      const recentYearReadingScoresByNation = {};
      nest()
        .key(d => d.Year)
        .entries(readingScoresByNation)
        .forEach(group => {
          group.key >= readingScoresByNation[0].Year ? Object.assign(recentYearReadingScoresByNation, group) : {};
        });

      // Find top National average for 4th Grade.
      const nationalFourthGradeReadingScores = recentYearReadingScoresByNation.values.filter(d => d.Grade === "4");

      // Find top National average for 8th Grade.
      const nationalEighthGradeReadingScores = recentYearReadingScoresByNation.values.filter(d => d.Grade === "8");

      // Get the recent year 4th and 8th grade data for reading scores by City.
      const recentYearReadingScoresByCity = {};
      nest()
        .key(d => d.Year)
        .entries(readingScoresByCity)
        .forEach(group => {
          group.key >= readingScoresByCity[0].Year ? Object.assign(recentYearReadingScoresByCity, group) : {};
        });

      // Find top National average for 4th Grade.
      const fourthGradeReadingScoresbyCity = recentYearReadingScoresByCity.values.filter(d => d.Grade === "4");

      // Find top National average for 8th Grade.
      const eighthGradeReadingScoresbyCity = recentYearReadingScoresByCity.values.filter(d => d.Grade === "8");

      // Get stats for scores by Geography.
      const stats = this.getStatsForGeography(nationalFourthGradeReadingScores[0], nationalEighthGradeReadingScores[0], 
        fourthGradeReadingScoresbyCity[0], eighthGradeReadingScoresbyCity[0]);

      const dropdownComponents = this.getDropdownComponents(readingAssessmentChoices);
      const paragraph = this.getShortDescription("in United States and");

      return (
        <SectionColumns>
          <SectionTitle>Reading Assessment</SectionTitle>
          <article>
            {dropdownComponents}
            {paragraph}
            {stats}
          </article>
  
          {/* Lineplot to show the Reading assessment for different years in the Detroit City. */}
          <LinePlot config={{
            data: readingScoresByGeography,
            discrete: "x",
            height: 400,
            groupBy: d => `${d.Grade} ${d.Geography}`,
            label: d => `${d.Grade}th Grade ${d[d.Geography]}`,
            x: "Year",
            xConfig: {
              title: "Year"
            },
            y: "Average Reading Score",
            yConfig: {
              title: "Average Reading Score"
            },
            shapeConfig: {
              strokeDasharray: d => d.Geography === "Nation" ?  "4 1" : null 
            },
            tooltipConfig: {tbody: [["Score", d => d["Average Reading Score"]]]}
          }}
          />
        </SectionColumns>
      );
    }
    else {
      return <div></div>;
    }
  }
}

ReadingAssessment.defaultProps = {
  slug: "reading-assessment"
};


ReadingAssessment.need = [
  fetchData("readingScoresByGender", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Gender,City&Year=all", d => d.data),
  fetchData("readingScoresByELL", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,ELL,City&Year=all", d => d.data),
  fetchData("readingScoresByDisability", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Disability,City&Year=all", d => d.data),
  fetchData("readingScoresByParentsEducation", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Parents%20Education,City&Year=all", d => d.data),
  fetchData("readingScoresByNation", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,Nation&Year=all", d => d.data),
  fetchData("readingScoresByCity", "/api/data?measures=Average%20Reading%20Score&drilldowns=Grade,City&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  readingScoresByGender: state.data.readingScoresByGender,
  readingScoresByELL: state.data.readingScoresByELL,
  readingScoresByDisability: state.data.readingScoresByDisability,
  readingScoresByParentsEducation: state.data.readingScoresByParentsEducation,
  readingScoresByNation: state.data.readingScoresByNation,
  readingScoresByCity: state.data.readingScoresByCity
});
  
export default connect(mapStateToProps)(ReadingAssessment);
