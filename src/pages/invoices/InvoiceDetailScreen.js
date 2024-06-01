import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { useReactToPrint } from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import {
  defaultTdStyle,
  defaultTdActionStyle,
  defaultTdWrapperStyle,
  defaultTdContent,
  defaultTdContentTitleStyle,
  defaultSearchStyle,
} from "../../constants/defaultStyles";
// import NumberFormat from "react-number-format";
import { NumberFormatBase } from "react-number-format";
import { toast } from "react-toastify";
import domtoimage from "dom-to-image";
import InvoiceTopBar from "../../components/Invoice/InvoiceTopBar";
import {
  getAllInvoiceDetailSelector,
  getCurrentBGImage,
  getCurrentColor,
  getInvoiceNewForm,
  getIsConfirm,
  setConfirmModalOpen,
  setDefaultBackground,
  setDefaultColor,
  setIsConfirm,
  setNewInvoices,
  setSettingModalOpen,
  updateExisitingInvoiceForm,
  updateNewInvoiceForm,
} from "../../store/invoiceSlice";
import {
  getSelectedClient,
  setOpenClientSelector,
} from "../../store/clientSlice";
import { getCompanyData } from "../../store/companySlice";
import { defaultInputSmStyle, IconStyle } from "../../constants/defaultStyles";
import Button from "../../components/Button/Button";
import ClientPlusIcon from "../../components/Icons/ClientPlusIcon";
import InvoiceIcon from "../../components/Icons/InvoiceIcon";
import { nanoid } from "nanoid";
import DeleteIcon from "../../components/Icons/DeleteIcon";
import Modal from "../../components/Modal";
import {
  getSelectedProduct,
  setOpenProductSelector,
} from "../../store/productSlice";
import { useAppContext } from "../../context/AppContext";
import TaxesIcon from "../../components/Icons/TaxesIcon";
import {
  getTotalTaxesWithPercent,
  sumProductTotal,
  sumTotalAmount,
  sumTotalTaxes,
} from "../../utils/match";
import PageTitle from "../../components/Common/PageTitle";
import ProductChoosenModal from "../../components/Product/ProductChoosenModal";
import { jsPDF } from "jspdf";

