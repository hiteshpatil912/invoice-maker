import React, { useCallback, useEffect, useState } from "react";
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
import { useAppContext } from "../../context/AppContext";
import EmptyBar from "../Common/EmptyBar";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-toastify";

// Example items, to simulate fetching from another resources.
const itemsPerPage = 10;
const emptySearchForm = {
  search: "",
};

function CategoryTable({
  showAdvanceSearch = true,
  onSelectDiscount,
  onNewOrUpdateDiscount,
}) {
  const { initLoading } = useAppContext();
  const [allCategories, setAllCategories] = useState({
    data: [],
    pagination: { total: 0 },
  });
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";

  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  console.log({ currentItems });

  useEffect(() => {
    if (onNewOrUpdateDiscount && onNewOrUpdateDiscount.data) {
      const updatedDiscount =
        onNewOrUpdateDiscount.data.discount ||
        onNewOrUpdateDiscount.data.Discount;
      if (updatedDiscount) {
        console.log({ updatedDiscount });
        setCurrentItems((prevItems) => {
          const discountIndex = prevItems.findIndex(
            (discount) => discount.id === updatedDiscount.id
          );
          if (discountIndex !== -1) {
            // If the client already exists, update it in the currentItems list
            const updatedItems = [...prevItems];
            updatedItems[discountIndex] = updatedDiscount;
            return updatedItems;
          } else {
            // If the client does not exist, add it to the beginning of the currentItems list
            return [updatedDiscount, ...prevItems];
          }
        });
      }
    }
  }, [onNewOrUpdateDiscount]);

  const fetchCategories = useCallback(
    async (page = 1, searchParams = {}) => {
      setLoading(true);
      try {
        const searchQuery = new URLSearchParams({
          ...searchParams,
          page,
        }).toString();

        const response = await fetch(`${apiDomain}/discounts?${searchQuery}`, {
          method: "GET",
          headers: {
            Authorization: authToken,
          },
        });
        const data = await response.json();
        setAllCategories(data.data.discounts);
        setPageCount(data.data.discounts.pagination.total_pages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken]
  );

  const deleteDiscount = useCallback(
    async (discountId) => {
      if (window.confirm(`Are you sure you want to delete ?`)) {
      try {
        const response = await fetch(
          `${apiDomain}/discount/${discountId}/delete`,
          {
            method: "DELETE",
            headers: {
              Authorization: authToken,
            },
          }
        );

        if (response.success) {
          fetchCategories()
        const result = await response.json();
        toast.success(result.data.message || "Product Deleted Successfully!", {
          position: "bottom-center",
          autoClose: 2000,
        });
        }else{
          throw new Error("Failed to delete discount");
        }
        // removeFromState(discountId);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
    },
    [apiDomain, authToken,fetchCategories]
  );

  const removeFromState = (discountId) => {
    setAllCategories((prevDiscounts) => {
      const updatedData = prevDiscounts.data.filter(
        (discount) => discount.id !== discountId
      );
      const updatedTotal = updatedData.length;
      return {
        data: updatedData,
        pagination: { ...prevDiscounts.pagination, total: updatedTotal },
      };
    });

    setCurrentItems((prevItems) =>
      prevItems.filter((item) => item.id !== discountId)
    );
  };

  useEffect(() => {
    if (authToken) {
      fetchCategories(currentPage);
    }
  }, [authToken, fetchCategories, currentPage]);

  useEffect(() => {
    if (Array.isArray(allCategories.data)) {
      setCurrentItems(allCategories.data);
      setPageCount(Math.ceil(allCategories.pagination.total / itemsPerPage));
    }
  }, [allCategories]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1; // ReactPaginate uses 0-based index
    setCurrentPage(selectedPage);
    fetchCategories(selectedPage);
  };

  // Handlers for delete and edit
  const handleDelete = useCallback(
    (item) => {
      deleteDiscount(item.id);
    },
    [deleteDiscount]
  );

  const handleEdit = useCallback(
    (item) => {
      onSelectDiscount(item);
    },
    [onSelectDiscount]
  );

  const handlerSearchValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setSearchForm((prev) => {
        return { ...prev, [keyName]: value };
      });

      const searchParams = {
        search:
          keyName === "search" ? value : searchForm.search,
      };
      fetchCategories(1, searchParams);
    },
    [fetchCategories, searchForm]
  );



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
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
            currentItems.map((discount, index) => (
              <div className={defaultTdWrapperStyle} key={discount.id}>
                <div className="px-4 py-2">
                {(currentPage - 1) * itemsPerPage + index + 1}
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>
                    discount Category
                  </div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden pl-1">
                      {discount.client_category}
                    </span>
                  </div>
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>
                    Product category
                  </div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {discount.product_category}
                    </span>
                  </div>
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Percentage</div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {discount.discount_percentage}
                      {"%"}
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
                      <MenuItem onClick={() => handleEdit(discount)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete(discount)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>
            ))}

          {allCategories.data.length <= 0 && !initLoading && (
            <EmptyBar title="Category Data" />
          )}

          {allCategories.data.length > 0 && (
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
              nextLabel=">"
              renderOnZeroPageCount={null}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default CategoryTable;
