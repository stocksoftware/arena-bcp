import React, {useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import {
    iconForEquipmentAvailability,
    iconForAircraftAvailability,
    renderAvailabilityPopup,
    planeMBMarker,
    equipmentMBMarker
} from "../helper/map-style";
import {observer} from "mobx-react";
import {filterAvailabilityData, fetchAsset} from '../helper/toGeoJSON';
import '../css/thirdparty/leaflet.label.css';
import * as L from "leaflet";
import useStores from "../hooks/use-stores";
import MarkerClusterGroup from 'react-leaflet-cluster';
import {ASSET_MODE} from "../constant";

const AvailabilityLayer = observer(() => {
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;
    const [availableAsset, setAvailableAsset] = useState(null);
    useEffect(() => {
        filterAvailabilityData(assetMode).then(setAvailableAsset);
    }, [assetMode]);
    const createClusterCustomIcon = function () {
        if (assetMode === ASSET_MODE.AIRCRAFT) {
            return planeMBMarker;
        } else {
            return equipmentMBMarker;
        }
    };
    const pointToLayer = function (feature, latlng) {
        const icon = feature.properties.is_equipment ?
            iconForEquipmentAvailability(feature.properties.event_type) :
            iconForAircraftAvailability(feature.properties.event_type);
        return L.marker(latlng, {icon: icon, zIndexOffset: 30});
    };

    const onEachFeature = function (feature, layer) {
        layer.on('click', async function (e) {
            let match = await fetchAsset(feature.properties.asset_id, feature.properties.is_equipment);
            feature.properties = {...(feature.properties), ...match};
            const content = await renderAvailabilityPopup(feature);
            layer.bindPopup(content, {maxWidth: 600})
                .openPopup()
                ._popup._closeButton.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    };

    return (
        <MarkerClusterGroup  iconCreateFunction={createClusterCustomIcon} spiderfyOnMaxZoom={true}
                            showCoverageOnHover={false} spiderfyDistanceMultiplier={3} maxClusterRadius={30}>
            <DataLayer data={availableAsset} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
        </MarkerClusterGroup>
    );
});

export default AvailabilityLayer;
