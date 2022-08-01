import React,{useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import * as AM_STYLES from '../helper/map-style';
import L from "leaflet";
import {fetchIncidentGeoJSON} from '../helper/toGeoJSON';
const IncidentLayer = () => {
    const [incidentGeoJSON, setIncidentGeoJSON] = useState(null);
    useEffect(() => {
        fetchIncidentGeoJSON().then(setIncidentGeoJSON) ;
    },[]);
    const pointToLayer = function(feature, latlng){
        return L.marker(latlng, { icon: AM_STYLES.getIconForIncident(feature) });
    };
    const onEachFeature = function (feature, layer) {
        layer.on('click', function(e){
            layer.bindPopup(AM_STYLES.renderIncidentPopup(feature), { maxWidth: 600 });
        });
    };
    return(
        <DataLayer data={incidentGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );

};

export default IncidentLayer;
