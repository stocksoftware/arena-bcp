import React, {useState} from "react";
import {
    MapContainer, LayersControl, TileLayer, LayerGroup
} from "react-leaflet";
import IncidentLayer from "../components/incidentLayer";
import EquipmentLayer from "../components/equipmentLayer"
import {MAP_CONFIG} from "../constant";

const Map = () => {
    const position = [-27, 130];
    const {showIncident, setShowIncident} = useState(true);
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
                <LayersControl.Overlay name="Incident" >
                    <IncidentLayer/>
                </LayersControl.Overlay>
                <LayersControl.Overlay name="Equipment" >
                    <EquipmentLayer/>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
};

export default Map;