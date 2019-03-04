import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart, LinePlot} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {Classes, Button, MenuItem} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/labs";
import "@blueprintjs/labs/dist/blueprint-labs.css";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import growthCalculator from "utils/growthCalculator";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Cancer extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [
        {index: 0, title: "Digestive System"},
        {index: 1, title: "Male Genital System"},
        {index: 2, title: "Prostate"}
      ]
    };
  }

  render() {

    const {sortedCancerTypes, occuranceByGender, occuranceByRaceAndEthnicity, occuranceRate} = this.props;
    const selectedItems = this.state.selectedItems;

    const topOccuranceByRaceAndEthnicity = occuranceByRaceAndEthnicity.sort((a, b) => b["Age-Adjusted Cancer Rate"] - a["Age-Adjusted Cancer Rate"])[0];

    // Get top 2 recent year OccuranceRate data and find percent growth rate over last year.
    const mostRecentYearOccuranceRate = occuranceRate[0];
    const secondMostRecentYearOccuranceRate = occuranceRate[1];
    const growthRate = growthCalculator(mostRecentYearOccuranceRate["Age-Adjusted Cancer Rate"], secondMostRecentYearOccuranceRate["Age-Adjusted Cancer Rate"]);

    // Get data to pass to the Multiselect component.
    const filteredCancerTypes = sortedCancerTypes.filter(d => d !== "All Invasive Cancer Sites Combined");
    const items = filteredCancerTypes.map((d, i) => Object.assign({}, {index: i, title: d}));

    const isItemSelected = item => selectedItems.findIndex(d => d.index === item.index) > -1;

    const renderItem = ({handleClick, isActive, item}) =>
      <MenuItem
        className={isActive ? Classes.ACTIVE : ""}
        iconName={isItemSelected(item) ? "tick" : "blank"}
        key={item.index}
        onClick={handleClick}
        text={`${item.title}`}
      />;

    const filterItem = (query, item) => `${item.title.toLowerCase()}`.indexOf(query.toLowerCase()) >= 0;

    const getSelectedItemIndex = item => selectedItems.findIndex(d => d.index === item.index);

    const selectItem = item => {
      if (selectedItems.length === 5) return;
      const newSelectedItems = [...selectedItems, item];
      this.setState({selectedItems: newSelectedItems});
    };

    const deselectItem = item => {
      const itemIndex = getSelectedItemIndex(item);
      const newSelectedItems = selectedItems.filter((d, i) => i !== itemIndex);
      this.setState({selectedItems: newSelectedItems});
    };

    const handleItemSelect = item => getSelectedItemIndex(item) < 0 ? selectItem(item) : deselectItem(item);

    const deleteTag = (d, index) => {
      const selectedItems = this.state.selectedItems.filter((item, i) => i !== index);
      this.setState({selectedItems});
    };

    const renderTag = item => <span>{item.title}</span>;

    let dropdownSelected = "";
    selectedItems.forEach((d, i) => dropdownSelected += i === selectedItems.length - 1 ? `${d.title}` : `${d.title},`);

    return (
      <SectionColumns>
        <SectionTitle>Cancer Prevalence by Demographic</SectionTitle>
        <article>
          <div className="disclaimer">Data only available for the Detroit-Warren-Dearborn, MI metro area.</div>
          <MultiSelect
            items={items}
            itemPredicate={filterItem}
            itemRenderer={renderItem}
            noResults={<MenuItem disabled text="No results." />}
            onItemSelect={handleItemSelect}
            tagInputProps={{onRemove: deleteTag, placeholder: "Add a cancer type", inputProps: {placeholder: "Add a cancer type"}}}
            tagRenderer={renderTag}
            selectedItems={selectedItems}
            resetOnClose={true}
            resetOnSelect={true}>
            <Button rightIcon="caret-down" />
          </MultiSelect>

          <h3>By Gender</h3>
          <p>In {occuranceByGender[0].Year}, the overall prevalence of cancer in the {occuranceByGender[0].MSA} for men and women was {formatAbbreviate(occuranceByGender[1]["Age-Adjusted Cancer Rate"])} and {formatAbbreviate(occuranceByGender[0]["Age-Adjusted Cancer Rate"])} per 100,000 people, respectively.</p>
          <p>The following chart shows the gender breakdowns for the selected cancer sites.</p>
          {/* Draw a mini BarChart to show Cancer by Sex for selected cancer type. */}
          <BarChart config={{
            data: `/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Cancer Site=${dropdownSelected}&Year=all`,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: ["Cancer Site", "Sex"],
            stacked: true,
            x: "share",
            y: "Cancer Site",
            time: "Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {
              tickFormat: d => d
            },
            tooltipConfig: {tbody: [["Cancer Type", d => d["Cancer Site"]], ["Year", d => d.Year], ["Prevalence", d => formatPercentage(d.share)],
              ["Occurance per 100,000 people", d => formatAbbreviate(d["Age-Adjusted Cancer Rate"])], ["Metro Area", d => d.MSA]]}
          }}
          dataFormat={resp => {
            nest()
              .key(d => d["Cancer Site"])
              .entries(resp.data)
              .forEach(cancerType => {
                nest()
                  .key(d => d.Year)
                  .entries(cancerType.values)
                  .forEach(group => {
                    const total = sum(group.values, d => d["Cancer Diagnosis"]);
                    group.values.forEach(d => d.share = d["Cancer Diagnosis"] / total * 100);
                  });
              });
            return resp.data;
          }}
          />

          <h3>By Race & Ethnicity</h3>
          <p>In {topOccuranceByRaceAndEthnicity.Year}, the race/ethnicity group in the {topOccuranceByRaceAndEthnicity.MSA} with the highest overall cancer rate was {topOccuranceByRaceAndEthnicity.Race} {topOccuranceByRaceAndEthnicity.Ethnicity} ({formatAbbreviate(topOccuranceByRaceAndEthnicity["Age-Adjusted Cancer Rate"])} per 100,000 people).</p>
          <p>The following chart shows the race and Ethnicity breakdowns for the selected cancer sites.</p>
          {/* Draw a mini BarChart to show Cancer by Race and Ethnicity for selected cancer type. */}
          <BarChart config={{
            data: `/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Cancer Site=${dropdownSelected}&Year=all`,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: ["Cancer Site", d => `${d.Ethnicity} ${d.Race}`],
            stacked: true,
            label: d => `${d.Ethnicity} ${d.Race}`,
            x: "share",
            y: "Cancer Site",
            time: "Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {tickFormat: d => d},
            tooltipConfig: {tbody: [["Cancer Type", d => d["Cancer Site"]], ["Year", d => d.Year], ["Prevalence", d => formatPercentage(d.share)],
              ["Occurance per 100,000 people", d => formatAbbreviate(d["Age-Adjusted Cancer Rate"])], ["Metro Area", d => d.MSA]]}
          }}
          dataFormat={resp => {
            nest()
              .key(d => d["Cancer Site"])
              .entries(resp.data)
              .forEach(cancerType => {
                nest()
                  .key(d => d.Year)
                  .entries(cancerType.values)
                  .forEach(group => {
                    const total = sum(group.values, d => d["Cancer Diagnosis"]);
                    group.values.forEach(d => d.share = d["Cancer Diagnosis"] / total * 100);
                  });
              });
            return resp.data;
          }}
          />

          <Contact slug={this.props.slug} />
        </article>

        <div>
          <h3>Overall Occurance</h3>
          <p>In {mostRecentYearOccuranceRate.Year}, the cancer rate in the {mostRecentYearOccuranceRate.MSA} was {formatPercentage(mostRecentYearOccuranceRate["Age-Adjusted Cancer Rate"])}. This represents a {growthRate < 0 ? formatPercentage(growthRate * -1) : formatPercentage(growthRate)} {growthRate < 0 ? "decline" : "growth"} from the previous year ({formatPercentage(secondMostRecentYearOccuranceRate["Age-Adjusted Cancer Rate"])}).</p>
          <p>The following chart shows the occurance rate per 100,000 people for the selected cancer sites.</p>
          {/* Draw a LinePlot to show age adjusted data for the selected cancer types. */}
          <LinePlot config={{
            data: `/api/data?measures=Age-Adjusted Cancer Rate,Age-Adjusted Cancer Rate Lower 95 Percent Confidence Interval,Age-Adjusted Cancer Rate Upper 95 Percent Confidence Interval&Cancer Site=${dropdownSelected}&drilldowns=MSA&Year=all`,
            discrete: "x",
            height: 400,
            groupBy: "Cancer Site",
            legend: false,
            x: "Year",
            y: "Age-Adjusted Cancer Rate",
            xConfig: {
              labelRotation: false
            },
            yConfig: {
              tickFormat: d => d,
              title: "Occurance per 100,000 People"
            },
            confidence: [d => d["Age-Adjusted Cancer Rate Lower 95 Percent Confidence Interval"], d => d["Age-Adjusted Cancer Rate Upper 95 Percent Confidence Interval"]],
            confidenceConfig: {
              fillOpacity: 0.2
            },
            tooltipConfig: {tbody: [["Year", d => d.Year], ["Occurance per 100,000 people", d => formatAbbreviate(d["Age-Adjusted Cancer Rate"])], ["Metro Area", d => d.MSA]]}
          }}
          dataFormat={resp => resp.data}
          />
        </div>
      </SectionColumns>
    );
  }
}

Cancer.defaultProps = {
  slug: "cancer-prevalence-by-demographic"
};

Cancer.need = [
  fetchData("sortedCancerTypes", "/api/data?measures=Cancer Diagnosis&drilldowns=Cancer Site&Year=all&order=Cancer Diagnosis&sort=desc", d => {
    const cancerList = [];
    nest().key(d => d["Cancer Site"]).entries(d.data).forEach(group => cancerList.push(group.key));
    return cancerList;
  }),
  fetchData("occuranceByGender", "/api/data?measures=Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Year=latest", d => d.data),
  fetchData("occuranceByRaceAndEthnicity", "/api/data?measures=Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Year=latest", d => d.data),
  fetchData("occuranceRate", "/api/data?measures=Age-Adjusted Cancer Rate&drilldowns=MSA&Year=all", d => d.data) // getting all year data to find growthRate.
];

const mapStateToProps = state => ({
  sortedCancerTypes: state.data.sortedCancerTypes,
  occuranceByGender: state.data.occuranceByGender,
  occuranceByRaceAndEthnicity: state.data.occuranceByRaceAndEthnicity,
  occuranceRate: state.data.occuranceRate
});

export default connect(mapStateToProps)(Cancer);
