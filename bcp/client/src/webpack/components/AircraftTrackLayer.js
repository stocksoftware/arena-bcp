import React,{useState, useEffect}from 'react';
import DataLayer from "./DataLayer";
import {fetchAircraftTrack} from "../helper/toGeoJSON";
import {styleAssetTrack, buildTrackingPopup} from "../helper/map-style";
import {observer} from "mobx-react";
import {ASSET_MODE} from '../constant';
const AircraftTrackLayer =observer(({arenaAssetsOnly})=>{
    const [aircraftTrackGeoJSON, setAircraftTrackGeoJSON]= useState(null);
    useEffect(()=>{
        fetchAircraftTrack().then(setAircraftTrackGeoJSON);
    },[]);
    const pointToLayer = function(feature, latlng){
        return L.marker(latlng, {
            icon: L.divIcon({
                iconSize: L.point(1, 1),
            })
        });
    };
    const onEachFeature = function (feature, layer) {
        layer.options.color=styleAssetTrack(feature);
        layer.options.weight = 2 ;
        layer.options.opacity = 0.5;
        layer.on('click', function(e){
            layer.bindPopup(buildTrackingPopup(e, feature, ASSET_MODE.AIRCRAFT),{ maxWidth: 600 });
        });
    };

    const filter = (a) => !!a.properties.imeiMatch === arenaAssetsOnly;
    return(
        <DataLayer filter={filter} data={aircraftTrackGeoJSON} pointToLayer={pointToLayer} onEachFeature={onEachFeature} />
    );
});

export default AircraftTrackLayer;
