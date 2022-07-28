import React,{useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import * as AM_STYLES from '../helper/map-style';
import L from "leaflet";
import incident from '../../../../public/incidents.json';
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
        layer.on('click', function(e){
            layer.bindPopup(AM_STYLES.renderIncidentPopup(feature), { maxWidth: 600 })
                .openPopup()
                ._popup._closeButton.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    };
    return(
        <DataLayer data={data} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );

};

export default IncidentLayer;