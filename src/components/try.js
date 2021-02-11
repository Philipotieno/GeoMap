import React, { Component } from "react";
import OlMap from "ol/Map";
import ScaleLine from "ol/control/ScaleLine";
import Zoom from "ol/control/Zoom";
import Rotate from "ol/control/Rotate";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import OlSourceOSM from "ol/source/OSM.js";
import LayerGroup from "ol/layer/Group";
import "ol/ol.css";
import "ol-geocoder/dist/ol-geocoder.css";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import { register } from "ol/proj/proj4";
import { fromLonLat } from "ol/proj";
import proj4 from "proj4";
// import "./style.css";

class MapComponent extends Component {
  constructor(props) {
    super(props);

    this.state = { center: [4107903.0, -149900.0], zoom: 10 };
    // this.getCoords = this.getCoords.bind(this)
    // this.handleClick = this.handleClick.bind(this)

    this.resolutions = new Array(22);
    this.matrixIds = new Array(22);

    for (let z = 0; z < 22; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      this.matrixIds[z] = "EPSG:32737:" + z;
    }
    //Registering the EPSG:32737 Projection
    proj4.defs(
      "EPSG:32737",
      "+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs"
    );
    register(proj4);

    this.olmap = new OlMap({
      target: null,
      controls: [
        new ScaleLine({
          className: "ol-scale-line",
          steps: 8,
          minWidth: 180,
        }),
        new Zoom({
          delta: 0.5,
        }),
        new Rotate({
          label: "⮙",
          autoHide: false,
          tipLabel: "Seek North",
        }),
      ],
      layers: [
        new LayerGroup({
          title: "Base maps",
          layers: [
            new OlLayerTile({
              title: "Standard",
              visible: true,
              source: new OlSourceOSM(),
            }),
          ],
        }),
      ],
      view: new OlView({
        center: this.state.center,
        zoom: this.state.zoom,
      }),
    });
  }

  updateMap() {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
    // this.olmap.addControl(this.layerSwitcher);
  }

//   componentDidMount() {
//     this.olmap.setTarget("map");
//     let highlightStyle = new Style({
//       fill: new Fill({
//         color: "rgba(255,255,255,0.7)",
//       }),
//       stroke: new Stroke({
//         color: "#f40c80",
//         width: 3,
//       }),
//     });
//   }

//   handleClick = (e) => {
//     navigator.geolocation.getCurrentPosition(locationSuccess);

//     const locationSuccess = (position) => {
//       let lat = position.coords.latitude;
//       let long = position.coords.longitude;
//       let coordinates = [long, lat];

//       console.log(fromLonLat(coordinates));
//       let curLocation = fromLonLat(coordinates);
//       this.setState({ center: curLocation });
//     };
//     // this.setState({center: curLocation })
//   };

  shouldComponentUpdate(nextProps, nextState) {
    let center = this.olmap.getView().getCenter();
    let zoom = this.olmap.getView().getZoom();
    if (center === nextState.center && zoom === nextState.zoom) return false;
    return true;
  }
  render() {
    this.updateMap();
    return (
      <div>
        <div className="control-icons">
          <span
            id="current-location"
            className="material-icons"
            onClick={this.handleClick}
          >
            gps_fixed
          </span>
          <span className="material-icons">share</span>
          <a id="export-png" download="map.png">
            <i className="material-icons">download</i>
          </a>
        </div>
        <span id="status"></span>
        <div
          id="map"
          style={{
            width: "100%",
            height: "85%",
            position: "absolute",
            // marginBottom: "20%",
            // top:"12%"
          }}
        ></div>

        <div style={{ position: "fixed", bottom: "0", width: "100%" }}></div>
      </div>
    );
  }
}

export default MapComponent;
