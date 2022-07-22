import React from "react";
import MapStore from "../store/mapStore";

const stores = {};

const mapStore = new MapStore();
stores.mapStore = mapStore;


const storesContext = React.createContext({
  mapStore
});

export default storesContext;
