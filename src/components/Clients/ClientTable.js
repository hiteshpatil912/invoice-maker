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

function ClientTable({
  showAdvanceSearch = false,
  onSelectClient,
  onNewOrUpdateClient,
}) {
  const { initLoading } = useAppContext();
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [clients, setClients] = useState({
    data: [],
    pagination: { total: 0 },
  });

  useEffect(() => {
    if (onNewOrUpdateClient && onNewOrUpdateClient.data) {
      const updatedClient =
        onNewOrUpdateClient.data.client || onNewOrUpdateClient.data.Client;
      if (updatedClient) {
        console.log({ updatedClient });
        setCurrentItems((prevItems) => {
          const clientIndex = prevItems.findIndex(
            (client) => client.id === updatedClient.id
          );
          if (clientIndex !== -1) {
            // If the client already exists, update it in the currentItems list
            const updatedItems = [...prevItems];
            updatedItems[clientIndex] = updatedClient;
            return updatedItems;
          } else {
            // If the client does not exist, add it to the beginning of the currentItems list
            return [updatedClient, ...prevItems];
          }
        });
      }
    }
  }, [onNewOrUpdateClient]);

  const fetchClients = useCallback(
    async (page = 1, searchParams = {}) => {
      setLoading(true);
      try {
        const searchQuery = new URLSearchParams({
          ...searchParams,
          page,
        }).toString();

        const response = await fetch(`${apiDomain}/clients?${searchQuery}`, {
          method: "GET",
          headers: {
            Authorization: authToken,
          },
        });
        const data = await response.json();
        setClients(data.data.clients);
        setPageCount(data.data.clients.pagination.total_pages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken]
  );

  const deleteClient = useCallback(
    async (clientId) => {
      if (window.confirm(`Are you sure you want to delete ?`)) {
        try {
          const response = await fetch(
            `${apiDomain}/client/${clientId}/delete`,
            {
              method: "DELETE",
              headers: {
                Authorization: authToken,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete product");
          }

          const result = await response.json();
          if (result.success) {
            fetchClients();
            toast.success(
              result.data.message || "Product Deleted Successfully!",
              {
                position: "bottom-center",
                autoClose: 2000,
              }
            );
          }
          // removeFromState(clientId);
        } catch (error) {
          console.error("Error deleting product:", error);
        }
      }
    },
    [apiDomain, authToken, fetchClients]
  );

  const removeFromState = (clientId) => {
    setClients((prevClients) => {
      const updatedData = prevClients.data.filter(
        (client) => client.id !== clientId
      );
      const updatedTotal = updatedData.length;
      return {
        data: updatedData,
        pagination: { ...prevClients.pagination, total: updatedTotal },
      };
    });

    setCurrentItems((prevItems) =>
      prevItems.filter((item) => item.id !== clientId)
    );
  };

  useEffect(() => {
    if (authToken) {
      fetchClients(currentPage);
    }
  }, [authToken, fetchClients, currentPage]);

  useEffect(() => {
    if (Array.isArray(clients.data)) {
      setCurrentItems(clients.data);
      setPageCount(Math.ceil(clients.pagination.total / itemsPerPage));
    }
  }, [clients]);

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1; // ReactPaginate uses 0-based index
    setCurrentPage(selectedPage);
    fetchClients(selectedPage);
  };

  const handleDelete = useCallback(
    (item) => {
      deleteClient(item.id);
    },
    [deleteClient]
  );

  const handleEdit = useCallback(
    (item) => {
      onSelectClient(item);
    },
    [onSelectClient]
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
      fetchClients(1, searchParams);
    },
    [fetchClients, searchForm]
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
            Name
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Mobile
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            address
          </div>
          <div className="sm:text-left text-default-color font-title flex-1">
            Client Category
          </div>
          <div className="sm:text-left text-default-color font-title sm:w-11">
            Action
          </div>
        </div>

        <div>
          {currentItems &&
            currentItems.map((client, index) => (
              <div className={defaultTdWrapperStyle} key={client.id}>
                <div className="px-4 py-2">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Name</div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden pl-1">
                      {client.name}
                    </span>
                  </div>
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Mobile</div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {client.phone_number}
                    </span>
                  </div>
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>Address</div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {client.address}{" "}
                    </span>
                  </div>
                </div>
                <div className={defaultTdStyle}>
                  <div className={defaultTdContentTitleStyle}>
                    client Category
                  </div>
                  <div className={defaultTdContent}>
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
                      {client.category}{" "}
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
                      <MenuItem onClick={() => handleEdit(client)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDelete(client)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>
            ))}

          {clients.data.length <= 0 && !initLoading && (
            <EmptyBar title="Client Data" />
          )}

          {clients.data.length > 0 && (
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

export default ClientTable;
