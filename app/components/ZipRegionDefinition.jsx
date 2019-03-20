import React, {Component} from "react";
import {Classes, Tooltip} from "@blueprintjs/core";
import "./Definition.css";

class ZipRegionDefinition extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {text} = this.props;

    const zipRegionDefinition = 
      <p>
        Based on geographical contiguity and knowledge of Detroit and Wayne County communities, the 73 zip codes were combined into 27 communities to address sample size issues. Variation between measures by community was also taken into account, to avoid watering down estimates by grouping geographies with disparate estimates. In six cases, the zip code had a large enough sample to stand on its own; in others, between two and seven zip codes were combined.
      </p>;

    return (
      <Tooltip className={Classes.TOOLTIP_INDICATOR} tooltipClassName="definition-tooltip" content={zipRegionDefinition}>
        { text } 
      </Tooltip>
    );
  }
}

export default ZipRegionDefinition;
