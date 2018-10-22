import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Stat from "../../components/Stat";
import places from "../../../../utils/places";

const formatPopulation = d => `${formatAbbreviate(d)}%`;

class Immigrants extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {dropdownValue: "Native"};
  }

  // Handler function for dropdown onChange event.
  handleChange = event => this.setState({dropdownValue: event.target.value});

  render() {

    const {dropdownValue} = this.state;
    const {immigrantsNativityData} = this.props;

    const recentYearData = {};
    nest()
      .key(d => d.Year)
      .entries(immigrantsNativityData.data)
      .forEach(group => {
        const total = sum(group.values, d => d.Population);
        group.values.forEach(d => d.share = d.Population / total * 100);
        group.key >= immigrantsNativityData.data[0].Year ? Object.assign(recentYearData, group) : {};
      });

    const nativePopulationData = [];
    const foreignBornPopulationData = [];
    recentYearData.values.forEach(d => d["ID Nativity"] === 0 ? nativePopulationData.push(d) : foreignBornPopulationData.push(d));

    nativePopulationData.sort((a, b) => b.Population - a.Population);
    const topNativePopulation = nativePopulationData[0];

    foreignBornPopulationData.sort((a, b) => b.Population - a.Population);
    const topForeignBornPopulation = foreignBornPopulationData[0];

    const nativityArr = ["Native", "Foreign Born"];

    let topNativityYear = topNativePopulation.Year;
    let topNativityPlace = topNativePopulation.Place;
    let topNativityShare = topNativePopulation.share;

    if (dropdownValue === nativityArr[0]) {
      topNativityYear = topNativePopulation.Year;
      topNativityPlace = topNativePopulation.Place;
      topNativityShare = topNativePopulation.share;
    }
    else {
      topNativityYear = topForeignBornPopulation.Year;
      topNativityPlace = topForeignBornPopulation.Place;
      topNativityShare = topForeignBornPopulation.share;
    }

    return (
      <SectionColumns>
        <SectionTitle>Immigrants</SectionTitle>
        <article>
          {/* Create a dropdown for Native and Foreign Born options. */}
          <select onChange={this.handleChange}>
            {nativityArr.map((item, i) => <option key={i} value={item}>{item}</option>)}
          </select>

          {/* Show top stats and a short paragraph about it for each Nativity. */}
          <Stat
            title={`Top ${dropdownValue} Population in ${topNativityYear}`}
            value={`${topNativityPlace} ${formatPopulation(topNativityShare)}`}
          />
          <p>In {topNativityYear}, the highest {dropdownValue} population was {formatPopulation(topNativityShare)} in the {topNativityPlace} city</p>
        </article>

        {/* Create a Geomap based on the dropdown choice. */}
        <Geomap config={{
          data: `/api/data?measures=Population&drilldowns=Nativity,Place&Year=all&Nativity=${dropdownValue === "Native" ? 0 : 1}`,
          groupBy: "ID Place",
          colorScale: "Population",
          time: "Year",
          label: d => d.Place,
          height: 400,
          tooltipConfig: {tbody: [["Value", d => formatAbbreviate(d.Population)]]},
          topojson: "/topojson/place.json",
          topojsonFilter: d => places.includes(d.id)
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

Immigrants.defaultProps = {
  slug: "immigrants"
};

Immigrants.need = [
  fetchData("immigrantsNativityData", "/api/data?measures=Population&drilldowns=Nativity,Place&Year=all")
];
  
const mapStateToProps = state => ({
  immigrantsNativityData: state.data.immigrantsNativityData
});
    
export default connect(mapStateToProps)(Immigrants);
