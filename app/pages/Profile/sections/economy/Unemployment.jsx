import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../../../components/Stat";
import rangeFormatter from "../../../../utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Unemployment extends SectionColumns {

  render() {

    const {employmentStatus, workExperience, unemploymentRate} = this.props;
    // console.log("employmentStatus: ", employmentStatus);
    console.log("workExperience: ", workExperience);

    // Find share for work experience.
    const filteredWorkExperienceData = workExperience.filter(d => d["Work Experience"] !== "Did Not Work");
    // const recentYear
    nest()
      .key(d => d.Year)
      .entries(filteredWorkExperienceData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });
    console.log("filteredWorkExperienceData: ", filteredWorkExperienceData);
    const getMaleFullTimeData = filteredWorkExperienceData.filter(d => d.Sex === "Male" && d["ID Work Experience"] === 0);
    console.log("getMaleFullTimeData", getMaleFullTimeData);
    const getFemaleFullTimeData = filteredWorkExperienceData.filter(d => d.Sex === "Female" && d["ID Work Experience"] === 0);

    // Find share for employmentStatus.
    const unemployedData = employmentStatus.filter(d => d["Employment Status"] === "Unemployed");
    nest()
      .key(d => d.Year)
      .entries(unemployedData)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
      });
    
    return (
      <SectionColumns>
        <SectionTitle>Unemployment</SectionTitle>
        <article>
          <Stat
            title="Male Working Full Time"
            year={getMaleFullTimeData[0].Year}
            value={formatPercentage(getMaleFullTimeData[0].share)}
          />

          <Stat
            title="Female Working Full Time"
            year={getFemaleFullTimeData[0].Year}
            value={formatPercentage(getFemaleFullTimeData[0].share)}
          />
          
          {/* Barchart to show population by age and gender over the years for selected geography. */}
          <BarChart config={{
            data: unemployedData,
            discrete: "x",
            height: 300,
            groupBy: ["Employment Status", "Sex"],
            x: "Age",
            y: "share",
            time: "Year",
            xSort: (a, b) => a["ID Age"] - b["ID Age"],
            xConfig: {
              tickFormat: d => rangeFormatter(d),
              title: "Unemployment Rate by Age and Gender"
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => rangeFormatter(d.Age)], ["Share", d => formatPercentage(d.share)]]}
          }}
          />
        </article>

        {/* Lineplot to show total population over the years for selected geography. */}
        <LinePlot config={{
          data: unemploymentRate,
          discrete: "x",
          height: 300,
          baseline: 0,
          title: "Unemplyment Rate Over Years",
          legend: false,
          groupBy: "Geography",
          x: "Year",
          y: "Unemployment Rate",
          yConfig: {tickFormat: d => formatPercentage(d)},
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d["Unemployment Rate"])]]}
        }}
        />
      </SectionColumns>
    );
  }
}

Unemployment.defaultProps = {
  slug: "unemployment"
};

Unemployment.need = [
  fetchData("unemploymentRate", "/api/data?measures=Unemployment Rate&Geography=<id>&Year=all", d => d.data),
  fetchData("employmentStatus", "/api/data?measures=Population&drilldowns=Employment Status,Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("workExperience", "/api/data?measures=Population&drilldowns=Work Experience,Sex&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  unemploymentRate: state.data.unemploymentRate,
  employmentStatus: state.data.employmentStatus,
  workExperience: state.data.workExperience
});

export default connect(mapStateToProps)(Unemployment);
