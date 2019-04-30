import React from "react";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {connect} from "react-redux";
import {BarChart, Treemap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPercentage = d => `${formatAbbreviate(d)}%`;
const formatMinutes = d => d.replace("Minutes", "minute");

const formatCommuteTimeData = commuteTimeData => {
  nest()
    .key(d => d.Year)
    .entries(commuteTimeData)
    .forEach(group => {
      const total = sum(group.values, d => d["Commuter Population"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Commuter Population"] / total * 100 : d.share = 0);
    });
  const topRecentYearCommuteTime = commuteTimeData.sort((a, b) => b.share - a.share)[0];
  return [commuteTimeData, topRecentYearCommuteTime];
};

const formatTransportationMeans = transportationMeans => {
  nest()
    .key(d => d.Year)
    .entries(transportationMeans)
    .forEach(group => {
      const total = sum(group.values, d => d["Commute Means"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Commute Means"] / total * 100 : d.share = 0);
    });
  const topRecentYearModeOfTransport = transportationMeans.sort((a, b) => b.share - a.share)[0];
  return [transportationMeans, topRecentYearModeOfTransport];
};

class Transportation extends SectionColumns {
  constructor(props) {
    super(props);
    this.state = {sources: []};
  }

  render() {

    const {meta, commuteTimeData, numberOfVehiclesData, transportationMeans} = this.props;

    const commuteTimeDataAvailable = commuteTimeData.length !== 0;
    const numberOfVehiclesDataAvailable = numberOfVehiclesData.length !== 0;
    const transportationMeansAvailable = transportationMeans.length !== 0;

    // Get data for number of vehicles.
    let averageVehiclesPerHousehold, topAverageVehiclesPerHousehold;
    if (numberOfVehiclesDataAvailable) {
      nest()
        .key(d => d.Year)
        .entries(numberOfVehiclesData)
        .forEach(group => {
          const total = sum(group.values, d => d["Commute Means by Gender"]);
          group.values.forEach(d => total !== 0 ? d.averageShare = d["Commute Means by Gender"] / total * 100 : d.averageShare = 0);
        });
      averageVehiclesPerHousehold = numberOfVehiclesData.sort((a, b) => b.averageShare - a.averageShare);
      topAverageVehiclesPerHousehold = averageVehiclesPerHousehold[0].averageShare + averageVehiclesPerHousehold[1].averageShare;
    }

    // Get data for commute time.
    let topRecentYearCommuteTime;
    if (commuteTimeDataAvailable) {
      topRecentYearCommuteTime = formatCommuteTimeData(commuteTimeData)[1];
    }

    // Get data for Mode of transport.
    let topRecentYearModeOfTransport;
    if (transportationMeansAvailable) {
      topRecentYearModeOfTransport = formatTransportationMeans(transportationMeans)[1];
    }

    return (
      <SectionColumns>
        <SectionTitle>Transportation</SectionTitle>
        <article>
          <Stat
            title="Most common commute time"
            year={commuteTimeDataAvailable ? topRecentYearCommuteTime.Year : ""}
            value={commuteTimeDataAvailable ? topRecentYearCommuteTime["Travel Time"] : "N/A"}
            qualifier={commuteTimeDataAvailable ? `(${formatPercentage(topRecentYearCommuteTime.share)})` : ""}
          />
          <Stat
            title="Most common means of transportation"
            year={transportationMeansAvailable ? topRecentYearModeOfTransport.Year : ""}
            value={transportationMeansAvailable ? topRecentYearModeOfTransport["Transportation Means"] : "N/A"}
            qualifier={transportationMeansAvailable ? `(${formatPercentage(topRecentYearModeOfTransport.share)})` : ""}
          />
          <Stat
            title="Average vehicles per household"
            year={numberOfVehiclesDataAvailable ? averageVehiclesPerHousehold[0].Year : ""}
            value={numberOfVehiclesDataAvailable ? rangeFormatter(averageVehiclesPerHousehold[0]["Vehicles Available"]) : "N/A"}
            qualifier={numberOfVehiclesDataAvailable ? `(${formatPercentage(topAverageVehiclesPerHousehold)})` : ""}
          />
          <p>
            {commuteTimeDataAvailable ? <span>As of {topRecentYearCommuteTime.Year}, most of the workforce living in {topRecentYearCommuteTime.Geography} has a {formatMinutes(topRecentYearCommuteTime["Travel Time"])} commute ({formatPercentage(topRecentYearCommuteTime.share)}). </span> : ""}
            {transportationMeansAvailable ? <span>The majority of commuters {topRecentYearModeOfTransport["Transportation Means"].toLowerCase()} to work ({formatPercentage(topRecentYearModeOfTransport.share)}).</span> : ""}
          </p>

          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />

          <div className="viz">
            {numberOfVehiclesDataAvailable &&
          <Options
            component={this}
            componentKey="viz1"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `https://acs.datausa.io/api/data?measures=Commute Means by Gender&drilldowns=Vehicles Available,Gender&Geography=${meta.id}&Year=all` }
            title="Chart of Access to Car by Gender" />
            }

            {/* Draw a Barchart for Number of vehicles in each household. */}
            {numberOfVehiclesDataAvailable &&
            <BarChart ref={comp => this.viz1 = comp } config={{
              data: `https://acs.datausa.io/api/data?measures=Commute Means by Gender&drilldowns=Vehicles Available,Gender&Geography=${meta.id}&Year=all`,
              discrete: "x",
              height: 300,
              groupBy: "Gender",
              x: d => d["Vehicles Available"],
              y: "share",
              time: "Year",
              title: d => `Access to Cars by Gender in ${d[0].Geography}`,
              xSort: (a, b) => a["ID Vehicles Available"] - b["ID Vehicles Available"],
              xConfig: {
                labelRotation: false,
                tickFormat: d => rangeFormatter(d)
              },
              yConfig: {
                tickFormat: d => formatPercentage(d),
                title: "Share"
              },
              shapeConfig: {
                label: false
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Number of Vehicles", d => rangeFormatter(d["Vehicles Available"])], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              // find share of each gender for each number of vehicles per household.
              nest()
                .key(d => d.Year)
                .entries(resp.data)
                .forEach(group => {
                  nest()
                    .key(d => d["ID Vehicles Available"])
                    .entries(group.values)
                    .forEach(numOfVehicles => {
                      const total = sum(numOfVehicles.values, d => d["Commute Means by Gender"]);
                      numOfVehicles.values.forEach(d => total !== 0 ? d.share = d["Commute Means by Gender"] / total * 100 : d.share = 0);
                    });
                });
              return  resp.data;
            }}
            />
            }
          </div>
        </article>

        <div className="viz u-text-right">
          {commuteTimeDataAvailable &&
          <Options
            component={this}
            componentKey="viz2"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `https://acs.datausa.io/api/data?measures=Commuter Population&drilldowns=Travel Time&Geography=${meta.id}&Year=all` }
            title="Chart of Distribution of Commute Time" />
          }
          {/* Draw a Barchart for commute time. */}
          {commuteTimeDataAvailable
            ? <BarChart ref={comp => this.viz2 = comp} config={{
              data: `https://acs.datausa.io/api/data?measures=Commuter Population&drilldowns=Travel Time&Geography=${meta.id}&Year=all`,
              discrete: "x",
              height: 300,
              legend: false,
              groupBy: "Travel Time",
              x: "Travel Time",
              y: "share",
              time: "Year",
              title: d => `Distribution of Commute Time in ${d[0].Geography}`,
              xSort: (a, b) => a["ID Travel Time"] - b["ID Travel Time"],
              xConfig: {
                tickFormat: d => d.replace("Minutes", "").trim(),
                title: "Commute Time in Minutes"
              },
              yConfig: {
                tickFormat: d => formatPercentage(d),
                title: "Share"
              },
              shapeConfig: {
                label: false
              },
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatCommuteTimeData(resp.data)[0];
            }}
            /> : null}

          {transportationMeansAvailable &&
              <Options
                component={this}
                componentKey="viz3"
                dataFormat={resp => resp.data}
                slug={this.props.slug}
                data={ `https://acs.datausa.io/api/data?measures=Commute Means&drilldowns=Transportation Means&Geography=${meta.id}&Year=all` }
                title="Chart of Means of Transportation" />
          }
          {/* Draw a Treemap for Modes of tranportation. */}
          {transportationMeansAvailable
            ? <Treemap ref={comp => this.viz3 = comp} config={{
              data: `https://acs.datausa.io/api/data?measures=Commute Means&drilldowns=Transportation Means&Geography=${meta.id}&Year=all`,
              height: 300,
              sum: d => d["Commute Means"],
              legend: false,
              groupBy: "Transportation Means",
              time: "Year",
              title: d => `Means of Transportation in ${d[0].Geography}`,
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return formatTransportationMeans(resp.data)[0];
            }}
            /> : null}
        </div>

      </SectionColumns>
    );
  }
}

Transportation.defaultProps = {
  slug: "transportation"
};

Transportation.need = [
  fetchData("commuteTimeData", "https://acs.datausa.io/api/data?measures=Commuter Population&drilldowns=Travel Time&Geography=<id>&Year=latest", d => d.data),
  fetchData("numberOfVehiclesData", "https://acs.datausa.io/api/data?measures=Commute Means by Gender&drilldowns=Vehicles Available,Gender&Geography=<id>&Year=latest", d => d.data),
  fetchData("transportationMeans", "https://acs.datausa.io/api/data?measures=Commute Means&drilldowns=Transportation Means&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  commuteTimeData: state.data.commuteTimeData,
  numberOfVehiclesData: state.data.numberOfVehiclesData,
  transportationMeans: state.data.transportationMeans
});

export default connect(mapStateToProps)(Transportation);
