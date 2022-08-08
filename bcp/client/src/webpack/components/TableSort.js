import React from "react";
import SortIcon from '../../../../public/icons/descending.svg?component';
import DescendingIcon from '../../../../public/icons/descending.svg?component';
import AscendingIcon from '../../../../public/icons/ascending.svg?component';

const TableSort = ({desc, sortKey, tagKey}) => sortKey === tagKey ? (desc ? <DescendingIcon/>:<AscendingIcon/>) :<SortIcon/>;

export default TableSort;
