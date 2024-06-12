import ReactPaginate from "react-paginate";

const  ClientSelectionModal = ({
    clients,
    onClose,
    onSelect,
    handlePageClick,
    pageCount,
  }) => 
    (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-10">
      <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-3xl w-full">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Select a Client</h2>
          <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {clients.data.map((client) => (
              <li
                key={client.id}
                className="p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelect(client)}
              >
                <div className="font-semibold">{client.name}</div>
                <div className="text-sm text-gray-600">{client.address}</div>
                <div className="text-sm text-gray-600">
                  {client.phone_number}
                </div>
                <div className="text-sm text-gray-600">
                  {client.client_category}
                </div>
              </li>
            ))}
          </ul>

          {clients.data.length === 0 && (
            <div className="text-center mt-4">No clients found.</div>
          )}

          {clients.data.length > 0 && (
            <ReactPaginate
              className="flex justify-center mt-4"
              previousLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              nextLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              pageLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              breakLinkClassName="py-2 px-3 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              activeLinkClassName="py-2 px-3 text-blue-600 bg-blue-50 border border-gray-300 hover:bg-blue-100 hover:text-blue-700"
              breakLabel="..."
              onPageChange={handlePageClick}
              pageRangeDisplayed={1}
              pageCount={pageCount}
              previousLabel="<"
              nextLabel=">"
              renderOnZeroPageCount={null}
            />
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  export default ClientSelectionModal;