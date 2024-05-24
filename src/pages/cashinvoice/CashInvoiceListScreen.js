import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import PageTitle from "../../components/Common/PageTitle";
import InvoiceIcon from "../../components/Icons/InvoiceIcon";
import InvoiceTable from "../../components/CashInvoice/CashInvoiceTable.js";

function CashInvoiceListScreen() {
  const navigate = useNavigate();

  const goToNewInvoice = useCallback(() => {
    navigate("/cashinvoice/new");
  }, [navigate]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row flex-wrap p-4">
        <div className="sm:mr-4">
          <PageTitle title="Cash Invoice" />
        </div>
        <div className="flex-1">
          <Button onClick={goToNewInvoice} block={1} size="sm">
            <InvoiceIcon />
            <span className="inline-block ml-2"> Add Cash Invoice </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap">
        <div className="w-full px-4 mb-4 sm:mb-1">
          <InvoiceTable showAdvanceSearch />
        </div>
      </div>
    </div>
  );
}

export default CashInvoiceListScreen;
