import React from "react";
// import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
// import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

// import Stat from "../../components/Stat";

import rangeFormatter from "../../../../utils/rangeFormatter";

class ChildCare extends SectionColumns {

  render() {
    return (
      <SectionColumns>
        <SectionTitle>Child Care</SectionTitle>
        <article>
        </article>

        <BarChart config={{
          data: "/api/data?measures=Population&drilldowns=Responsibility%20Length&Year=all",
          discrete: "x",
          height: 400,
          //   stacked: true,
          groupBy: "Responsibility Length",
          x: d => d["Responsibility Length"],
          y: "Population",
          time: "ID Year",
          xSort: (a, b) => a["ID Responsibility Length"] - b["ID Responsibility Length"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d)
          },
          //   yConfig: {tickFormat: d => formatPopulation(d)},
          shapeConfig: {label: false}
        //   tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d.Population)]]}
        }}
        dataFormat={resp => {
          console.log("resp.data: ", resp.data);
          return resp.data;
        }}
        />
      </SectionColumns>
    );
  }
}

ChildCare.defaultProps = {
  slug: "child-care"
};

export default ChildCare;
