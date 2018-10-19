import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class ChildCare extends SectionColumns {

  render() {

    const {responsibilityData} = this.props;
    const recentYearData = {};
    nest()
      .key(d => d.Year)
      .entries(responsibilityData.data)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= responsibilityData.data[0].Year ? Object.assign(recentYearData, group) : {};
      });

    const recentYearFilteredData = recentYearData.values.filter(d => d["ID Responsibility Length"] === 4);
    const data = responsibilityData.data.filter(d => d["ID Responsibility Length"] !== 5 && d["ID Responsibility Length"] !== 6);

    return (
      <SectionColumns>
        <SectionTitle>Child Care</SectionTitle>
        <article>
          <Stat
            title={`Grandparents responsible for their 5+ years grandchildren in ${recentYearFilteredData[0].Year}, `}
            value={`${formatAbbreviate(recentYearFilteredData[0].Population)}`}
          />
          <p>Short paragraph here</p>
        </article>

        <BarChart config={{
          data,
          discrete: "x",
          height: 400,
          groupBy: "Responsibility Length",
          legend: false,
          x: d => d["Responsibility Length"],
          y: "Population",
          time: "ID Year",
          xSort: (a, b) => a["ID Responsibility Length"] - b["ID Responsibility Length"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => {
              if (rangeFormatter(d) === "< 6") return "< 6 months";
              if (rangeFormatter(d) === "6 - 11") return "6 - 11 months";
              return rangeFormatter(d);
            }
          },
          yConfig: {tickFormat: d => formatAbbreviate(d)},
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

ChildCare.defaultProps = {
  slug: "child-care"
};

ChildCare.need = [
  fetchData("responsibilityData", "/api/data?measures=Population&drilldowns=Responsibility%20Length&Year=all")
];

const mapStateToProps = state => ({
  responsibilityData: state.data.responsibilityData
});
  
export default connect(mapStateToProps)(ChildCare);

