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
    const isUnemploymentRateAvailableForCurrentLocation = unemploymentRate.source[0].substitutions.length === 0;

    // Find full-time work share for male and female population.
    const filteredWorkExperienceData = workExperience.filter(d => d["Work Experience"] === "Worked Full Time, Year-round");
    nest()
      .key(d => d.Year)
      .entries(filteredWorkExperienceData)
      .forEach(group => {
        const total = sum(group.values, d => d["Poverty by Work Experience"]);
        group.values.forEach(d => d.share = d["Poverty by Work Experience"] / total * 100);
      });
    const getMaleFullTimeData = filteredWorkExperienceData.filter(d => d.Sex === "Male");
    const getFemaleFullTimeData = filteredWorkExperienceData.filter(d => d.Sex === "Female");

    // Find share for employmentStatus.
    const unemployedData = employmentStatus.filter(d => d["Employment Status"] === "Unemployed");
    const recentYearUnemploymentData = {};
    nest()
      .key(d => d.Year)
      .entries(unemployedData)
      .forEach(group => {
        const total = sum(group.values, d => d["Population by Employment Status"]);
        group.values.forEach(d => d.share = d["Population by Employment Status"] / total * 100);
        group.key >= unemployedData[0].Year ? Object.assign(recentYearUnemploymentData, group) : {};
      });
    const getMaleUnemploymemtData = recentYearUnemploymentData.values.filter(d => d.Sex === "Male");
    const getTopMaleUnemploymemtData = getMaleUnemploymemtData.sort((a, b) => b.share - a.share)[0];
    const getFemaleUnemploymemtData = recentYearUnemploymentData.values.filter(d => d.Sex === "Female");
    const getTopFemaleUnemploymemtData = getFemaleUnemploymemtData.sort((a, b) => b.share - a.share)[0];

    const recentYearUnemploymentRate = {};
    nest()
      .key(d => d.Year)
      .entries(unemploymentRate.data)
      .forEach(group => {
        group.key >= unemploymentRate.data[0].Year ? Object.assign(recentYearUnemploymentRate, group) : {};
      });
    
    return (
      <SectionColumns>
        <SectionTitle>Unemployment</SectionTitle>
        <article>
          {isUnemploymentRateAvailableForCurrentLocation ? <div></div> : <div className="disclaimer">Showing unemployment rate data for {unemploymentRate.data[0].Geography}.</div>}
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

          <p>
            In {getMaleFullTimeData[0].Year}, the percentage of the working population in {getMaleFullTimeData[0].Geography} that worked full-time for men and women was {formatPercentage(getMaleFullTimeData[0].share)} and {formatPercentage(getFemaleFullTimeData[0].share)}, respectively.
            The most common unemployed age group for men was {getTopMaleUnemploymemtData.Age.toLowerCase()} ({formatPercentage(getTopMaleUnemploymemtData.share)}), and the most common female unemployed age group for women was {getTopFemaleUnemploymemtData.Age.toLowerCase()} ({formatPercentage(getTopFemaleUnemploymemtData.share)}).  
            In {recentYearUnemploymentRate.values[0].Year}, the overall unemploymemt rate in {recentYearUnemploymentRate.values[0].Geography} was {formatPercentage(recentYearUnemploymentRate.values[0]["Unemployment Rate"])}.
          </p>
          <p>The following charts show the unemployment rate over time both overall and by age and gender.</p>
          
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
              tickFormat: d => rangeFormatter(d)
            },
            yConfig: {
              tickFormat: d => formatPercentage(d),
              title: "Share"
            },
            shapeConfig: {
              label: false
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => rangeFormatter(d.Age)], ["Share", d => formatPercentage(d.share)], ["Location", d => d.Geography]]}
          }}
          />
        </article>

        {/* Lineplot to show total population over the years for selected geography. */}
        <LinePlot config={{
          data: unemploymentRate.data,
          discrete: "x",
          height: 300,
          baseline: 0,
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
  fetchData("unemploymentRate", "/api/data?measures=Unemployment Rate&Geography=<id>&Year=all"),
  fetchData("employmentStatus", "/api/data?measures=Population by Employment Status&drilldowns=Employment Status,Age,Sex&Geography=<id>&Year=all", d => d.data),
  fetchData("workExperience", "/api/data?measures=Poverty by Work Experience&drilldowns=Work Experience,Sex&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  unemploymentRate: state.data.unemploymentRate,
  employmentStatus: state.data.employmentStatus,
  workExperience: state.data.workExperience
});

export default connect(mapStateToProps)(Unemployment);
