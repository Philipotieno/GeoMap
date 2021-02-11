import React, { useState } from "react";
import OlMap from "ol/Map";
import ScaleLine from "ol/control/ScaleLine";
import Zoom from "ol/control/Zoom";
import Rotate from "ol/control/Rotate";
import OlView from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import OlSourceOSM from "ol/source/OSM.js";
import LayerGroup from "ol/layer/Group";

function MapComponent() {
  const [center, setCenter] = useState([4107903.0, -149900.0]);
  const [zoom, setZoom] = useState(10);

  OlMap({
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
      center: setCenter,
      zoom: setZoom,
    }),
  });

  return (
    <div>
      <div>
        <span id="current-location" className="material-icons">
          gps_fixed
        </span>
        <span className="material-icons">share</span>
        <span className="material-icons">download</span>
      </div>
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

export default MapComponent;
