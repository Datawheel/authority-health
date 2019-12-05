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
import Options from "components/Options";

const commas = format(",d");

const definitions = [
  {term: "Full Service Restaurants", definition: "Full service restaurants are establishments with a relatively broad menu along with table, counter and/or booth service and a wait staff. These establishments offer meals and snacks for immediate consumption primarily on-premise, though they may also offer takeout service."},
  {term: "Fast-Food Restaurants", definition: "Fast-food restaurant are establishments whose patrons generally order or select items and pay before eating. Food and drink may be consumed on premises, taken out, or delivered to customers' locations."},
  {term: "Convenience Stores,", definition: "A small grocery store, selling a limited variety of food and nonfood products, typically open extended hours. Customers normally use a convenience store to purchase a few items, whereas grocery stores are used for large, volume purchases. Convenience stores normally have less than 2,500 square feet of total under-roof floor space. Many convenience stores operate gasoline pumps."},
  {term: "Grocery Stores", definition: "A grocery store is a retail shop that primarily sells food. A grocer is a bulk seller of food. Grocery stores also offer non-perishable foods that are packaged in bottles, boxes, and cans; some also have bakeries, butchers, delis, and fresh produce."},
  {term: "Specialized Food Stores", definition: "A foodstore primarily engaged in the retail sale of a single food category such as meat and seafood markets, dairy stores, candy and nut stores, and retail bakeries."},
  {term: "Supercenters", definition: "A large combination supermarket and discount general merchandise store, with grocery products accounting for up to 40 percent of selling area."},
  {term: "Clube Stores", definition: "A membership-based wholesale-retail hybrid outlet, serving both small businesses and individual consumers. Both grocery products (in large and multipack sizes) and a wide variety of general merchandise are offered."},
  {term: "Farmers Market", definition: "A farmers’ market is a common area where several farmers gather on a recurring basis to sell a variety of fresh fruits, vegetables, and other farm products directly to consumers."}
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
    const {foodStores} = this.props;
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
          {!isFoodStoreDataAvailableForCurrentGeography &&
            <Disclaimer>Data is only available for {topStore.Geography}</Disclaimer>
          }
          <Stat
            title={"most common food store"}
            year={topStore.Year}
            value={titleCase(topStore["Sub-category"])}
            qualifier={`${commas(topStore["Number of Food Stores"])} in ${topStore.Geography}`}
          />
          <p>In {topStore.Year}, the most common food store type available in {topStore.Geography} was {topStore["Sub-category"].toLowerCase()} ({commas(topStore["Number of Food Stores"])}).</p>
          <p>The chart here shows the shares of fast-food restaurants, full-service restaurants, convenience stores, grocery stores, specialized food stores, supercenters and farmers markets in {topStore.Geography}.</p>

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
            data={ data }
            title="Chart of Food Availability" />

          {/* Draw a Pie chart to show types of stores and restaurants. */}
          <Pie ref={comp => this.viz = comp } config={{
            data,
            groupBy: ["Group", "Sub-category"],
            label: d => d["Sub-category"] instanceof Array ? titleCase(d.Group) : titleCase(d["Sub-category"]),
            height: 400,
            shapeConfig: {
              Path: {
                fillOpacity: 1
              }
            },
            value: d => d["Number of Food Stores"],
            tooltipConfig: {tbody: [["Count", d => `${commas(d["Number of Food Stores"])} in ${d.Year}`], ["County", d => d.Geography]]}
          }}
          />
        </div>
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
