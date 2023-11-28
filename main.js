import GPX from "ol/format/GPX.js";
import VectorSource from "ol/source/Vector.js";
import "./style.css";
import { Map, View } from "ol";
import { Control } from "ol/control.js";
import { defaults } from "ol/control/defaults";
import { Style, Text, Fill, Stroke, RegularShape } from "ol/style.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj.js";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { circular } from "ol/geom/Polygon";
import gpxURL from "./favorites-Repères d'urgence.gpx";

const sainteAdeleLonLat = [-74.1622253, 45.9522908];

const style = [
  new Style({
    image: new RegularShape({
      fill: new Fill({ color: "yellow" }),
      stroke: new Stroke({ color: "black" }),
      points: 4,
      radius: 20,
    }),
  }),
  new Style({
    text: new Text(),
  }),
];

const vector = new VectorLayer({
  source: new VectorSource({
    url: gpxURL,
    format: new GPX(),
  }),
  style: function (feature) {
    style[1].getText().setText(feature.get("name"));
    return style;
  },
});
const tile = new TileLayer({
  source: new OSM(),
});
const source = new VectorSource();
const geoloc = new VectorLayer({
  source: source,
});

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: true,
    };
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function geolocateMe() {
  const pos = await getCurrentPosition();
  const coords = [pos.coords.longitude, pos.coords.latitude];
  const accuracy = circular(coords, pos.coords.accuracy);
  source.clear(true);
  source.addFeatures([
    new Feature(accuracy.transform("EPSG:4326", map.getView().getProjection())),
    new Feature(new Point(fromLonLat(coords))),
  ]);
  map.getView().fit(source.getExtent(), {
    maxZoom: 16,
    duration: 500,
  });
}

const locate = document.getElementById("locate");
locate.addEventListener("click", geolocateMe);

const controls = defaults();
controls.extend([
  new Control({
    element: locate,
  }),
]);

const map = new Map({
  target: "map",
  layers: [tile, geoloc, vector],
  controls: controls,
  view: new View({
    center: fromLonLat(sainteAdeleLonLat),
    zoom: 16,
  }),
});
