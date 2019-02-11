import React from "react";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import Stat from "../../../../components/Stat";

class ReadingAssessment extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Overall"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {
    const {dropdownValue} = this.state;
    const dropdownList = ["Overall", "Gender", "Race", "ELL", "NSLP", "Disability", "Parents Education"];
    const isOverallSelected = dropdownValue === "Overall";
    const isParentsEducationSelected = dropdownValue === "Parents Education";

    const readingScoresData = isOverallSelected ? [] : isParentsEducationSelected ? this.props.readingScoresByParentsEducation : this.props[`readingScoresBy${dropdownValue}`];

    if (dropdownValue === "Overall") {
      const {readingScoresByNation, readingScoresByCity} = this.props;
      readingScoresByNation.forEach(d => {
        d.Geography = "Nation";
        readingScoresData.push(d);
      });
      readingScoresByCity.forEach(d => {
        d.Geography = "City";
        readingScoresData.push(d);
      });
    }

    let stat1Value = "Nation";
    let stat2Value = "City";

    if (dropdownValue === "Gender") {
      stat1Value = "Male";
      stat2Value = "Female";
    }
    if (dropdownValue === "ELL" || dropdownValue === "NSLP" || dropdownValue ===  "Disability") {
      stat1Value = "No";
      stat2Value = "Yes";
    }
    if (dropdownValue === "Race") {
      stat1Value = "Black";
      stat2Value = "Hispanic";
    }

    const isStatValueYesOrNo = stat1Value === "No" && stat2Value === "Yes";  

    // Get recent year data.
    const latestYear = readingScoresData[0].Year;
    const recentYearData = readingScoresData.filter(d => d.Year === latestYear);

    let stat1EighthGradeReadingScores, stat1FourthGradeReadingScores, stat2EighthGradeReadingScores, stat2FourthGradeReadingScores;
    if (!isParentsEducationSelected) {
      // Find top stat1 4th Grade data.
      const stat1ReadingScores = isOverallSelected ? recentYearData.filter(d => d.Geography === stat1Value) : recentYearData.filter(d => d[dropdownValue] === stat1Value);
      stat1FourthGradeReadingScores = stat1ReadingScores.filter(d => d.Grade === "4")[0];
  
      // Find top stat1 8th grade data.
      stat1EighthGradeReadingScores = stat1ReadingScores.filter(d => d.Grade === "8")[0];
  
      // Find top stat2 4th Grade data.
      const stat2ReadingScores = isOverallSelected ? recentYearData.filter(d => d.Geography === stat2Value) : recentYearData.filter(d => d[dropdownValue] === stat2Value);
      stat2FourthGradeReadingScores = stat2ReadingScores.filter(d => d.Grade === "4")[0];
  
      // Find top stat2 8th grade data.
      stat2EighthGradeReadingScores = stat2ReadingScores.filter(d => d.Grade === "8")[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>ReadingAssessment</SectionTitle>
        <article>
          {/* Create a dropdown for all categoeries of reading assessment. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <p>The following chart shows the average reading assessment score {isParentsEducationSelected ? "for 8th grade students" : ""} in Detroit {isOverallSelected ? "compared to the United States" : isParentsEducationSelected ? `by their ${dropdownValue.toLowerCase()}` : `by ${dropdownValue.toLowerCase()}`} over time.</p>
          {isParentsEducationSelected 
            ? <div>
              {recentYearData.map(item =>
                <Stat key={item.measure}
                  title={`${item["Parents Education"]} (DETROIT)`}
                  year={item.Year}
                  value={item["Average Reading Score by Parents Education"]}
                />
              )}
            </div>
            : <div>
              <Stat
                title={isOverallSelected ? "4TH grade Score (United States)" : `4TH GRADE ${stat1Value} ${isStatValueYesOrNo ? dropdownValue : ""} (DETROIT)`}
                year={stat1FourthGradeReadingScores.Year}
                value={isOverallSelected ? stat1FourthGradeReadingScores["Average Reading Score"] : stat1FourthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
              />
              <Stat
                title={isOverallSelected ? "4TH grade Score (DETROIT)" : `4TH GRADE  ${isStatValueYesOrNo ? `with ${dropdownValue}` : stat2Value} (DETROIT)`}
                year={stat2FourthGradeReadingScores.Year}
                value={isOverallSelected ? stat2FourthGradeReadingScores["Average Reading Score"] : stat2FourthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
              />
              <Stat
                title={isOverallSelected ? "8TH grade Score (United States)" : `8TH GRADE ${stat1Value} ${isStatValueYesOrNo ? dropdownValue : ""} (DETROIT)`}
                year={stat1EighthGradeReadingScores.Year}
                value={isOverallSelected ? stat1EighthGradeReadingScores["Average Reading Score"] : stat1EighthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
              />
              <Stat
                title={isOverallSelected ? "8TH grade Score (DETROIT)" : `8TH GRADE ${isStatValueYesOrNo ? `with ${dropdownValue}` : stat2Value} (DETROIT)`}
                year={stat2EighthGradeReadingScores.Year}
                value={isOverallSelected ? stat2EighthGradeReadingScores["Average Reading Score"] : stat2EighthGradeReadingScores[`Average Reading Score by ${dropdownValue}`]}
              />
            </div>}
        </article>

        <LinePlot config={{
          data: readingScoresData,
          discrete: "x",
          height: 400,
          groupBy: d => isOverallSelected ? `${d.Grade} ${d.Geography === "Nation" ? "United States" : "Detroit"}` : `${d.Grade} ${d[dropdownValue]}`,
          label: d => isOverallSelected ? `${d.Grade}th Grade ${d.Geography === "Nation" ? "United States" : "Detroit"}` : `${d.Grade}th Grade ${d[dropdownValue]}`,
          baseline: 0,
          legend: false,
          x: "Year",
          y: isOverallSelected ? "Average Reading Score" : `Average Reading Score by ${dropdownValue}`,
          yConfig: {
            title: `Average Reading Score by ${dropdownValue}`,
            domain: [0, 300]
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Average Reading Score", d => isOverallSelected ? d["Average Reading Score"] : d[`Average Reading Score by ${dropdownValue}`]], ["Place", d => isOverallSelected ? d.Geography === "Nation" ? "United States" : "Detroit" : "Detroit"]]}
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

export default connect(mapStateToProps)(ReadingAssessment);
