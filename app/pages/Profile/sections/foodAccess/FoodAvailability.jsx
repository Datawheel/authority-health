import React from "react";
import {connect} from "react-redux";
import {format} from "d3-format";
import {Pie} from "d3plus-react";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Disclaimer from "components/Disclaimer";
import Glossary from "components/Glossary";
import Stat from "components/Stat";
import {updateSource} from "utils/helper";
import SourceGroup from "components/SourceGroup";

const commas = format(",d");

const definitions = [
  {term: "Full Service Restaurants", definition: "Full service restaurants are establishments with a relatively broad menu along with table, counter and/or booth service and a wait staff. These establishments offer meals and snacks for immediate consumption primarily on-premise, though they may also offer takeout service."},
  {term: "Fast-Food Restaurants", definition: "Fast-food restaurant are establishments whose patrons generally order or select items and pay before eating. Food and drink may be consumed on premises, taken out, or delivered to customers' locations."}
];

class FoodAvailability extends SectionColumns {

  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      foodStores: this.props.foodStores
    };
  }

  componentDidMount() {
    this.setState({sources: updateSource(this.state.foodStores.source, this.state.sources)});
  }

  render() {
    const {meta, foodStores} = this.props;
    const isFoodStoreDataAvailableForCurrentGeography = foodStores.source[0].substitutions.length === 0;

    const storeTypes = ["Farmers' markets", "Convenience stores", "Grocery stores", "Specialized food stores", "Supercenters and club stores"];
    const restaurantTypes = ["Fast-food restaurants", "Full-service restaurants"];
    const data = [];
    storeTypes.map(storeType => {
      const result = foodStores.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue["Sub-category"] !== null && currentValue["Sub-category"] === storeType) {
          return Object.assign({}, currentValue, {Group: "Stores"});
        }
        return acc;
      }, null);
      data.push(result);
    });
    restaurantTypes.map(restaurantType => {
      const result = foodStores.data.reduce((acc, currentValue) => {
        if (acc === null && currentValue["Sub-category"] !== null && currentValue["Sub-category"] === restaurantType) {
          return Object.assign({}, currentValue, {Group: "Restaurants"});
        }
        return acc;
      }, null);
      data.push(result);
    });

    const topStore = data.sort((a, b) => b["Number of Food Stores"] - a["Number of Food Stores"])[0];

    return (
      <SectionColumns>
        <SectionTitle>Food Availability</SectionTitle>
        <article>
          <Stat
            title={"most number of food store available"}
            year={topStore.Year}
            value={titleCase(topStore["Sub-category"])}
            qualifier={`${commas(topStore["Number of Food Stores"])} in ${topStore.Geography}`}
          />
          <p>In {topStore.Year}, the most available food stores in {topStore.Geography} were {topStore["Sub-category"].toLowerCase()} ({commas(topStore["Number of Food Stores"])}) out of all food store types.</p>
          <p>The chart here shows the share of fast-food restaurants, full-service restaurants, convenience stores, grocery stores, specialized food stores, supercenters and farmers market in {meta.name}.</p>

          {!isFoodStoreDataAvailableForCurrentGeography &&
            <Disclaimer>Data is shown for {topStore.Geography}</Disclaimer>
          }
          <SourceGroup sources={this.state.sources} />
          <Glossary definitions={definitions} />
          <Contact slug={this.props.slug} />
        </article>

        {/* Draw a Pie chart to show types of stores and restaurants. */}
        <Pie config={{
          data,
          groupBy: ["Group", "Sub-category"],
          label: d => d["Sub-category"] instanceof Array ? titleCase(d.Group) : titleCase(d["Sub-category"]),
          height: 400,
          value: d => d["Number of Food Stores"],
          tooltipConfig: {tbody: [["Count", d => `${commas(d["Number of Food Stores"])} in ${d.Year}`], ["County", d => d.Geography]]}
        }}
        />
      </SectionColumns>
    );
  }
}

FoodAvailability.defaultProps = {
  slug: "food-availability"
};

FoodAvailability.need = [
  fetchData("foodStores", "/api/data?measures=Number of Food Stores&drilldowns=Sub-category&Geography=<id>&Year=all") // get all year data since we have different year data for different stores.
];

const mapStateToProps = state => ({
  meta: state.data.meta,
  foodStores: state.data.foodStores
});

export default connect(mapStateToProps)(FoodAvailability);
