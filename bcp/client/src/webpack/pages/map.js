import React,{useEffect} from 'react';
import { observer } from "mobx-react";
import {MAP_CONFIG, ASSET_MODE} from "../constant";
import useStores from "../hooks/use-stores";
import {MapContainer, TileLayer, LayersControl} from "react-leaflet";
import IncidentLayer from "../components/incidentLayer";
import EquipmentLayer from "../components/equipmentLayer";
import AircraftLayer from "../components/aircraftLayer";
const Map = observer(() => {
    const position = [-27, 130];
    const {mapStore} = useStores();
    const asset = mapStore.assetType;
    const {aircraftGeoJSON,equipmentGeoJSON } = mapStore;
    useEffect(()=>{
        mapStore.loadGeoJSON();
    },[]);
    return (
        <MapContainer
            center={position}
            zoom={5}
            scrollWheelZoom={false}
            id="map"
        >
            <TileLayer
                attribution='Tiles &copy; Esri'
                url={MAP_CONFIG.ESRItopoURL}
            />
            <LayersControl>
                <LayersControl.Overlay name="Incident">
                    <IncidentLayer/>
                </LayersControl.Overlay>
                {asset === ASSET_MODE.EQUIPMENT ?
                    equipmentGeoJSON &&
                    <LayersControl.Overlay name="Equipment" checked >
                        <EquipmentLayer/>
                    </LayersControl.Overlay>
                    :
                    aircraftGeoJSON &&  <LayersControl.Overlay name="Aircraft" checked>
                        <AircraftLayer/>
                    </LayersControl.Overlay>

                }
            </LayersControl>
        </MapContainer>
    );
});

export default Map;