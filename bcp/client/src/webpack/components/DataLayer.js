import React from 'react';
import {GeoJSON} from "react-leaflet";

const DataLayer = ({data, pointToLayer, onEachFeature}) => {
    return (<GeoJSON data={data} pointToLayer={pointToLayer} key={data !== null} onEachFeature={onEachFeature}/>);
};

export default DataLayer;