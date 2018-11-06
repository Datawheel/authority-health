import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const filterTimeBucket = d => d.split(" ").filter(d => d !== "Minutes").join("");

class Transportation extends SectionColumns {

  render() {

    const {commuteTimeData, numberOfVehiclesData, transportationMeans} = this.props;

    const recentYearNumberOfVehicles = {};
    nest()
      .key(d => d.Year)
      .entries(numberOfVehiclesData)
      .forEach(group => {
        const total = sum(group.values, d => d["Commute Means by Gender"]);
        group.values.forEach(d => d.share = d["Commute Means by Gender"] / total * 100);
        group.key >= numberOfVehiclesData[0].Year ? Object.assign(recentYearNumberOfVehicles, group) : {};
      });
    recentYearNumberOfVehicles.values.sort((a, b) => b.share - a.share);
    const topRecentYearNumberOfVehicles = recentYearNumberOfVehicles.values[0];

    // Find recent year commute time data.
    const recentYearCommuteTime = {};
    nest()
      .key(d => d.Year)
      .entries(commuteTimeData)
      .forEach(group => {
        const total = sum(group.values, d => d["Commute Time"]);
        group.values.forEach(d => d.share = d["Commute Time"] / total * 100);
        group.key >= commuteTimeData[0].Year ? Object.assign(recentYearCommuteTime, group) : {};
      });
    recentYearCommuteTime.values.sort((a, b) => b.share - a.share);
    const topRecentYearCommuteTime = recentYearCommuteTime.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Transportation</SectionTitle>
        <article>
          <Stat 
            title={`Top commute time in ${topRecentYearCommuteTime.Year}`}
            value={`${topRecentYearCommuteTime["Travel Time"]} ${formatPercentage(topRecentYearCommuteTime.share)}`}
          />
          <Stat 
            title={`Top number of vehicles in ${topRecentYearNumberOfVehicles.Year}`}
            value={`${rangeFormatter(topRecentYearNumberOfVehicles["Vehicles Available"])} ${formatPercentage(topRecentYearNumberOfVehicles.share)}`}
          />
          <p>The Barchart here shows the Number of vehicles in each household and the percentage of Male and Female that owns them.</p>
          <BarChart config={{
            data: commuteTimeData,
            discrete: "x",
            height: 300,
            legend: false,
            groupBy: "Travel Time",
            x: "Travel Time",
            y: "share",
            time: "ID Year",
            xSort: (a, b) => a["ID Travel Time"] - b["ID Travel Time"],
            xConfig: {
              tickFormat: d => filterTimeBucket(d),
              title: "Commute Time in minutes"
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Commute time percentage"
            },
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
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

        <Treemap config={{
          data: transportationMeans,
          height: 400,
          sum: d => d["Commute Means"],
          legend: false,
          groupBy: "Transportation Means",
          time: "ID Year",
          title: "Means of Transportation",
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d["Commute Means"])]]}
        }}
        />

        {/* <Barchart config={{
          data: transportationMeans,
          discrete: "x",
          height: 300,
          // stacked: true,
          legend: false,
          groupBy: "Transportation Means",
          x: d => d["Transportation Means"],
          y: "Commute Means",
          time: "ID Year",
          xSort: (a, b) => a["ID Transportation Means"] - b["ID Transportation Means"],
          xConfig: {
            labelRotation: false,
            tickFormat: d => rangeFormatter(d),
            title: "Means of transport"
          },
          yConfig: {tickFormat: d => formatPercentage(d)},
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d["Commute Means"])]]}
        }}
        /> */}
      </SectionColumns>
    );
  }
}

Transportation.defaultProps = {
  slug: "transportation"
};

Transportation.need = [
  fetchData("commuteTimeData", "https://gila-cliff.datausa.io/api/data?measures=Commute%20Time&drilldowns=Travel%20Time&County=<id>&Year=all", d => d.data),
  fetchData("numberOfVehiclesData", "https://gila-cliff.datausa.io/api/data?measures=Commute%20Means%20by%20Gender&drilldowns=Vehicles%20Available,Sex&County=<id>&Year=all", d => d.data),
  fetchData("transportationMeans", "https://gila-cliff.datausa.io/api/data?measures=Commute%20Means&drilldowns=Transportation%20Means&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  commuteTimeData: state.data.commuteTimeData,
  numberOfVehiclesData: state.data.numberOfVehiclesData,
  transportationMeans: state.data.transportationMeans
});
  
export default connect(mapStateToProps)(Transportation);
