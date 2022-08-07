import React from 'react';
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
import AvailabilityLayer from "../components/AvailabilityLayer";

const Map = observer(() => {
    const mapCenter = [-27, 130];
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;

    return (
        <MapContainer
            center={mapCenter}
            zoom={5}
            scrollWheelZoom={true}
            id="map"
        >
            <TileLayer
                attribution='Tiles &copy; Esri'
                url={MAP_CONFIG.ESRItopoURL}
            />
            <LayersControl>
                {assetMode === ASSET_MODE.EQUIPMENT ?
                    <>
                        <LayersControl.Overlay name="Arena Equipment" key={"Arena Equipment"+assetMode}>
                            <EquipmentLayer arenaAssetsOnly={true}/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Arena Track" key={"Arena Tracks"+assetMode}>
                            <EquipmentTrackLayer arenaAssetsOnly={true}/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Other Equipment" key={"Other Equipment"+assetMode}>
                            <EquipmentLayer arenaAssetsOnly={false}/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Other Track" key={"other Track"+assetMode}>
                            <EquipmentTrackLayer arenaAssetsOnly={false}/>
                        </LayersControl.Overlay>
                    </>
                    :
                    <>
                        <LayersControl.Overlay name="Arena Aircraft" key={"Arena Aircraft"+assetMode}>
                            <AircraftLayer arenaAssetsOnly={true}/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Arena Tracks" key={"Arena Tracks"+assetMode}>
                            <AircraftTrackLayer arenaAssetsOnly={true}/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Other Aircraft" key={"Other Aircraft"+assetMode} >
                            <AircraftLayer arenaAssetsOnly={false}/>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="Other Tracks" key={"Other Tracks"+assetMode}>
                            <AircraftTrackLayer arenaAssetsOnly={false}/>
                        </LayersControl.Overlay>
                    </>
                }
                <LayersControl.Overlay name="Incident" key={"Incident"+assetMode}  >
                    <IncidentLayer/>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Location" key={"Location"+assetMode} >
                    <LocationLayer/>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Availability" key={"availability"+assetMode} checked>
                    <AvailabilityLayer/>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
});

export default Map;
