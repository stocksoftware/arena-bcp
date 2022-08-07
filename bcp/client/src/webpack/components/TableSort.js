import React from "react";
import SortIcon from '../../../../public/icons/sort.svgcomponent';
import DescendingIcon from '../../../../public/icons/descending.svgcomponent';
import AscendingIcon from '../../../../public/icons/ascending.svgcomponent';


const TableSort = ({desc, sortKey, tagKey}) => {
    return(
        sortKey === tagKey ? (desc ? <DescendingIcon/>:<AscendingIcon/>) :<SortIcon/>
    );
    };


export default TableSort;
