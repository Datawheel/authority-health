import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {sum} from "d3-array";
import {titleCase} from "d3plus-text";
import {formatAbbreviate} from "d3plus-format";
import {Geomap, Pie, Treemap} from "d3plus-react";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import growthCalculator from "utils/growthCalculator";
import zipcodes from "utils/zipcodes";
import Stat from "components/Stat";
import styles from "style.yml";

const formatRaceName = d => {
  d = d.replace("Alone", "").replace("Black", "black").replace("White", "white").replace("Asian", "asian");
  if (d.trim() === "Some Other Race") return d.toLowerCase();
  if (d.trim() === "Two or More Races") return d.toLowerCase();
  return d;
};
const formatEthnicityName = d => d.replace("Not Hispanic or Latino", "non-Hispanic").replace("or Latino", "");

const formatRankSuffix = d => {
  if (d % 10 === 1 && d !== 11) return `${d}st`;
  if (d % 10 === 2 && d !== 12) return `${d}nd`;
  if (d % 10 === 3 && d !== 13) return `${d}rd`;
  return `${d}th`;
};

const formatLevelNames = d => {
  if (d === "place") return "cities";
  if (d === "zip") return "zip codes";
  if (d === "tract") return "tracts";
  return d;
};

const formatGeomapTractLabel = (d, meta, tractToPlace) => {
  if (meta.level === "tract" || meta.level === "county") {
    const cityName = tractToPlace[d["ID Geography"]];
    return cityName === undefined ? d.Geography : `${d.Geography}, ${cityName}`;
  }
  else return `${d.Geography}, ${meta.name}`;
};

const formatGeomapZipLabel = (d, meta, zipToPlace) => {
  if (meta.level === "tract" || meta.level === "county") {
    const cityName = zipToPlace[d["ID Zip"]];
    return cityName === undefined ? d.Zip : `${d.Zip}, ${cityName}`;
  }
  else return `${d.Zip}, ${meta.name}`;
};

const formatTopojsonFilter = (d, meta, childrenTractIds) => {
  if (meta.level === "tract" || meta.level === "county") return d.id.startsWith("14000US26163");
  else return childrenTractIds.includes(d.id);
};

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

const formatRaceAndEthnicityData = data => {
  nest()
    .key(d => d.Year)
    .entries(data)
    .forEach(group => {
      const total = sum(group.values, d => d["Hispanic Population"]);
      group.values.forEach(d => total !== 0 ? d.share = d["Hispanic Population"] / total * 100 : d.share = 0);
    });
  const topRaceAndEthnicity = data.sort((a, b) => b.share - a.share);
  return [data, topRaceAndEthnicity];
};

class Introduction extends SectionColumns {

