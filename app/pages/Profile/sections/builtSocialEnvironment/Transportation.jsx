import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const filterTimeBucket = d => d.split(" ").filter(d => d !== "Minutes").join("");

class Transportation extends SectionColumns {

  render() {

    const {commuteTimeData, numberOfVehiclesData, transportationMeans} = this.props;

    // Get data for Number of vehicles.
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
    const topAverageVehiclesPerHousehold = recentYearNumberOfVehicles.values[0].share + recentYearNumberOfVehicles.values[1].share;

    // Get data for commute time.
    const recentYearCommuteTime = {};
    nest()
      .key(d => d.Year)
      .entries(commuteTimeData)
      .forEach(group => {
        const total = sum(group.values, d => d["Commuter Population"]);
        group.values.forEach(d => d.share = d["Commuter Population"] / total * 100);
        group.key >= commuteTimeData[0].Year ? Object.assign(recentYearCommuteTime, group) : {};
      });
    recentYearCommuteTime.values.sort((a, b) => b.share - a.share);
    const topRecentYearCommuteTime = recentYearCommuteTime.values[0];

    // Get data for Mode of transport.
    const recentYearModeOfTransport = {};
    nest()
      .key(d => d.Year)
      .entries(transportationMeans)
      .forEach(group => {
        const total = sum(group.values, d => d["Commute Means"]);
        group.values.forEach(d => d.share = d["Commute Means"] / total * 100);
        group.key >= transportationMeans[0].Year ? Object.assign(recentYearModeOfTransport, group) : {};
      });
    recentYearModeOfTransport.values.sort((a, b) => b.share - a.share);
    const topRecentYearModeOfTransport = recentYearModeOfTransport.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Transportation</SectionTitle>
        <article>
          <Stat
            title="Most common commute"
            year={topRecentYearCommuteTime.Year}
            value={topRecentYearCommuteTime["Travel Time"]}
            qualifier={formatPercentage(topRecentYearCommuteTime.share)}
          />
          <Stat
            title="Most common means of transportation"
            year={topRecentYearModeOfTransport.Year}
            value={topRecentYearModeOfTransport["Transportation Means"]}
            qualifier={formatPercentage(topRecentYearModeOfTransport.share)}
          />
          <Stat
            title="Average vehicles per household"
            year={topRecentYearNumberOfVehicles.Year}
            value={rangeFormatter(topRecentYearNumberOfVehicles["Vehicles Available"])}
            qualifier={formatPercentage(topAverageVehiclesPerHousehold)}
          />
          <p>As of {topRecentYearCommuteTime.Year}, most of the workforce living in {topRecentYearCommuteTime.Geography} has a {topRecentYearCommuteTime["Travel Time"].toLowerCase()} commute ({formatPercentage(topRecentYearCommuteTime.share)}). The majority of commuters {topRecentYearModeOfTransport["Transportation Means"].toLowerCase()} to work ({formatPercentage(topRecentYearModeOfTransport.share)}).</p>
          <p>The following charts show the distribution of commute times, access to cars by gender, and share of commute means.</p>

          {/* Draw a Barchart for Number of vehicles in each household. */}
          <BarChart config={{
            data: numberOfVehiclesData,
            discrete: "x",
            height: 300,
            groupBy: "Gender",
            x: d => d["Vehicles Available"],
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Vehicles Available"] - b["ID Vehicles Available"],
            xConfig: {
              labelRotation: false,
              tickFormat: d => rangeFormatter(d),
              title: "Number of Vehicles"
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Number of Vehicles", d => rangeFormatter(d["Vehicles Available"])], ["Share", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        {/* Draw a Barchart for commute time. */}
        <BarChart config={{
          data: commuteTimeData,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Travel Time",
          x: "Travel Time",
          y: "share",
          time: "Year",
          xSort: (a, b) => a["ID Travel Time"] - b["ID Travel Time"],
          xConfig: {
            tickFormat: d => filterTimeBucket(d),
            title: "Commute Time in Minutes"
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Share"
          },
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]}
        }}
        />

        {/* Draw a Treemap for Modes of tranportation. */}
        <Treemap config={{
          data: transportationMeans,
          height: 400,
          sum: d => d["Commute Means"],
          legend: false,
          groupBy: "Transportation Means",
          time: "Year",
          title: "Means of Transportation",
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)]]}
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
  fetchData("commuteTimeData", "https://olympic.datausa.io/api/data?measures=Commuter Population&drilldowns=Travel Time&Geography=<id>&Year=all", d => d.data),
  fetchData("numberOfVehiclesData", "https://olympic.datausa.io/api/data?measures=Commute Means by Gender&drilldowns=Vehicles Available,Gender&Geography=<id>&Year=all", d => d.data),
  fetchData("transportationMeans", "https://olympic.datausa.io/api/data?measures=Commute Means&drilldowns=Transportation Means&Geography=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  commuteTimeData: state.data.commuteTimeData,
  numberOfVehiclesData: state.data.numberOfVehiclesData,
  transportationMeans: state.data.transportationMeans
});

export default connect(mapStateToProps)(Transportation);
