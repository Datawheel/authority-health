import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Dentists extends SectionColumns {

  render() {

    const {dentistsByAge} = this.props;
    console.log("dentistsByAge: ", dentistsByAge);

    const recentYearDentistsByAgeData = {};
    nest()
      .key(d => d.Year)
      .entries(dentistsByAge)
      .forEach(group => {
        const total = sum(group.values, d => d["Number of Dentists"]);
        group.values.forEach(d => d.share = d["Number of Dentists"] / total * 100);
        group.key >= dentistsByAge[0].Year ? Object.assign(recentYearDentistsByAgeData, group) : {};
      });

    recentYearDentistsByAgeData.values.sort((a, b) => b.share - a.share);
    const topDentistsAgeData = recentYearDentistsByAgeData.values[0];

    return (
      <SectionColumns>
        <SectionTitle>Dentists</SectionTitle>
        <article>
          <Stat 
            title={`Majority Age group in ${topDentistsAgeData.Year}`}
            value={`${topDentistsAgeData["Age Group"]} ${formatPercentage(topDentistsAgeData.share)}`}
          />
        </article>

        {/* Draw a BarChart to show data for health center data by race */}
        <BarChart config={{
          data: dentistsByAge,
          discrete: "x",
          height: 400,
          legend: false,
          groupBy: "Age Group",
          x: "Age Group",
          y: "share",
          time: "ID Year",
          xSort: (a, b) => a["ID Age Group"] - b["ID Age Group"],
          xConfig: {
            tickFormat: d => rangeFormatter(d) === "None" ? "Unknown Age" : rangeFormatter(d),
            labelRotation: false,
            title: "Age Group"
          },
          yConfig: {
            ticks: [],
            title: "Number of Dentists"
          },
          shapeConfig: {label: false},
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Dentists.defaultProps = {
  slug: "dentists"
};

Dentists.need = [
  fetchData("dentistsByAge", "/api/data?measures=Number%20of%20Dentists&drilldowns=Age%20Group&County=<id>&Year=all", d => d.data)
];

const mapStateToProps = state => ({
  dentistsByAge: state.data.dentistsByAge
});

export default connect(mapStateToProps)(Dentists);

