import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import {
  defaultTdStyle,
  defaultTdActionStyle,
  defaultTdWrapperStyle,
  defaultTdContent,
  defaultTdContentTitleStyle,
  defaultSearchStyle,
} from "../../constants/defaultStyles";
import ReactPaginate from "react-paginate";
import ProductIcon from "../Icons/ProductIcon";
import ProductIDIcon from "../Icons/ProductIDIcon";
import EmptyBar from "../Common/EmptyBar";
import { useAppContext } from "../../context/AppContext";

// Example items, to simulate fetching from another resources.
const itemsPerPage = 10;
const emptySearchForm = {

};

function DiscountTable({ showAdvanceSearch = false }) {

  const [itemOffset, setItemOffset] = useState(0);

  

  return (
    <>
      <div className="sm:bg-white rounded-xl sm:px-3 sm:py-3">
        <div className="hidden sm:flex invisible sm:visible w-full flex-col sm:flex-row">
          <div className="sm:text-left text-default-color font-title flex-1">
            Client Category
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Product Category
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Percentage
          </div>
          <div className="sm:text-left text-default-color font-title sm:w-11">
            Action
          </div>
        </div>
      </div>
    </>
  );
}

export default DiscountTable;
