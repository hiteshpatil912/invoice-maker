import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllClientsSelector,
  // setDeleteId,
  // setEditedId,
} from "../../store/clientSlice";
import {
  getAllProductSelector,
  // setDeleteId,
  // setEditedId,
} from "../../store/productSlice";
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
 clientCategory: "",
  category: "",
};

function DiscountTable({ showAdvanceSearch = false }) {

  const [currentItems, setCurrentItems] = useState(null);
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const allClients = useSelector(getAllClientsSelector);
  const allProducts = useSelector(getAllProductSelector);

  const { initLoading } = useAppContext();

  const clients = useMemo(() => {
    let filterData = allClients.length > 0 ? [...allClients].reverse() : [];
    if (searchForm.name?.trim()) {
      filterData = filterData.filter((client) =>
        client.name.includes(searchForm.name)
      );
    }

    if (searchForm.clientCategory?.trim()) {
      filterData = filterData.filter((client) =>
        client.clientCategory.includes(searchForm.clientCategory)
      );
    }

    if (searchForm.mobileNo?.trim()) {
      filterData = filterData.filter((client) =>
        client.mobileNo.includes(searchForm.mobileNo)
      );
    }

    return filterData;
  }, [allClients,searchForm]);  

  const products = useMemo(() => {
    let filterData = allProducts.length > 0 ? [...allProducts].reverse() : [];
    if (searchForm.name?.trim()) {
      filterData = filterData.filter((product) =>
        product.name.includes(searchForm.name)
      );
    }

    if (searchForm.productID?.trim()) {
      filterData = filterData.filter((product) =>
        product.productID.includes(searchForm.productID)
      );
    }

    return filterData;
  }, [allProducts, searchForm]);


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
        <div>
          {currentItems &&
            currentItems.map((client) => (
              <div className={defaultTdWrapperStyle}>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>
                    client Category
                  </div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {client.clientCategory}{" "}
                    </span>
                  </div>
                </div>
                {/* <div className={defaultTdActionStyle}>
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
                      <MenuItem onClick={() => handleEdit(client)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete(client)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </div>
                </div> */}
              </div>
            ))}

          {clients.length <= 0 && !initLoading && (
            <EmptyBar title="Client Data" />
          )}

          {clients.length > 0 && (
            <ReactPaginate
              className="inline-flex items-center -space-x-px mt-2"
              previousLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              nextLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              pageLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              breakLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              activeLinkClassName="py-2 px-3 text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              breakLabel="..."
              // onPageChange={handlePageClick}
              pageRangeDisplayed={1}
              // pageCount={pageCount}
              previousLabel="<"
              nextLabel=">"
              renderOnZeroPageCount={null}
            />
          )}
        </div>
        <div>
        {currentItems &&
            currentItems.map((product) => (
              <div className={defaultTdWrapperStyle}>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>
                    ProductCategory
                  </div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}

          {products.length <= 0 && !initLoading && <EmptyBar />}

          {products.length > 0 && (
            <ReactPaginate
              className="inline-flex items-center -space-x-px mt-2"
              previousLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              nextLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              pageLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              breakLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              activeLinkClassName="py-2 px-3 text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
              breakLabel="..."
              // onPageChange={handlePageClick}
              pageRangeDisplayed={1}
              // pageCount={pageCount}
              previousLabel="<"
              nextLabel={">"}
              renderOnZeroPageCount={null}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default DiscountTable;
