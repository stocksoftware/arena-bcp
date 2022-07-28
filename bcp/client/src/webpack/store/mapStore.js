import { action, observable, makeObservable } from "mobx";
import {ASSET_MODE} from "../constant";
import IncidentJson from "../asset/incidents.json";
import {toGeoJSON} from "../helper/toGeoJSON";

export default class mapStore {
    constructor(stores) {
        this.stores = stores;
        makeObservable(this);
    }

    @observable assetType = ASSET_MODE.AIRCRAFT;
    @observable incidentJson = IncidentJson;
    @observable aircraftGeoJSON = [];
    @observable equipmentGeoJSON = [];

    @action
    setAssetType(type) {
        this.assetType = type;
    }
    @action
    setAircraftGeoJSON(json) {
        this.aircraftGeoJSON = json;
    }
    @action
    setEquipmentGeoJSON(json) {
        this.equipmentGeoJSON = json;
    }
    loadGeoJSON(){
        const {aircraftGeoJSON, equipmentGeoJSON} = toGeoJSON();
        this.setAircraftGeoJSON(aircraftGeoJSON);
        this.setEquipmentGeoJSON(equipmentGeoJSON);
    }

}