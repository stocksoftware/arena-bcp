import { action, observable, makeObservable } from "mobx";
import {ASSET_MODE} from "../constant";
import IncidentJson from "../../../public/incidents.json";

export default class mapStore {
    constructor(stores) {
        this.stores = stores;
        makeObservable(this);
    }

    @observable assetType = ASSET_MODE.EQUIPMENT;
    @observable incidentJson = IncidentJson;
    @action
    setAssetType(type) {
        this.assetType = type;
    }

}