import { action, observable, makeObservable } from "mobx";
import {ASSET_MODE} from "../constant";
export default class mapStore {
    constructor(stores) {
        this.stores = stores;
        makeObservable(this);
    }

    @observable assetType = ASSET_MODE.aircraft;
    @action
    setAssetType(type) {
        this.assetType = type;
    }

}