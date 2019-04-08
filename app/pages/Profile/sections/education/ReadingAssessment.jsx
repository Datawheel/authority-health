import React from "react";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const formatOverallData = (readingScoresByNation, readingScoresByCity) => {
  const readingScoresData = [];
  readingScoresByNation.forEach(d => {
    d.Geography = "Nation";
    readingScoresData.push(d);
  });
  readingScoresByCity.forEach(d => {
    d.Geography = "City";
    readingScoresData.push(d);
  });

  // Get recent year data.
  const recentYear = readingScoresData[0].Year;
  const recentYearData = readingScoresData.filter(d => d.Year === recentYear);
  return [readingScoresData, recentYearData];
};

class ReadingAssessment extends SectionColumns {
  constructor(props) {
    super(props);
    const readingScoresData = formatOverallData(this.props.readingScoresByNation, this.props.readingScoresByCity)[1];
    this.state = {
      dropdownValue: "Overall",
      readingScoresData,
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue !== "Overall") {
      axios.get(`/api/data?measures=Average Reading Score by ${dropdownValue}&drilldowns=Grade,${dropdownValue},Place&Year=latest`)
        .then(resp => {
          this.setState({
            readingScoresData: resp.data.data,
            dropdownValue
          });
        });
    }
    else {
      this.setState({
        readingScoresData: formatOverallData(this.props.readingScoresByNation, this.props.readingScoresByCity)[1],
        dropdownValue
      });
    }
  }

  render() {
    const {dropdownValue, readingScoresData} = this.state;
    const dropdownList = ["Overall", "Gender", "Race", "ELL", "NSLP", "Disability", "Parents Education"];
    const isOverallSelected = dropdownValue === "Overall";
    const isParentsEducationSelected = dropdownValue === "Parents Education";

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
    // const recentYear = readingScoresData[0].Year;
    // const recentYearData = readingScoresData.filter(d => d.Year === recentYear);

    let stat1EighthGrade, stat1FourthGrade, stat2EighthGrade, stat2FourthGrade;
    if (!isParentsEducationSelected) {
      // Find top stat1 4th Grade data.
      const stat1Data = isOverallSelected ? readingScoresData.filter(d => d.Geography === stat1Value) : readingScoresData.filter(d => d[dropdownValue] === stat1Value);
      stat1FourthGrade = stat1Data.filter(d => d.Grade === "4")[0];

      // Find top stat1 8th grade data.
      stat1EighthGrade = stat1Data.filter(d => d.Grade === "8")[0];

      // Find top stat2 4th Grade data.
      const stat2Data = isOverallSelected ? readingScoresData.filter(d => d.Geography === stat2Value) : readingScoresData.filter(d => d[dropdownValue] === stat2Value);
      stat2FourthGrade = stat2Data.filter(d => d.Grade === "4")[0];

      // Find top stat2 8th grade data.
      stat2EighthGrade = stat2Data.filter(d => d.Grade === "8")[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>Reading Assessment</SectionTitle>
        <article>
          {/* Create a dropdown for all categoeries of reading assessment. */}
          <label className="pt-label pt-inline" htmlFor="reading-assessment-dropdown">
            Show data for
            <div className="pt-select">
              <select id="reading-assessment-dropdown" onChange={this.handleChange}>
                {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </label>
          <p>The following chart shows the average reading assessment score {isParentsEducationSelected ? "for 8th grade students" : ""} in Detroit {isOverallSelected ? "compared to the United States" : isParentsEducationSelected ? `by their ${dropdownValue.toLowerCase()}` : `by ${dropdownValue.toLowerCase()}`} over time.</p>
          {isParentsEducationSelected
            ? <div>
              {readingScoresData.map(item =>
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
                year={stat1FourthGrade.Year}
                value={isOverallSelected ? stat1FourthGrade["Average Reading Score"] : stat1FourthGrade[`Average Reading Score by ${dropdownValue}`]}
              />
              <Stat
                title={isOverallSelected ? "4TH grade Score (DETROIT)" : `4TH GRADE  ${isStatValueYesOrNo ? `with ${dropdownValue}` : stat2Value} (DETROIT)`}
                year={stat2FourthGrade.Year}
                value={isOverallSelected ? stat2FourthGrade["Average Reading Score"] : stat2FourthGrade[`Average Reading Score by ${dropdownValue}`]}
              />
              <Stat
                title={isOverallSelected ? "8TH grade Score (United States)" : `8TH GRADE ${stat1Value} ${isStatValueYesOrNo ? dropdownValue : ""} (DETROIT)`}
                year={stat1EighthGrade.Year}
                value={isOverallSelected ? stat1EighthGrade["Average Reading Score"] : stat1EighthGrade[`Average Reading Score by ${dropdownValue}`]}
              />
              <Stat
                title={isOverallSelected ? "8TH grade Score (DETROIT)" : `8TH GRADE ${isStatValueYesOrNo ? `with ${dropdownValue}` : stat2Value} (DETROIT)`}
                year={stat2EighthGrade.Year}
                value={isOverallSelected ? stat2EighthGrade["Average Reading Score"] : stat2EighthGrade[`Average Reading Score by ${dropdownValue}`]}
              />
            </div>}
            
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />
        </article>

        <LinePlot config={{
          data: isOverallSelected ? "/api/data?measures=Average Reading Score&drilldowns=Grade,Place&Year=all" : `/api/data?measures=Average Reading Score by ${dropdownValue}&drilldowns=Grade,${dropdownValue},Place&Year=all`,
          discrete: "x",
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
        dataFormat={resp => {
          this.setState({sources: updateSource(resp.source, this.state.sources)});
          return isOverallSelected ? formatOverallData(this.props.readingScoresByNation, resp.data)[0] : resp.data;
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
  // Default dropdown value "Overall" needs data from 2 APIs, and merge them into one array. Hence all year data is fetched.
  fetchData("readingScoresByNation", "/api/data?measures=Average Reading Score&drilldowns=Grade,Nation&Year=all", d => d.data),
  fetchData("readingScoresByCity", "/api/data?measures=Average Reading Score&drilldowns=Grade,Place&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  readingScoresByNation: state.data.readingScoresByNation,
  readingScoresByCity: state.data.readingScoresByCity
});

export default connect(mapStateToProps)(ReadingAssessment);
