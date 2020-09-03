import React from "react";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import StatGroup from "components/StatGroup";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatOverallData = (readingScoresByNation, readingScoresByState, readingScoresByCity) => {
  const readingScoresData = [];
  readingScoresByNation.forEach(d => {
    d.Geography = "United States";
    delete d.Nation;
    readingScoresData.push(d);
  });
  readingScoresByState.forEach(d => {
    d.Geography = "Michigan";
    readingScoresData.push(d);
  });
  readingScoresByCity.forEach(d => {
    d.Geography = "Detroit";
    readingScoresData.push(d);
  });
  // Get recent year data.
  const recentYear = readingScoresData[0].Year;
  const recentYearData = readingScoresData.filter(d => d.Year === recentYear);
  return [readingScoresData, recentYearData];
};

const getLabel = (d, isOverallSelected = true, dropdownValue) => {
  if (isOverallSelected) return `${d.Grade}th Grade, ${d.Geography}`;
  else {
    if (d[dropdownValue] === "Yes") return `${d.Grade}th Grade, With ${dropdownValue}`;
    if (d[dropdownValue] === "No") return `${d.Grade}th Grade, No ${dropdownValue}`;
    return `${d.Grade}th Grade, ${d[dropdownValue]}`;
  }
};

const definitions = [
  {term: "ELL", definition: "English-language learners, or ELLs, are students who are unable to communicate fluently or learn effectively in English, who often come from non-English-speaking homes and backgrounds, and who typically require specialized or modified instruction in both the English language and in their academic courses."},
  {term: "NSLP", definition: "The National School Lunch Program, or NSLP, is a federally assisted meal program operating in public and nonprofit private schools and residential child care institutions. It provides nutritionally balanced, low-cost or free lunches to children each school day."},
  {term: "Disability", definition: "A student with a disability may need specially designed instruction to meet his or her learning goals. A student with a disability will usually have an Individualized Education Plan (IEP), which guides his or her special education instruction. Students with disabilities are often referred to as special education students and may be classified by their school as learning disabled (LD) or emotionally disturbed (ED)."}
];

