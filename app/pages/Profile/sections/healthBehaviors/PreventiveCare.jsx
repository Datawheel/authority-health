import React from "react";
import {connect} from "react-redux";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class PreventiveCare extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Annual Checkup"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {preventiveCareData, preventiveCareWeightedData} = this.props;

    // Include all the measures from preventiveCareData and preventiveCareWeightedData in the dropdown list.
    const {dropdownValue} = this.state;
    const dropdownList = preventiveCareData.source[0].measures.slice();
    preventiveCareWeightedData.source[0].measures.forEach(d => {
      dropdownList.push(d);
    });

    // Check if the selected dropdown values are from the preventiveCareWeightedData.
    const isPreventativeCareWeightedValueSelected = dropdownValue === "Had Flu Vaccine" ||
    dropdownValue === "Had Pneumonia Vaccine" ||
    dropdownValue === "Had Routine Checkup Last Year" ||
    dropdownValue === "FOBT or Endoscopy";

    // Find recent year top data for the selceted dropdown value.
    const recentYearWeightedData = {};
    nest()
      .key(d => d["End Year"])
      .entries(preventiveCareWeightedData.data)
      .forEach(group => {
        group.key >= preventiveCareWeightedData.data[0]["End Year"] ? Object.assign(recentYearWeightedData, group) : {};
      });
    const topDropdownWeightedData = recentYearWeightedData.values.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    const topDropdownValueTract = preventiveCareData.data.sort((a, b) => b[dropdownValue] - a[dropdownValue])[0];

    return (
      <SectionColumns>
        <SectionTitle>Preventive Care</SectionTitle>
        <article>
          {isPreventativeCareWeightedValueSelected ? <div className="disclaimer">Data only available for zip regions.</div> : <div className="disclaimer">Data only available at the tract level.</div>}
          {/* Create a dropdown for different types of preventive care. */}
          <div className="pt-select pt-fill">
            <select onChange={this.handleChange}>
              {dropdownList.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          {/* Show top stats for the dropdown selected. */}
          {isPreventativeCareWeightedValueSelected
            ? <Stat
              title={"Location with highest share"}
              year={topDropdownWeightedData["End Year"]}
              value={topDropdownWeightedData["Zip Region"]}
              qualifier={formatPercentage(topDropdownWeightedData[dropdownValue])}
            />
            : <Stat
              title={"Location with highest share"}
              year={topDropdownValueTract.Year}
              value={topDropdownValueTract.Tract}
              qualifier={formatPercentage(topDropdownValueTract[dropdownValue])}
            />
          }

          {/* Write short paragraphs explaining Geomap and top stats for the dropdown value selected. */}
          {isPreventativeCareWeightedValueSelected
            ? <p>In {topDropdownWeightedData["End Year"]}, {topDropdownWeightedData["Zip Region"]} had the highest share of {dropdownValue} ({formatPercentage(topDropdownWeightedData[dropdownValue])}) out of all zip regions in Wayne County.</p>
            : <p>In {topDropdownValueTract.Year}, {topDropdownValueTract.Tract} had the highest share of {dropdownValue.toLowerCase()} ({formatPercentage(topDropdownValueTract[dropdownValue])}) out of all the tracts in Wayne County.</p>
          }
          {isPreventativeCareWeightedValueSelected
            ? <p>The map here shows the {dropdownValue.toLowerCase()} for all zip regions in Wayne County.</p>
            : <p>The map here shows the {dropdownValue.toLowerCase()} for all tracts in Wayne County.</p>
          }
          <Contact slug={this.props.slug} />
        </article>

        {/* Geomap to show Preventive care data for selected dropdown Value. */}
        {isPreventativeCareWeightedValueSelected
          ? <Geomap config={{
            data: preventiveCareWeightedData.data,
            groupBy: "ID Zip Region",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d["Zip Region"],
            height: 400,
            time: "End Year",
            tooltipConfig: {tbody: [["Year", d => d["End Year"]], ["Preventive Care", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/zipregions.json",
            topojsonId: d => d.properties.REGION,
            topojsonFilter: () => true
          }}
          />
          : <Geomap config={{
            data: preventiveCareData.data,
            groupBy: "ID Tract",
            colorScale: dropdownValue,
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.Tract,
            height: 400,
            time: "Year",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Preventive Care", `${dropdownValue}`], ["Share", d => `${formatPercentage(d[dropdownValue])}`]]},
            topojson: "/topojson/tract.json",
            topojsonFilter: d => d.id.startsWith("14000US26163")
          }}
          />}
      </SectionColumns>
    );
  }
}

PreventiveCare.defaultProps = {
  slug: "preventive-care"
};

PreventiveCare.need = [
  fetchData("preventiveCareData", "/api/data?measures=Annual Checkup,Core preventive services for older men,Core preventive services for older women,Dental Visit,Colorectal Cancer Screening,Pap Smear Test,Mammography,Cholesterol Screening&drilldowns=Tract&Year=all"),
  fetchData("preventiveCareWeightedData", "/api/data?measures=Had Flu Vaccine,Had Pneumonia Vaccine,Had Routine Checkup Last Year,FOBT or Endoscopy&drilldowns=Zip Region&Year=all")
];

const mapStateToProps = state => ({
  preventiveCareData: state.data.preventiveCareData,
  preventiveCareWeightedData: state.data.preventiveCareWeightedData
});

export default connect(mapStateToProps)(PreventiveCare);
