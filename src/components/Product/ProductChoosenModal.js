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
import Button from "../Button/Button";
import ProductIcon from "../Icons/ProductIcon";
import { useAuth } from "../../auth/AuthContext";



function ProductChoosenModal({ selectedCategory, onClose, onSelect , selectedClient }) {
  const { authToken } = useAuth();
  const [filterRecords, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";
    const [products, setProducts] = useState({
    data: [],
    category:[],
    pagination: { total: 0 , pageCount: 0 },
  });



  const fetchProductsCategories = useCallback(
    async (page = 1, searchParams = {}) => {
      setLoading(true);
      try {

      const queryParams = {
        ...searchParams,
        client_category_id: selectedClient?.category_id,
        product_category_id: selectedCategory,
        page,
      };


      const searchQuery = new URLSearchParams(queryParams).toString();

        const response = await fetch(`${apiDomain}/invoice/products?${searchQuery}`, {
          method: "GET",
          headers: {
            Authorization: authToken,
          },
        });
        const data = await response.json();
        setProducts({
          data: data.data.product,
          category: data.data.category,
          pagination: {
            total: data.data.product.pagination.total,
            pageCount: data.data.product.pagination.total_pages,
          },
        });
        setRecords(data.data.product.data)
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken,selectedCategory,selectedClient]
  );

  useEffect(() => {
    if (authToken) {
      fetchProductsCategories()
    }
  }, [authToken,fetchProductsCategories]);

  // useEffect(() => {
  //   if (products.category.length > 0 && selectedCategory) {
  //     const filteredProducts = products.data.data.filter(
  //       (product) => product.productCategoryID === selectedCategory
  //     );
  //     setRecords(filteredProducts);
  //   }
  // }, [selectedCategory, products]);

  const handleSelect = useCallback(
    (item) => {
      onSelect(item);
      setTimeout(() => {
        onClose();
      }, 50);
    },
    [onClose,onSelect]
  );


  return (
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
  );
}

export default ProductChoosenModal;
