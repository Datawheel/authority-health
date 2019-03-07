import React from "react";
import {connect} from "react-redux";
import {Treemap} from "d3plus-react";
import {titleCase} from "d3plus-text";

import {fetchData, SectionColumns, SectionTitle} from "@datawheel/canon-core";

import Contact from "components/Contact";
import Stat from "components/Stat";

class FoodAvailability extends SectionColumns {

  render() {
    const {meta} = this.props;

    return (
      <SectionColumns>
        <SectionTitle>Food Availability</SectionTitle>
        <article>
          <p>Full Service Restaurants are establishments with a relatively broad menu along with table, counter and/or booth service and a wait staff. These establishments offer meals and snacks for immediate consumption primarily on-premise, though they may also offer takeout service.</p>
          <p>Fast-food restaurant are establishments whose patrons generally order or select items and pay before eating. Food and drink may be consumed on premises, taken out, or delivered to customers' locations.</p>
          <p>The chart here shows the share of fast-food restaurants, full-service restaurants, convenience stores, grocery stores, specialized food stores, supercenters and farmers market in {meta.name}.</p>
          <Contact slug={this.props.slug} />
        </article>

        {/* Draw a Treemap to show types of stores and restaurants. */}
        <Treemap config={{
          data: `/api/data?measures=Number of Food Stores&drilldowns=Sub-category&Geography=${meta.id}&Year=all`,
          groupBy: ["Group", "Sub-category"],
          label: d => d["Sub-category"] instanceof Array ? titleCase(d.Group) : titleCase(d["Sub-category"]),
          height: 400,
          sum: d => d["Number of Food Stores"],
          tooltipConfig: {tbody: [["Count", d => `${d["Number of Food Stores"]} in ${d.Year}`], ["County", d => d.Geography]]}
        }}
        dataFormat={resp => {
          // Find and return an array of objects for the latest year data for each store type and restaurant type.
          const storeTypes = ["Farmers' markets", "Convenience stores", "Grocery stores", "Specialized food stores", "Supercenters and club stores"];
          const restaurantTypes = ["Fast-food restaurants", "Full-service restaurants"];
          const data = [];
          storeTypes.map(storeType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue["Sub-category"] !== null && currentValue["Sub-category"] === storeType) {
                return Object.assign({}, currentValue, {Group: "Stores"});
              }
              return acc;
            }, null);
            data.push(result);
          });
          restaurantTypes.map(restaurantType => {
            const result = resp.data.reduce((acc, currentValue) => {
              if (acc === null && currentValue["Sub-category"] !== null && currentValue["Sub-category"] === restaurantType) {
                return Object.assign({}, currentValue, {Group: "Restaurants"});
              }
              return acc;
            }, null);
            data.push(result);
          });
          return data;
        }}
        />
      </SectionColumns>
    );
  }
}

FoodAvailability.defaultProps = {
  slug: "food-availability"
};

const mapStateToProps = state => ({
  meta: state.data.meta
});

export default connect(mapStateToProps)(FoodAvailability);
