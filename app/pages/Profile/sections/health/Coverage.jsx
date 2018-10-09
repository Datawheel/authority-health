import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {SectionColumns, SectionTitle} from "@datawheel/canon-core";

import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPopulation = d => `${formatAbbreviate(d)}%`;
const formatAge = d => rangeFormatter(d);

class Coverage extends SectionColumns {

  render() {

    return (
      <SectionColumns>
        <SectionTitle>Coverage</SectionTitle>
        <BarChart config={{
          data: "/api/data?measures=Population&drilldowns=Health%20Insurance%20Coverage%20Status,Sex,Age&Year=all",
          discrete: "x",
          height: 400,
          stacked: true,
          groupBy: "Sex",
          x: d => d.Age,
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age"] - b["ID Age"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => formatAge(d)
          },
          yConfig: {tickFormat: d => formatPopulation(d)},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d.Population)]]}
        }}
        dataFormat={resp => {
          nest()
            .key(d => d.Year)
            .entries(resp.data)
            .forEach(group => {
              const total = sum(group.values, d => d.Population);
              group.values.forEach(d => d.share = d.Population / total * 100);
            });
          return resp.data.filter(d => d["ID Health Insurance Coverage Status"] === 0);
        }}
        />
      </SectionColumns>
    );
  }
}

Coverage.defaultProps = {
  slug: "coverage"
};

export default Coverage;
