import React from "react";
// import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

const formatName = d => {
  const nameArr = d.split(" ");
  return nameArr.reduce((acc, currValue, i) => i === 0 ? "" : acc.concat(currValue), "").trim();
};

const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;

class HealthCenters extends SectionColumns {

  render() {

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>
          <BarChart config={{
            data: "/api/data?measures=%25%20Non-white,%25%20Hispanic,%25%20Black,%25%20Asian,%25%20American%20Indian%2FAlaska%20Native&Year=all",
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: "RaceType",
            label: d => formatName(d.RaceType),
            x: d => d[d.RaceType],
            y: "RaceType",
            time: "ID Year",
            xConfig: {tickFormat: d => formatPercentage(d)},
            yConfig: {ticks: []},
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d[d.RaceType])]]}
          }}
          dataFormat={resp => {
            console.log("resp:", resp);
            const data = [];
            nest()
              .key(d => d.Year)
              .entries(resp.data)
              .forEach(group => {
                resp.source[0].measures.map(d => {
                  const result = group.values.reduce((acc, currentValue) => {
                    if (acc === null && currentValue[d] !== null) {
                      return Object.assign({}, currentValue, {RaceType: d});
                    }
                    return acc;
                  }, null);
                  data.push(result);
                });
              });
            return data;
          }}
          />

        </article>
      </SectionColumns>
    );
  }
}

HealthCenters.defaultProps = {
  slug: "health-centers"
};
  
export default HealthCenters;
