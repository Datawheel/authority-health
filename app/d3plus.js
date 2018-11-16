import styles from "style.yml";

/**
  The object exported by this file will be used as a base config for any
  d3plus-react visualization rendered on the page.
*/

const typeface = "Lato, sans-serif";
const defaultFontColor = styles["dark-3"];
const headingFontColor = styles.black;
const fontSizeSm = 12;
const fontSizeLg = 18;

// shared styles for y & x axis
const axisConfig = {
  // main bar lines
  barConfig: {
    "stroke": styles["dark-1"],
    "stroke-width": 1
  },
  // secondary grid lines
  gridConfig: {
    "stroke": styles["light-3"],
    "stroke-width": 0.5
  },
  // axis title labels
  titleConfig: {
    fontFamily: () => typeface,
    fontColor: headingFontColor
  },
  // value labels
  shapeConfig: {
    labelConfig: {
      fontColor: defaultFontColor,
      fontFamily: () => typeface,
      fontMax: fontSizeLg
    }
  },
  // death to ticks
  tickSize: 0
};


// defaults
export default {
  height: 400,
  shapeConfig: {
    fontFamily: () => typeface,
    labelConfig: {
      fontFamily: () => typeface,
      fontMax: fontSizeLg
    },
    // stacked area
    Area: {
      labelConfig: {
        fontColor: styles.white,
        fontFamily: () => typeface,
        fontMax: fontSizeLg
      }
    },
    // line charts
    Line: {
      curve: "catmullRom",
      strokeLinecap: "round",
      strokeWidth: 2
    }
  },
  // legend defaults
  legendConfig: {
    // labels are directly in the shape
    shapeConfig: {
      fontColor: headingFontColor,
      fontFamily: () => typeface,
      fontResize: false,
      maxFont: fontSizeSm,
      height: fontSizeSm,
      width: fontSizeSm,
      // legend icons
      labelConfig: {
        fontColor: defaultFontColor,
        fontFamily: () => typeface
      }
    }
  },
  // timeline defaults
  timelineConfig: {
    brushing: false,
    // handle
    handleConfig: {
      width: 9,
      fill: styles["brand-dark"]
    },
    // main horizontal bar line
    barConfig: {
      stroke: styles["dark-1"],
      opacity: 0.75
    },
    shapeConfig: {
      // ticks and/or button bg
      fill: styles["dark-1"],
      stroke: "none",
      // label and/or button text
      labelConfig: {
        fontColor: defaultFontColor
      }
    }
  },
  // axis defaults (see line 8)
  xConfig: axisConfig,
  yConfig: axisConfig
};
