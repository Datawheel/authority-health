import React, {Component} from "react";
import PropTypes from "prop-types";

import axios from "axios";

import {event, select} from "d3-selection";
import {uuid} from "d3plus-common";

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      id: uuid(),
      results: [],
      userQuery: ""
    };
  }

  onChange(e) {

    const userQuery = e ? e.target.value : "";
    const {limit, searchEmpty, url}  = this.props;

    if (!searchEmpty && userQuery.length === 0) {
      this.setState({active: true, results: [], userQuery});
    }
    else if (url) {
      axios.get(`${url}?q=${userQuery}`)
        .then(res => res.data)
        .then(data => {
          let results = data;
          if (limit) results = results.slice(0, limit);
          this.setState({active: true, results, userQuery});
        });
    }

  }

  onClick(d) {
    const {router} = this.context;
    const {resultLink} = this.props;
    this.setState({active: false});
    router.push(resultLink(d));
  }

  onFocus() {
    this.setState({active: true});
  }

  onToggle() {

    if (this.state.active) {
      this.input.blur();
      this.setState({active: false});
    }
    else this.input.focus();

  }

  componentDidMount() {

    const {primary, searchEmpty} = this.props;
    const {id} = this.state;

    select(document).on(`mousedown.${ id }`, () => {
      if (this.state.active && this.container && !this.container.contains(event.target)) {
        this.setState({active: false});
      }
    });

    select(document).on(`keydown.${ id }`, () => {

      const {router} = this.context;
      const {active} = this.state;
      const key = event.keyCode;
      const DOWN = 40,
            ENTER = 13,
            ESC = 27,
            S = 83,
            UP = 38;

      // override the built-in browser save dialog with a command to focus the search input?
      // if (primary && !active && key === S && !["input", "textarea"].includes(event.target.tagName.toLowerCase()) && !event.target.className.includes("ql-editor")) {
      //   event.preventDefault();
      //   this.onToggle.bind(this)();
      // }
      // else if (active && key === ESC && event.target === this.input) {
      //   event.preventDefault();
      //   this.onToggle.bind(this)();
      // }
      if (active && event.target === this.input) {

        const highlighted = document.querySelector(".highlighted");

        if (key === ENTER && highlighted) {
          this.setState({active: false});
          router.push(highlighted.querySelector("a").href);
        }
        else if (key === DOWN || key === UP) {

          if (!highlighted) {
            if (key === DOWN) document.querySelector(".results > li:first-child").classList.add("highlighted");
          }
          else {

            const results = document.querySelectorAll(".results > li");

            const currentIndex = [].indexOf.call(results, highlighted);

            if (key === DOWN && currentIndex < results.length - 1) {
              results[currentIndex + 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
            else if (key === UP) {
              if (currentIndex > 0) results[currentIndex - 1].classList.add("highlighted");
              highlighted.classList.remove("highlighted");
            }
          }
        }

      }

    }, false);

    if (searchEmpty) this.onChange.bind(this)();

  }

  render() {

    const {
      className,
      icon,
      id,
      inactiveComponent: InactiveComponent,
      placeholder,
      resultRender,
      searchEmpty
    } = this.props;
    const {active, results, userQuery} = this.state;

    return (
      <div ref={comp => this.container = comp} className={ `search-container ${className || ""} ${ active ? "active" : "" }` }>
        { InactiveComponent && <InactiveComponent active={ active } onClick={ this.onToggle.bind(this) } /> }
        <div className={ `pt-input-group pt-fill ${ active ? "active" : "" }` }>
          <input id={id || "search"} type="text" className="pt-input" ref={ input => this.input = input } onChange={ this.onChange.bind(this) } onFocus={ this.onFocus.bind(this) } placeholder={placeholder} autoComplete="off" />
          { icon && <span className="pt-icon pt-icon-search" /> }
        </div>
        { searchEmpty || active && userQuery.length
          ? <ul className={ active ? "results active font-sm" : "results font-sm" }>
            { results.map(result =>
              <li key={ result.id } className="result" onClick={this.onClick.bind(this, result)}>
                { resultRender(result, this.props) }
              </li>
            )}
            { !results.length && <p className="no-results">No Results Found</p> }
          </ul>
          : null }
      </div>
    );

  }
}

Search.contextTypes = {
  router: PropTypes.object
};

Search.defaultProps = {
  className: "search",
  icon: "search",
  inactiveComponent: false,
  limit: 0,
  placeholder: "Search",
  primary: false,
  resultLink: d => d.url,
  resultName: d => d.name,
  resultRender: (d, props) => <span>{ props.resultName(d) }</span>,
  searchEmpty: false,
  url: false
};

export default Search;
