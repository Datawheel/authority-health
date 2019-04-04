import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import rangeFormatter from "utils/rangeFormatter";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatEmploymentStatusData = employmentStatus => {
  // Find share only for unemployed age and gender data.
  const unemployedData = employmentStatus.filter(d => d["Employment Status"] === "Unemployed");
  nest()
    .key(d => d.Year)
    .entries(unemployedData)
    .forEach(group => {
      const total = sum(group.values, d => d["Population by Employment Status"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Population by Employment Status"] / total * 100 : d.share = 0);
    });
  const getMaleUnemploymemtData = unemployedData.filter(d => d.Sex === "Male");
  const getTopMaleUnemploymemtData = getMaleUnemploymemtData.sort((a, b) => b.share - a.share)[0];
  const getFemaleUnemploymemtData = unemployedData.filter(d => d.Sex === "Female");
  const getTopFemaleUnemploymemtData = getFemaleUnemploymemtData.sort((a, b) => b.share - a.share)[0];

  return [unemployedData, getTopMaleUnemploymemtData, getTopFemaleUnemploymemtData];
};

class Unemployment extends SectionColumns {

  render() {

    const {meta, employmentStatus, workExperience, unemploymentRate} = this.props;

    const employmentStatusAvailable = employmentStatus.length !== 0;
    const workExperienceAvailable = workExperience.length !== 0;
    const isUnemploymentRateAvailableForCurrentLocation = unemploymentRate.source[0].substitutions.length === 0;

    // Find full-time work share for male and female population.
    let getFemaleFullTimeData, getMaleFullTimeData;
    if (workExperienceAvailable) {
      const filteredWorkExperienceData = workExperience.filter(d => d["Work Experience"] === "Worked Full Time, Year-round");
      nest()
        .key(d => d.Year)
        .entries(filteredWorkExperienceData)
        .forEach(group => {
          const total = sum(group.values, d => d["Poverty by Work Experience"]);
          group.values.forEach(d => total !== 0 ? d.share = d["Poverty by Work Experience"] / total * 100 : d.share = 0);
        });
      getMaleFullTimeData = filteredWorkExperienceData.filter(d => d.Sex === "Male");
      getFemaleFullTimeData = filteredWorkExperienceData.filter(d => d.Sex === "Female");
    }

    // Find share for employmentStatus.
    let getTopFemaleUnemploymemtData, getTopMaleUnemploymemtData;
    if (employmentStatusAvailable) {
      const unemploymentData = formatEmploymentStatusData(employmentStatus);
      getTopMaleUnemploymemtData = unemploymentData[1];
      getTopFemaleUnemploymemtData = unemploymentData[2];
    }

    const recentYearUnemploymentRate = unemploymentRate.data[0];

    return (
      <SectionColumns>
        <SectionTitle>Unemployment</SectionTitle>
        <article>
          {isUnemploymentRateAvailableForCurrentLocation ? <div></div> : <Disclaimer>unemployment rate data is shown for {unemploymentRate.data[0].Geography}</Disclaimer>}
          <Stat
            title="Male Working Full Time"
            year={workExperienceAvailable ? getMaleFullTimeData[0].Year : ""}
            value={workExperienceAvailable ? formatPercentage(getMaleFullTimeData[0].share) : "N/A"}
            qualifier={workExperienceAvailable ? `of the full-time working population in ${getMaleFullTimeData[0].Geography}` : ""}
          />
          <Stat
            title="Female Working Full Time"
            year={workExperienceAvailable ? getFemaleFullTimeData[0].Year : ""}
            value={workExperienceAvailable ? formatPercentage(getFemaleFullTimeData[0].share) : "N/A"}
            qualifier={workExperienceAvailable ? `of the full-time working population in ${getFemaleFullTimeData[0].Geography}` : ""}
          />
          <p>
            {workExperienceAvailable ? <span>In {getMaleFullTimeData[0].Year}, the percentage of the working population in {getMaleFullTimeData[0].Geography} that worked full-time was {formatPercentage(getMaleFullTimeData[0].share)} for men and {formatPercentage(getFemaleFullTimeData[0].share)} for women.</span> : ""}
            {employmentStatusAvailable ? <span> The most common unemployed age group for men was {getTopMaleUnemploymemtData.Age.toLowerCase()} ({formatPercentage(getTopMaleUnemploymemtData.share)}), and the most common female unemployed age group for women was {getTopFemaleUnemploymemtData.Age.toLowerCase()} ({formatPercentage(getTopFemaleUnemploymemtData.share)}).</span> : ""}
            {} In {recentYearUnemploymentRate.Year}, the overall unemploymemt rate in {recentYearUnemploymentRate.Geography} was {formatPercentage(recentYearUnemploymentRate["Unemployment Rate"])}.
          </p>

          {/* Barchart to show population by age and gender over the years for selected geography. */}
          {workExperienceAvailable
            ? <BarChart config={{
              data: `/api/data?measures=Population by Employment Status&drilldowns=Employment Status,Age,Sex&Geography=${meta.id}&Year=all`,
              discrete: "x",
              height: 250,
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
              title: d => `Unemployment by Age and Gender in ${d[0].Geography}`,
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Age", d => rangeFormatter(d.Age)], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
            }}
            dataFormat={resp => formatEmploymentStatusData(resp.data)[0]}
            /> : <div></div>}
          <Contact slug={this.props.slug} />
        </article>

        {/* Lineplot to show total population over the years for selected geography. */}
        <LinePlot config={{
          data: `/api/data?measures=Unemployment Rate&Geography=${meta.id}&Year=all`,
          discrete: "x",
          baseline: 0,
          legend: false,
          groupBy: "Geography",
          x: "Year",
          y: "Unemployment Rate",
          title: d => `Unemployment Over Time in ${d[0].Geography}`,
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Unemployment Rate"
          },
          tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d["Unemployment Rate"])]]}
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

Unemployment.defaultProps = {
  slug: "unemployment"
};

Unemployment.need = [
  fetchData("unemploymentRate", "/api/data?measures=Unemployment Rate&Geography=<id>&Year=latest"), // only county level data available.
  fetchData("employmentStatus", "/api/data?measures=Population by Employment Status&drilldowns=Employment Status,Age,Sex&Geography=<id>&Year=latest", d => d.data),
  fetchData("workExperience", "/api/data?measures=Poverty by Work Experience&drilldowns=Work Experience,Sex&Geography=<id>&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  unemploymentRate: state.data.unemploymentRate,
  employmentStatus: state.data.employmentStatus,
  workExperience: state.data.workExperience
});

export default connect(mapStateToProps)(Unemployment);
