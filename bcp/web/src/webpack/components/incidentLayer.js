import React from 'react';
import DataLayer from "./dataLayer";
import * as AM_STYLES from '../helper/arenamap-style';
import L from "leaflet";
import {renderIncidentPopup} from "../helper/arenamap-style";
const IncidentLayer = () => {
    const pointToLayer = function(feature, latlng){
        const marker = L.marker(latlng, { icon: AM_STYLES.getIconForIncident(feature) });
        return marker
    };
    const onEachFeature = function (feature, layer) {
        if (feature.properties) {
            layer.bindPopup(renderIncidentPopup(feature), { maxWidth: 600 });
        }
    }
    const fileName = 'incidents';
    return(
     <DataLayer fileName={fileName} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    )

};

export default IncidentLayer;