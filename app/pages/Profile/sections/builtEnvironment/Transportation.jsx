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

class Transportation extends SectionColumns {

  render() {

    const {commuteTimeData, numberOfVehiclesData} = this.props;
    console.log("numberOfVehiclesData: ", numberOfVehiclesData);
    console.log("commuteTimeData: ", commuteTimeData);

    const recentYearNumberOfVehicles = {};
    nest()
      .key(d => d.Year)
      .entries(numberOfVehiclesData)
      .forEach(group => {
        const total = sum(group.values, d => d["Commute Means by Gender"]);
        group.values.forEach(d => d.share = d["Commute Means by Gender"] / total * 100);
        group.key >= numberOfVehiclesData[0].Year ? Object.assign(recentYearNumberOfVehicles, group) : {};
      });

    console.log("recentYearNumberOfVehicles: ", recentYearNumberOfVehicles);
    const findTopMaleData = recentYearNumberOfVehicles.values.filter(d => d.Sex === "Male").sort((a, b) => b.share - a.share);
    const topMaleData = findTopMaleData[0];

    const findTopFemaleData = recentYearNumberOfVehicles.values.filter(d => d.Sex === "Female").sort((a, b) => b.share - a.share);
    const topFemaleData = findTopFemaleData[0];

    // Find recent year commute time data.
    const recentYearCommuteTime = {};
    nest()
      .key(d => d.Year)
      .entries(commuteTimeData)
      .forEach(group => {
        group.key >= commuteTimeData[0].Year ? Object.assign(recentYearCommuteTime, group) : {};
      });

    console.log("recentYearCommuteTime: ", recentYearCommuteTime);
    const maleCommuteTimeData = recentYearCommuteTime.values[0];
    const femaleCommuteTimeData = recentYearCommuteTime.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Transportation</SectionTitle>
        <article>
          <Stat 
            title={`Median commute time (in minutes) for Male in ${maleCommuteTimeData.Year}`}
            value={`${formatAbbreviate(maleCommuteTimeData["Total Commute Time"])}`}
          /> 
          <Stat 
            title={`Median commute time (in minutes) for Female in ${femaleCommuteTimeData.Year}`}
            value={`${formatAbbreviate(femaleCommuteTimeData["Total Commute Time"])}`}
          /> 
          <Stat 
            title={`Male majority in ${topMaleData.Year}, Number of Vehicles & total percentage`}
            value={`${rangeFormatter(topMaleData["Vehicles Available"])} ${formatPercentage(topMaleData.share)}`}
          /> 
          <Stat 
            title={`Female majority in ${topFemaleData.Year}, Number of Vehicles & total percentage`}
            value={`${rangeFormatter(topFemaleData["Vehicles Available"])} ${formatPercentage(topFemaleData.share)}`}
          />
          <p>The Barchart here shows the Number of vehicals in each household and the percentage of Male and Female that owns them.</p>
          <BarChart config={{
            data: commuteTimeData,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: "Sex",
            y: d => d.Sex,
            x: "Total Commute Time",
            time: "ID Year",
            xConfig: {
              tickFormat: d => formatAbbreviate(d),
              title: "Commute time in minutes"
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Total Commute Time"])]]}
          }}
          />
        </article>

        <BarChart config={{
          data: numberOfVehiclesData,
          discrete: "x",
          height: 400,
          stacked: true,
          groupBy: "Sex",
          x: d => d["Vehicles Available"],
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Vehicles Available"] - b["ID Vehicles Available"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d),
            title: "Number of Vehicles"
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Transportation.defaultProps = {
  slug: "transportation"
};

Transportation.need = [
  fetchData("commuteTimeData", "https://gila-cliff.datausa.io/api/data?measures=Total%20Commute%20Time&drilldowns=Sex&County=<id>&Year=all", d => d.data),
  fetchData("numberOfVehiclesData", "https://gila-cliff.datausa.io/api/data?measures=Commute%20Means%20by%20Gender&drilldowns=Vehicles%20Available,Sex&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  commuteTimeData: state.data.commuteTimeData,
  numberOfVehiclesData: state.data.numberOfVehiclesData
});
  
export default connect(mapStateToProps)(Transportation);
