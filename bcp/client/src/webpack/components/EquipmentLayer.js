import React, {useEffect, useState} from 'react';
import DataLayer from "./DataLayer";
import {styleAssetMarker, buildPopUpEquipmentContent} from "../helper/map-style";
import {observer} from "mobx-react";
import {fetchEquipmentGeoJSON} from "../helper/toGeoJSON";

const EquipmentLayer = observer(({arenaAssetsOnly}) => {
    const [equipmentGeoJSON, setEquipmentGeoJSON] = useState(null);
    useEffect(() => {
        fetchEquipmentGeoJSON().then(setEquipmentGeoJSON);
    }, []);
    const pointToLayer = function (feature, latlng) {
        return styleAssetMarker(feature, latlng);
    };

    const onEachFeature = function (feature, layer) {
        layer.on('click', function () {
            layer.bindPopup(buildPopUpEquipmentContent(feature), {maxWidth: 600});
        });
    };
    const filter = (a) => !!a.properties.imeiMatch === arenaAssetsOnly;
    return (
        <DataLayer filter={filter} data={equipmentGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});

export default EquipmentLayer;
