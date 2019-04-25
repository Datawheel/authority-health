import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {sum} from "d3-array";
import {titleCase} from "d3plus-text";
import {formatAbbreviate} from "d3plus-format";
import {Geomap, Treemap} from "d3plus-react";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";
import growthCalculator from "utils/growthCalculator";
import Glossary from "components/Glossary";
import zipcodes from "utils/zipcodes";
import Stat from "components/Stat";
import styles from "style.yml";

import "./Introduction.css";

const definitions = [
  {term: "The Distressed Communities Index (DCI) combines seven complementary economic indicators into a single holistic and comparative measure of community well-being. The seven component metrics of the DCI are", definition: ""},
  {term: "1. No high school diploma", definition: "Percent of the 25+ population without a high school diploma or equivalent."},
  {term: "2. Housing vacancy rate", definition: "Percent of habitable housing that is unoccupied, excluding properties that are for seasonal, recreational, or occasional use."},
  {term: "3. Adults not working", definition: "Percent of the prime-age population (25-64) not currently in work."},
  {term: "4. Poverty rate", definition: "Percent of the population living under the poverty line."},
  {term: "5. Median income ratio", definition: "Median household income as a percent of the state’s median household income (to account for cost of living differences across states)."},
  {term: "6. Change in employment", definition: "Percent change in the number of jobs."},
  {term: "7. Change in establishments", definition: "Percent change in the number of business establishments."}
];

