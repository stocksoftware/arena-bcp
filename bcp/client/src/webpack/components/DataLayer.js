import React from 'react';
import {GeoJSON} from "react-leaflet";

const DataLayer = ({data, pointToLayer, onEachFeature, filter}) => {
    return (
        <GeoJSON filter={filter} data={data} pointToLayer={pointToLayer}
                 key={data !== null} onEachFeature={onEachFeature}/>);
};

export default DataLayer;