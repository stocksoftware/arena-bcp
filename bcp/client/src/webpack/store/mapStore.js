import { action, observable, makeObservable } from "mobx";
import {ASSET_MODE} from "../constant";
import IncidentJson from "../../../../public/incidents.json";
import {toGeoJSON} from "../helper/toGeoJSON";

export default class mapStore {
    constructor(stores) {
        this.stores = stores;
        makeObservable(this);
    }

    @observable assetType = ASSET_MODE.EQUIPMENT;

    @action
    setAssetType(type) {
        this.assetType = type;
        console.log('set asset type', type);
    }


}