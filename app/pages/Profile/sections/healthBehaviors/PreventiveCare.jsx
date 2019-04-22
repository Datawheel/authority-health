import React from "react";
import {connect} from "react-redux";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import axios from "axios";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import ZipRegionDefinition from "components/ZipRegionDefinition";
import CensusTractDefinition from "components/CensusTractDefinition";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPercentage = (d, mutiplyBy100 = false) => mutiplyBy100 ? `${formatAbbreviate(d * 100)}%` : `${formatAbbreviate(d)}%`;

const formatDropdownNames = d => {
  if (d === "FOBT or Endoscopy") return "Appropriate Colorectal Cancer Screening";
  return d.replace("Had", "");
};

const getArticle = dropdownValue => {
  const firstLetter = dropdownValue[0];
  if (["A", "E", "I", "O", "U"].includes(firstLetter)) return "an";
  const firstWord = dropdownValue.split(" ")[0];
  if (firstWord === "Taking") return "been";
  if (firstWord === "Sleep" || firstWord === "HIV") return "";
  return "a";
};

const definitions = [
  {term: "Annual Checkup", definition: "Visits to doctor for routine checkup within the past year among adults aged ≥18 years."},
  {term: "Core Preventive Services for Older Men", definition: "Older adults aged ≥65 years who are up to date on a core set of clinical preventive services by age and sex (Number of men aged ≥65 years reporting having received all of the following: an influenza vaccination in the past year; a PPV ever; and either a fecal occult blood test (FOBT) within the past year, a sigmoidoscopy within the past 5 years and a FOBT within the past 3 years, or a colonoscopy within the past 10 years)."},
  {term: "Core Preventive Services for Older Women", definition: "Older adults aged ≥65 years who are up to date on a core set of clinical preventive services by age and sex (Number of women aged ≥65 years reporting having received all of the following: an influenza vaccination in the past year; a pneumococcal vaccination (PPV) ever; either a fecal occult blood test (FOBT) within the past year, a sigmoidoscopy within the past 5 years and a FOBT within the past 3 years, or a colonoscopy within the previous 10 years; and a mammogram in the past 2 years)."},
  {term: "Dental Visit", definition: "Visits to dentist or dental clinic among adults aged ≥18 years."},
  {term: "Colorectal Cancer Screening", definition: "Fecal occult blood test, sigmoidoscopy, or colonoscopy among adults aged 50–75 years."},
  {term: "Pap Smear Test", definition: "Papanicolaou smear use among adult women aged 21–65 years."},
  {term: "Mammography", definition: "Mammography use among women aged 50–74 years."},
  {term: "Cholesterol Screening", definition: "Cholesterol screening among adults aged ≥18 years."},
  {term: "Taking Blood Pressure Medication", definition: "Taking medicine for high blood pressure control among adults aged ≥18 years with high blood pressure."},
  {term: "Sleep Less Than 7 Hours", definition: "Sleeping less than 7 hours among adults aged ≥18 years."},
  {term: "Flu Vaccine", definition: "Among adults aged 65 years and older, the proportion who reported that they had a flu vaccine, either by an injection in the arm or sprayed in the nose during the past 12 months."},
  {term: "Pneumonia Vaccine", definition: "Among adults aged 65 years and older, the proportion who reported that they ever had a pneumococcal vaccine."},
  {term: "Routine Checkup Last Year", definition: "The proportion of adults who reported that they did not have a routine checkup in the past year."},
  {term: "Appropriate Colorectal Cancer Screening", definition: "Among adults aged 50 years and older, the proportion who had either a fecal occult blood test within the past year, a sigmoidoscopy within the past five years, or a colonoscopy within the past ten years."},
  {term: "HIV Tested", definition: "Among adults aged 18 - 64 years, the proportion who reported that they ever had been tested for HIV, apart from tests that were part of a blood donation."}
];

