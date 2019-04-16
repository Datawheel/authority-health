import React, {Component} from "react";
import "./Glossary.css";

import {Button, Dialog} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";

const title = "Glossary";
const icon = "book";

class Glossary extends Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  render() {

    const {definitions} = this.props;
    const {open} = this.state;
    const toggle = this.toggleDialog.bind(this);

    return (
      <div className="glossary section-popover-button">
        <Tooltip2 className="glossary-container" tooltipClassName="glossary-tooltip" content={ "Definitions of some of the terms used here." }>
          <Button className="glossary-button pt-minimal font-xxs" text={title} iconName={icon} onClick={toggle} />
        </Tooltip2>
        <Dialog className="glossary-dialog" title={title} iconName={icon} isOpen={open} onClose={toggle}>
          <div className="pt-dialog-body">
            <ul className="glossary-list">
              { definitions.map(d => {
                const term = d.term;
                const definition = d.definition;
                return <li key={term}>
                  <div className="font-sm">{ term }:</div>
                  <ul className="glossary-definition font-xs has-icon">{definition}</ul>
                </li>;
              }) }
            </ul>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default Glossary;
