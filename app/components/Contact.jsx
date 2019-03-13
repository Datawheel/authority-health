import React, {Component} from "react";
import {connect} from "react-redux";
import contacts from "utils/contacts";
import {nest} from "d3-collection";
import "./Contact.css";

import {Button, Dialog, Icon} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";

const title = "Community Resources";
const icon = "geosearch";

const phoneParse = p => {
  const countryCode = p.indexOf("1") === 0 ? "1" : false;
  if (countryCode) p = p.slice(1);
  const split = p.match(/([A-z0-9]{10})[x]*([0-9]*)\s*\(*([^)]*)\)*/);
  let number = split[1];
  const extension = split[2];
  const subtitle = split[3];
  const h = p.toLowerCase().includes("wellnow") ? 7 : 6;
  number = `${countryCode ? "1-" : ""}${number.slice(0, 3)}-${number.slice(3, h)}-${number.slice(h)}`;
  return {extension, number, subtitle};
};

class Contact extends Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  toggleDialog() {
    this.setState({open: !this.state.open});
  }

  render() {

    const {locations, slug} = this.props;
    const {open} = this.state;
    const toggle = this.toggleDialog.bind(this);

    const data = contacts.filter(d => d.slug === slug && (!d.location || locations.includes(d.location)));

    if (!data.length) return null;

    const agencies = nest()
      .key(d => d.agency)
      .entries(data);

    console.log(this.props);

    return (
      <div className="contact">
        <Tooltip2 className="contact-container" tooltipClassName="contact-tooltip" content={ `Community resources that relate to ${slug.replace(/\-/g, " ")} can be found here.` }>
          <Button className="contact-button" text={title} iconName={icon} onClick={toggle} />
        </Tooltip2>
        <Dialog className="contact-dialog" title={title} iconName={icon} isOpen={open} onClose={toggle}>
          <div className="pt-dialog-body">
            <ul className="agency-list">
              { agencies.map(group => {
                const agency = group.key;
                const contacts = group.values;
                return <li key={agency}>
                  <div className="contact-agency title font-sm">{ agency }</div>
                  <ul className="contact-list">
                    { contacts.map((d, i) => {
                      const {address1, address2, contact, email, subAgency, title} = d;

                      let phone = d.phone;
                      if (!(phone instanceof Array)) phone = [];
                      phone = phone.map(phoneParse);

                      let fax = d.fax;
                      if (!(fax instanceof Array)) fax = [];
                      fax = fax.map(phoneParse);

                      return <li className="contact font-sm" key={i}>
                        { contact && <div className="contact-name"><b>{ contact }</b></div> }
                        { title && <div className="contact-title font-xs"><i>{ title }</i></div> }
                        { subAgency && <div className="contact-subAgency font-xs"><i dangerouslySetInnerHTML={{__html: subAgency}} /></div> }
                        { address1 && address2 && <div className="contact-address font-xs has-icon">
                          <Icon iconName="office" />
                          <span>{ address1 }<br />{ address2 }</span>
                        </div> }
                        { email && <div className="contact-email font-xs has-icon">
                          <Icon iconName="desktop" />
                          <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">{ email }</a>
                        </div> }
                        { phone.map((p, i) => {
                          const {number, extension, subtitle} = p;
                          return <div key={i} className="contact-phone font-xs has-icon">
                            <Icon iconName="phone" />
                            <span>{ number }{ extension ? ` x ${extension}` : null }{ subtitle ? ` (${subtitle})` : null }</span>
                          </div>;
                        }) }
                        { fax.map((p, i) => {
                          const {number, extension, subtitle} = p;
                          return <div key={i} className="contact-fax font-xs has-icon">
                            <Icon iconName="document" />
                            <span>{ number }{ extension ? ` x ${extension}` : null }{ subtitle ? ` (${subtitle} fax)` : " (fax)" }</span>
                          </div>;
                        }) }
                      </li>;
                    }) }
                  </ul>
                </li>;
              }) }
            </ul>
          </div>
        </Dialog>
      </div>
    );
  }
}

export default connect(state => ({
  locations: state.data.topStats.locations
}))(Contact);