class PreventiveCare extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      dropdownValue: "Annual Checkup",
      preventiveCareWeightedData: [],
      countyLevelData: [],
      preventiveCareData: this.props.preventiveCareData,
      isPreventativeCareWeightedValueSelected: false,
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue === "Had Flu Vaccine" ||
    dropdownValue === "Had Pneumonia Vaccine" ||
    dropdownValue === "Had Routine Checkup Last Year" ||
    dropdownValue === "FOBT or Endoscopy" ||
    dropdownValue === "HIV Tested") {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=latest`) // MiBRFS - All Years
        .then(resp => {
          axios.get(`/api/data?measures=${dropdownValue}&Geography=05000US26163&Year=latest`) // Get Wayne County data for comparison. Only available for MiBRFS cube and not 500 cities.
            .then(d => {
              this.setState({
                preventiveCareWeightedData: resp.data.data,
                isPreventativeCareWeightedValueSelected: true,
                countyLevelData: d.data.data,
                dropdownValue
              });
            });
        });
    }
    else {
      axios.get(`/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=latest`)
        .then(resp => {
          this.setState({
            preventiveCareData: resp.data.data,
            isPreventativeCareWeightedValueSelected: false,
            dropdownValue
          });
        });
    }
  }

  render() {
    const {dropdownValue, preventiveCareData, preventiveCareWeightedData, isPreventativeCareWeightedValueSelected, countyLevelData} = this.state;
    const dropdownList = ["Annual Checkup", "Core Preventive Services for Older Men", "Core Preventive Services for Older Women",
      "Dental Visit", "Colorectal Cancer Screening", "Pap Smear Test", "Mammography", "Cholesterol Screening", "Taking Blood Pressure Medication", "Sleep Less Than 7 Hours",
      "Had Flu Vaccine", "Had Pneumonia Vaccine", "Had Routine Checkup Last Year", "FOBT or Endoscopy", "HIV Tested"];

    // Find recent year top data for the selected dropdown value.
    const topDropdownData = isPreventativeCareWeightedValueSelected ? preventiveCareWeightedData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0] : preventiveCareData.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const {tractToPlace} = this.props.topStats;
    let topTractPlace;
    if (!isPreventativeCareWeightedValueSelected) {
      topTractPlace = tractToPlace[topDropdownData["ID Tract"]];
    }

    return (
      <SectionColumns>
        <SectionTitle>Preventive Care</SectionTitle>
        <article>
          {/* Create a dropdown for different types of preventive care. */}
          <label className="pt-label pt-inline" htmlFor="preventive-care-dropdown">
            Show data for
            <select id="preventive-care-dropdown" onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{formatDropdownNames(item)}</option>)}
            </select>
          </label>

          {isPreventativeCareWeightedValueSelected
            ? <Disclaimer>Data is shown at the zip region level</Disclaimer>
            : <Disclaimer>Data is shown at the census tract level for four cities</Disclaimer>
          }
          {/* Show top stats for the dropdown selected. */}
          <Stat
            title={"Location with highest share"}
            year={isPreventativeCareWeightedValueSelected ? topDropdownData["End Year"] : topDropdownData.Year}
            value={isPreventativeCareWeightedValueSelected ? topDropdownData["Zip Region"] : `${topDropdownData.Tract}, ${topTractPlace}`}
            qualifier={isPreventativeCareWeightedValueSelected ? `${formatPercentage(topDropdownData[dropdownValue], true)} of the population of this zip region` : `${formatPercentage(topDropdownData[dropdownValue])} of the population of this census tract`}
          />

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isPreventativeCareWeightedValueSelected
            ? <p>In {topDropdownData["End Year"]}, {formatPercentage(topDropdownData[dropdownValue], true)} of the population of the {topDropdownData["Zip Region"]} <ZipRegionDefinition text="zip region" /> had {getArticle(dropdownValue)} {formatDropdownNames(dropdownValue).toLowerCase()}, as compared to {formatPercentage(countyLevelData[0][dropdownValue], true)} overall for Wayne County.</p>
            : <p>In {topDropdownData.Year}, {formatPercentage(topDropdownData[dropdownValue])} of the population of <CensusTractDefinition text={topDropdownData.Tract}/>{topTractPlace !== undefined ? `, ${topTractPlace}` : ""} had {getArticle(dropdownValue)} {formatDropdownNames(dropdownValue).toLowerCase()} out of all tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }
          {isPreventativeCareWeightedValueSelected
            ? <p>The map here shows {formatDropdownNames(dropdownValue).toLowerCase()} for zip regions in Wayne County.</p>
            : <p>The map here shows {formatDropdownNames(dropdownValue).toLowerCase()} for census tracts in Detroit, Livonia, Dearborn and Westland.</p>
          }

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ `/api/data?measures=${dropdownValue}&drilldowns=${ isPreventativeCareWeightedValueSelected ? "Zip Region" : "Tract" }&Year=all` }
            title="Map of Preventive Care" />
          {/* Geomap to show Preventive care data for selected dropdown Value. */}
          {isPreventativeCareWeightedValueSelected
            ? <Geomap ref={comp => this.viz = comp } config={{
              data: `/api/data?measures=${dropdownValue}&drilldowns=Zip Region&Year=all`,
              groupBy: "ID Zip Region",
              colorScale: dropdownValue,
              colorScaleConfig: {
                axisConfig: {tickFormat: d => formatPercentage(d, true)}
              },
              label: d => d["Zip Region"],
              height: 400,
              time: "End Year",
              tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Preventive Care", `${formatDropdownNames(dropdownValue)}`], ["Share", d => `${formatPercentage(d[dropdownValue], true)}`]]},
              topojson: "/topojson/zipregions.json",
              topojsonId: d => d.properties.REGION,
              topojsonFilter: () => true
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return resp.data;
            }}
            />
            : <Geomap ref={comp => this.viz = comp } config={{
              data: `/api/data?measures=${dropdownValue}&drilldowns=Tract&Year=all`,
              groupBy: "ID Tract",
              colorScale: dropdownValue,
              colorScaleConfig: {
                axisConfig: {tickFormat: d => formatPercentage(d)}
              },
              label: d => `${d.Tract}, ${tractToPlace[d["ID Tract"]]}`,
              time: "Year",
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Preventive Care", `${formatDropdownNames(dropdownValue)}`], ["Share", d => `${formatPercentage(d[dropdownValue])}`]]},
              topojson: "/topojson/tract.json",
              topojsonId: d => d.id,
              topojsonFilter: d => d.id.startsWith("14000US26163")
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return resp.data;
            }}
            />}
        </div>
      </SectionColumns>
    );
  }
}

PreventiveCare.defaultProps = {
  slug: "preventive-care"
};

PreventiveCare.need = [
  fetchData("preventiveCareData", "/api/data?measures=Annual Checkup&drilldowns=Tract&Year=latest", d => d.data) // 500 Cities
];

const mapStateToProps = state => ({
  topStats: state.data.topStats,
  preventiveCareData: state.data.preventiveCareData
});

export default connect(mapStateToProps)(PreventiveCare);
