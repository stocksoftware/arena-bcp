import React from 'react';
import useStores from "../hooks/use-stores";
import {observer} from "mobx-react";
const List = observer(() => {
    const {mapStore} = useStores();
    const assetMode = mapStore.assetType;

    return (
        <div>
            list
        </div>
    );
});

export default List;
