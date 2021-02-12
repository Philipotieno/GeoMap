// import React, { useState, useRef } from "react";
// import OlMap from "ol/Map";
// import ScaleLine from "ol/control/ScaleLine";
// import Zoom from "ol/control/Zoom";
// import Rotate from "ol/control/Rotate";
// import OlView from "ol/View";
// import OlLayerTile from "ol/layer/Tile";
// import OlSourceOSM from "ol/source/OSM.js";
// import LayerGroup from "ol/layer/Group";
// import "ol/ol.css";
// import "ol-geocoder/dist/ol-geocoder.css";
// import Stroke from "ol/style/Stroke";
// import Style from "ol/style/Style";
// import Fill from "ol/style/Fill";
// import { register } from "ol/proj/proj4";
// import { fromLonLat } from "ol/proj";
// import proj4 from "proj4";
// import "./style.css";

// function MapComponent(props) {
//   const [center, setCenter] = useState([4107903.0, -149900.0]);
//   const [zoom, setZoom] = useState(10);

//   // get ref to div element - OpenLayers will render into this div
//   const mapElement = useRef();
//   // OlMap({
//   //   target: null,
//   //   controls: [
//   //     new ScaleLine({
//   //       className: "ol-scale-line",
//   //       steps: 8,
//   //       minWidth: 180,
//   //     }),
//   //     new Zoom({
//   //       delta: 0.5,
//   //     }),
//   //     new Rotate({
//   //       label: "⮙",
//   //       autoHide: false,
//   //       tipLabel: "Seek North",
//   //     }),
//   //   ],
//   //   layers: [
//   //     new LayerGroup({
//   //       title: "Base maps",
//   //       layers: [
//   //         new OlLayerTile({
//   //           title: "Standard",
//   //           visible: true,
//   //           source: new OlSourceOSM(),
//   //         }),
//   //       ],
//   //     }),
//   //   ],
//   //   view: new OlView({
//   //     center: setCenter,
//   //     zoom: setZoom,
//   //   }),
//   // });

//   return (
//     <div>
//       <div className="control-icons">
//         <span id="current-location" className="material-icons">
//           gps_fixed
//         </span>
//         <span className="material-icons">share</span>
//         <span className="material-icons">download</span>
//       </div>
//       <div
//         ref={mapElement}
//         className="map-container"
//         id="map"
//         style={{
//           width: "100%",
//           height: "85%",
//           position: "absolute",
//           // marginBottom: "20%",
//           // top:"12%"
//         }}
//       ></div>
//       <div style={{ position: "fixed", bottom: "0", width: "100%" }}></div>
//     </div>
//   );
// }

// export default MapComponent;

// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';

function MapWrapper(props) {

  // set intial state
  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()

  // pull refs
  const mapElement = useRef()
  
  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {

    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource()
    })

    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        
        // USGS Topo
        new TileLayer({
          source: new XYZ({
            url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
          })
        }),

        // Google Maps Terrain
        /* new TileLayer({
          source: new XYZ({
            url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
          })
        }), */

        initalFeaturesLayer
        
      ],
      view: new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 2
      }),
      controls: []
    })

    // set map onclick handler
    initialMap.on('click', handleMapClick)

    // save map and vector layer references to state
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)

  },[])

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect( () => {

    if (props.features.length) { // may be null on first render

      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )

      // fit map to feature extent (with 100px of padding)
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100,100,100,100]
      })

    }

  },[props.features])

  // map click handler
  const handleMapClick = (event) => {
    
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);

    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

    // set React state
    setSelectedCoord( transormedCoord )
    
  }

  // render component
  return (      
    <div>
      
      <div ref={mapElement} className="map-container"></div>
      
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>

    </div>
  ) 

}

export default MapWrapper