// src/components/CustomMarkerIcon.tsx
import L from "leaflet";
import pin from "../public/pin.png";   
import here from "../public/here.png";
import alr from "../public/already.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
// Fix Leaflet default icon path issue in Webpack/Parcel/Vite
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
//   iconUrl: require("leaflet/dist/images/marker-icon.png"),
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
// });

export const customIcon = new L.Icon({
  iconUrl: pin,               // your custom image
  iconRetinaUrl: pin,
  iconSize: [35, 35],               // width, height
  iconAnchor: [25, 30],             // point of the icon that corresponds to marker's location
  popupAnchor: [0, -38],            // where the popup opens relative to the iconAnchor
  shadowUrl: markerShadowPng,
  shadowSize: [30, 30],
  shadowAnchor: [18, 30],
});

export const customIconHere = new L.Icon({
  iconUrl: here,               // your custom image
  iconRetinaUrl: here,
  iconSize: [35, 35],               // width, height
  iconAnchor: [25, 30],             // point of the icon that corresponds to marker's location
  popupAnchor: [0, -38],            // where the popup opens relative to the iconAnchor
  shadowUrl: markerShadowPng,
  shadowSize: [30, 30],
  shadowAnchor: [18, 30],
});

export const checkedInIcon = new L.Icon({
  iconUrl: alr,               // your custom image
  iconRetinaUrl: alr,
  iconSize: [35, 35],               // width, height
  iconAnchor: [25, 30],             // point of the icon that corresponds to marker's location
  popupAnchor: [0, -38],            // where the popup opens relative to the iconAnchor
  shadowUrl: markerShadowPng,
  shadowSize: [30, 30],
  shadowAnchor: [18, 30],
});