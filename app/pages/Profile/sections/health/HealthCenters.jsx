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

class HealthCenters extends SectionColumns {

  render() {
    const {healthCenterData} = this.props;
    console.log("healthCenterData: ", healthCenterData);
    const healthCenterLatestYearData = healthCenterData.data[0];
    console.log("Penetration of Uninsured Population: ", healthCenterLatestYearData["Penetration of Uninsured Population"]);

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>
          {healthCenterLatestYearData["Penetration of Total Population"] !== null && healthCenterLatestYearData["Penetration of Total Population"] !== undefined
            ? <Stat
              title={`Total Population visited health center in ${healthCenterLatestYearData.Year}`}
              value={`${formatPercentage(healthCenterLatestYearData["Penetration of Total Population"])}`}
            />
            : null
          }
          {healthCenterLatestYearData["Penetration of Low-Income"] !== null && healthCenterLatestYearData["Penetration of Low-Income"] !== undefined
            ? <Stat 
              title={`Low-Income Population visited health center in ${healthCenterLatestYearData.Year}`}
              value={`${formatPercentage(healthCenterLatestYearData["Penetration of Low-Income"])}`}
            />
            : null
          }
          {healthCenterLatestYearData["Penetration of Uninsured Population"] !== null && healthCenterLatestYearData["Penetration of Uninsured Population"] !== undefined
            ? <Stat
              title={`Uninsured Population visited health center in ${healthCenterLatestYearData.Year}`}
              value={`${formatPercentage(healthCenterLatestYearData["Penetration of Uninsured Population"])}`}
            />
            : null
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
            console.log("resp:", resp);
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
            console.log("data: ", data);
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
          topojsonFilter: d => {
            // console.log("d: ", d);
            console.log("topojsonFilter:");
            return d.properties.GEOID10;
          }
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
  fetchData("healthCenterData", "/api/data?measures=Penetration%20of%20Total%20Population,Penetration%20of%20Low-Income,Penetration%20of%20Uninsured%20Population&Zip%20Code=48101&Year=all")
];

const mapStateToProps = state => ({
  healthCenterData: state.data.healthCenterData
});

export default connect(mapStateToProps)(HealthCenters);

