import React, {Component} from "react";
import "./Disclaimer.css";

export default class Disclaimer extends Component {
  render() {
    const {children} = this.props || "missing `children` in Disclaimer.jsx";

    return (
      <p className="disclaimer">
        <span className="disclaimer-icon pt-icon pt-icon-warning-sign" />
        <span className="disclaimer-text font-xxs">
          {children}
        </span>
      </p>
    );
  }
}
