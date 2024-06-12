import React,{useState} from "react";
import PageTitle from "../../components/Common/PageTitle";
import ClientTable from "../../components/Clients/ClientTable";
import QuickAddClient from "../../components/Clients/QuickAddClient";
// import QuickAddClient from "../../components/Dashboard/QuickAddClient";

function ClientListScreen() {
  const [ newOrUpdatedClient , setNewOrUpdatedClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);



  const handleUpdateClient = (newClient) =>{
    setNewOrUpdatedClient(newClient);
  }

  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  return (
    <div>
      <div className="p-4">
        <PageTitle title="Clients" />
      </div>

      <div className="flex flex-wrap">
        <div className="w-full lg:w-4/6 pl-4 pr-4 sm:pl-4 sm:pr-0 mb-4 sm:mb-1">
          <ClientTable showAdvanceSearch onSelectClient={handleSelectClient} onNewOrUpdateClient={newOrUpdatedClient} />
        </div>
        <div className="w-full lg:w-2/6 pl-4 pr-4 sm:pl-4 sm:pr-2">
          <QuickAddClient selectedClient={selectedClient} onNewUpdateClient={handleUpdateClient} />
        </div>
      </div>
    </div>
  );
}

export default ClientListScreen;
