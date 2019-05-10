import React from "react";
import {connect} from "react-redux";
import {sum} from "d3-array";
import {nest} from "d3-collection";
import {BarChart} from "d3plus-react";
import {formatAbbreviate} from "d3plus-format";

import {Classes, Button, MenuItem} from "@blueprintjs/core";
import {MultiSelect} from "@blueprintjs/labs";
import "@blueprintjs/labs/dist/blueprint-labs.css";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Glossary from "components/Glossary";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";
import Disclaimer from "components/Disclaimer";
import Options from "components/Options";

const formatPercentage = d => `${formatAbbreviate(d)}%`;

const definitions = [
  {term: "All Invasive Cancer Sites Combined", definition: "All invasive cancer sites combined are the summary or combined aggregate total for all invasive cancer sites, except urinary bladder, which includes invasive and in situ."}
];

class CancerPrevalenceByDemographics extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      sources: []
    };
  }

  render() {

    const {sortedCancerTypes, occuranceByGender, occuranceByRaceAndEthnicity} = this.props;
    const selectedItems = this.state.selectedItems;
    const isItemsListEmpty = selectedItems.length === 0;

    const topOccuranceByRaceAndEthnicity = occuranceByRaceAndEthnicity.sort((a, b) => b["Age-Adjusted Cancer Rate"] - a["Age-Adjusted Cancer Rate"])[0];

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
          <Disclaimer>Data only available for the Detroit-Warren-Dearborn, MI metro area.</Disclaimer>
          <p>Click on the box to select a cancer type and display its data in the bar charts to the right. You can select up to 5 types of cancer.</p>
          <div className="field-container">
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
          </div>

          {/* Added empty <p> element for some space between the dropdown choice and text*/}
          <p></p>
          <p>In {occuranceByGender[0].Year}, the overall prevalence of cancer in the {occuranceByGender[0].MSA} for men and women was {formatAbbreviate(occuranceByGender[1]["Age-Adjusted Cancer Rate"])} and {formatAbbreviate(occuranceByGender[0]["Age-Adjusted Cancer Rate"])} per 100,000 people, respectively.</p>
          <p>In {topOccuranceByRaceAndEthnicity.Year}, the race/ethnicity group in the {topOccuranceByRaceAndEthnicity.MSA} with the highest overall cancer rate was {topOccuranceByRaceAndEthnicity.Race} {topOccuranceByRaceAndEthnicity.Ethnicity} ({formatAbbreviate(topOccuranceByRaceAndEthnicity["Age-Adjusted Cancer Rate"])} per 100,000 people).</p>
          <p>The following charts shows the occurrence rate per 100,000 people in {topOccuranceByRaceAndEthnicity.MSA} by gender and race/ethnicity for {isItemsListEmpty ? topOccuranceByRaceAndEthnicity["Cancer Site"].toLowerCase() : "the selected cancer site(s)"}.</p>

          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        <div className="viz u-text-right">
          <Options
            component={this}
            componentKey="viz1"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ isItemsListEmpty ? "/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Cancer Site=All Invasive Cancer Sites Combined&Year=all" : `/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Cancer Site=${dropdownSelected}&Year=all` }
            title="Chart of Cancer Prevalence By Gender" />
          {/* Draw a barchart to show Cancer by Sex for selected cancer type. */}
          <BarChart ref={comp => this.viz1 = comp } config={{
            data: isItemsListEmpty ? "/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Cancer Site=All Invasive Cancer Sites Combined&Year=all" : `/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Cancer Site=${dropdownSelected}&Year=all`,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: ["Cancer Site", "Sex"],
            stacked: true,
            x: "share",
            y: "Cancer Site",
            time: "Year",
            title: "Gender Breakdown",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {
              tickFormat: d => d
              // labelRotation: true
            },
            tooltipConfig: {tbody: [["Cancer Type", d => d["Cancer Site"]], ["Year", d => d.Year], ["Prevalence", d => formatPercentage(d.share)],
              ["Occurrence per 100,000 people", d => formatAbbreviate(d["Age-Adjusted Cancer Rate"])], ["Metro Area", d => d.MSA]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
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

          <Options
            component={this}
            componentKey="viz2"
            dataFormat={resp => resp.data}
            slug={this.props.slug}
            data={ isItemsListEmpty ? "/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Cancer Site=All Invasive Cancer Sites Combined&Year=all" : `/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Cancer Site=${dropdownSelected}&Year=all` }
            title="Chart of Cancer Prevalence By Race and Ethnicty" />
          {/* Draw a barchart to show Cancer by Race and Ethnicity for selected cancer type. */}
          <BarChart ref={comp => this.viz2 = comp } config={{
            data: isItemsListEmpty ? "/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Cancer Site=All Invasive Cancer Sites Combined&Year=all" : `/api/data?measures=Cancer Diagnosis,Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Cancer Site=${dropdownSelected}&Year=all`,
            discrete: "y",
            height: 200,
            legend: false,
            groupBy: ["Cancer Site", d => `${d.Ethnicity} ${d.Race}`],
            stacked: true,
            label: d => `${d.Ethnicity} ${d.Race}`,
            x: "share",
            y: "Cancer Site",
            title: "Race/Ethnicity Breakdown",
            time: "Year",
            xConfig: {
              tickFormat: d => formatPercentage(d),
              labelRotation: false
            },
            yConfig: {
              tickFormat: d => d
              // labelRotation: true
            },
            tooltipConfig: {tbody: [["Cancer Type", d => d["Cancer Site"]], ["Year", d => d.Year], ["Prevalence", d => formatPercentage(d.share)],
              ["Occurrence per 100,000 people", d => formatAbbreviate(d["Age-Adjusted Cancer Rate"])], ["Metro Area", d => d.MSA]]}
          }}
          dataFormat={resp => {
            this.setState({sources: updateSource(resp.source, this.state.sources)});
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
        </div>

      </SectionColumns>
    );
  }
}

CancerPrevalenceByDemographics.defaultProps = {
  slug: "cancer-prevalence-by-demographic"
};

CancerPrevalenceByDemographics.need = [
  fetchData("sortedCancerTypes", "/api/data?measures=Cancer Diagnosis&drilldowns=Cancer Site&Year=all&order=Cancer Diagnosis&sort=desc", d => {
    const cancerList = [];
    nest().key(d => d["Cancer Site"]).entries(d.data).forEach(group => cancerList.push(group.key));
    return cancerList;
  }),
  fetchData("occuranceByGender", "/api/data?measures=Age-Adjusted Cancer Rate&drilldowns=Sex,MSA&Cancer Site=All Invasive Cancer Sites Combined&Year=latest", d => d.data),
  fetchData("occuranceByRaceAndEthnicity", "/api/data?measures=Age-Adjusted Cancer Rate&drilldowns=Race,Ethnicity,MSA&Cancer Site=All Invasive Cancer Sites Combined&Year=latest", d => d.data)
];

const mapStateToProps = state => ({
  sortedCancerTypes: state.data.sortedCancerTypes,
  occuranceByGender: state.data.occuranceByGender,
  occuranceByRaceAndEthnicity: state.data.occuranceByRaceAndEthnicity
});

export default connect(mapStateToProps)(CancerPrevalenceByDemographics);