class ReadingAssessment extends SectionColumns {
  constructor(props) {
    super(props);
    const readingScoresData = formatOverallData(this.props.readingScoresByNation, this.props.readingScoresByState, this.props.readingScoresByCity)[1];
    this.state = {
      dropdownValue: "Overall",
      readingScoresData,
      readingScoresByNation: this.props.readingScoresByNation,
      readingScoresByState: this.props.readingScoresByState,
      readingScoresByCity: this.props.readingScoresByCity,
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    const {readingScoresByNation, readingScoresByState, readingScoresByCity} = this.state;
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
        readingScoresData: formatOverallData(readingScoresByNation, readingScoresByState, readingScoresByCity)[1],
        dropdownValue
      });
    }
  }

  render() {
    const {dropdownValue, readingScoresData, readingScoresByNation, readingScoresByState} = this.state;
    const dropdownList = ["Overall", "Gender", "Race", "ELL", "NSLP", "Disability", "Parents' Education"];
    const isOverallSelected = dropdownValue === "Overall";
    const isParentsEducationSelected = dropdownValue === "Parents' Education";

    let stat1Value = "Detroit";
    let stat2Value = "Michigan";
    const stat3Value = "United States";

    if (dropdownValue === "Gender") {
      stat1Value = "Female";
      stat2Value = "Male";
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

    let stat3EighthGrade, stat3FourthGrade;
    if (isOverallSelected) {
      const stat3Data = readingScoresData.filter(d => d.Geography === stat3Value);
      stat3FourthGrade = stat3Data.filter(d => d.Grade === "4")[0];

      // Find top stat3 8th grade data.
      stat3EighthGrade = stat3Data.filter(d => d.Grade === "8")[0];
    }

    return (
      <SectionColumns>
        <SectionTitle>Reading Assessment</SectionTitle>
        <article>
          {/* Create a dropdown for all categoeries of reading assessment. */}
          <label className="pt-label pt-inline" htmlFor="reading-assessment-dropdown">
            Show data for
            <select id="reading-assessment-dropdown" onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <p>The following chart shows the average reading assessment scores {isParentsEducationSelected ? "for 8th grade students" : ""} in Detroit {isOverallSelected ? "compared to Michigan and the United States" : isParentsEducationSelected ? `by their ${dropdownValue.toLowerCase()}` : `by ${dropdownValue === "ELL" || dropdownValue === "NSLP" ? dropdownValue : dropdownValue.toLowerCase()}`}.</p>
          {isParentsEducationSelected
            ? <StatGroup
              title="Parental education level (Detroit)"
              year={readingScoresData[0].Year}
              stats={readingScoresData.map(stat => ({
                key: stat.measure,
                title: stat["Parents' Education"],
                value: stat["Average Reading Score by Parents' Education"]
              }))}
            />

            : <div className="article-inner-container">
              {/* fourth grade stats */}
              <StatGroup
                title={`4th grade average scores${ !isOverallSelected ? ` by ${dropdownValue}` : "" }`}
                year={stat1FourthGrade.Year}
                stats={[
                  {
                    title: isOverallSelected
                      ? "Detroit"
                      : `${stat1Value} ${isStatValueYesOrNo ? dropdownValue : ""} (Detroit)`,
                    value: isOverallSelected
                      ? stat1FourthGrade["Average Reading Score"]
                      : stat1FourthGrade[`Average Reading Score by ${dropdownValue}`]
                  },
                  {
                    title: isOverallSelected
                      ? "Michigan"
                      : `${ stat2Value !== "Yes" ? stat2Value : "" } ${isStatValueYesOrNo ? dropdownValue : ""} (Detroit)`,
                    value: isOverallSelected
                      ? stat2FourthGrade["Average Reading Score"]
                      : stat2FourthGrade[`Average Reading Score by ${dropdownValue}`],
                    color: dropdownValue === "Gender" ? "terra-cotta" : null
                  },
                  {
                    title: isOverallSelected
                      ? "United States"
                      : null,
                    value: isOverallSelected
                      ? stat3FourthGrade["Average Reading Score"]
                      : null
                  }
                ]}
              />
              {/* eighth grade stats */}
              <StatGroup
                title={`8th grade average scores${ !isOverallSelected ? ` by ${dropdownValue}` : "" }`}
                year={stat1EighthGrade.Year}
                stats={[
                  {
                    title: isOverallSelected
                      ? "Detroit"
                      : `${stat1Value} ${isStatValueYesOrNo ? dropdownValue : ""} (Detroit)`,
                    value: isOverallSelected
                      ? stat1EighthGrade["Average Reading Score"]
                      : stat1EighthGrade[`Average Reading Score by ${dropdownValue}`]
                  },
                  {
                    title: isOverallSelected
                      ? "Michigan"
                      : `${ stat2Value !== "Yes" ? stat2Value : "" } ${isStatValueYesOrNo ? dropdownValue : ""} (Detroit)`,
                    value: isOverallSelected
                      ? stat2EighthGrade["Average Reading Score"]
                      : stat2EighthGrade[`Average Reading Score by ${dropdownValue}`],
                    color: dropdownValue === "Gender" ? "terra-cotta" : null
                  },
                  {
                    title: isOverallSelected
                      ? "United States"
                      : null,
                    value: isOverallSelected
                      ? stat3EighthGrade["Average Reading Score"]
                      : null
                  }
                ]}
              />
            </div>}

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return isOverallSelected ? formatOverallData(readingScoresByNation, readingScoresByState, resp.data)[0] : resp.data;
            }}
            slug={this.props.slug}
            data={ isOverallSelected ? "/api/data?measures=Average Reading Score&drilldowns=Grade,Place&Year=all" : `/api/data?measures=Average Reading Score by ${dropdownValue}&drilldowns=Grade,${dropdownValue},Place&Year=all` }
            title="Chart of Reading Assessment" />

          <BarChart ref={comp => this.viz = comp} config={{
            data: isOverallSelected ? "/api/data?measures=Average Reading Score&drilldowns=Grade,Place&Year=all" : `/api/data?measures=Average Reading Score by ${dropdownValue}&drilldowns=Grade,${dropdownValue},Place&Year=all`,
            discrete: "x",
            groupBy: d => isOverallSelected ? `${d.Geography}` : `${d[dropdownValue]}`,
            label: d => isOverallSelected ? getLabel(d) : getLabel(d, false, dropdownValue),
            legend: false,
            x: "Grade",
            xConfig: {
              // title: "Grade"
              tickFormat: d => `${d}th Grade`
            },
            y: isOverallSelected ? "Average Reading Score" : `Average Reading Score by ${dropdownValue}`,
            yConfig: {
              title: isOverallSelected ? "Average Reading Score" : `Average Reading Score by ${dropdownValue}`
            },
            groupPadding: 25,
            barPadding: 3,
            time: "Year",
            tooltipConfig: {
              tbody: [
                ["Year", d => d.Year],
                ["Average Reading Score", d => isOverallSelected ? d["Average Reading Score"] : d[`Average Reading Score by ${dropdownValue}`]]
              ]
            }
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return isOverallSelected ? formatOverallData(readingScoresByNation, readingScoresByState, resp.data)[0] : resp.data;
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

ReadingAssessment.defaultProps = {
  slug: "reading-assessment"
};

ReadingAssessment.need = [
  // Default dropdown value "Overall" needs data from 3 APIs, and merge them into one array. Hence all year data is fetched.
  fetchData("readingScoresByNation", "/api/data?measures=Average Reading Score&drilldowns=Grade,Nation&Year=all", d => d.data),
  fetchData("readingScoresByState", "/api/data?measures=Average Reading Score&drilldowns=Grade,State&Year=all", d => d.data),
  fetchData("readingScoresByCity", "/api/data?measures=Average Reading Score&drilldowns=Grade,Place&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  readingScoresByNation: state.data.readingScoresByNation,
  readingScoresByState: state.data.readingScoresByState,
  readingScoresByCity: state.data.readingScoresByCity
});

export default connect(mapStateToProps)(ReadingAssessment);