const formatRaceName = d => {
  d = d.replace("Alone", "").replace("Black", "black").replace("White", "white").replace("Asian", "asian").trim();
  if (d.trim() === "Some Other Race") return d.toLowerCase();
  if (d.trim() === "Two or More Races") return d.toLowerCase();
  return d;
};
const formatEthnicityName = d => d.replace("Not Hispanic or Latino", "non-Hispanic").replace("or Latino", "").trim();

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
  if (meta.level === "place") return `${d.Zip}, ${meta.name}`;
  const cityName = zipToPlace[d["ID Zip"]];
  return cityName === undefined ? d.Zip : `${d.Zip}, ${cityName}`;
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
    const {rankData, tractToPlace, zipToPlace} = topStats;
    const {level} = meta;

    const populationByAgeAndGenderAvailable = populationByAgeAndGender.length !== 0;
    const populationByRaceAndEthnicityAvailable = populationByRaceAndEthnicity.length !== 0;
    const lifeExpectancyAvailable = lifeExpectancy.length !== 0;

    const onCityOrZipLevel = level === "place" || level === "zip";

    const populationGrowth = formatAbbreviate(growthCalculator(population[0].Population, population[population.length - 1].Population));

    const currentLocationRankData = rankData.filter(d => d.id === meta.id)[0];

    // Get recent year male and female population data by their age.
    let getFemaleData, getMaleData, getTopFemaleData, getTopMaleData;
    if (populationByAgeAndGenderAvailable) {
      getMaleData = populationByAgeAndGender.filter(d => d.Sex === "Male");
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
    topOverallCoverage.share = total !== 0 ? topOverallCoverage["Population by Insurance Coverage"] / total * 100 : 0;

    // Filter zips for Geomap based on the profile you are on.
    let filteredZips = [];
    if (meta.level === "county" || meta.level === "zip") filteredZips = zipcodes;
    else childrenZipIds.forEach(d => filteredZips.push(d.substring(7, 12)));

    return (
      <SectionColumns>
        <SectionTitle>Introduction</SectionTitle>
        <article className="top-stats">
          <p>
            {level === "zip" ? `Zip code ${population[0].Geography}` : population[0].Geography} has a population of {formatAbbreviate(population[0].Population)} people{meta.level === "county" ? "" : <span> which makes it the {formatRankSuffix(currentLocationRankData.populationRank)} largest of {rankData.length} {formatLevelNames(meta.level)} in Wayne County</span>}
            {}, with the life expectancy of {lifeExpectancyAvailable ? formatAbbreviate(lifeExpectancy[0]["Life Expectancy"]) : "N/A"} {lifeExpectancyAvailable ? onCityOrZipLevel ? <span>(in {lifeExpectancy[0].Geography})</span> : "" : ""}.
            The most common age group for male is {populationByAgeAndGenderAvailable && population[0].Population !== 0 ? getTopMaleData.Age.toLowerCase() : "N/A"} and for female it is {populationByAgeAndGenderAvailable && population[0].Population !== 0 ? getTopFemaleData.Age.toLowerCase() : "N/A"}.
            Between {population[population.length - 1].Year} and {population[0].Year} the population of {population[0].Geography} {populationGrowth < 0 ? "reduced" : "increased"} from {formatAbbreviate(population[population.length - 1].Population)} to {formatAbbreviate(population[0].Population)},
            {} {populationGrowth < 0 ? "a decline" : "an increase"} of {populationGrowth < 0 ? `${populationGrowth * -1}%` : isNaN(populationGrowth) ? "N/A" : `${populationGrowth}%`}.
          </p>
          {populationByRaceAndEthnicityAvailable
            ? <p>
              {formatAbbreviate(topRaceAndEthnicity[0].share)}% of the population in {topRaceAndEthnicity[0].Geography} is {formatRaceName(topRaceAndEthnicity[0].Race)} ({formatEthnicityName(topRaceAndEthnicity[0].Ethnicity)}), followed by {formatAbbreviate(topRaceAndEthnicity[1].share)}% {formatRaceName(topRaceAndEthnicity[1].Race)} ({formatEthnicityName(topRaceAndEthnicity[1].Ethnicity)}).
            </p>
            : null}
          <p>In {level === "zip" ? `Zip code ${currentLocationRankData.name}` : currentLocationRankData.name}, the median household income is {formatAbbreviate(currentLocationRankData.medianIncome)}{meta.level === "county" ? "." : <span>, which ranks it at {formatRankSuffix(currentLocationRankData.medianIncomeRank)} largest of all {formatLevelNames(meta.level)} in Wayne County.</span>}</p>
          <p>
            Social and economic factors, such as income, education, and access to health care, impact health outcomes for all Americans. For example, in many low income areas in the country, there are higher rates of chronic diseases, like high blood pressure and diabetes. The summary to the right highlights some of the social and health conditions for {population[0].Geography}.
          </p>
          <Stat
            title={"Health Insurance Coverage"}
            year={topOverallCoverage.Year}
            value={formatPercentage(topOverallCoverage.share)}
            qualifier={`of the population in ${meta.name} had coverage`}
          />
          <Stat
            title="Population by Race and Ethnicity"
          />
          <Treemap config={{
            data: `https://acs.datausa.io/api/data?measures=Hispanic Population&drilldowns=Race,Ethnicity&Geography=${meta.id}&Year=all`,
            height: 250,
            sum: "Hispanic Population",
            groupBy: ["Race", "Ethnicity"],
            label: d => `${d.Race.replace("Alone", "")} (${formatEthnicityName(d.Ethnicity)})`,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Share", d => formatPercentage(d.share)], [titleCase(meta.level), d => d.Geography]]}
          }}
          dataFormat={resp => formatRaceAndEthnicityData(resp.data)[0]}
          />
        </article>
        <div className="top-stats viz">

          <div>
            <Stat
              title="Distress Score"
              qualifier={`Zip Codes in ${meta.name}`}
            />
            <Geomap config={{
              data: "/api/data?measures=Distress Score&drilldowns=Zip&Year=all",
              height: 250,
              groupBy: "Zip",
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
              ocean: "transparent",
              tiles: false,
              time: "Year",
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Distress Score", d => `${formatAbbreviate(d["Distress Score"])} percentile`]]},
              topojson: "/topojson/zipcodes.json",
              topojsonId: d => d.properties.ZCTA5CE10,
              topojsonFilter: d => filteredZips.includes(d.properties.ZCTA5CE10),
              zoom: false
            }}
            dataFormat={resp => resp.data}
            />
            <Glossary definitions={definitions} />

          </div>

          <div>
            <Stat
              title="Poor Physical Health"
              qualifier={<p className="stat-value-qualifier font-xs"><ZipRegionDefinition text="Zip Regions" /> in Wayne County</p>}
            />
            <Geomap config={{
              data: "/api/data?measures=Poor Physical Health 14 Or More Days&drilldowns=Zip Region&Year=all",
              height: 300,
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
              ocean: "transparent",
              tiles: false,
              time: "End Year",
              tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Condition", "Poor Physical Health 14 Or More Days"], ["Prevalence", d => `${formatPercentage(d["Poor Physical Health 14 Or More Days"], true)}`]]},
              topojson: "/topojson/zipregions.json",
              topojsonId: d => d.properties.REGION,
              topojsonFilter: () => true,
              zoom: false
            }}
            dataFormat={resp => resp.data}
            />
          </div>

        </div>

        <div className="top-stats viz">

          <div>
            <Stat
              title="Life Expectancy"
              qualifier={<p className="stat-value-qualifier font-xs"><CensusTractDefinition text="Census Tracts" /> in {meta.level === "county" || meta.level === "tract" ? "Wayne County" : meta.name}</p>}
            />
            <Geomap config={{
              // Getting data for a particular tract ID so that we get all tracts data in Wayne County.
              // We cannot use meta.id here because we do not get tracts for Wayne County id.
              data: "/api/data?measures=Life Expectancy&Geography=14000US26163561300:children&Year=all",
              height: 250,
              groupBy: "ID Geography",
              colorScale: "Life Expectancy",
              legend: false,
              label: d => formatGeomapTractLabel(d, meta, tractToPlace),
              ocean: "transparent",
              tiles: false,
              time: "End Year",
              tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Life Expectancy", d => d["Life Expectancy"]]]},
              topojson: "/topojson/tract.json",
              topojsonFilter: d => formatTopojsonFilter(d, meta, childrenTractIds),
              zoom: false
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
          </div>

          <div>
            <Stat
              title="Poor Mental Health"
              qualifier={<p className="stat-value-qualifier font-xs"><ZipRegionDefinition text="Zip Regions" /> in Wayne County</p>}
            />
            <Geomap config={{
              data: "/api/data?measures=Poor Mental Health 14 Or More Days&drilldowns=Zip Region&Year=all",
              height: 300,
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
              ocean: "transparent",
              tiles: false,
              time: "End Year",
              tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Condition", "Poor Mental Health 14 Or More Days"], ["Prevalence", d => `${formatPercentage(d["Poor Mental Health 14 Or More Days"], true)}`]]},
              topojson: "/topojson/zipregions.json",
              topojsonId: d => d.properties.REGION,
              topojsonFilter: () => true,
              zoom: false
            }}
            dataFormat={resp => resp.data}
            />
          </div>
        </div>
      </SectionColumns>
    );
  }
}

Introduction.defaultProps = {
  slug: "introduction"
};

Introduction.need = [
  fetchData("lifeExpectancy", "/api/data?measures=Life Expectancy&Geography=<id>&Year=latest", d => d.data), // Year data not available
  fetchData("populationByAgeAndGender", "/api/data?measures=Population by Sex and Age&drilldowns=Age,Sex&Geography=<id>&Year=latest", d => d.data),
  fetchData("populationByRaceAndEthnicity", "https://acs.datausa.io/api/data?measures=Hispanic Population&drilldowns=Race,Ethnicity&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  topStats: state.data.topStats,
  childrenZipIds: state.data.childrenZipIds,
  childrenTractIds: state.data.childrenTractIds,
  population: state.data.population.data,
  lifeExpectancy: state.data.lifeExpectancy,
  populationByAgeAndGender: state.data.populationByAgeAndGender,
  populationByRaceAndEthnicity: state.data.populationByRaceAndEthnicity.data,
  currentLevelOverallCoverage: state.data.currentLevelOverallCoverage
});

export default connect(mapStateToProps)(Introduction);
