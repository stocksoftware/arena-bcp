import React, {useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import {
    iconForEquipmentAvailability,
    iconForAircraftAvailability,
    buildPopUpAvailability, renderAvailabilityPopup
} from "../helper/map-style";
import {observer} from "mobx-react";
import {filterAvailabilityData} from '../helper/toGeoJSON';
import '../css/thirdparty/leaflet.label.css';
import * as L from "leaflet";

const AvailabilityLayer = observer(({assetMode}) => {
    const [availableAsset, setAvailableAsset] = useState(null);
    useEffect(() => {
        filterAvailabilityData(setAvailableAsset,assetMode )
    }, []);
    const pointToLayer = function (feature, latlng) {
        const icon = feature.properties.is_equipment ?
            iconForEquipmentAvailability(feature.properties.event_type) :
            iconForAircraftAvailability(feature.properties.event_type);
        return L.marker(latlng, { icon: icon, zIndexOffset: 30 });
    };

    const onEachFeature = function (feature, layer) {
        layer.on('click', function (e) {
            layer.bindPopup(renderAvailabilityPopup(feature, assetMode, availableAsset), {maxWidth: 600})
                .openPopup()
                ._popup._closeButton.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    };
    return (
        <DataLayer data={availableAsset} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});

export default AvailabilityLayer;