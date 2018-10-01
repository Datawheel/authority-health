import React from "react";
// import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "./Stat";

class DemographicFoodAccess extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Low Access to Food store</SectionTitle>
        <article>
          Some text about low access to food
          <BarChart config={{
            data: "/api/data?measures=Children%2C%20low%20access%20to%20store%20(%25),Seniors%2C%20low%20access%20to%20store%20(%25)&County=05000US26163&Year=all",
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "AgeType",
            x: d => d[d.AgeType],
            y: "AgeType",
            yConfig: {ticks: []},
            tooltipConfig: {tbody: [["Value", d => d[d.AgeType]]]}
          }}
          dataFormat={resp => {
            console.log("resp: ", resp);
            const ages = [];
            resp.source[0].measures.forEach(ageType => ages.push(ageType));
            const data = [];
            ages.map(ageType => {
              const result = resp.data.reduce((acc, currentValue) => {
                if (acc === null && currentValue[ageType] !== null) {
                  return Object.assign({}, currentValue, {AgeType: ageType});
                }
                return acc;
              }, null);
              data.push(result);
            });
            return data;
          }}
          />
        </article>

        <BarChart config={{
          data: "/api/data?measures=White%2C%20low%20access%20to%20store%20(%25),Black%2C%20low%20access%20to%20store%20(%25),Hispanic%20ethnicity%2C%20low%20access%20to%20store%20(%25),Asian%2C%20low%20access%20to%20store%20(%25),American%20Indian%20or%20Alaska%20Native%2C%20low%20access%20to%20store%20(%25),Hawaiian%20or%20Pacific%20Islander%2C%20low%20access%20to%20store%20(%25),Multiracial%2C%20low%20access%20to%20store%20(%25)&County=05000US26163&Year=all",
          discrete: "x",
          height: 500,
          legend: false,
          groupBy: "RaceType",
          x: "RaceType",
          y: d => d[d.RaceType],
          shapeConfig: {label: false},
          xConfig: {labelRotation: false},
          tooltipConfig: {tbody: [["Value", d => d[d.RaceType]]]}
        }}
        dataFormat={resp => {
          const races = [];
          resp.source[0].measures.forEach(race => races.push(race));
          const data = [];
          races.map(race => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue[race] !== null) {
                return Object.assign({}, currentValue, {RaceType: race});
              }
              return acc;
            }, null);
            data.push(result);
          });
          return data;
        }}
        />
      </SectionColumns>
    );
  }
}

export default DemographicFoodAccess;
