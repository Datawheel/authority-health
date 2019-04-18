import React from "react";
import {connect} from "react-redux";
import {BarChart, Geomap} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";
import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";
import axios from "axios";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Options from "components/Options";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const formatRaceText = d => {
  if (d === "Asian" || d === "Black" || d === "White") return `${d}(s)`;
  else if (d === "American Indian or Alaska Native") return "American Indians or Alaska Natives";
  else if (d === "Hawaiian or Pacific Islander") return "Hawaiians or Pacific Islanders";
  else return d;
};

class StoreAccessByDemographic extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      meta: this.props.meta,
      dropdownValue: "Children",
      foodAccessByRace: [],
      sources: []
    };
  }

  // Handler function for dropdown onChange event.
  handleChange = event => {
    const dropdownValue = event.target.value;
    if (dropdownValue !== "Children" && dropdownValue !== "Seniors") {
      axios.get(`/api/data?measures=Low-Access to Food by Race&drilldowns=Race Group&Geography=${this.state.meta.id}&Year=latest`)
        .then(resp => {
          this.setState({
            foodAccessByRace: resp.data,
            dropdownValue
          });
        });
    }
    else this.setState({dropdownValue});
  }

  render() {

    const {foodAccessByAge} = this.props;
    const {meta, dropdownValue, foodAccessByRace} = this.state;
    const raceAndAgeTypes = ["Children", "Seniors", "American Indian or Alaska Native", "Asian", "Black", "Hawaiian or Pacific Islander", "Hispanic ethnicity", "Multiracial", "White"];
    const ageSelected = dropdownValue === "Children" || dropdownValue === "Seniors";
    const isCurrentLocationDataAvailable = ageSelected ? foodAccessByAge.source[0].substitutions.length === 0 : foodAccessByRace.source[0].substitutions.length === 0;

    // Get recent year data for food access by Age/Race based on the dropdown.
    const topFoodAccessData = ageSelected ? foodAccessByAge.data.sort((a, b) => b["Low-Access to Food by Age"] - a["Low-Access to Food by Age"])[0] : foodAccessByRace.data.sort((a, b) => b["Low-Access to Food by Race"] - a["Low-Access to Food by Race"])[0];

    return (
      <SectionColumns>
        <SectionTitle>Store Access by Demographic</SectionTitle>
        <article>
          {/* Create a dropdown for each age and race type using raceAndAgeTypes array. */}
          <label className="pt-label pt-inline" htmlFor="store-access-dropdown">
            Show data for
            <select id="store-access-dropdown" onChange={this.handleChange}>
              {raceAndAgeTypes.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          {/* Show top stats for Age and Race groups based on the drilldown value. */}
          <Stat
            title={ageSelected ? "Most at risk demographic" : "Top Food Access by Race"}
            year={topFoodAccessData.Year}
            value={ageSelected ? topFoodAccessData["Age Group"] : topFoodAccessData["Race Group"]}
            qualifier={ageSelected ? `${formatPercentage(topFoodAccessData["Low-Access to Food by Age"])} of all ${topFoodAccessData["Age Group"].toLowerCase()} in ${topFoodAccessData.Geography} has low access` : `${formatPercentage(topFoodAccessData["Low-Access to Food by Race"])} of total population in ${topFoodAccessData.Geography} has low access`}
          />
          {/* Write a paragraph for top stats based on the dropdown choice. */}
          <p>In {topFoodAccessData.Year}, {ageSelected ? `between children and seniors age groups, ${topFoodAccessData["Age Group"].toLowerCase()}` : topFoodAccessData["Race Group"].toLowerCase()} were the largest {ageSelected ? "age" : "race"} group ({ageSelected ? `${formatPercentage(topFoodAccessData["Low-Access to Food by Age"])} of all ${topFoodAccessData["Age Group"].toLowerCase()}` : `${formatPercentage(topFoodAccessData["Low-Access to Food by Race"])} of the population`}) in {topFoodAccessData.Geography} with low access to food stores.</p>
          <p>Low access to healthy food is defined as being far from a supermarket, supercenter, or large grocery store.</p>
          <p>The following map shows the low access rate for {dropdownValue.split(" ").length === 1 ? formatRaceText(dropdownValue).toLowerCase() : formatRaceText(dropdownValue)} with low access to food stores across all counties in Michigan.</p>

          {!isCurrentLocationDataAvailable &&
            <Disclaimer>
              data is shown for { ageSelected ? foodAccessByAge.data[0].Geography : foodAccessByRace.data[0].Geography }
            </Disclaimer>
          }
          <SourceGroup sources={this.state.sources} />
          <Contact slug={this.props.slug} />

          <div className="viz">
            <Options
              component={this}
              componentKey="viz"
              dataFormat={resp => resp.data}
              slug={this.props.slug}
              data={ ageSelected ? `/api/data?measures=Low-Access to Food by Age&drilldowns=Age Group&Geography=${meta.id}&Year=all` : `/api/data?measures=Low-Access to Food by Race&drilldowns=Race Group&Geography=${meta.id}&Year=all` }
              title="Chart of Low Access to Food by Age" />
            {/* Create a BarChart based on the dropdown choice. */}
            <BarChart ref={comp => this.viz = comp} config={{
              data: ageSelected ? `/api/data?measures=Low-Access to Food by Age&drilldowns=Age Group&Geography=${meta.id}&Year=all` : `/api/data?measures=Low-Access to Food by Race&drilldowns=Race Group&Geography=${meta.id}&Year=all`,
              discrete: "y",
              height: 200,
              legend: false,
              groupBy: ageSelected ? "Age Group" : "Race Group",
              x: ageSelected ? "Low-Access to Food by Age" : "Low-Access to Food by Race",
              y: ageSelected ? "Age Group" : "Race Group",
              xConfig: {
                tickFormat: d => formatPercentage(d)
              },
              yConfig: {
                barConfig: {stroke: "transparent"},
                ticks: []
              },
              time: "Year",
              title: d => `Low Access to Food Store in ${d[0].Geography}`,
              tooltipConfig: {tbody: [["Year", d => d.Year], ["Demographic", d => ageSelected ? `${d["Age Group"]}` : `${d["Race Group"]}`], ["Low-Access Rate", d => ageSelected ? formatPercentage(d["Low-Access to Food by Age"]) : formatPercentage(d["Low-Access to Food by Race"])], ["County", d => d.Geography]]}
            }}
            dataFormat={resp => {
              this.setState({sources: updateSource(resp.source, this.state.sources)});
              return resp.data;
            }}
            />
          </div>
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ ageSelected ? `/api/data?measures=Low-Access to Food by Age&drilldowns=Age Group,County&Age Group=${dropdownValue}&Year=all` : `/api/data?measures=Low-Access to Food by Race&drilldowns=Race Group,County&Race Group=${dropdownValue}&Year=all` }
            title="Map of Store Access By Demographics" />

          {/* Create a Geomap based on dropdown choice for all the counties in Michigan. */}
          <Geomap ref={comp => this.viz = comp } config={{
            data: ageSelected ? `/api/data?measures=Low-Access to Food by Age&drilldowns=Age Group,County&Age Group=${dropdownValue}&Year=all` : `/api/data?measures=Low-Access to Food by Race&drilldowns=Race Group,County&Race Group=${dropdownValue}&Year=all`,
            groupBy: "ID County",
            colorScale: ageSelected ? "Low-Access to Food by Age" : "Low-Access to Food by Race",
            colorScaleConfig: {
              axisConfig: {tickFormat: d => formatPercentage(d)}
            },
            label: d => d.County,
            time: "Year",
            title: "Low Access to Food Store for Counties in Michigan",
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Demographic", dropdownValue], ["Low-Access Rate", d => ageSelected ? formatPercentage(d["Low-Access to Food by Age"]) : formatPercentage(d["Low-Access to Food by Race"])]]},
            topojson: "/topojson/county.json",
            topojsonFilter: d => d.id.startsWith("05000US26")
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
            return resp.data;
          }}
          />
        </div>
      </SectionColumns>
    );
  }
}

StoreAccessByDemographic.defaultProps = {
  slug: "store-access-by-demographic"
};

StoreAccessByDemographic.need = [
  fetchData("foodAccessByAge", "/api/data?measures=Low-Access to Food by Age&drilldowns=Age Group&Geography=<id>&Year=latest")
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  foodAccessByAge: state.data.foodAccessByAge
});

export default connect(mapStateToProps)(StoreAccessByDemographic);
