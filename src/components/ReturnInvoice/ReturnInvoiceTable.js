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
import { useNavigate } from "react-router-dom";
import { NumberFormatBase } from 'react-number-format';
import InvoiceIcon from "../Icons/InvoiceIcon";
import { useAppContext } from "../../context/AppContext";
import EmptyBar from "../Common/EmptyBar";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-toastify";

const itemsPerPage = 10;
const emptySearchForm = {
  search: "",
};

function ReturnInvoiceTable({ showAdvanceSearch = false }) {
  const { initLoading } = useAppContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";
  const [currentPage, setCurrentPage] = useState(1);



  // Fetch invoices from the API
  const fetchInvoices = useCallback(
    async (page = 1, searchParams = {}) => {
      try {
        const searchQuery = new URLSearchParams({
          ...searchParams,
          "invoice_type":"return",
          page,
        }).toString();
      const myHeaders = new Headers();
      myHeaders.append("Authorization", authToken);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${apiDomain}/invoices?${searchQuery}`, requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setInvoices(data.data.invoices.data);
          setPageCount(data.data.invoices.pagination.total_pages);
        } else {
          console.error("Failed to fetch invoices");
        }
      })
      .catch(error => console.error('Error:', error));
    }catch (error) {
      console.error("Error fetching clients:", error);
    }
  }, [apiDomain, authToken]);

  useEffect(() => {
    if (authToken) {
      fetchInvoices(currentPage);
    }
  }, [authToken, fetchInvoices, currentPage]);



  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1; // ReactPaginate uses 0-based index
    setCurrentPage(selectedPage);
    fetchInvoices(selectedPage);
  };

  const handleDelete = useCallback(
    (invoice) => {
      if (window.confirm(`Are you sure you want to delete ${invoice.invoice_name}?`)) {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", authToken);
  
        const requestOptions = {
          method: "DELETE",
          headers: myHeaders,
          redirect: "follow"
        };
  
        fetch(`${apiDomain}/invoice/${invoice.id}/delete`, requestOptions)
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              fetchInvoices(currentPage);
              toast.success(data.data.message || "Product Deleted Successfully!", {
                position: "bottom-center",
                autoClose: 2000,
              });
            } else {
              console.error("Failed to delete invoice");
            }
          })
          .catch(error => console.error('Error:', error));
      }
    },
    [apiDomain, authToken, fetchInvoices, currentPage]
  );
  

  const handleEdit = useCallback(
    (item) => {
      navigate("/invoices/" + item.id);
    },
    [navigate]
  );

  const handlerSearchValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setSearchForm((prev) => {
        return { ...prev, [keyName]: value };
      });

      const searchParams = {
        search: keyName === "search" ? value : searchForm.search,
      };
      fetchInvoices(1, searchParams);
    },
    [fetchInvoices, searchForm]
  );



  return (
    <>
      {showAdvanceSearch && (
        <div className="bg-white rounded-xl px-3 py-3 mb-3">
          <div className="font-title mb-2">Advanced Search</div>
          <div className="flex w-full flex-col sm:flex-row">
            <div className="mb-2 sm:mb-0 sm:text-left text-default-color flex flex-row font-title flex-1 px-2">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 mr-2 flex justify-center items-center">
                <InvoiceIcon className="h-6 w-6 text-gray-400" />
              </div>
              <input
                autoComplete="nope"
                value={searchForm.search}
                placeholder="Search Invoice"
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
            Invoice Name
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Client Name
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Status
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Amount
          </div>
          <div className="sm:text-left text-default-color font-title sm:w-11">
            Action
          </div>
        </div>

        <div>
          {invoices &&
            invoices.map((invoice) => (
              <div className={defaultTdWrapperStyle} key={invoice.id}>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Invoice Name</div>
                  <div className={defaultTdContent}>
                    <span
                      className="whitespace-nowrap text-ellipsis overflow-hidden text-blue-500 cursor-pointer"
                      onClick={() => handleEdit(invoice)}
                    >
                      {invoice.invoice_name}
                    </span>
                  </div>
                </div>

                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Client Name</div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {invoice.client_name}
                    </span>
                  </div>
                </div>

                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Status</div>
                  <div className={defaultTdContent}>
                    <span
                      className={
                        "whitespace-nowrap text-ellipsis overflow-hidden px-3 rounded-xl py-1 " +
                        (invoice.status === "Paid"
                          ? "bg-green-200 text-green-600"
                          : "bg-gray-100 text-gray-600 ")
                      }
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>

                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Amount</div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden ">
                      <NumberFormatBase
                        value={invoice.amount}
                        className=""
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$"}
                        renderText={(value, props) => (
                          <span {...props}>{value}</span>
                        )}
                      />
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
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 11-2 0 1 1 0 012 0zm7 0a1 1 11-2 0 1 1 0 012 0z"
                              />
                            </svg>
                          </div>
                        </MenuButton>
                      }
                      transition
                    >
                      <MenuItem onClick={() => handleEdit(invoice)}>
                        Detail
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete(invoice)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>
            ))}

          {invoices.length <= 0 && !initLoading && (
            <EmptyBar title={"Invoice"} />
          )}

          {invoices.length > 0 && (
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
      </div>
    </>
  );
}

export default ReturnInvoiceTable;










