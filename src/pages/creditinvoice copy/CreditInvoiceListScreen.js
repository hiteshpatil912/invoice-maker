import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button.js";
import PageTitle from "../../components/Common/PageTitle.js";
import InvoiceIcon from "../../components/Icons/InvoiceIcon.js";
import InvoiceTable from "../../components/CreditInvoice/CreditInvoiceTable.js";

function CreditInvoiceListScreen() {
  const navigate = useNavigate();

  const goToNewInvoice = useCallback(() => {
    navigate("/creditinvoice/new");
  }, [navigate]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row flex-wrap p-4">
        <div className="sm:mr-4">
          <PageTitle title="Credit Invoice" />
        </div>
        <div className="flex-1">
          <Button onClick={goToNewInvoice} block={1} size="sm">
            <InvoiceIcon />
            <span className="inline-block ml-2"> Add Credit Invoice </span>
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

export default CreditInvoiceListScreen;
