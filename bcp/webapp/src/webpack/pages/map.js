import React from "react";
import {MAP_CONFIG} from "../constant";
import {
    LayersControl,
    MapContainer,
    TileLayer,
} from "react-leaflet";

const Map = () => {
    const position = [51.505, -0.09];

    return(
        <MapContainer
            center={position}
            zoom={10}
            scrollWheelZoom={false}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer name="Topographic" checked>
                    <TileLayer attribution="Tiles &copy; Esri" url={MAP_CONFIG.ESRItopoURL} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Aerial">
                    <TileLayer
                        attribution="Tiles &copy; Esri"
                        url={MAP_CONFIG.ESRIearthURL}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Aerial - Topo - Blend">
                    <TileLayer
                        attribution="Tiles &copy; Esri"
                        url={MAP_CONFIG.ESRIearthURL}
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
        </MapContainer>
    );
};

export default Map;