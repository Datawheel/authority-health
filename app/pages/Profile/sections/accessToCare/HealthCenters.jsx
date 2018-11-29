import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import zipcodes from "../../../../utils/zipcodes";

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

    // Get the health center data for latest year.
    const recentYearHealthCenterData = {};
    nest()
      .key(d => d.Year)
      .entries(healthCenterData.data)
      .forEach(group => {
        group.key >= healthCenterData.data[0].Year ? Object.assign(recentYearHealthCenterData, group) : {};
      });

    // Sort healthCenterData by each Penetration type, then find the top data for each.
    const sortedTotalPopulationData = recentYearHealthCenterData.values.slice(0);
    sortedTotalPopulationData.sort((a, b) =>  b["Penetration of Total Population"] - a["Penetration of Total Population"]);
    const topTotalPopulationData = sortedTotalPopulationData[0];

    const sortedLowIncomeData = recentYearHealthCenterData.values.slice(0);
    sortedLowIncomeData.sort((a, b) => b["Penetration of Low-Income"] - a["Penetration of Low-Income"]);
    const topLowIncomeData = sortedLowIncomeData[0];

    const sortedUninsuredPopulationData = recentYearHealthCenterData.values.slice(0);
    sortedUninsuredPopulationData.sort((a, b) =>  b["Penetration of Uninsured Population"] - a["Penetration of Uninsured Population"]);
    const topUninsuredPopulationData = sortedUninsuredPopulationData[0];

    return (
      <SectionColumns>
        <SectionTitle>Health Centers</SectionTitle>
        <article>
          {/* Show top stats for each penetration type */}
          <Stat
            title={formatMeasureName("Penetration of Total Population")}
            year={`visited health center in ${topTotalPopulationData.Year}`}
            value={topTotalPopulationData["Zip Code"]}
            qualifier={formatPercentage(topTotalPopulationData["Penetration of Total Population"])}
          />
          <Stat
            title={formatMeasureName("Penetration of Low-Income")}
            year={`visited health center in ${topLowIncomeData.Year}`}
            value={topLowIncomeData["Zip Code"]}
            qualifier={formatPercentage(topLowIncomeData["Penetration of Low-Income"])}
          />
          <Stat
            title={formatMeasureName("Penetration of Uninsured Population")}
            year={`visited health center in ${topUninsuredPopulationData.Year}`}
            value={topUninsuredPopulationData["Zip Code"]}
            qualifier={formatPercentage(topUninsuredPopulationData["Penetration of Uninsured Population"])}
          />

          {/* Draw a BarChart to show data for health center data by race */}
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
            // console.log(data);
            return data;
          }}
          />
        </article>

        {/* Draw Geomap to show health center count for each zip code in the Wayne county */}
        <Geomap config={{
          data: "/api/data?measures=Health%20Centers&drilldowns=Zip%20Code&Year=all",
          groupBy: "ID Zip Code",
          colorScale: "Health Centers",
          label: d => d["Zip Code"],
          height: 400,
          time: "Year",
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Health Centers"])]]},
          topojson: "/topojson/zipcodes.json",
          topojsonFilter: d => zipcodes.includes(d.properties.ZCTA5CE10),
          topojsonId: d => d.properties.ZCTA5CE10
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

HealthCenters.defaultProps = {
  slug: "health-centers"
};

HealthCenters.need = [
  fetchData("healthCenterData", "/api/data?measures=Penetration%20of%20Total%20Population,Penetration%20of%20Low-Income,Penetration%20of%20Uninsured%20Population&drilldowns=Zip%20Code&Year=all")
];

const mapStateToProps = state => ({
  healthCenterData: state.data.healthCenterData
});

export default connect(mapStateToProps)(HealthCenters);
