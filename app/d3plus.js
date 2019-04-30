import styles from "style.yml";

/**
  The object exported by this file will be used as a base config for any
  d3plus-react visualization rendered on the page.
*/

// create array of category groupings to loop through
const groupings = [
  "Group",
  "Age Group",
  "Race Group",
  "RaceType",
  "SmokingType",
  "Health Insurance coverage:type",
  "Coverage Type",
  "Sex",
  "Gender",
  "Sex of Partner",
  "Responsibility Length",
  "Offense",
  "Rent Amount",
  "Household Income Bucket",
  "Household Income",
  "Level of School",
  "Family type",
  "Period of Service",
  "Type of Crime",
  // Health center demographics
  "American Indian/Alaska Native Health Center Patients",
  "Black Health Center Patients",
  "Hispanic Health Center Patients",
  "Non-white Health Center Patients",
  "White Health Center Patients",
  // smoking status
  "Smoking Status Current",
  "Smoking Status Former",
  "Smoking Status Never"
];

/** function to lookup & assign color scheme */
function colorLogic(d) {

  // console.log(d["Period of Service"]);

  // lookup grouping color schemes in style.yml
  for (const grouping of groupings) {
    if (d[grouping]) {
      // console.log(grouping + ":", d[grouping]);
      // styles[`color-${d[grouping]}`] ? console.log(styles[`color-${d[grouping]}`]) : null;
      return styles[`color-${d[grouping]}`]
        ? styles[`color-${d[grouping]}`]
        : styles["majorelle-dark"];
    }
  }

  // if a visualization is totally purple, it probably doesn't yet have a color scheme assigned
  // else {
  return styles["majorelle-dark"];
  // }
}

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
  shapeConfig: {
    fill: colorLogic,
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
      stroke: colorLogic,
      curve: "catmullRom",
      strokeLinecap: "round",
      strokeWidth: 2
    },
    // keep map locations visible; override in pie charts
    Path: {
      fillOpacity: 0.75
    }
  },
  // prevent map scrolljacking
  zoomScroll: false,
  // map color scale key
  colorScaleConfig: {
    // default to green
    color: [
      styles.white,
      styles["majorelle-light"],
      styles.majorelle,
      styles["majorelle-dark"]
    ],
    // the key itself
    rectConfig: {
      height: 12,
      strokeWidth: 0
    },
    axisConfig: {
      // bar underneath the key
      barConfig: {
        stroke: "transparent",
        strokeWidth: 0
      },
      // death to ticks
      tickSize: 0
    },
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
    // scale type
    scale: "jenks"
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
  innerRadius: 1,
  padPixel: 2,
  // timeline defaults
  timelineConfig: {
    brushing: false,
    buttonHeight: 20,
    buttonPadding: 10,
    // main horizontal bar line
    barConfig: {
      stroke: styles["dark-1"],
      opacity: 0.75
    },
    shapeConfig: {
      // ticks and/or button bg
      fill: styles["light-3"],
      stroke: "none",
      // label and/or button text
      labelConfig: {
        fontColor: defaultFontColor
      }
    }
  },
  titleConfig: {
    fontColor: defaultFontColor,
    fontFamily: () => typeface,
    padding: 0
  },
  totalConfig: {
    fontColor: defaultFontColor,
    fontFamily: () => typeface,
    fontSize: () => fontSizeSm
  },
  // default visualization height
  height: 400,
  // axis defaults (see line 8)
  xConfig: axisConfig,
  yConfig: axisConfig
};
