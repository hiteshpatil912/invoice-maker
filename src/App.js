import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import DashboardScreen from "./pages/DashboardScreen";
import ClientListScreen from "./pages/clients/ClientListScreen";
import ProductListScreen from "./pages/products/ProductListScreen";
import InvoiceListScreen from "./pages/invoices/InvoiceListScreen";
import CashInvoiceListScreen from "./pages/cashinvoice/CashInvoiceListScreen.js";
import DiscountListScreen from "./pages/discount/DiscountListScreen";
import InvoiceDetailScreen from "./pages/invoices/InvoiceDetailScreen";
import CashInvoiceDetailScreen from "./pages/cashinvoice/CashInvoiceDetailScreen.js";
import SalesOrderInvoiceListScreen from "./pages/salesorderinvoice/SalesOrderInvoiceListScreen.js";
import SalesOrderInvoiceDetailScreen from "./pages/salesorderinvoice/SalesOrderInvoiceDetailScreen.js";
import CreditInvoiceListScreen from "./pages/creditinvoice/CreditInvoiceListScreen.js";
import CreditInvoiceDetailScreen from "./pages/creditinvoice/CreditInvoiceDetailScreen.js";
import ReturnInvoiceListScreen from "./pages/returninvoice/ReturnInvoiceListScreen.js";
import ReturnInvoiceDetailScreen from "./pages/returninvoice/ReturnInvoiceDetailScreen.js"

import AboutScreen from "./pages/about/AboutScreen";
import Container from "./components/Container/Container";
import useInitApp from "./hook/useInitApp";
import PageLoading from "./components/Common/PageLoading";
import Login from "./auth/Login.js";
import { AuthProvider } from "./auth/AuthContext.js";

const App = () => {
  const { initialSetData } = useInitApp();
  const authData = JSON.parse(localStorage.getItem("auth"));
  const isAuthenticated = authData && authData.token;
  const userRole = authData ? authData.role : null;

  useEffect(() => {
    initialSetData();
  }, [initialSetData]);

  return (
    <AuthProvider>
      <BrowserRouter>
        {isAuthenticated ? (
          <Container>
            <Routes>
              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="clients" element={<ClientListScreen />} />
              <Route path="products" element={<ProductListScreen />} />
              <Route path="discount" element={<DiscountListScreen />} />
              <Route path="invoices" element={<InvoiceListScreen />} />
              <Route path="invoices/:id" element={<InvoiceDetailScreen />} />
              <Route path="cashinvoice" element={<CashInvoiceListScreen />} />
              <Route path="cashinvoice/:id" element={<CashInvoiceDetailScreen />} />
              <Route path="salesorderInvoice" element={<SalesOrderInvoiceListScreen />}/>
              <Route path="salesorderInvoice/:id" element={<SalesOrderInvoiceDetailScreen />} />
              <Route path="creditInvoice" element={<CreditInvoiceListScreen />} exact />
              <Route path="creditInvoice/:id" element={<CreditInvoiceDetailScreen />} />
              <Route path="returnInvoice" element={<ReturnInvoiceListScreen />} exact />
              <Route path="returnInvoice/:id" element={<ReturnInvoiceDetailScreen />} />
              <Route path="about" element={<AboutScreen />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
            <ToastContainer />
            <PageLoading />
          </Container>
        ) : (
          <Routes>
            {/* Unauthenticated Routes */}
            <Route path="login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
