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

const formatPercentage = d => `${formatAbbreviate(d)}%`;

class Cancer extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [{index: 0, title: "All Invasive Cancer Sites Combined"},
        {index: 1, title: "Digestive System"},
        {index: 2, title: "Male Genital System"}]
    };
  }
  
  render() {

    const {sortedCancerTypes} = this.props;
    // console.log("sortedCancerTypes: ", sortedCancerTypes);
    const selectedItems = this.state.selectedItems;

    const items = sortedCancerTypes.map((d, i) => Object.assign({}, {index: i, title: d}));

    const isItemSelected = item => selectedItems.findIndex(d => d.index === item.index) > -1;    

    const renderItem = ({handleClick, isActive, item}) => 
      <MenuItem
        className={isActive ? Classes.ACTIVE : ""}
        iconName={isItemSelected(item) ? "tick" : "blank"}
        label={""}
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
        <SectionTitle>Cancer</SectionTitle>
        <article>
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

          <h3>Gender</h3>
          {/* Draw a mini BarChart to show Cancer by Sex for selected cancer type. */}
          <BarChart config={{
            data: `/api/data?measures=Count&drilldowns=Sex&Cancer%20Site=${dropdownSelected}&Year=all`,
            discrete: "y",
            height: 250,
            legend: false,
            groupBy: ["Cancer Site", "Sex"],
            stacked: true,
            label: d => d.Sex === "M" ? "Male" : "Female",
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
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
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
                    const total = sum(group.values, d => d.Count);
                    group.values.forEach(d => d.share = d.Count / total * 100);
                  });
              });
            return resp.data;
          }}
          />
          
          <h3>Race & Ethnicity</h3>
          {/* Draw a mini BarChart to show Cancer by Race and Ethnicity for selected cancer type. */}
          <BarChart config={{
            data: `/api/data?measures=Count&drilldowns=Race,Ethnicity&Cancer%20Site=${dropdownSelected}&Year=all`,
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
            tooltipConfig: {tbody: [["Value", d => formatPercentage(d.share)]]}
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
                    const total = sum(group.values, d => d.Count);
                    group.values.forEach(d => d.share = d.Count / total * 100);
                  });
              });
            return resp.data;
          }}
          />
        </article>
        
        <h3>Occurance</h3>
        {/* Draw a LinePlot to show age adjusted data for the selected cancer types. */}
        <LinePlot config={{
          data: `/api/data?measures=Age-Adjusted%20Rate,Age-Adjusted%20Rate%20Lower%2095%20Percent%20Confidence%20Interval,Age-Adjusted%20Rate%20Upper%2095%20Percent%20Confidence%20Interval&Cancer%20Site=${dropdownSelected}&Year=all`,
          discrete: "x",
          height: 400,
          groupBy: "Cancer Site",
          legend: false,
          x: "Year",
          y: "Age-Adjusted Rate",
          xConfig: {
            title: "Year",
            labelRotation: false
          },
          yConfig: {
            tickFormat: d => formatPercentage(d),
            title: "Occurance"
          },
          confidence: [d => d["Age-Adjusted Rate Lower 95 Percent Confidence Interval"], d => d["Age-Adjusted Rate Upper 95 Percent Confidence Interval"]],
          confidenceConfig: {
            fillOpacity: 0.2
          },
          tooltipConfig: {tbody: [["Value", d => formatPercentage(d["Age-Adjusted Rate"])]]}
        }}
        dataFormat={resp => resp.data}
        />
      </SectionColumns>
    );
  }
}

Cancer.defaultProps = {
  slug: "cancer"
};

Cancer.need = [
  fetchData("sortedCancerTypes", "/api/data?measures=Count&drilldowns=Cancer%20Site&Year=all&order=Count&sort=desc", d => {
    const cancerList = [];
    nest().key(d => d["Cancer Site"]).entries(d.data).forEach(group => cancerList.push(group.key));
    return cancerList;
  })
];

const mapStateToProps = state => ({
  sortedCancerTypes: state.data.sortedCancerTypes
});

export default connect(mapStateToProps)(Cancer);
