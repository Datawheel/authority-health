import React, {Component} from "react";
import {Tooltip} from "@blueprintjs/core";
import "./SourceGroup.css";

export default class SourceGroup extends Component {

  render() {
    const {sources} = this.props;

    return <p className="source-group">
      <span className="source-group-icon pt-icon pt-icon-info-sign" />
      <span className="source-group-text font-xxs">
        {sources && sources.length
          ? "Data provided by "
          : "Loading sources..."
        }
        {sources && sources.length
          ? sources.map((source, i) => {

            const {
              dataset_link: datasetLink,
              source_description: orgDesc,
              source_name: org
            } = source;

            let orgName = org && `the ${org.replace(/^(T|t)he\s/g, "")}`;
            orgName = orgName.replace("the Feeding America", "Feeding America");

            return <span key={i} className="source-item">
              { i && i === sources.length - 1 ? <span> and</span> : null }
              { org && <Tooltip content={orgDesc} className={orgDesc ? "active" : ""} tooltipClassName="source-group-tooltip" disabled={!orgDesc}>
                { datasetLink && orgName ? <a className="link" href={datasetLink} target="_blank" rel="noopener noreferrer" dangerouslySetInnerHTML={{__html: orgName}} /> : <span dangerouslySetInnerHTML={{__html: orgName}} /> }
              </Tooltip> }
              { i < sources.length - 2 && <span>,</span> }
              {i === sources.length - 1 && <span>.</span>}
            </span>;
          })
          : null
        }
      </span>
    </p>;
  }

}
