import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class Incarceration extends SectionColumns {

  render() {
    const {incarcerationData} = this.props;
    console.log("incarcerationData: ", incarcerationData);

    // Format data for publicAssistanceData.
    const recentYearEducationalAttainment = {};
    nest()
      .key(d => d.Year)
      .entries(incarcerationData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= incarcerationData[0].Year ? Object.assign(recentYearEducationalAttainment, group) : {};
      });

    // const filteredData = incarcerationData.filter(d => );

    return (
      <SectionColumns>
        <SectionTitle>Incarceration</SectionTitle>
        <article>
          {/* Draw a Barchart to show Educational Attainment for all types of education buckets. */}
          {/* <BarChart config={{
            data: incarcerationData,
            discrete: "x",
            height: 400,
            legend: false,
            // label: d => `${d.Sex} - ${d["Educational Attainment"]}`,
            groupBy: "Sex",
            x: "Educational Attainment",
            y: "share",
            time: "ID Year",
            xSort: (a, b) => a["ID Educational Attainment"] - b["ID Educational Attainment"],
            yConfig: {tickFormat: d => formatPopulation(d)},
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Value", d => formatPopulation(d.share)]]}
          }}
          /> */}
        </article>
      </SectionColumns>
    );
  }
}

Incarceration.defaultProps = {
  slug: "incarceration"
};

Incarceration.need = [
  fetchData("incarcerationData", "/api/data?measures=Total,Prison,Jail,Jail%2FProbation,Probation,Other&drilldowns=Offense&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  incarcerationData: state.data.incarcerationData
});

export default connect(mapStateToProps)(Incarceration);
