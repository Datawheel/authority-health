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
        Zip region definition here.
      </p>;

    return (
      <Tooltip className={Classes.TOOLTIP_INDICATOR} tooltipClassName="definition-tooltip" content={zipRegionDefinition}>
        { text } 
      </Tooltip>
    );
  }
}

export default ZipRegionDefinition;
