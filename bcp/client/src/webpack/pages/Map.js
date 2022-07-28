import React, {useEffect} from 'react';
import {observer} from "mobx-react";
import {MAP_CONFIG, ASSET_MODE} from "../constant";
import useStores from "../hooks/use-stores";
import {MapContainer, TileLayer, LayersControl} from "react-leaflet";
import IncidentLayer from "../components/IncidentLayer";
import EquipmentLayer from "../components/EquipmentLayer";
import AircraftLayer from "../components/AircraftLayer";
import AircraftTrackLayer from "../components/AircraftTrackLayer";
import EquipmentTrackLayer from "../components/EquipmentTrackLayer";
import LocationLayer from "../components/LocationLayer";

const Map = observer(() => {
    const position = [-27, 130];
    const {mapStore} = useStores();
    const asset = mapStore.assetType;
    const track = asset + 'TRACK';
    return (
        <MapContainer
            center={position}
            zoom={5}
            scrollWheelZoom={true}
            id="map"
        >
            <TileLayer
                attribution='Tiles &copy; Esri'
                url={MAP_CONFIG.ESRItopoURL}
            />
            <LayersControl>
                {asset === ASSET_MODE.EQUIPMENT ?
                    <>
                        <LayersControl.Overlay name="Equipment" key={ASSET_MODE.EQUIPMENT}>
                            <EquipmentLayer/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Equipment Track" key={track}>
                            <EquipmentTrackLayer/>
                        </LayersControl.Overlay>
                    </>
                    :
                    <>
                        <LayersControl.Overlay name="Aircraft" key={ASSET_MODE.AIRCRAFT}>
                            <AircraftLayer/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Aircraft Track" key={track}>
                            <AircraftTrackLayer/>
                        </LayersControl.Overlay>
                    </>
                }
                <LayersControl.Overlay name="Incident" key="Incident">
                    <IncidentLayer/>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Location" key="Location" checked>
                    <LocationLayer/>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
});

export default Map;