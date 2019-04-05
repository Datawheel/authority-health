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
            dataset_description: datasetDesc,
            dataset_link: datasetLink,
            dataset_name: dataset,
            source_description: orgDesc,
            source_link: orgLink,
            source_name: org
          } = source;

          const orgName = org && `the ${org.replace(/^(T|t)he\s/g, "")}`;
          const datasetName = dataset && `${dataset}`;

          return <span key={i} className="source-item">
            { i && i === sources.length - 1 ? <span> and</span> : null }
            { org && <span>&nbsp;</span> }
            { org && <Tooltip content={orgDesc} className={orgDesc ? "active" : ""} tooltipClassName="source-group-tooltip" disabled={!orgDesc}>
              {/* { orgLink ? <a className="link" href={orgLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: orgName}} /> : <span dangerouslySetInnerHTML={{__html: orgName}} /> } */}
              { datasetLink ? <a className="link" href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: orgName}} /> : <span dangerouslySetInnerHTML={{__html: orgName}} /> }
              {/* { datasetLink ? <a className="link" href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: datasetName}} /> : <span dangerouslySetInnerHTML={{__html: datasetName}} /> } */}
            </Tooltip> }
            {/* { dataset && <span>&nbsp;</span> }
            { dataset && <Tooltip content={datasetDesc} className={datasetDesc ? "active" : ""} disabled={!datasetDesc}>
              { datasetLink ? <a className="link" href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: datasetName}} /> : <span dangerouslySetInnerHTML={{__html: datasetName}} /> }
            </Tooltip> } */}
            { i < sources.length - 1 && <span>,</span> }
            {i === sources.length - 1 && <span>.</span>}
          </span>;
        })}
      </span>
    </p>;
  }

}
