import React, {useState, useEffect} from 'react';
import DataLayer from "./DataLayer";
import {fetchEquipmentTrack} from "../helper/toGeoJSON";
import {styleAssetTrack, buildTrackingPopup} from "../helper/map-style";
import {observer} from "mobx-react";
import {ASSET_MODE} from '../constant';

const EquipmentTrackLayer = observer(({arenaAssetsOnly}) => {
    const [equipmentTrackGeoJSON, setEquipmentTrackGeoJSON] = useState();
    useEffect(() => {
        fetchEquipmentTrack().then(setEquipmentTrackGeoJSON);
    }, []);
    const pointToLayer = function (feature, latlng) {
        return L.marker(latlng, {
            icon: L.divIcon({
                iconSize: L.point(1, 1),
            })
        });
    };
    const onEachFeature = function (feature, layer) {
        layer.options.color = styleAssetTrack(feature);
        layer.options.weight = 2;
        layer.options.opacity = 0.5;
        layer.on('click', function (e) {
            layer.bindPopup(buildTrackingPopup(e, feature, ASSET_MODE.AIRCRAFT), {maxWidth: 600});
        });
    };
    const filter = (a) => !!a.properties.imeiMatch === arenaAssetsOnly;
    return (
        <DataLayer filter={filter} data={equipmentTrackGeoJSON} pointToLayer={pointToLayer}
                   onEachFeature={onEachFeature}/>
    );
});

export default EquipmentTrackLayer;