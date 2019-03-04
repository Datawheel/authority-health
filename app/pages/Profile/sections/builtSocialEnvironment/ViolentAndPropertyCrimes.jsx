import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";
const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatCrimeData = crimeData => {
  // Find the percentage for each type of crime and add "share" property to each data point.
  nest()
    .key(d => d.Year)
    .entries(crimeData)
    .forEach(group => {
      const total = sum(group.values, d => d["Number of Crimes"]);
      group.values.forEach(d => d.share = d["Number of Crimes"] / total * 100);
    });
  return crimeData;
};

class ViolentAndPropertyCrimes extends SectionColumns {

  render() {
    const {meta, crimeDataOverall, crimeDataForPlace} = this.props;

    const isPlaceDataAvailable = meta.level === "place";
    const crimeData = isPlaceDataAvailable ? crimeDataForPlace : crimeDataOverall;

    // Seperate property crime and violent crime data from crime data array.
    const propertyCrime = [], violentCrime = [];
    formatCrimeData(crimeData).forEach(d => d["Type of Crime"] === "Violent crime" ? violentCrime.push(d) : propertyCrime.push(d));

    // Get data for Property crime stats.
    const topRecentYearPropertyCrime = propertyCrime.sort((a, b) => b.share - a.share)[0];

    // Get data for Violent crime stats.
    const topRecentYearViolentCrime = violentCrime.sort((a, b) => b.share - a.share)[0];

    return (
      <SectionColumns>
        <SectionTitle>Violent and Property Crimes</SectionTitle>
        <article>
          {isPlaceDataAvailable ? <div></div> : <div className="disclaimer">Data only available for cities. Showing data for overall cities in Wayne County.</div>}
          {/* Show stats and short paragraph for each type of crime based on the dropdown value. */}
          <Stat
            title= {isPlaceDataAvailable ? "Violent Crime" : "Most common Violent Crime"}
            year={topRecentYearViolentCrime.Year}
            value={titleCase(topRecentYearViolentCrime.Crime)}
            qualifier={formatPercentage(topRecentYearViolentCrime.share)}
          />
          <Stat
            title="Most common Property Crime"
            year={topRecentYearPropertyCrime.Year}
            value={titleCase(topRecentYearPropertyCrime.Crime)}
            qualifier={formatPercentage(topRecentYearPropertyCrime.share)}
          />
          <p>In {topRecentYearViolentCrime.Year}, the most common violent crime{isPlaceDataAvailable ? ` in ${topRecentYearViolentCrime.Geography}` : ""} was {topRecentYearViolentCrime.Crime.toLowerCase()} ({formatPercentage(topRecentYearViolentCrime.share)}), and the most common property crime was {topRecentYearPropertyCrime.Crime.toLowerCase()} ({formatPercentage(topRecentYearPropertyCrime.share)}).</p>
          <p>The following chart shows the distribution for the different types of property and violent crimes{isPlaceDataAvailable ? ` in ${topRecentYearViolentCrime.Geography}` : ""}.</p>
          <Contact slug={this.props.slug} />
        </article>

        {/* Draw a Barchart for each type of crime. */}
        <BarChart config={{
          data: isPlaceDataAvailable ? `/api/data?measures=Number of Crimes&drilldowns=Type of Crime,Crime&Geography=${meta.id}&Year=all` : "/api/data?measures=Number of Crimes&drilldowns=Type of Crime,Crime&Year=all",
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: d => `${d["Type of Crime"]}: ${d.Crime}`,
          x: "Crime",
          y: "share",
          time: "Year",
          xConfig: {
            tickFormat: d => titleCase(d),
            labelRotation: false
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Crime Rate"
          },
          xSort: (a, b) => a.share - b.share,
          shapeConfig: {
            label: false
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [isPlaceDataAvailable ? "Place" : "County", d => isPlaceDataAvailable ? d.Geography : "Wayne County"]]}
        }}
        dataFormat={resp => formatCrimeData(resp.data)
        }
        />
      </SectionColumns>
    );
  }
}

ViolentAndPropertyCrimes.defaultProps = {
  slug: "violent-and-property-crimes"
};

ViolentAndPropertyCrimes.need = [
  fetchData("crimeDataOverall", "/api/data?measures=Number of Crimes&drilldowns=Type of Crime,Crime&Year=latest", d => d.data),
  fetchData("crimeDataForPlace", "/api/data?measures=Number of Crimes&drilldowns=Type of Crime,Crime&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  crimeDataOverall: state.data.crimeDataOverall,
  crimeDataForPlace: state.data.crimeDataForPlace
});

export default connect(mapStateToProps)(ViolentAndPropertyCrimes);
