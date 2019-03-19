import React, {Component} from "react";
import {Classes, Tooltip} from "@blueprintjs/core";
import "./Definition.css";

class CensusTractDefinition extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    const {text} = this.props;

    const censusTractDefinition = 
      <p>
        Census tracts are small, relatively permanent statistical subdivisions of a county or county equivalent and generally have a population size between 1,200 and 8,000 people, with an optimum size of 4,000 people.
      </p>;

    return (
      <Tooltip className={Classes.TOOLTIP_INDICATOR} tooltipClassName="definition-tooltip" content={censusTractDefinition}>
        { text } 
      </Tooltip>
    );
  }
}

export default CensusTractDefinition;
