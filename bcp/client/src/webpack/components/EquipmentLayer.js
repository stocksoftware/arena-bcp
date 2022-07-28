import React from 'react';
import DataLayer from "./DataLayer";
import {styleAssetMarker,buildPopUpEquipmentContent} from "../helper/map-style";
import {observer} from "mobx-react";
import {toGeoJSON} from "../helper/toGeoJSON";

const EquipmentLayer =observer(({arenaAssetsOnly})=>{
    const { equipmentGeoJSON } = toGeoJSON();
    const pointToLayer = function(feature, latlng){
        return styleAssetMarker(feature, latlng);
    };
    const onEachFeature = function (feature, layer) {
        layer.on('click', function(e){
            layer.bindPopup(buildPopUpEquipmentContent(feature),{ maxWidth: 600 })
                .openPopup()
                ._popup._closeButton.addEventListener('click', (event) => {
                event.preventDefault();
            });
        });
    };
    const filter = (a) => !!a.properties.imeiMatch === arenaAssetsOnly;
    return(
        <DataLayer filter={filter} data={equipmentGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature}/>
    );
});


export default EquipmentLayer;