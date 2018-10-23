import React from "react";
// import {connect} from "react-redux";
// import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

class DisabilityStatus extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Disability Status</SectionTitle>
        <article>
        </article>
        {/* <BarChart config={{
          data: "/api/data?measures=Smoking%20Status%20Current%20Weighted%20Percent,Smoking%20Status%20Former%20Weighted%20Percent,Smoking%20Status%20Never%20Weighted%20Percent&drilldowns=End%20Year",
          discrete: "y",
          height: 250,
          groupBy: "SmokingType",
          label: d => {
            const wordsArr = d.SmokingType.split(" ");
            return `${wordsArr[0]} ${wordsArr[1]}: ${wordsArr[2]}`;
          },
          legend: false,
          y: "SmokingType",
          x: d => d[d.SmokingType],
          time: "ID End Year",
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatPercentage(d)
          },
          yConfig: {ticks: []},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d[d.SmokingType])]]}
        }}
        dataFormat={resp => {
          console.log("resp", resp);
          const data = resp.source[0].measures.map(smokingType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue[smokingType] !== null) {
                return Object.assign({}, currentValue, {SmokingType: smokingType});
              }
              return acc;
            }, null);
            return result;
          });
          console.log("data: ", data);
          return data;
        }}
        /> : null } */}
      </SectionColumns>
    );
  }
}

DisabilityStatus.defaultProps = {
  slug: "disability-status"
};

export default DisabilityStatus;
