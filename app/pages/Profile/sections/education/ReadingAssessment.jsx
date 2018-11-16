import React from "react";
import {connect} from "react-redux";
import {LinePlot} from "d3plus-react";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class ReadingAssessment extends SectionColumns {

  render() {

    const {readingScoresByGender} = this.props;
    console.log("readingScoresByGender: ", readingScoresByGender);

    return (
      <SectionColumns>
        <SectionTitle>Reading Assessment</SectionTitle>
        <article>
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
