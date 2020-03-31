import React, {Component} from "react";
import {connect} from "react-redux";
import contacts from "utils/contacts";
import "./Contact.css";

import {Button, Dialog} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";

const title = "Community Resources";
const icon = "geosearch";

class Contact extends Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  render() {

    const {meta, stats, slug} = this.props;
    const {open} = this.state;
    const toggle = this.toggleDialog.bind(this);

    const data = contacts.find(d => d.slug === slug);

    if (!data) return null;
    const topic = slug
      .replace(/\-/g, " ")
      .replace(" by demographic", "")
      .replace(" prevalence", "")
      .replace("occurance by ", "")
      .replace("cancer site", "cancer")
      .replace(" demographics", "")
      .replace("health center", "health centers")
      .replace("homeless", "homelessness")
      .replace("disability status", "disabilities");
    const tooltip = `Community resources for ${topic} can be found here.`;
    let city = "Detroit";
    if (meta.level === "place") city = meta.name;
    if (meta.level === "tract") city = stats.tractToPlace[meta.id] || city;
    if (meta.level === "zip") city = stats.zipToPlace[meta.id] || city;

    return (
      <div className="contact section-popover-button">
        <Tooltip2 className="contact-container" tooltipClassName="contact-tooltip" content={ tooltip }>
          <Button className="contact-button pt-minimal font-xxs" text={title} iconName={icon} onClick={toggle} />
        </Tooltip2>
        <Dialog className="contact-dialog" title={title} iconName={icon} isOpen={open} onClose={toggle}>
          <div className="pt-dialog-body">
            <iframe className="tic-iframe" src={data.embed.replace("Detroit", city)} />
          </div>
        </Dialog>
      </div>
    );
  }
}

export default connect(state => ({
  meta: state.data.meta,
  stats: state.data.topStats
}))(Contact);
