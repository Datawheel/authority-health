import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";

const formatName = d => {
  const nameArr = d.split(" ");
  return nameArr.reduce((acc, currValue, i) => i === 0 ? "" : acc.concat(currValue), "").trim();
};

const formatPercentage = d => `${formatAbbreviate(d * 100)}%`;
const formatMeasureName = d => {
  const nameArr = d.split(" ");
  return nameArr[2];
};

class HealthCenters extends SectionColumns {

  render() {
    const {healthCenterData} = this.props;
    const data = healthCenterData.source[0].measures.map(d => {
      const result = healthCenterData.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue[d] !== null) {
          return Object.assign({}, currentValue, {PenetrationType: d});
        }
        return acc;
      }, null);
      return result;
    });

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>
          {data.map(d => <Stat key={d.PenetrationType}
            title={`${formatMeasureName(d.PenetrationType)} Population visited health center in ${d.Year}`}
            value={`${formatPercentage(d[d.PenetrationType])}`}
          />)
          }
          
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
            const data = [];
            nest()
              .key(d => d.Year)
              .entries(resp.data)
              .forEach(group => {
                resp.source[0].measures.map(d => {
                  const result = group.values.reduce((acc, currentValue) => {
                    if (acc === null && currentValue[d] !== null) {
                      if (d === "% Non-white") {
                        d = "% White";
                        currentValue[d] = 1 - currentValue["% Non-white"];
                        return Object.assign({}, currentValue, {RaceType: d});
                      }
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

        <Geomap config={{
          data: "http://localhost:3300/api/data?measures=Health%20Centers&drilldowns=Zip%20Code&Year=all",
          groupBy: "ID Zip Code",
          colorScale: "Health Centers",
          label: d => d["Zip Code"],
          height: 400,
          // time: "Year",
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Health Centers"])]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => 
            // console.log("topojsonFilter:");
            true
            // return d.properties.GEOID10.indexOf("26163") === 0;
          
        }}
        // dataFormat={resp => {
        //   console.log("resp: ", resp);
        //   return resp.data;
        // }}
        />
      </SectionColumns>
    );
  }
}

HealthCenters.defaultProps = {
  slug: "health-centers"
};

HealthCenters.need = [
  fetchData("healthCenterData", "/api/data?measures=Penetration%20of%20Total%20Population,Penetration%20of%20Low-Income,Penetration%20of%20Uninsured%20Population&Zip%20Code=48111&Year=all")
];

const mapStateToProps = state => ({
  healthCenterData: state.data.healthCenterData
});

export default connect(mapStateToProps)(HealthCenters);

