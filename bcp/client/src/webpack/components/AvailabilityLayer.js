import React, {useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import {
    iconForEquipmentAvailability,
    iconForAircraftAvailability,
    buildPopUpAvailability, renderAvailabilityPopup
} from "../helper/map-style";
import {observer} from "mobx-react";
import {filterAvailabilityData, fetchAssetfetchAsset, fetchAsset} from '../helper/toGeoJSON';
import '../css/thirdparty/leaflet.label.css';
import * as L from "leaflet";
import useStores from "../hooks/use-stores";

const AvailabilityLayer = observer(() => {
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;
    const [availableAsset, setAvailableAsset] = useState(null);
    const [matchAsset, setMatchAsset] = useState(null);
    useEffect(() => {
        filterAvailabilityData(assetMode).then(setAvailableAsset);
    }, [assetMode]);
    const pointToLayer =function (feature, latlng) {
        const icon = feature.properties.is_equipment ?
            iconForEquipmentAvailability(feature.properties.event_type) :
            iconForAircraftAvailability(feature.properties.event_type);
        return L.marker(latlng, { icon: icon, zIndexOffset: 30 });
    };

    const onEachFeature =  function (feature, layer) {

        layer.on('click', async function (e) {
            let match = await fetchAsset(feature.properties.asset_id, feature.properties.is_equipment);
            feature.properties={...(feature.properties),...match};
            const content = await renderAvailabilityPopup(feature);
            layer.bindPopup(content, {maxWidth: 600})
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
