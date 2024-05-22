import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  defaultTdStyle,
  defaultTdActionStyle,
  defaultTdWrapperStyle,
  defaultTdContent,
  defaultTdContentTitleStyle,
  defaultSearchStyle,
} from "../../constants/defaultStyles";
import ReactPaginate from "react-paginate";
import Button from "../Button/Button";
import {
  getAllProductSelector,
  getIsOpenProductSelector,
  setOpenProductSelector,
  setProductSelector,
} from "../../store/productSlice";
import ProductIDIcon from "../Icons/ProductIDIcon";
import ProductIcon from "../Icons/ProductIcon";

// Example items, to simulate fetching from another resources.
const itemsPerPage = 6;
const emptySearchForm = {
  name: "",
  // email: "",
  mobileNo: "",
};

function ProductChoosenModal({ selectedCategory, onClose }) {
  const dispatch = useDispatch();
  const allProducts = useSelector(getAllProductSelector);
  const openModal = useSelector(getIsOpenProductSelector);

  const [animate, setAnimate] = useState(true);
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  // const [currentItems, setCurrentItems] = useState(null);
  // const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  // const [data, setData] = useState([]);
  const [filterRecords, setRecords] = useState([]);

  useEffect(() => {
    if (allProducts && selectedCategory) {
      const filteredProducts = allProducts.filter(
        (product) => product.category === selectedCategory
      );
      setRecords(filteredProducts);
      console.log("filteredProducts", filteredProducts);
    }
  }, [selectedCategory, allProducts]);

  const handleSelect = useCallback(
    (item) => {
      dispatch(setProductSelector(item.id));

      setTimeout(() => {
        dispatch(setOpenProductSelector(false));
        onClose();
      }, 50);
    },
    [dispatch, onClose]
  );

  const onCancelHandler = useCallback(() => {
    dispatch(setOpenProductSelector(false));
  }, [dispatch]);

  const handlerSearchValue = useCallback((event, keyName) => {
    const value = event.target.value;

    setSearchForm((prev) => {
      return { ...prev, [keyName]: value };
    });

    setItemOffset(0);
  }, []);

  return openModal ? (
    <div className="px-4 ">
      {filterRecords &&
        filterRecords.map((product) => (
          <div className={defaultTdWrapperStyle} key={product.id}>
            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>ProductID</div>
              <div className={defaultTdContent}>
                {product.image ? (
                  <img
                    className="object-cover h-10 w-10 rounded-2xl"
                    src={product.image}
                    alt={product.name}
                  />
                ) : (
                  <span className="h-10 w-10 rounded-2xl bg-gray-100 flex justify-center items-center">
                    <ProductIcon />
                  </span>
                )}
                <span className="whitespace-nowrap text-ellipsis overflow-hidden pl-1">
                  {product.productID || "#"}
                </span>
              </div>
            </div>

            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>Name</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {product.name}
                </span>
              </div>
            </div>

            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>Amount</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {product.amount}
                </span>
              </div>
            </div>
            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>Product Category</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {product.category}
                </span>
              </div>
            </div>

            <div className={defaultTdActionStyle}>
              <div className={defaultTdContentTitleStyle}>Action</div>
              <div className={defaultTdContent}>
                <Button onClick={() => handleSelect(product)}>Select</Button>
              </div>
            </div>
          </div>
        ))}
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : null;
}

export default ProductChoosenModal;
