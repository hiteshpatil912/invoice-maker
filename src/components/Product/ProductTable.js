import React, { useCallback, useEffect, useState } from "react";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import ReactPaginate from "react-paginate";
import EmptyBar from "../Common/EmptyBar";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../auth/AuthContext";
import {
  defaultTdActionStyle,
  defaultTdContent,
  defaultTdContentTitleStyle,
  defaultSearchStyle,
  defaultTdWrapperStyle,
  defaultTdStyle,
} from "../../constants/defaultStyles";
import { toast } from "react-toastify";

const itemsPerPage = 10;
const emptySearchForm = {
  search: "",
};

function ProductTable({
  showAdvanceSearch = false,
  onSelectProduct,
  onNewOrUpdateProduct,
}) {
  const { initLoading } = useAppContext();
  const { authToken } = useAuth();
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [products, setProducts] = useState({
    data: [],
    pagination: { total: 0 },
  });
  const [loading, setLoading] = useState(true);

  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";

  useEffect(() => {
    if (
      onNewOrUpdateProduct &&
      onNewOrUpdateProduct.data &&
      onNewOrUpdateProduct.data.product
    ) {
      const updatedProduct = onNewOrUpdateProduct.data.product;
      setCurrentItems((prevItems) => {
        const productIndex = prevItems.findIndex(
          (product) => product.id === updatedProduct.id
        );
        if (productIndex !== -1) {
          // If the product already exists, update it in the currentItems list
          const updatedItems = [...prevItems];
          updatedItems[productIndex] = updatedProduct;
          return updatedItems;
        } else {
          // If the product does not exist, add it to the beginning of the currentItems list
          return [updatedProduct, ...prevItems];
        }
      });
    }
  }, [onNewOrUpdateProduct]);

  const fetchProducts = useCallback(
    async (page = 1, searchParams = {}) => {
      setLoading(true);
      try {
        const searchQuery = new URLSearchParams({
          ...searchParams,
          page,
        }).toString();

        const response = await fetch(`${apiDomain}/products?${searchQuery}`, {
          method: "GET",
          headers: {
            Authorization: authToken,
          },
        });
        const data = await response.json();
        setProducts(data.data.product);
        setPageCount(data.data.product.pagination.total_pages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken]
  );

  const deleteProduct = useCallback(
    async (productId) => {
      if (window.confirm(`Are you sure you want to delete ?`)) {
        try {
          const response = await fetch(
            `${apiDomain}/product/${productId}/delete`,
            {
              method: "DELETE",
              headers: {
                Authorization: authToken,
              },
            }
          );
          const result = await response.json();
          if (result.success) {
            toast.success(
              result.data.message || "Product Deleted Successfully!",
              {
                position: "bottom-center",
                autoClose: 2000,
              }
            );
          } else {
            throw new Error("Failed to delete product");
          }
          fetchProducts();
          // removeFromState(productId);
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      }
    },
    [apiDomain, authToken, fetchProducts]
  );

  // const removeFromState = (productId) => {
  //   setProducts((prevProducts) => {
  //     const updatedData = prevProducts.data.filter(
  //       (product) => product.id !== productId
  //     );
  //     const updatedTotal = updatedData.length;
  //     return {
  //       data: updatedData,
  //       pagination: { ...prevProducts.pagination, total: updatedTotal },
  //     };
  //   });

  //   setCurrentItems((prevItems) =>
  //     prevItems.filter((item) => item.id !== productId)
  //   );
  // };

  useEffect(() => {
    if (authToken) {
      fetchProducts(currentPage);
    }
  }, [authToken, fetchProducts, currentPage]);

  useEffect(() => {
    if (Array.isArray(products.data)) {
      setCurrentItems(products.data);
      setPageCount(Math.ceil(products.pagination.total / itemsPerPage));
    }
  }, [products]);

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1; // ReactPaginate uses 0-based index
    setCurrentPage(selectedPage);
    fetchProducts(selectedPage);
  };

  const handleDelete = useCallback(
    (item) => {
      deleteProduct(item.id);
    },
    [deleteProduct]
  );

  const handleEdit = useCallback(
    (item) => {
      onSelectProduct(item); // Pass selected product to parent component
    },
    [onSelectProduct]
  );

  const handlerSearchValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setSearchForm((prev) => ({ ...prev, [keyName]: value }));

      const searchParams = {
        search: keyName === "search" ? value : searchForm.search,
      };
      fetchProducts(1, searchParams);
    },
    [fetchProducts, searchForm]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {showAdvanceSearch && (
        <div className="bg-white rounded-xl px-3 py-3 mb-3">
          <div className="font-title mb-2">Advanced Search</div>
          <div className="flex w-full flex-col sm:flex-row">
            <div className="mb-2 sm:mb-0 sm:text-left text-default-color flex flex-row font-title flex-1 px-2">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 mr-2 flex justify-center items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                autoComplete="nope"
                value={searchForm.search}
                placeholder="Search"
                className={defaultSearchStyle}
                onChange={(e) => handlerSearchValue(e, "search")}
              />
            </div>
          </div>
        </div>
      )}

      <div className="sm:bg-white rounded-xl sm:px-3 sm:py-3">
        <div className="hidden sm:flex invisible sm:visible w-full flex-col sm:flex-row">
          <div className="sm:text-left text-default-color font-title flex-1">
            Id
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Product Image
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Name
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Description
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Category
          </div>
          <div className="sm:text-left text-default-color font-title sm:w-11">
            Action
          </div>
        </div>
        {currentItems.map((product, index) => (
          <div className={defaultTdWrapperStyle} key={product.id}>
            <div className={defaultTdStyle}>
              <div className="px-4 py-2">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </div>
            </div>
            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>image</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover"
                  />{" "}
                </span>
              </div>
            </div>
            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>Name</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden pl-1">
                  {product.name}
                </span>
              </div>
            </div>

            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>Description</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {product.description}{" "}
                </span>
              </div>
            </div>
            <div className={defaultTdStyle}>
              <div className={defaultTdContentTitleStyle}>Product Category</div>
              <div className={defaultTdContent}>
                <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                  {product.category}{" "}
                </span>
              </div>
            </div>
            <div className={defaultTdActionStyle}>
              <div className={defaultTdContentTitleStyle}>Action</div>
              <div className={defaultTdContent}>
                <Menu
                  menuButton={
                    <MenuButton>
                      <div className="bg-gray-50 px-2 rounded-xl">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                          />
                        </svg>
                      </div>
                    </MenuButton>
                  }
                  transition
                >
                  <MenuItem onClick={() => handleEdit(product)}>Edit</MenuItem>
                  <MenuItem onClick={() => handleDelete(product)}>
                    Delete
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </div>
        ))}

        {products.data.length <= 0 && !initLoading && <EmptyBar />}
        
        {products.data.length > 0 && (
          <ReactPaginate
            className="inline-flex items-center -space-x-px mt-2"
            previousLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            nextLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            pageLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            breakLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            activeLinkClassName="py-2 px-3 text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            breakLabel="..."
            onPageChange={handlePageClick}
            pageRangeDisplayed={1}
            pageCount={pageCount}
            previousLabel="<"
            nextLabel={">"}
            renderOnZeroPageCount={null}
          />
        )}
      </div>
    </>
  );
}

export default ProductTable;
