import React, {Component} from "react";
import {Tooltip} from "@blueprintjs/core";
import "./SourceGroup.css";

export default class SourceGroup extends Component {

  render() {
    const {sources} = this.props;
    if (!sources || !sources.length) return null;

    return <p className="source-group">
      <span className="source-group-icon pt-icon pt-icon-info-sign" />
      <span className="source-group-text font-xxs">
        Data provided by
        { sources.map((source, i) => {

          const {
            dataset_link: datasetLink,
            source_description: orgDesc,
            source_name: org
          } = source;

          const orgName = org && `the ${org.replace(/^(T|t)he\s/g, "")}`;

          return <span key={i} className="source-item">
            { i && i === sources.length - 1 ? <span> and</span> : null }
            { org && <span>&nbsp;</span> }
            { org && <Tooltip content={orgDesc} className={orgDesc ? "active" : ""} tooltipClassName="source-group-tooltip" disabled={!orgDesc}>
              { datasetLink && orgName ? <a className="link" href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: orgName}} /> : <span dangerouslySetInnerHTML={{__html: orgName}} /> }
            </Tooltip> }
            { i < sources.length - 1 && <span>,</span> }
            {i === sources.length - 1 && <span>.</span>}
          </span>;
        })}
      </span>
    </p>;
  }

}
