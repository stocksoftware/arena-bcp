import React, {useState} from "react";
import {
    MapContainer, LayersControl, TileLayer
} from "react-leaflet";
import IncidentLayer from "../components/incidentLayer";
import EquipmentLayer from "../components/equipmentLayer";
import {MAP_CONFIG, ASSET_MODE} from "../constant";
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";

const Map = observer(() => {
    const position = [-27, 130];
    const {showIncident, setShowIncident} = useState(true);
    const {mapStore} = useStores();
    const asset = mapStore.assetType;
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
                <LayersControl.Overlay name="Incident">
                    <IncidentLayer/>
                </LayersControl.Overlay>
                {asset === ASSET_MODE.EQUIPMENT &&
                    <LayersControl.Overlay name="Equipment" checked>
                        <EquipmentLayer/>
                    </LayersControl.Overlay>
                }
            </LayersControl>
        </MapContainer>
    );
});

export default Map;