function InvoiceDetailScreen(props, { showAdvanceSearch = false }) {
  const { initLoading, showNavbar, toggleNavbar, setEscapeOverflow } =
    useAppContext();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const componentRef = useRef(null);
  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Invoice Letter",
    onAfterPrint: useCallback(() => {
      setIsExporting(false);
      setEscapeOverflow(false);
    }, [setEscapeOverflow]),
    removeAfterPrint: true,
  });
  const invoiceNewForm = useSelector(getInvoiceNewForm);
  const allInvoiceDetails = useSelector(getAllInvoiceDetailSelector);
  const company = useSelector(getCompanyData);
  const selectedClient = useSelector(getSelectedClient);
  const selectedProduct = useSelector(getSelectedProduct);
  const currentBg = useSelector(getCurrentBGImage);
  const currentColor = useSelector(getCurrentColor);
  const isConfirm = useSelector(getIsConfirm);
  const [invoiceForm, setInvoiceForm] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusData, setStatusData] = useState({
    statusName: "Draft",
    statusIndex: 1,
  });
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const emptySearchForm = { name: "", productID: "", category: "" };
  const [searchForm, setSearchForm] = useState(emptySearchForm);
  const allProducts = useSelector((state) => state.products.allProducts);
  const products = useMemo(() => {
    if (!allProducts) return []; // Handle the case where allProducts is undefined
    let filterData = allProducts.length > 0 ? [...allProducts].reverse() : [];
    if (searchForm.category?.trim()) {
      filterData = filterData.filter((product) =>
        product.category.includes(searchForm.category)
      );
    }
    return filterData;
  }, [allProducts, searchForm]);

  const handleExport = useCallback(() => {
    if (showNavbar) {
      toggleNavbar();
    }
    setEscapeOverflow(true);
    setIsViewMode(true);
    setIsExporting(true);
    setTimeout(() => {
      handlePrint();
    }, 3000);
  }, [handlePrint, setEscapeOverflow, showNavbar, toggleNavbar]);

  const handleDownloadPdf = useCallback(() => {
    if (showNavbar) {
      toggleNavbar();
    }
    setEscapeOverflow(true);
    setIsViewMode(true);
    setIsExporting(true);

    domtoimage.toPng(componentRef.current).then((dataUrl) => {
      try {
        const pdf = new jsPDF("p", "mm", "a4");
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const imgWidth = pdf.internal.pageSize.getWidth();
          const imgHeight = (img.height * imgWidth) / img.width;

          pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
          pdf.save("invoice.pdf");
        };
      } catch (e) {
        console.log(e);
      } finally {
        setIsExporting(false);
        setEscapeOverflow(false);
      }
    });
  }, [setEscapeOverflow, showNavbar, toggleNavbar]);

  // const handleDownloadImg = useCallback(() => {
  //   if (showNavbar) {
  //     toggleNavbar();
  //   }
  //   setEscapeOverflow(true);
  //   setIsViewMode(true);
  //   setIsExporting(true);
  //   domtoimage
  //     .toJpeg(componentRef.current, { quality: 1 })
  //     .then(async (dataUrl) => {
  //       try {
  //         const res = await fetch(dataUrl);
  //         const blob = await res.blob();
  //         let a = document.createElement("a");
  //         a.href = URL.createObjectURL(blob);
  //         a.download = "invoice.jpeg";
  //         a.hidden = true;
  //         document.body.appendChild(a);
  //         a.click();
  //         a.remove();
  //       } catch (e) {
  //         console.log(e);
  //       } finally {
  //         setIsExporting(false);
  //         setEscapeOverflow(false);
  //       }
  //     });
  // }, [setEscapeOverflow, showNavbar, toggleNavbar]);

  const toggleViewMode = useCallback(() => {
    if (invoiceForm.statusIndex !== "1" && isViewMode) {
      toast.warn("You can only edit on Draft Mode", {
        position: "bottom-center",
        autoClose: 3000,
      });
      return;
    }
    setIsViewMode((prev) => !prev);
  }, [invoiceForm, isViewMode]);
  const openSettingModal = useCallback(() => {
    if (invoiceForm.statusIndex !== "1" && isViewMode) {
      toast.warn("You can only change Setting on Draft Mode", {
        position: "bottom-center",
        autoClose: 3000,
      });
      return;
    }
    dispatch(setSettingModalOpen(true));
  }, [dispatch, invoiceForm, isViewMode]);

  const openChooseClient = useCallback(() => {
    dispatch(setOpenClientSelector(true));
  }, [dispatch]);

  const openChooseProduct = useCallback(
    (category) => {
      setSelectedCategory(category);
      dispatch(setOpenProductSelector(true));
      setIsModalOpen(true);
    },
    [dispatch]
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // setSelectedCategory(null);
  };

  const handlerInvoiceValue = useCallback((event, keyName) => {
    const value =
      typeof event === "string" ? new Date(event) : event?.target?.value;
    setInvoiceForm((prev) => {
      return { ...prev, [keyName]: value };
    });
  }, []);

  const handlerProductValue = useCallback(
    (event, keyName, productID) => {
      const value = event.target.value;

      // If Keyname Price or Quantity must be only number
      if (keyName === "quantity") {
        if (!`${value}`.match(/^\d+$/)) {
          return;
        }
      }

      if (keyName === "amount") {
        if (!`${value}`.match(/^[0-9]\d*(\.\d+)?$/)) {
          return;
        }
      }

      // Quantity Zero Case
      if ((keyName === "quantity" || keyName === "amount") && value <= 0) {
        return;
      }

      let updatedData = { ...invoiceForm };
      let updateProducts = [...invoiceForm.products];

      const isFindIndex = updateProducts.findIndex(
        (prod) => prod.id === productID
      );

      if (isFindIndex !== -1) {
        updateProducts[isFindIndex] = {
          ...updateProducts[isFindIndex],
          [keyName]: value,
        };

        updatedData.products = [...updateProducts];
      }

      if (keyName === "quantity" || keyName === "amount") {
        const subTotalAmount = sumProductTotal(updateProducts);
        const updateTaxes = getTotalTaxesWithPercent(
          invoiceForm.taxes,
          subTotalAmount
        );
        updatedData.taxes = updateTaxes;
        updatedData.totalAmount = sumTotalAmount(
          subTotalAmount,
          sumTotalTaxes(updateTaxes)
        );
      }
      setInvoiceForm(updatedData);
    },
    [invoiceForm]
  );

  const onDeleteProduct = useCallback((prodID) => {
    setInvoiceForm((prev) => {
      let updatedData = { ...prev };
      const updateProducts = prev.products.filter((prod) => prod.id !== prodID);
      const subTotalAmount = sumProductTotal(updateProducts);
      const updateTaxes = getTotalTaxesWithPercent(prev.taxes, subTotalAmount);
      // const updateDiscount =getTotalDiscountwithPercent(0);
      updatedData.products = updateProducts;
      updatedData.taxes = updateTaxes;
      // updatedData.taxes = updateDiscount;
      updatedData.totalAmount = sumTotalAmount(
        subTotalAmount,
        sumTotalTaxes(updateTaxes)
      );
      return updatedData;
    });
  }, []);

  // abc
  const handlerDiscountsValue = useCallback(
    (event, keyName, discountID) => {
      const value = event.target.value;
      let updateDiscounts = [...invoiceForm.discounts];
      const isFindIndex = updateDiscounts.findIndex(
        (disc) => disc.id === discountID
      );
      if (isFindIndex === -1) {
        return;
      }
      const currentDiscount = updateDiscounts[isFindIndex];

      // Validation based on discount type
      if (currentDiscount.type === "percentage" && keyName === "value") {
        if (!`${value}`.match(/^[0-9]\d*(\.\d+)?$/)) {
          return;
        }

        if (value <= 0 || value > 100) {
          return;
        }
      }

      if (currentDiscount.type === "flat" && keyName === "value") {
        if (!`${value}`.match(/^[0-9]\d*(\.\d+)?$/)) {
          return;
        }

        if (value <= 0) {
          return;
        }
      }

      // Update invoice form state
      setInvoiceForm((prev) => {
        let discounts = [...prev.discounts];

        if (keyName === "value") {
          const sumDiscounts = (discounts) => {
            return discounts.reduce((total, discount) => {
              return (
                total +
                (discount.type === "percentage"
                  ? (discount.value / 100) * subTotalAmount
                  : discount.amount)
              );
            }, 0);
          };
          const subTotalAmount = sumProductTotal(prev.products);
          const discountAmount = (value / 100) * subTotalAmount;
          discounts[isFindIndex] = {
            ...discounts[isFindIndex],
            [keyName]: value,
            amount:
              currentDiscount.type !== "percentage" ? value : discountAmount,
          };
          const totalAmount = subTotalAmount - sumDiscounts(discounts);
          return { ...prev, discounts: discounts, totalAmount: totalAmount };
        } else {
          discounts[isFindIndex] = {
            ...discounts[isFindIndex],
            [keyName]: value,
          };
          return { ...prev, discounts: discounts };
        }
      });
    },
    [invoiceForm]
  );
  const handlerInvoiceClientValue = useCallback((event, keyName) => {
    const value =
      typeof event === "string" ? new Date(event) : event?.target?.value;

    setInvoiceForm((prev) => {
      return {
        ...prev,
        clientDetail: { ...prev.clientDetail, [keyName]: value },
      };
    });
  }, []);
  // Calculation for Showing
  const subTotal = useMemo(() => {
    if (!invoiceForm) {
      return 0;
    }

    if (!invoiceForm?.products) {
      return 0;
    }
    return sumProductTotal(invoiceForm.products);
  }, [invoiceForm]);

  // abc addDiscount
  const addDiscount = useCallback((category, client) => {
    console.log("Adding Discount!", category, client);
  
    const isSomeDiscount = invoiceForm?.discounts?.some(
      (form) => form.type === "percentage"
    );
  
    if (isSomeDiscount) {
      toast.error("Already Have Percentage Discounts!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }
  
    // Assuming you have access to client and product category IDs
    const clientCategoryId = client.id; // Replace with the correct property name
    const productCategoryId = category.id; // Replace with the correct property name
  
    // Find the discount using the client and product category IDs
    const discount = findDiscount(clientCategoryId, productCategoryId);
  
    if (discount) {
      // Apply the discount
      console.log("Discount found:", discount);
      // Further logic to apply the discount as needed
    } else {
      console.log("No discount found for the given category and client.");
    }
  
    console.log("invoiceForm", invoiceForm);

    console.log("invoiceForm", invoiceForm);
    setInvoiceForm((prev) => {
      const subTotalAmount = sumProductTotal(prev.products);

      // // find the discount using client and product category id
      // ccid=clintid;
      // pcid=pcid;
      // findDscount(cciid,pcid);
      // // set discountPercentage

      // Calculate discount
      const discountPercentage = 5; // Example: 5% discount
      const discountAmount = (discountPercentage / 100) * subTotalAmount;
      const totalAmount = subTotalAmount - discountAmount;

      const discount = {
        id: nanoid(),
        title: "Discount",
        type: "percentage",
        value: discountPercentage,
        amount: discountAmount,
      };

      return {
        ...prev,
        discounts: prev?.discounts
          ? [discount, ...prev?.discounts]
          : [discount],
        totalAmount: totalAmount,
      };
    });
  }, [invoiceForm]);
  const findDiscount = (clientCategoryId, productCategoryId) => {
    // Your logic to find the discount based on client and product category IDs
    // Iterate through your discount data to find the applicable discount
    // Return the discount object if found, or null if not found
  };
  // rozy

  // const getDiscountRate = (clientCategoryId, productCategoryId) => {
  //   const discount = discountTable.find(
  //     (d) => d.clientCategoryId === clientCategoryId && d.productCategoryId === productCategoryId
  //   );
  //   return discount ? discount.discountRate : null;
  // };
  
  // const applyDiscount = (product, clientCategory) => {
  //   const discountRate = getDiscountRate(clientCategory.id, product.productCategoryId);
  //   if (discountRate !== null) {
  //     return {
  //       ...product,
  //       price: product.price - product.price * discountRate,
  //     };
  //   }
  //   return null;
  // };
  
  // const InvoiceDetailScreen = ({ invoiceForm }) => {
  //   const [selectedProducts, setSelectedProducts] = useState([]);
  //   const [discountedProducts, setDiscountedProducts] = useState([]);
  //   const [client, setClient] = useState(null);
  
  //   useEffect(() => {
  //     if (invoiceForm?.clientDetail?.clientCategory) {
  //       setClient(invoiceForm.clientDetail.clientCategory);
  //     }
  //   }, [invoiceForm]);
  
  //   const handleAddProduct = (product) => {
  //     setSelectedProducts((prevSelected) => [...prevSelected, product]);
  //   };
  
  //   const handleAddDiscount = useCallback(() => {
  //     if (selectedProducts.length > 0 && client) {
  //       const newDiscountedProducts = selectedProducts.map((product) => {
  //         const discountedProduct = applyDiscount(product, client);
  //         return discountedProduct || product;
  //       });
  //       setDiscountedProducts(newDiscountedProducts);
  //     }
  //   }, [selectedProducts, client]);
  
  //   const selectProduct = (productId) => {
  //     const product = products.find((p) => p.id === productId);
  //     if (product) {
  //       handleAddProduct(product);
  //     }
  //   };
  
  //   return (
  //     <div>
  //       <h1>Invoice</h1>
  //       <div>
  //         {discountedProducts.map((product) => (
  //           <div key={product.id}>
  //             <p>{product.name} - ${product.price.toFixed(2)}</p>
  //           </div>
  //         ))}
  //       </div>
  //       {/* Example product selection */}
  //       <button onClick={() => selectProduct(1)}>Select Product A</button>
  //       <button onClick={() => selectProduct(2)}>Select Product B</button>
  //       <button onClick={handleAddDiscount}>Add Discount</button>
  //       {discountedProducts.length === 0 && <p>No discounts available.</p>}
  //     </div>
  //   );
  // };

  // xyz
  const saveAs = useCallback(
    (status) => {
      setStatusData({
        statusIndex: status === "Draft" ? "1" : status === "Unpaid" ? "2" : "3",
        statusName: status,
      });
      dispatch(setConfirmModalOpen(true));
    },
    [dispatch]
  );

  const onDeleteDiscount = (discountID) => {
    // Filter out the discount with the given ID
    const updatedDiscounts = invoiceForm.discounts.filter(
      (discount) => discount.id !== discountID
    );

    // Update the invoice form state with the filtered discounts
    setInvoiceForm((prev) => ({
      ...prev,
      discounts: updatedDiscounts,
      // You might need to recalculate the total amount here
    }));
  };
  const goInvoiceList = useCallback(() => {
    navigate("/invoices");
  }, [navigate]);

  useEffect(() => {
    if (selectedProduct !== null) {
      // If Choosen Exisiting Client And This form is news
      const { name, productID, amount } = selectedProduct;
      const newProduct = { id: nanoid(), name, productID, amount, quantity: 1 };
      setInvoiceForm((prev) => {
        let updatedData = { ...prev };
        const updateProducts = [...prev.products, newProduct];
        const subTotalAmount = sumProductTotal(updateProducts);
        const updateTaxes = getTotalTaxesWithPercent(
          prev.taxes,
          subTotalAmount
        );
        updatedData.products = updateProducts;
        updatedData.taxes = updateTaxes;
        updatedData.totalAmount = sumTotalAmount(
          subTotalAmount,
          sumTotalTaxes(updateTaxes)
        );
        return updatedData;
      });
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (initLoading === false) {
      if (params.id === "new" && invoiceForm === null) {
        // If New I ignore Company Data,
        // Everytime we set current company Data
        setInvoiceForm({
          ...invoiceNewForm,
          companyDetail: { ...company },
          dueDate: new Date(invoiceNewForm.dueDate),
          createdDate: new Date(),
        });

        dispatch(setDefaultBackground(invoiceNewForm.backgroundImage));
        dispatch(setDefaultColor(invoiceNewForm.color));
      } else if (params.id !== "new" && invoiceForm === null) {
        // Else Exisiting Invoice,
        // We'll Set Company Data
        // But if it's Draft, we'll currenty set the data for Current Company Data
        // Because it's still Draft State
        const getInvoiceDetail = allInvoiceDetails.find(
          (inv) => inv.id === params.id
        );

        // If not Found Redirect Back
        // navigate("/");
        if (!getInvoiceDetail) {
          navigate("/invoices");
          return;
        } else {
          setInvoiceForm({
            ...getInvoiceDetail,
            companyDetail: { ...getInvoiceDetail.companyDetail },
            dueDate: new Date(getInvoiceDetail.dueDate),
            createdDate: new Date(getInvoiceDetail.createdDate),
          });

          dispatch(setDefaultBackground(getInvoiceDetail.backgroundImage));
          dispatch(setDefaultColor(getInvoiceDetail.color));
          setIsViewMode(true);
        }
      }
    }
  }, [
    params,
    invoiceForm,
    navigate,
    invoiceNewForm,
    initLoading,
    company,
    dispatch,
    allInvoiceDetails,
  ]);
  useEffect(() => {
    if (selectedClient !== null) {
      // If Choosen Exisiting Client And This form is news
      setInvoiceForm((prev) => {
        return {
          ...prev,
          clientDetail: { ...selectedClient },
        };
      });
    }
  }, [selectedClient]);

  useEffect(() => {
    // if (invoiceForm.produ)
    if (params.id === "new" && invoiceForm !== null) {
      dispatch(updateNewInvoiceForm(invoiceForm));
    } else if (params.id !== "new" && invoiceForm !== null) {
      dispatch(updateExisitingInvoiceForm(invoiceForm));
    }
  }, [dispatch, invoiceForm, params]);

  useEffect(() => {
    if (initLoading === false) {
      setInvoiceForm((prev) => ({
        ...prev,
        backgroundImage: currentBg,
        color: currentColor,
      }));
    }
  }, [currentBg, currentColor, initLoading]);
  // On Confirm Dependencies
  useEffect(() => {
    if (isConfirm) {
      const isNew = params.id === "new";
      if (isNew) {
        dispatch(setIsConfirm(false));
        dispatch(setNewInvoices({ ...invoiceForm, ...statusData }));
        setInvoiceForm({
          ...invoiceForm,
          products: [
            {
              amount: 1200,
              id: nanoid(),
              name: "productName",
              productID: "",
              quantity: 1,
            },
          ],
          taxes: [],
          totalAmount: 1200,
        });

        setTimeout(() => {
          navigate("/invoices");
        }, 300);
      } else {
        // Update Exisiting Invoice
        dispatch(setIsConfirm(false));
        setIsViewMode(true);
        setInvoiceForm({
          ...invoiceForm,
          ...statusData,
        });
      }
    }
  }, [dispatch, invoiceForm, isConfirm, navigate, params, statusData]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [product, setProduct] = useState([]);
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Books" },
    { id: 3, name: "Clothing" },
    // Add more categories as needed
  ];
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const fetchProducts = () => {
    const filteredProducts = allProducts.filter(
      (product) => product.category === selectedCategory
    );
    setProduct(filteredProducts);
  };

  return (
    <div>
      <div className="p-4">
        <PageTitle
          title={
            <>
              {params.id === "new"
                ? "New Invoice"
                : `Invoice Detail ${invoiceForm?.statusName}`}
            </>
          }
        />
      </div>
      {/* <div className="px-4 pb-3">
        <InvoiceTopBar
          onClickBack={goInvoiceList}
          viewMode={isViewMode}
          onClickViewAs={toggleViewMode}
          onClickSetting={openSettingModal}
          onClickExport={handleExport}
          onClickDownloadImg={handleDownloadImg}
        />
      </div> */}
      {invoiceForm && (
        <div
          className={
            isExporting
              ? "bg-white mb-1 pt-1 px-1 "
              : "bg-white mx-4 rounded-xl mb-1"
          }
          id="InvoiceWrapper"
          ref={componentRef}
          style={isExporting ? { width: 1200 } : {}}
        >
          {/* Background Image */}
          <div
            className={
              isExporting
                ? "py-5 px-8 bg-cover bg-center bg-slate-50 rounded-xl flex flex-row justify-between items-center"
                : "py-9 px-8 bg-cover bg-center bg-slate-50 rounded-xl flex flex-col sm:flex-row justify-between items-center"
            }
            style={{
              backgroundImage: `url(${invoiceForm?.backgroundImage?.base64})`,
            }}
          >
            <div
              className={
                isExporting
                  ? "flex xflex-row items-center"
                  : "flex flex-col sm:flex-row items-center"
              }
            >
              {invoiceForm?.companyDetail?.image ? (
                <img
                  className="object-contain h-20 w-20 mr-3 rounded"
                  alt={invoiceForm?.companyDetail?.companyName}
                  src={invoiceForm?.companyDetail?.image}
                />
              ) : (
                <span></span>
              )}

              <div
                className={
                  isExporting
                    ? "text-white font-title text-left"
                    : "text-white font-title text-center sm:text-left"
                }
              >
                <p className="font-bold mb-2">
                  {invoiceForm?.companyDetail?.companyName || "Company Name"}
                </p>
                <p className="text-sm font-medium">
                  {invoiceForm?.companyDetail?.billingAddress ||
                    "Plz add First Company Data"}
                </p>
                <p className="text-sm font-medium">
                  {invoiceForm?.companyDetail?.companyMobile || "Company Ph"}
                </p>
                <p className="text-sm font-medium">
                  {invoiceForm?.companyDetail?.companyEmail ||
                    "Company@email.com"}
                </p>
              </div>
            </div>
            <div className="text-white font-title font-bold text-5xl mt-5 sm:mt-0">
              Invoice
            </div>
          </div>
          {/* Background Image Finished */}
          {/* Customer Billing Info */}
          <div
            className={
              isExporting
                ? "flex flex-row pt-2 px-8"
                : "flex flex-col sm:flex-row pt-3 px-8"
            }
          >
            <div className="flex-1">
              <div className="flex flex-row">
                <div className="font-title font-bold">Billing To</div>
                <div className="w-1/2 relative ml-3" style={{ top: "-3px" }}>
                  {!isViewMode && (
                    <Button size="sm" outlined={1} onClick={openChooseClient}>
                      <ClientPlusIcon className="w-4 h-4" /> Exisiting
                    </Button>
                  )}
                </div>
              </div>
              <div className="client-form-wrapper sm:w-1/2">
                <div
                  className={
                    "font-medium " + (isExporting ? "text-xs" : "text-sm mb-1")
                  }
                >
                  {invoiceForm?.clientDetail?.name}
                </div>
                <div
                  className={
                    "font-medium " + (isExporting ? "text-xs" : "text-sm mb-1")
                  }
                >
                  {invoiceForm?.clientDetail?.billingAddress}
                </div>
                <div
                  className={
                    "font-medium " + (isExporting ? "text-xs" : "text-sm mb-1")
                  }
                >
                  {invoiceForm?.clientDetail?.mobileNo}
                </div>
                <div
                  className={
                    "font-medium " + (isExporting ? "text-xs" : "text-sm mb-1")
                  }
                >
                  {invoiceForm?.clientDetail?.clientCategory}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="font-title font-bold">Add Product Category</div>
              <div className="flex flex-row">
                <div className="w-1/2 relative mt-2">
                  <div>
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl p-x2 focus:outline-none border-indigo-300 h-8 text-sm flex-1"
                    >
                      <div className="overflow-y h-12"></div>
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-row justify-between items-center mb-1">
                <div className="font-title flex-1"> INVOICE # </div>
                <div className="font-title flex-1 text-right">
                  {!isViewMode ? (
                    <input
                      autoComplete="nope"
                      placeholder="Invoice No"
                      className={defaultInputSmStyle + " text-right"}
                      value={invoiceForm.invoiceNo}
                      onChange={(e) => handlerInvoiceValue(e, "invoiceNo")}
                    />
                  ) : (
                    invoiceForm.invoiceNo || "-"
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between items-center mb-1">
                <div className="font-title flex-1"> Creation Date </div>
                <div className="font-title flex-1 text-right">
                  <DatePicker
                    selected={invoiceForm.createdDate}
                    onChange={(date) =>
                      handlerInvoiceValue(date.toISOString(), "createdDate")
                    }
                    disabled
                    className={
                      !isViewMode
                        ? defaultInputSmStyle + " border-gray-300 text-right"
                        : " text-right bg-white"
                    }
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between items-center mb-1">
                <div className="font-title flex-1"> Due Date </div>
                <div className="font-title flex-1 text-right">
                  <DatePicker
                    selected={invoiceForm.dueDate}
                    onChange={(date) =>
                      handlerInvoiceValue(date.toISOString(), "dueDate")
                    }
                    disabled={isViewMode}
                    className={
                      !isViewMode
                        ? defaultInputSmStyle + " border-gray-300 text-right"
                        : " text-right bg-white"
                    }
                  />
                </div>
              </div>
              {!isViewMode && (
                <div className="flex flex-row justify-between items-center mb-1">
                  <div className="font-title flex-1"> Change Currency </div>
                  <div className="font-title flex-1 text-right">
                    <input
                      autoComplete="nope"
                      placeholder="Invoice No"
                      className={defaultInputSmStyle + " text-right"}
                      value={invoiceForm.currencyUnit}
                      onChange={(e) => handlerInvoiceValue(e, "currencyUnit")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Customer Billing Info Finished */}

          {/* Products */}
          <div className="py-2 px-4">
            <div
              className={
                isExporting
                  ? "flex rounded-lg w-full flex-row px-4 py-1 text-white"
                  : "hidden sm:flex rounded-lg invisible sm:visible w-full flex-col sm:flex-row px-4 py-2 text-white"
              }
              style={{ backgroundColor: invoiceForm.color }}
            >
              <div
                className={
                  "font-title " +
                  (isExporting
                    ? " text-sm w-1/4 text-right pr-10"
                    : " w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                <span className="inline-block">Product Name</span>{" "}
              </div>
              <div
                className={
                  "font-title " +
                  (isExporting
                    ? " text-sm  w-1/4 text-right pr-10"
                    : " w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                Price{" "}
              </div>
              <div
                className={
                  "font-title " +
                  (isExporting
                    ? " text-sm  w-1/4 text-right pr-10"
                    : " w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                Qty{" "}
              </div>
              <div
                className={
                  "font-title" +
                  (isExporting
                    ? " text-sm w-1/4 text-right pr-10"
                    : "  w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                Total{" "}
              </div>
            </div>
            {!isViewMode && (
              <div className="flex flex-col sm:flex-row rounded-lg sm:visible w-full px-4 py-2 items-center sm:justify-end">
                <div className="font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block mb-1">
                  <Button
                    size="sm"
                    block={1}
                    onClick={() => openChooseProduct(selectedCategory)}
                  >
                    <InvoiceIcon style={IconStyle} className="w-5 h-5" />
                    Add Existing Product
                  </Button>

                  <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                    {selectedCategory && (
                      <ProductChoosenModal
                        onClose={handleCloseModal}
                        selectedCategory={selectedCategory}
                      />
                    )}
                  </Modal>
                </div>
              </div>
            )}

            {/* Add Product Actions */}

            {invoiceForm?.products?.map((product, index) => (
              <div
                key={`${index}_${product.id}`}
                className={
                  (isExporting
                    ? "flex flex-row rounded-lg w-full px-4 py-1 items-center relative text-sm"
                    : "flex flex-col sm:flex-row rounded-lg sm:visible w-full px-4 py-2 items-center relative") +
                  (index % 2 !== 0 ? " bg-gray-50 " : "")
                }
              >
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Product_name
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full mb-0"
                        : "inline-block w-1/2 sm:w-full mb-1 sm:mb-0"
                    }
                  >
                    {!isViewMode ? (
                      <input
                        autoComplete="nope"
                        value={product.name}
                        placeholder="Product Name"
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(e) =>
                          handlerProductValue(e, "name", product.id)
                        }
                      />
                    ) : (
                      <span className="pr-3">{product.name}</span>
                    )}
                  </span>
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Price
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full mb-0"
                        : "inline-block w-1/2 sm:w-full mb-1 sm:mb-0"
                    }
                  >
                    {!isViewMode ? (
                      <input
                        autoComplete="nope"
                        value={product.amount}
                        placeholder="Price"
                        type={"number"}
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(e) =>
                          handlerProductValue(e, "amount", product.id)
                        }
                      />
                    ) : (
                      <span className="pr-3">
                        <NumberFormatBase
                          value={product.amount}
                          className=""
                          displayType={"text"}
                          renderText={(value, props) => (
                            <span {...props}>{value}</span>
                          )}
                        />
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Quantity
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full mb-0"
                        : "inline-block w-1/2 sm:w-full mb-1 sm:mb-0"
                    }
                  >
                    {!isViewMode ? (
                      <input
                        autoComplete="nope"
                        value={product.quantity}
                        type={"number"}
                        placeholder="Quantity"
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(e) =>
                          handlerProductValue(e, "quantity", product.id)
                        }
                      />
                    ) : (
                      <span className="pr-3">
                        <NumberFormatBase
                          value={product.quantity}
                          className=""
                          displayType={"text"}
                          renderText={(value, props) => (
                            <span {...props}>{value}</span>
                          )}
                        />
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-9 flex flex-row `1block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-9 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Total
                    </span>
                  )}

                  <span
                    className={
                      isExporting
                        ? "inline-block w-full "
                        : "inline-block w-1/2 sm:w-full"
                    }
                  >
                    <NumberFormatBase
                      value={
                        Number.isInteger(product.quantity * product.amount)
                          ? product.quantity * product.amount
                          : (product.quantity * product.amount)
                              .toFixed(4)
                              .toString()
                              .slice(0, -2)
                      }
                      className=""
                      displayType={"text"}
                      renderText={(value, props) => (
                        <span {...props}>{value}</span>
                      )}
                    />{" "}
                    {invoiceForm?.currencyUnit}
                  </span>
                </div>
                {!isViewMode && (
                  <div
                    className="w-full sm:w-10 sm:absolute sm:right-0"
                    onClick={() => onDeleteProduct(product.id)}
                  >
                    <div className="w-full text-red-500 font-title h-8 sm:h-8 sm:w-8 cursor-pointer rounded-2xl bg-red-200 mr-2 flex justify-center items-center">
                      <DeleteIcon className="h-4 w-4" style={IconStyle} />
                      <span className="block sm:hidden">Delete Product</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Subtotal Start */}
            <div
              className={
                isExporting
                  ? "flex flex-row rounded-lg w-full px-4 py-1 justify-end items-end relative text-sm"
                  : "flex flex-row sm:flex-row sm:justify-end rounded-lg sm:visible w-full px-4 py-1 items-center "
              }
            >
              <div
                className={
                  isExporting
                    ? "font-title w-1/4 text-right pr-9 flex flex-row block justify-end text-sm "
                    : "font-title w-1/2 sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block mb-1 sm:mb-0"
                }
              >
                Subtotal{" "}
              </div>
              <div
                className={
                  isExporting
                    ? "font-title w-1/4 text-right pr-9 flex flex-row block justify-end text-sm "
                    : "font-title w-1/2 sm:w-1/4 text-right sm:pr-9 flex flex-row justify-end sm:block mb-1"
                }
              >
                <NumberFormatBase
                  value={subTotal}
                  className="inline-block"
                  displayType={"text"}
                  renderText={(value, props) => (
                    <span {...props}>
                      {value} {invoiceForm?.currencyUnit}
                    </span>
                  )}
                />
              </div>
            </div>
            {/* Discounts */}
            {invoiceForm?.discounts?.map((discount, index) => (
              <div
                key={`${index}_${discount.id}`}
                className={
                  isExporting
                    ? "flex flex-row justify-end rounded-lg w-full px-4 py-1 items-center relative"
                    : "flex flex-col sm:flex-row sm:justify-end rounded-lg sm:visible w-full px-4 py-1 items-center relative"
                }
              >
                <div
                  className={
                    isExporting
                      ? "font-title w-3/5 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-3/5 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <div className="sm:hidden w-1/3 flex flex-row items-center">
                      Discount Type
                    </div>
                  )}
                  <div
                    className={
                      isExporting
                        ? "w-full mb-0 flex flex-row items-center justify-end"
                        : "w-2/3 sm:w-full mb-1 sm:mb-0 flex flex-row items-center sm:justify-end"
                    }
                  >
                    <div
                      className={
                        isExporting ? "w-1/3 pr-1" : "w-1/2 sm:w-1/3 pr-1"
                      }
                    >
                      {!isViewMode && (
                        <input
                          autoComplete="nope"
                          value={discount.title}
                          type={"text"}
                          placeholder="Discount Title"
                          className={defaultInputSmStyle + " text-right"}
                          onChange={(e) =>
                            handlerDiscountsValue(e, "title", discount.id)
                          }
                        />
                      )}
                    </div>
                    <div
                      className={
                        (isExporting
                          ? "w-1/3 relative flex flex-row items-center text-sm"
                          : "w-1/2 sm:w-1/3 relative flex flex-row items-center") +
                        (isViewMode ? " justify-end" : " pr-4")
                      }
                    >
                      {!isViewMode ? (
                        <>
                          <input
                            autoComplete="nope"
                            value={discount.value}
                            type={"number"}
                            placeholder="Percentage"
                            className={defaultInputSmStyle + " text-right"}
                            onChange={(e) =>
                              handlerDiscountsValue(e, "value", discount.id)
                            }
                          />
                          <span className="ml-1">%</span>
                        </>
                      ) : (
                        <div className="text-right">{discount.title}</div>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-9 flex flex-row text-sm"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-9 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Amount
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full"
                        : "inline-block w-1/2 sm:w-full"
                    }
                  >
                    <>
                      <div className="w-full">
                        <NumberFormatBase
                          value={discount.amount}
                          className=""
                          displayType={"text"}
                          renderText={(value, props) => (
                            <span {...props}>
                              {value} {invoiceForm?.currencyUnit}
                            </span>
                          )}
                        />
                      </div>
                    </>
                  </span>
                </div>
                {!isViewMode && (
                  <div
                    className="w-full sm:w-10 sm:absolute sm:right-0"
                    onClick={() => onDeleteDiscount(discount.id)}
                  >
                    <div className="w-full text-red-500 font-title h-8 sm:h-8 sm:w-8 cursor-pointer rounded-2xl bg-red-200 mr-2 flex justify-center items-center">
                      <DeleteIcon className="h-4 w-4" style={IconStyle} />
                      <span className="block sm:hidden">Delete Discount</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Add Discount Action */}
            {!isViewMode && (
              <div className="flex flex-col sm:flex-row rounded-lg sm:visible w-full px-4 py-2 items-center sm:justify-end">
                <div className="font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block mb-1">
                  <Button
                    size="sm"
                    block={1}
                    onClick={addDiscount(
                      selectedCategory,
                      invoiceForm?.clientDetail?.clientCategory
                    )}
                  >
                    <TaxesIcon style={IconStyle} className="h-5 w-5" />
                    Add Discount (%)
                  </Button>
                </div>
              </div>
            )}
            {/* {!isViewMode && (
              <div className="flex flex-col sm:flex-row rounded-lg sm:visible w-full px-4 py-2 items-center sm:justify-end">
                <div className="font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block mb-1">
                  <Button size="sm" block={1} onClick={applyDiscount}>
                    <TaxesIcon style={IconStyle} className="h-5 w-5" />
                    Add Discount (%)
                  </Button>
                </div>
              </div>
            )} */}

            {/* Subtotal Start */}
            <div
              className={
                isExporting
                  ? "flex flex-row justify-end w-full items-center text-white"
                  : "flex flex-row sm:flex-row sm:justify-end w-full items-center text-white"
              }
            >
              <div
                className={
                  isExporting
                    ? "w-1/2 px-4 py-1 flex flex-row rounded-lg items-center"
                    : "w-full sm:w-1/2 px-4 py-1 flex flex-row rounded-lg items-center"
                }
                style={{ backgroundColor: invoiceForm.color }}
              >
                <div
                  className={
                    isExporting
                      ? "font-title text-base w-1/2 text-right pr-9 flex flex-row block  justify-end items-center"
                      : "font-title text-lg w-1/2 text-right sm:pr-9 flex flex-row sm:block items-center"
                  }
                >
                  Total
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title text-lg w-1/2 text-right pr-9 flex flex-row block  justify-end items-center"
                      : "font-title text-lg w-1/2 text-right sm:pr-9 flex flex-row justify-end sm:block items-center"
                  }
                >
                  <NumberFormatBase
                    value={invoiceForm?.totalAmount}
                    className=""
                    displayType={"text"}
                    renderText={(value, props) => (
                      <span {...props}>
                        {value}{" "}
                        <span className={isExporting ? "text-sm" : "text-base"}>
                          {invoiceForm?.currencyUnit}
                        </span>
                      </span>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Products Finished */}
        </div>
      )}
      {invoiceForm && invoiceForm?.statusIndex !== "3" && (
        <div className="px-4 pt-3">
          <div className="flex flex-col justify-end flex-wrap sm:flex-row">
            <div className="w-48 my-1 sm:my-1 md:my-0 px-4">
              <Button
                size="sm"
                block={1}
                success={1}
                onClick={() => saveAs("Paid")}
              >
                {/* <SecurityIcon className="h-5 w-5 mr-1" />{" "} */}
                {params.id === "new" ? "Save" : "Update"} As Paid
              </Button>
            </div>
          </div>
        </div>
      )}

      {invoiceForm && (
        <div className="p-4">
          <InvoiceTopBar
            onClickExport={handleExport}
            // onClickDownloadImg={handleDownloadImg}
            onClickDownloadPdf={handleDownloadPdf}
          />
        </div>
      )}
    </div>
  );
}
export default InvoiceDetailScreen;
