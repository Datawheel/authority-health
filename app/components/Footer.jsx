import React, {Component} from "react";
import {Link} from "react-router";
import "./Footer.css";

export default class Footer extends Component {

  render() {

    // explore link array
    const exploreLinks = [
      {title: "Locations", link: "/profiles/places"},
      {title: "Map", link: "/map"}
    ];
    // about link array
    const aboutLinks = [
      {title: "Background", link: "/about/background"},
      {title: "Data sources", link: "/about/data-sources"},
      {title: "Glossary", link: "/about/glossary"},
      {title: "Terms of use", link: "/about/terms-of-use"}
    ];

    // loop through arrays and create corresponding list items
    const exploreLinkItems = exploreLinks.map(exploreLink =>
      <li className="footer-nav-item" key={exploreLink.title}>
        <Link className="footer-nav-link title font-xs" to={exploreLink.link}>
          {exploreLink.title}
        </Link>
      </li>
    );
    // loop through arrays and create corresponding list items
    const aboutLinkItems = aboutLinks.map(aboutLink =>
      <li className="footer-nav-item" key={aboutLink.title}>
        <Link className="footer-nav-link title font-xs" to={aboutLink.link}>
          {aboutLink.title}
        </Link>
      </li>
    );


    // about link array
    const footerLogos = [
      {
        title: "Authority Health",
        link: "http://authorityhealth.org/",
        src: "authority-health-logo",
        svg: true
      },
      {
        title: "Wayne County, Michigan",
        link: "http://waynecounty.com/",
        src: "wayne-county-seal",
        svg: false
      },
      {
        title: "Datawheel",
        link: "http://datawheel.us",
        src: "datawheel-logo",
        svg: true
      }
    ];

    // loop through arrays and create corresponding logos
    const footerLogoItems = footerLogos.map(footerLogo =>
      <li className="footer-logo-item" key={footerLogo.title}>
        <a className="footer-logo-link" href={footerLogo.link} target="_blank" rel="noopener noreferrer">
          <img className="footer-logo-img" src={`/images/logos/${footerLogo.src}-pacific.png`} srcSet={
            footerLogo.svg
              ? `/images/logos/${footerLogo.src}-pacific.svg 1x`
              : `/images/logos/${footerLogo.src}-pacific.png 1x, /images/logos/${footerLogo.src}-pacific@2x.png 2x`
          } alt=""/>
          <span className="u-visually-hidden">{footerLogo.title}</span>
        </a>
      </li>
    );

    return (
      <footer className="footer dark-theme">
        <div className="footer-inner section-container">
          {/* nav */}
          <nav className="footer-nav" role="nav">
            <div className="footer-nav-inner">
              <h3>Explore</h3>
              <ul className="footer-nav-list u-list-reset">
                { exploreLinkItems }
              </ul>
            </div>
            <div className="footer-nav-inner">
              <h3>About</h3>
              <ul className="footer-nav-list u-list-reset">
                { aboutLinkItems }
              </ul>
            </div>
          </nav>
          {/* logos */}
          <ul className="footer-logo-list u-list-reset" role="contentinfo">
            { footerLogoItems }
          </ul>
        </div>
      </footer>
    );
  }
}