  render() {
    const {
      meta,
      population,
      populationByAgeAndGender,
      populationByRaceAndEthnicity,
      lifeExpectancy,
      topStats,
      childrenTractIds,
      childrenZipIds,
      currentLevelOverallCoverage
    } = this.props; 
    console.log("populationByRaceAndEthnicity: ", populationByRaceAndEthnicity);
    const {rankData, tractToPlace, zipToPlace} = topStats;
    const {level} = meta;

    const populationByAgeAndGenderAvailable = populationByAgeAndGender.length !== 0;
    const populationByRaceAndEthnicityAvailable = populationByRaceAndEthnicity.length !== 0;
    const lifeExpectancyAvailable = lifeExpectancy.length !== 0;

    const onCityOrZipLevel = level === "place" || level === "zip";

    const populationGrowth = formatAbbreviate(growthCalculator(population[0].Population, population[population.length - 1].Population));

    const currentLocationRankData = rankData.filter(d => d.id === meta.id)[0];

    // Get recent year male and female population data by their age.
    const recentYearPopulationByAgeAndGender = {};
    let getFemaleData, getMaleData, getTopFemaleData, getTopMaleData;
    if (populationByAgeAndGenderAvailable) {
      nest()
        .key(d => d.Year)
        .entries(populationByAgeAndGender)
        .forEach(group => {
          group.key >= populationByAgeAndGender[0].Year ? Object.assign(recentYearPopulationByAgeAndGender, group) : {};
        });
      getMaleData = recentYearPopulationByAgeAndGender.values.filter(d => d.Sex === "Male");
      getTopMaleData = getMaleData.sort((a, b) => b["Population by Sex and Age"] - a["Population by Sex and Age"])[0];
      getFemaleData = populationByAgeAndGender.filter(d => d.Sex === "Female");
      getTopFemaleData = getFemaleData.sort((a, b) => b["Population by Sex and Age"] - a["Population by Sex and Age"])[0];
    }

    // Get recent year race and ethnicity population data.
    let topRaceAndEthnicity;
    if (populationByRaceAndEthnicityAvailable) {
      topRaceAndEthnicity = formatRaceAndEthnicityData(populationByRaceAndEthnicity)[1];
    }

    const total = currentLevelOverallCoverage[0]["Population by Insurance Coverage"] + currentLevelOverallCoverage[1]["Population by Insurance Coverage"];
    const topOverallCoverage = currentLevelOverallCoverage.filter(d => d["Health Insurance Coverage Status"] === "With Health Insurance Coverage")[0];
    topOverallCoverage.share = topOverallCoverage["Population by Insurance Coverage"] / total * 100;

    // Filter zips for Geomap based on the profile you are on.
    let filteredZips = [];
    if (meta.level === "county" || meta.level === "zip") filteredZips = zipcodes;
    else childrenZipIds.forEach(d => filteredZips.push(d.substring(7, 12)));

    return (
      <SectionColumns>
        <SectionTitle>Introduction</SectionTitle>
        <article>
          <p>
            {level === "zip" ? `Zip code ${population[0].Geography}` : population[0].Geography} has a population of {formatAbbreviate(population[0].Population)} people{meta.level === "county" ? "" : <span> which makes it the {formatRankSuffix(currentLocationRankData.populationRank)} largest of {rankData.length} {formatLevelNames(meta.level)} in Wayne County</span>}
            {}, with the life expectancy of {lifeExpectancyAvailable ? formatAbbreviate(lifeExpectancy[0]["Life Expectancy"]) : "N/A"} {lifeExpectancyAvailable ? onCityOrZipLevel ? <span>(in {lifeExpectancy[0].Geography})</span> : "" : ""}.
            The most common age group for male is {populationByAgeAndGenderAvailable ? getTopMaleData.Age.toLowerCase() : "N/A"} and for female it is {populationByAgeAndGenderAvailable ? getTopFemaleData.Age.toLowerCase() : "N/A"}.
            Between {population[population.length - 1].Year} and {population[0].Year} the population of {population[0].Geography} {populationGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(population[population.length - 1].Population)} to {formatAbbreviate(population[0].Population)},
            {} {populationGrowth < 0 ? "a decline" : "an increase"} of {populationGrowth < 0 ? `${populationGrowth * -1}%` : isNaN(populationGrowth) ? "N/A" : `${populationGrowth}%`}.
          </p>
          {populationByRaceAndEthnicityAvailable
            ? <p>
              Most of the population in {topRaceAndEthnicity[0].Geography} is {formatEthnicityName(topRaceAndEthnicity[0].Ethnicity)} {}
              {formatRaceName(topRaceAndEthnicity[0].Race)} ({formatAbbreviate(topRaceAndEthnicity[0].share)}%), followed by {}
              {formatEthnicityName(topRaceAndEthnicity[1].Ethnicity)} {formatRaceName(topRaceAndEthnicity[1].Race)}
              ({formatAbbreviate(topRaceAndEthnicity[1].share)}%).
            </p>
            : null}
          <p>In {level === "zip" ? `Zip code ${currentLocationRankData.name}` : currentLocationRankData.name}, the median household income is {formatAbbreviate(currentLocationRankData.medianIncome)}{meta.level === "county" ? "." : <span>, which ranks it at {formatRankSuffix(currentLocationRankData.medianIncomeRank)} largest of all {formatLevelNames(meta.level)} in Wayne County.</span>}</p>
          <p>
            Social and economic factors, such as income, education, and access to health care, impact health outcomes for all Americans. For example, in many low income areas in the country, there are higher rates of chronic diseases, like high blood pressure and diabetes. The summary to the right highlights some of the social and health conditions for {population[0].Geography}.
          </p>
        </article>
        <div className="top-stats viz">
          <Stat
            title={"Health Insurance Coverage"}
            year={topOverallCoverage.Year}
            value={formatPercentage(topOverallCoverage.share)}
            qualifier={`of the population in ${meta.name} had coverage`}
          />

          <Treemap config={{
            data: `https://acs.datausa.io/api/data?measures=Hispanic Population&drilldowns=Race,Ethnicity&Geography=${meta.id}&Year=all`,
            height: 250, 
            sum: "Hispanic Population",
            groupBy: ["Race", "Ethnicity"],
            label: d => `${formatEthnicityName(d.Ethnicity)}, ${d.Race.replace("Alone", "")}`,
            time: "Year",
            title: d => `Population by Race and Ethnicity in ${d[0].Geography}`,
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatRaceAndEthnicityData(resp.data)[0]}
          />

          <Geomap config={{
            data: "/api/data?measures=Distress Score&drilldowns=Zip&Year=all",
            height: 250,
            groupBy: "ID Zip",
            colorScale: "Distress Score",
            colorScaleConfig: {
              // having a high distress score is bad
              color: [
                styles.success,
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
            },
            legend: false,
            label: d => formatGeomapZipLabel(d, meta, zipToPlace),
            time: "Year",
            title: `Distress Score by Zip Codes in ${meta.name}`,
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Distress Score", d => d["Distress Score"]]]},
            topojson: "/topojson/zipcodes.json",
            topojsonId: d => d.properties.ZCTA5CE10,
            topojsonFilter: d => filteredZips.includes(d.properties.ZCTA5CE10)
          }}
          dataFormat={resp => resp.data}
          />
        </div>

        <div className="top-stats viz">
          <Geomap config={{
            data: "/api/data?measures=Life Expectancy&Geography=14000US26163561300:children&Year=all",
            height: 250,
            groupBy: "ID Geography",
            colorScale: "Life Expectancy",
            legend: false,
            label: d => formatGeomapTractLabel(d, meta, tractToPlace),
            time: "End Year",
            title: `Life Expectancy by Census Tracts in ${meta.level === "county" || meta.level === "tract" ? "Wayne County" : meta.name}`,
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Life Expectancy", d => d["Life Expectancy"]]]},
            topojson: "/topojson/tract.json",
            topojsonFilter: d => formatTopojsonFilter(d, meta, childrenTractIds)
          }}
          dataFormat={resp => {
            let filteredChildrenGeography = [];
            if (meta.level === "county" || meta.level === "tract") {
              filteredChildrenGeography = resp.data;
            }
            else {
              resp.data.forEach(d => {
                if (childrenTractIds.includes(d["ID Geography"])) filteredChildrenGeography.push(d);
              });
            }
            return filteredChildrenGeography;
          }}
          />

          <Geomap config={{
            data: "/api/data?measures=Poor Mental Health 14 Or More Days&drilldowns=Zip Region&Year=all",
            height: 250,
            groupBy: "ID Zip Region",
            colorScale: "Poor Mental Health 14 Or More Days",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d, true)},
              // having high disease prevalency is bad
              color: [
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
            },
            label: d => d["Zip Region"],
            time: "End Year",
            title: "Poor Mental Health by Zip Regions in Wayne County",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Condition", "Poor Mental Health 14 Or More Days"], ["Prevalence", d => `${formatPercentage(d["Poor Mental Health 14 Or More Days"], true)}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          dataFormat={resp => resp.data}
          />

          <Geomap config={{
            data: "/api/data?measures=Poor Physical Health 14 Or More Days&drilldowns=Zip Region&Year=all",
            height: 250,
            groupBy: "ID Zip Region",
            colorScale: "Poor Physical Health 14 Or More Days",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d, true)},
              // having high disease prevalency is bad
              color: [
                styles["danger-light"],
                styles.danger,
                styles["danger-dark"]
              ]
            },
            label: d => d["Zip Region"],
            time: "End Year",
            title: "Poor Physical Health by Zip Regions in Wayne County",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Condition", "Poor Physical Health 14 Or More Days"], ["Prevalence", d => `${formatPercentage(d["Poor Physical Health 14 Or More Days"], true)}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          dataFormat={resp => resp.data}
          />
        </div>
      </SectionColumns>
    );
  }
}

Introduction.defaultProps = {
  slug: "introduction"
};

const mapStateToProps = state => ({
  meta: state.data.meta,
  childrenTractIds: state.data.childrenTractIds,
  childrenZipIds: state.data.childrenZipIds,
  population: state.data.population.data,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  populationByRaceAndEthnicity: state.data.populationByRaceAndEthnicity.data,
  lifeExpectancy: state.data.lifeExpectancy,
  topStats: state.data.topStats,
  currentLevelOverallCoverage: state.data.currentLevelOverallCoverage
});

export default connect(mapStateToProps)(Introduction);
