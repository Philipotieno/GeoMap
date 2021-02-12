import React, { Component } from "react";
import OlMap from "ol/Map";
import ScaleLine from "ol/control/ScaleLine";
import Zoom from "ol/control/Zoom";
import Rotate from "ol/control/Rotate";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import OlSourceOSM from "ol/source/OSM.js";
import LayerGroup from "ol/layer/Group";
import VectorLayer from "ol/layer/Vector";
import "ol/ol.css";
import "ol-geocoder/dist/ol-geocoder.css";
import { register } from "ol/proj/proj4";
import VectorSource from "ol/source/Vector";
import proj4 from "proj4";
import "./style.css";
import Geolocation from "ol/Geolocation";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

class MapComponent extends Component {
  constructor(props) {
    super(props);

    // this.state = { center: [4104903.0, -140900.0], zoom: 10 };
    this.state = { center: [257671, 9857706], zoom: 10 };
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
        projection: "EPSG:32737",
      }),
    });
  }

  updateMap() {
    this.olmap.getView().setCenter(this.state.center);
    this.olmap.getView().setZoom(this.state.zoom);
    // this.olmap.addControl(this.layerSwitcher);
  }

  componentDidMount() {
    this.olmap.setTarget("map");
    let highlightStyle = new Style({
      fill: new Fill({
        color: "rgba(255,255,255,0.7)",
      }),
      stroke: new Stroke({
        color: "#f40c80",
        width: 3,
      }),
    });

    let geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: "EPSG:32737",
    });

    function el(id) {
      return document.getElementById(id);
    }

    el("track").addEventListener("click", function () {
      // console.log("rdtfyghjkhsfeawfertrtretrtrtr")
      geolocation.setTracking(true);
    });
    // handle geolocation error.
    geolocation.on("error", function (error) {
      var info = document.getElementById("info");
      info.innerHTML = error.message;
      info.style.display = "";
    });

    let accuracyFeature = new Feature();
    geolocation.on("change:accuracyGeometry", function () {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    let positionFeature = new Feature();
    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 18,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
      })
    );

    geolocation.on("change:position", function () {
      let coordinates = geolocation.getPosition();
      // console.log("--------------",coordinates)
      positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
    });

    new VectorLayer({
      map: this.olmap,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature],
      }),
    });
    // console.log(geolocation.getPosition());
    document.getElementById("track").onclick = function () {
      // this.getView().setZoom(this.getView().getZoom() + 2);
      console.log("-------------------------------");
    };
  }

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
          <div htmlFor="track">
            <span
              id="track"
              className="material-icons"
              // onClick={this.handleClick}
            >
              gps_fixed
            </span>
          </div>

          <span className="material-icons">share</span>
          <a id="export-png" download="map.png">
            <i className="material-icons">download</i>
          </a>
        </div>
        <div id="info" style={{ display: "none" }}></div>
        <span id="status"></span>
        <div
          id="map"
          className="map"
          style={{
            width: "100%",
            height: "97%",
            position: "absolute",
            // marginBottom: "20%",
            // top:"12%"
          }}
        ></div>
        <div style={{ position: "fixed", bottom: "0", width: "100%" }}>
        </div>
      </div>
    );
  }
}

export default MapComponent;
