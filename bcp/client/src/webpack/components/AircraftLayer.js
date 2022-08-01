import React, {useState, useEffect} from 'react';
import DataLayer from "./DataLayer";
import {fetchAircraftGeoJSON} from "../helper/toGeoJSON";
import {styleAssetMarker, buildPopUpAircraftContent} from "../helper/map-style";
import {observer} from "mobx-react";

const AircraftLayer = observer(({arenaAssetsOnly}) => {
    const [aircraftGeoJSON, setAircraftGeoJSON] = useState(null);
    const pointToLayer = function (feature, latlng) {
        return styleAssetMarker(feature, latlng);
    };
    useEffect(()=>{
        fetchAircraftGeoJSON().then(setAircraftGeoJSON);
    },[]);
    const onEachFeature = function (feature, layer) {
        layer.on('click', function () {
            layer.bindPopup(buildPopUpAircraftContent(feature), {maxWidth: 600});
        });
    };

    const filter = (a) => !!a.properties.imeiMatch === arenaAssetsOnly;
    return (
        <DataLayer filter={filter} data={aircraftGeoJSON} pointToLayer={pointToLayer}
                   onEachFeature={onEachFeature}/>
    );
});

export default AircraftLayer;
