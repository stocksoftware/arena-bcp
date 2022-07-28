import React,{useEffect, useState} from 'react';
import DataLayer from "./dataLayer";
import * as AM_STYLES from '../helper/map-style';
import L from "leaflet";
import incident from '../asset/incidents.json';
const IncidentLayer = () => {
    const [data, setData] = useState(null);
    useEffect(() => {
        setData(incident);
    },[]);
    const pointToLayer = function(feature, latlng){
        const marker = L.marker(latlng, { icon: AM_STYLES.getIconForIncident(feature) });
        return marker;
    };
    const onEachFeature = function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(AM_STYLES.renderIncidentPopup(feature), { maxWidth: 600 });
        }
    };
    return(
        <DataLayer data={data} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );

};

export default IncidentLayer;