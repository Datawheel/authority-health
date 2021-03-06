import React, {Component} from "react";
import {connect} from "react-redux";
import "./Options.css";

import {select} from "d3-selection";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import axios from "axios";
import {saveElement} from "d3plus-export";
import {strip} from "d3plus-text";

import {Button, Dialog, Icon, NonIdealState, Spinner, Tab2, Tabs2} from "@blueprintjs/core";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import "@blueprintjs/table/dist/table.css";

const filename = str => strip(str.replace(/<[^>]+>/g, ""))
  .replace(/^\-/g, "")
  .replace(/\-$/g, "");

const getBackground = elem => {

  // Is current element's background color set?
  const color = select(elem).style("background-color");
  if (color !== "rgba(0, 0, 0, 0)" && color !== "transparent") return color;

  // if not: are you at the body element?
  if (elem === document.body) return "white";
  else return getBackground(elem.parentNode);

};

class Options extends Component {

  constructor(props) {
    super(props);
    this.state = {
      imageProcessing: false,
      loading: false,
      openDialog: false,
      results: props.data instanceof Array ? props.data : false
    };
  }

  componentDidUpdate(prevProps) {
    const {data} = this.props;
    if (prevProps.data !== data) {
      this.setState({results: data instanceof Array ? data : false});
    }
  }

  onCSV() {
    const {title} = this.props;
    const {results} = this.state;

    const colDelim = ",";
    const rowDelim = "\r\n";

    const columns = Object.keys(results[0]);
    let csv = columns.map(val => `\"${val}\"`).join(colDelim);

    for (let i = 0; i < results.length; i++) {
      const data = results[i];

      csv += rowDelim;
      csv += columns.map(key => {

        const val = data[key];

        return typeof val === "number" ? val
          : val ? `\"${val}\"` : "";

      }).join(colDelim);

    }

    const zip = new JSZip();
    zip.file(`${filename(title)}.csv`, csv);
    zip.generateAsync({type: "blob"})
      .then(content => saveAs(content, `${filename(title)}.zip`));

  }

  onSave(type) {
    const {title} = this.props;
    let node = this.getNode();
    if (node) {
      this.setState({imageProcessing: true});
      if (type === "svg") node = select(node).select("svg").node();
      const background = getBackground(node);
      saveElement(node,
        {filename: filename(title), type},
        {background, callback: () => this.setState({imageProcessing: false})}
      );
    }
  }

  getNode() {
    const {component, componentKey} = this.props;
    if (component[componentKey]) {
      const elem = component[componentKey];
      return elem.nodeType ? elem : elem.container || elem._reactInternalInstance._renderedComponent._hostNode;
    }
    else return false;
  }

  onBlur() {
    this.input.blur();
  }

  onFocus() {
    this.input.select();
  }

  toggleDialog(slug) {
    const {openDialog} = this.state;
    const {transitionDuration} = this.props;

    this.setState({openDialog: slug});
    const {results, loading} = this.state;
    if (slug === "view-table" && !results && !loading) {
      const {data, dataFormat} = this.props;
      this.setState({loading: true});
      axios.get(data)
        .then(resp => {
          const results = dataFormat(resp.data);
          this.setState({loading: false, results});
        });
    }

    if (slug) {
      setTimeout(() => {
        document.getElementById(`pt-tab-title_undefined_${slug}`).focus();
      }, transitionDuration);
    }
    else {
      setTimeout(() => {
        document.getElementById(`options-button-${this.props.slug}-${openDialog}`).focus();
      }, transitionDuration);
    }

  }

  onBlur(ref) {
    this[ref].blur();
  }

  onFocus(ref) {
    this[ref].select();
  }

  render() {

    const {imageProcessing, openDialog, results} = this.state;
    const {data, location, slug, transitionDuration} = this.props;

    const node = this.getNode();
    const svgAvailable = node && select(node).select("svg").size() > 0;

    const ImagePanel = () => imageProcessing
      ? <div className="pt-dialog-body save-image">
        <NonIdealState title="Generating Image" visual={<Spinner />} />
      </div>
      : <div className="pt-dialog-body save-image">
        <div className="save-image-btn" onClick={this.onSave.bind(this, "png")} tabIndex={0}>
          <Icon iconName="media" />PNG
        </div>
        {svgAvailable && <div className="save-image-btn" onClick={this.onSave.bind(this, "svg")} tabIndex={0}>
          <Icon iconName="code-block" />SVG
        </div>}
      </div>;

    const columns = results ? Object.keys(results[0]).filter(d => d.indexOf("ID ") === -1 && d.indexOf("Slug ") === -1) : [];

    const columnWidths = columns.map(key => {
      if (key === "Year") return 60;
      else if (key.includes("Year")) return 150;
      else if (key.includes("ID ")) return 120;
      else return 150;
    });

    const renderCell = (rowIndex, columnIndex) => {
      const key = columns[columnIndex];
      const val = results[rowIndex][key];
      return <Cell wrapText={true}>{ val }</Cell>;
    };

    const DataPanel = () => results
      ? <div className="pt-dialog-body view-table">
        <div className="horizontal download">
          <button type="button" className="pt-button pt-icon-download pt-minimal" onClick={this.onCSV.bind(this)}>
            Download as CSV
          </button>
          { typeof data === "string" && <input type="text" ref={input => this.dataLink = input} onClick={this.onFocus.bind(this, "dataLink")} onMouseLeave={this.onBlur.bind(this, "dataLink")} readOnly="readonly" value={`${location.origin}${data}`} /> }
        </div>
        <div className="table" tabIndex={0} onFocus={() => document.getElementById("pt-tab-title_undefined_view-table").focus()}>
          <Table
            allowMultipleSelection={false}
            columnWidths={columnWidths}
            fillBodyWithGhostCells={false}
            isColumnResizable={false}
            isRowResizable={false}
            numRows={ results.length }
            rowHeights={results.map(() => 40)}
            selectionModes={SelectionModes.NONE}
            transitionDuration={transitionDuration}>
            { columns.map(c => <Column id={ c } key={ c } name={ c } renderCell={ renderCell } />) }
          </Table>
        </div>
      </div>
      : <div className="pt-dialog-body view-table">
        <NonIdealState title="Loading Data" visual={<Spinner />} />
      </div>;

    return <div className="Options">

      <Button iconName="th" className="option view-table pt-minimal font-xxs" id={`options-button-${slug}-view-table`} onClick={this.toggleDialog.bind(this, "view-table")}>
        View Data
      </Button>

      <Button iconName="export" className="option save-image pt-minimal font-xxs" id={`options-button-${slug}-save-image`} onClick={this.toggleDialog.bind(this, "save-image")}>
        Save Image
      </Button>

      <Dialog className="options-dialog"
        autoFocus={false}
        isOpen={openDialog}
        onClose={this.toggleDialog.bind(this, false)}>
        <Tabs2 onChange={this.toggleDialog.bind(this)} selectedTabId={openDialog}>
          <Tab2 id="view-table" title="View Data" panel={<DataPanel />} />
          <Tab2 id="save-image" title="Save Image" panel={<ImagePanel />} />
          <button aria-label="Close" className="close-button pt-dialog-close-button pt-icon-small-cross" onClick={this.toggleDialog.bind(this, false)}></button>
        </Tabs2>
      </Dialog>

    </div>;

  }
}

Options.defaultProps = {
  componentKey: "viz",
  transitionDuration: 100
};

export default connect(state => ({
  location: state.location
}))(Options);
