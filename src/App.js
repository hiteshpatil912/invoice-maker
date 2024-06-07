import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

import DashboardScreen from "./pages/DashboardScreen";
import InvoiceListScreen from "./pages/invoices/InvoiceListScreen";
import ClientListScreen from "./pages/clients/ClientListScreen";
import ProductListScreen from "./pages/products/ProductListScreen";
import DiscountListScreen from "./pages/discount/DiscountListScreen"; 

import CashInvoiceListScreen from "./pages/cashinvoice/CashInvoiceListScreen.js";
import CreditInvoiceListScreen from "./pages/creditinvoice/CreditInvoiceListScreen.js";
import SalesOrderInvoiceListScreen from "./pages/salesorderinvoice/SalesOrderInvoiceListScreen.js";
import ReturnInvoiceListScreen from "./pages/returninvoice/ReturnInvoiceListScreen.js"

import InvoiceDetailScreen from "./pages/invoices/InvoiceDetailScreen";
import CashInvoiceDetailScreen from "./pages/cashinvoice/CashInvoiceDetailScreen.js";
import CreditInvoiceDetailScreen from "./pages/creditinvoice/CreditInvoiceDetailScreen.js";
import SalesOrderInvoiceDetailScreen from "./pages/salesorderinvoice/SalesOrderInvoiceDetailScreen.js"
import ReturnInvoiceDetailScreen from "./pages/returninvoice/ReturnInvoiceDetailScreen.js"

import AboutScreen from "./pages/about/AboutScreen";
import Container from "./components/Container/Container";
import useInitApp from "./hook/useInitApp";

import ClientDeleteConfirm from "./components/Clients/ClientDeleteConfirm";
import ClientEditModal from "./components/Clients/ClientEditModal";
import ProductDeleteConfirm from "./components/Product/ProductDeleteConfirm";
import ProductEditModal from "./components/Product/ProductEditModal";

import ClientChooseModal from "./components/Clients/ClientChooseModal";
import ProductChoosenModal from "./components/Product/ProductChoosenModal";

import InvoiceSettingModal from "./components/Invoice/InvoiceSettingModal";
import InvoiceConfirmModal from "./components/Invoice/InvoiceConfirmModal";
import InvoiceDeleteConfirm from "./components/Invoice/InvoiceDeleteConfirm";

import PageLoading from "./components/Common/PageLoading";

const App = () => {
  const { initialSetData } = useInitApp();

  useEffect(() => {
    initialSetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Container>
      {/* <Switch>
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/" component={UserDashboard} />
      </Switch> */}
        <Routes>
          <Route path="/" element={<DashboardScreen />} />

          <Route path="clients" element={<ClientListScreen />}></Route>

          <Route path="products" element={<ProductListScreen />}></Route>

          <Route path="discount" element={<DiscountListScreen />}></Route>

          <Route path="invoices">
            <Route path="" element={<InvoiceListScreen />} exact />
            <Route path=":id" element={<InvoiceDetailScreen />} />
          </Route>
          {/* cashInvoice */}
          <Route path="cashinvoice">
            <Route path="" element={<CashInvoiceListScreen />} exact />
            <Route path=":id" element={<CashInvoiceDetailScreen />} />
          </Route>
            {/* CreditInvoice */}
            <Route path="creditInvoice">
            <Route path="" element={<CreditInvoiceListScreen />} exact />
            <Route path=":id" element={<CreditInvoiceDetailScreen />} />
          </Route>
            {/* SalesOrderInvoice */}
            <Route path="salesorderInvoice">
            <Route path="" element={<SalesOrderInvoiceListScreen />} exact />
            <Route path=":id" element={<SalesOrderInvoiceDetailScreen />} />
          </Route>
           {/* ReturnInvoice */}
           <Route path="returnInvoice">
            <Route path="" element={<ReturnInvoiceListScreen />} exact />
            <Route path=":id" element={<ReturnInvoiceDetailScreen />} />
          </Route>

          <Route path="about" element={<AboutScreen />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
      <ToastContainer />
      <ClientDeleteConfirm />
      <ClientEditModal />
      <ClientChooseModal />
      <ProductDeleteConfirm />
      <ProductEditModal />
      <ProductChoosenModal />
      <InvoiceSettingModal />
      <InvoiceConfirmModal />
      <InvoiceDeleteConfirm />
      <PageLoading />
    </BrowserRouter>
  );
};

export default App;
