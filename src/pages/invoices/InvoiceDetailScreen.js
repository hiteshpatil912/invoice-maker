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
// import NumberFormat from "react-number-format";
import { NumberFormatBase } from "react-number-format";
import { toast } from "react-toastify";
import domtoimage from "dom-to-image";
import InvoiceTopBar from "../../components/Invoice/InvoiceTopBar";
import {
  getCurrentBGImage,
  getCurrentColor,
  getInvoiceNewForm,
  getIsConfirm,
  setDefaultBackground,
  setDefaultColor,
} from "../../store/invoiceSlice";
import { getCompanyData } from "../../store/companySlice";
import { defaultInputSmStyle, IconStyle } from "../../constants/defaultStyles";
import Button from "../../components/Button/Button";
import ClientPlusIcon from "../../components/Icons/ClientPlusIcon";
import InvoiceIcon from "../../components/Icons/InvoiceIcon";
import DeleteIcon from "../../components/Icons/DeleteIcon";
import Modal from "../../components/Modal";
import { useAppContext } from "../../context/AppContext";
import TaxesIcon from "../../components/Icons/TaxesIcon";
import {
  getTotalTaxesWithPercent,
  sumProductTotal,
  sumTotalAmount,
  sumTotalDiscount,
  sumTotalTaxes,
} from "../../utils/match";
import PageTitle from "../../components/Common/PageTitle";
import ProductChoosenModal from "../../components/Product/ProductChoosenModal";
import { jsPDF } from "jspdf";
import { useAuth } from "../../auth/AuthContext";
import ClientSelectionModal from "./selectClientModal";
import html2canvas from "html2canvas";

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
  const { authToken } = useAuth();
  const invoiceNewForm = useSelector(getInvoiceNewForm);
  const currentBg = useSelector(getCurrentBGImage);
  const currentColor = useSelector(getCurrentColor);
  const [invoiceForm, setInvoiceForm] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";
  const [clients, setClients] = useState({
    data: [],
    pagination: { total: 0, pageCount: 0 },
  });
  const [products, setProducts] = useState({
    data: [],
    category: [],
    pagination: { total: 0, pageCount: 0 },
  });

  const [discounts, setDiscounts] = useState({
    data: [],
    clientCategories: [],
    productCategories: [],
    pagination: { total: 0, pageCount: 0 },
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState();
  const [company, setCompany] = useState();


  

  const [currentPage, setCurrentPage] = useState(1);
  const { id } = useParams();

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
  
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const component = componentRef.current;
  
      html2canvas(component).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 size
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('invoice.pdf');
  
        setIsExporting(false);
        setEscapeOverflow(false);
      });
    } catch (e) {
      console.log(e);
      setIsExporting(false);
      setEscapeOverflow(false);
    }
  }, [setEscapeOverflow, showNavbar, toggleNavbar]);
  
  

  
  // const handleDownloadPdf = useCallback(() => {
  //   if (showNavbar) {
  //     toggleNavbar();
  //   }
  //   setEscapeOverflow(true);
  //   setIsViewMode(true);
  //   setIsExporting(true);

  //   domtoimage.toPng(componentRef.current).then((dataUrl) => {
  //     try {
  //       const pdf = new jsPDF("p", "mm", "a4");
  //       const img = new Image();
  //       img.src = dataUrl;
  //       img.onload = () => {
  //         const imgWidth = pdf.internal.pageSize.getWidth();
  //         const imgHeight = (img.height * imgWidth) / img.width;

  //         pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
  //         pdf.save("invoice.pdf");
  //       };
  //     } catch (e) {
  //       console.log(e);
  //     } finally {
  //       setIsExporting(false);
  //       setEscapeOverflow(false);
  //     }
  //   });
  // }, [setEscapeOverflow, showNavbar, toggleNavbar]);

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
        const result = await response.json();
        setClients({
          data: result.data.clients,
          pagination: {
            total: result.data.clients.pagination.total,
            pageCount: result.data.clients.pagination.total_pages,
          },
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken]
  );

  const fetchProductsCategories = useCallback(
    async (page = 1, searchParams = {}) => {
      setLoading(true);
      try {
        const searchQuery = new URLSearchParams({
          ...searchParams,
          page,
        }).toString();

        const response = await fetch(`${apiDomain}/products?${searchQuery}`, {
          method: "GET",
          headers: {
            Authorization: authToken,
          },
        });
        const data = await response.json();
        setProducts({
          data: data.data.product,
          category: data.data.category,
          pagination: {
            total: data.data.product.pagination.total,
            pageCount: data.data.product.pagination.total_pages,
          },
        });
        setPageCount(data.data.product.pagination.total_pages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken]
  );

  const fetchInvoice = useCallback(async () => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", authToken);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${apiDomain}/invoice/${id}/edit`,
        requestOptions
      );
      const data = await response.json();
      if (data.success) {
        const defaultImagePath = "/images/default_bg.jpg"; // Path to your default image
        const newInvoiceForm = {
          id: data.data.id,
          invoiceNo: data.data.invoice_number || "",
          statusIndex: "1",
          statusName: data.data.status || "Draft",
          totalAmount: data.data.total || 0,
          color: "#686de0",
          backgroundImage: {
            id: "bg_1",
            path: data.data.background_image_path || defaultImagePath,
            base64: data.data.background_image_base64 || "", // Add base64 data if available
          },
          dueDate: data.data.due_date,
          createdDate: data.data.creation_date,
          currencyUnit: data.data.currency || "KWD",
          clientDetail: {
            id: data.data.client.id || "",
            name: data.data.client.name || "",
            phone_number: data.data.client.phone_number,
            address: data.data.client.address,
            client_category: data.data.client.category,
          },
          products: data.data.invoiceDetails.map((detail) => ({
            id: detail.product_id,
            name: detail.product_name,
            productID: detail.product_id,
            amount: detail.price,
            quantity: detail.qty,
          })),
          discounts: [
            {
              title: "Discount",
              value: data.data.discount_per,
              amount: data.data.discounted_amount,
            },
          ],
          taxes: [],
          productCategoryId: data.data.product_category.id || 1,
        };

        setSelectedCategory(data.data.product_category.name);
        setSelectedClient(newInvoiceForm.clientDetail);
        setInvoiceForm(newInvoiceForm);
      } else {
        console.error("Failed to fetch invoice details");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [id, apiDomain, authToken]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await fetch(`${apiDomain}/company/1/edit`, {
        method: "GET",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      const companyDetails = {
        companyDetail: {
          id: data.data[0].id,
          billingAddress: data.data[0].address,
          companyName: data.data[0].name,
          companyEmail: data.data[0].email,
          companyMobile: data.data[0].phone,
          image: data.data[0].image,
        },
      };
      setCompany(companyDetails);
      setInvoiceForm((prevForm) => ({
        ...prevForm,
        ...companyDetails,
      }));
    } catch (error) {
      toast.error("Failed to fetch company details", {
        position: "bottom-center",
        autoClose: 2000,
      });
    }
  }, [apiDomain, authToken]);

  useEffect(() => {
      fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const fetchDiscounts = useCallback(
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
        const result = await response.json();
        setDiscounts({
          data: result.data.discounts.data,
          clientCategories: result.data.clientCategory,
          productCategories: result.data.productCategory,
          pagination: {
            total: result.data.discounts.pagination.total,
            pageCount: result.data.discounts.pagination.total_pages,
          },
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setLoading(false);
      }
    },
    [apiDomain, authToken]
  );

  const handleCategoryChange = (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const id = selectedOption.getAttribute("category-id");
    setSelectedCategoryId(id);
    const selectedCategory = products.category.find(
      (category) => category.name === e.target.value
    );
    setInvoiceForm((prevForm) => ({
      ...prevForm,
      productCategoryId: selectedCategory ? selectedCategory.id : "",
    }));
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    if (authToken) {
      if (currentPage) {
        fetchClients(currentPage);
        fetchDiscounts(currentPage);
      }
      fetchClients();
      fetchProductsCategories();
      fetchDiscounts();
    }
  }, [
    authToken,
    fetchClients,
    currentPage,
    fetchProductsCategories,
    fetchDiscounts,
  ]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSelect = useCallback(
    (item) => {
      setSelectedProduct(item);
      setTimeout(() => {
        handleCloseModal();
      }, 50);
    },
    [handleCloseModal]
  );

  const openChooseClient = () => {
    setShowClientModal(true);
  };

  const closeChooseClient = () => {
    setShowClientModal(false);
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(false);
  };

  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1; // ReactPaginate uses 0-based index
    setCurrentPage(selectedPage);
    fetchClients(selectedPage);
  };

  const openChooseProduct = useCallback((category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  }, []);

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
        const DiscountedAMount = sumTotalDiscount(
          subTotalAmount,
          invoiceForm?.discounts[0]?.value || 0
        );

        // Ensure invoiceForm.discounts is defined before accessing discounts[0]
        if (invoiceForm.discounts && invoiceForm.discounts.length > 0) {
          // Update discounts[0].amount only if discounts array exists and has elements
          invoiceForm.discounts[0].amount = invoiceForm.discounts[0].value
            ? DiscountedAMount
            : 0;
        }

        const updateTaxes = getTotalTaxesWithPercent(
          invoiceForm.taxes,
          subTotalAmount
        );
        updatedData.taxes = updateTaxes;

        // Calculate totalAmount based on discounts, taxes, and subTotalAmount
        updatedData.totalAmount = sumTotalAmount(
          subTotalAmount,
          sumTotalTaxes(updateTaxes),
          sumTotalDiscount(
            subTotalAmount,
            invoiceForm?.discounts[0]?.value || 0
          )
        );
      }

      setInvoiceForm(updatedData);
    },
    [invoiceForm]
  );

  const onDeleteProduct = useCallback(
    (prodID) => {
      setInvoiceForm((prev) => {
        let updatedData = { ...prev };
        const updateProducts = prev.products.filter(
          (prod) => prod.id !== prodID
        );
        const subTotalAmount = sumProductTotal(updateProducts);
        const updateTaxes = getTotalTaxesWithPercent(
          prev.taxes,
          subTotalAmount
        );
        const rate = prev.discounts?.[0] ? prev.discounts[0].value : 0;
        const updatedDiscount = sumTotalDiscount(subTotalAmount, rate);

        // Calculate the new total amount
        const totalAmount = subTotalAmount + updateTaxes - updatedDiscount;


        updatedData.products = updateProducts;
        updatedData.taxes = updateTaxes;
        updatedData.totalAmount = totalAmount;

        // Ensure discounts array is copied and updated properly
        if (updatedData.discounts?.length > 0) {
          updatedData.discounts = [...updatedData.discounts];
          updatedData.discounts[0] = {
            ...updatedData.discounts[0],
            amount: updatedDiscount,
          };
        }

        return updatedData;
      });
    },
    [setInvoiceForm]
  );

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
          const subTotalAmount = sumProductTotal(prev.products);
          const sumDiscounts = sumTotalDiscount(sumTotalAmount, value);

          
          const totalAmount = subTotalAmount - sumDiscounts;
          return { ...prev, discounts: sumDiscounts, totalAmount: totalAmount };
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

  // Define the handleAddDiscount function
  const handleAddDiscount = (category, clientCategory) => {
    const matchedCategory = discounts.data.find(
      (cat) =>
        cat.client_category === clientCategory &&
        cat.product_category === category
    );
    if (matchedCategory) {
      return matchedCategory.discount_percentage;
    } else {
      return "none";
    }
  };

  const onDiscountButtonClick = (category, clientCategory) => {
    const result = handleAddDiscount(category, clientCategory);

    if (result !== "none" && !isNaN(parseFloat(result))) {
      const discountPercentage = parseFloat(result);

      // let totalDiscountAmount = 0;
      let subtotal = 0;
      // let totalQuantity = 0;

      invoiceForm.products.forEach((product) => {
        subtotal += parseFloat(product.amount) * product.quantity;
        // totalQuantity += product.quantity;
      });

      let totalDiscountAmount = (discountPercentage / 100) * subtotal;
      let newTotalAmount = subTotal - totalDiscountAmount;

      // Create a new discount object
      const newDiscount = {
        title: "Discount", // You can change this as per your requirement
        value: discountPercentage,
        amount: totalDiscountAmount, // Total discount amount
      };

      // Update invoiceForm with the new total amount, updated products, and discounts
      setInvoiceForm((prevInvoiceForm) => ({
        ...prevInvoiceForm,
        // products: updatedProducts, // Update products with discounted amounts
        totalAmount: newTotalAmount, // Update total amount
        discounts: [...(prevInvoiceForm.discounts || []), newDiscount],
      }));
    } else {
      console.log("Invalid discount result:", result);
    }
  };

  const onDeleteDiscount = (discountID) => {
    // Find the discount to be removed
    const discountToRemove = invoiceForm.discounts.find(
      (discount) => discount.id === discountID
    );

    if (discountToRemove) {
      let newTotalAmount = invoiceForm.totalAmount + discountToRemove.amount;

      // Filter out the discount with the given ID
      const updatedDiscounts = invoiceForm.discounts.filter(
        (discount) => discount.id !== discountID
      );

      // Prepare the new state object
      const newState = {
        ...invoiceForm,
        totalAmount: newTotalAmount,
        discounts: updatedDiscounts.length > 0 ? updatedDiscounts : [],
      };

      // Update the invoice form state
      setInvoiceForm(newState);
    }
  };

  useEffect(() => {
    if (selectedProduct !== null) {
      // If chosen existing client and this form is new
      const { id, name, productID, amount } = selectedProduct;
      const newProduct = { id, name, productID, amount, quantity: 1 };

      setInvoiceForm((prev) => {
        let updatedData = { ...prev };
        const updateProducts = [...prev.products, newProduct];
        const subTotalAmount = sumProductTotal(updateProducts);
        let rate = 0;
        let Discounts = 0;

        if (prev.discounts?.[0]) {
          rate = prev.discounts[0].value;
          Discounts = sumTotalDiscount(subTotalAmount, rate);
        }

        const updateTaxes = getTotalTaxesWithPercent(
          prev.taxes,
          subTotalAmount
        );

        updatedData.products = updateProducts;
        updatedData.taxes = updateTaxes;

        // Initialize discounts array if it doesn't exist
        if (!updatedData.discounts) {
          updatedData.discounts = [];
        }

        // Update the discount amount if there is a discount
        if (updatedData.discounts[0]) {
          updatedData.discounts[0].amount = Discounts;
        } else if (rate !== 0) {
          // If there's a rate but no discounts object, create one
          updatedData.discounts[0] = { amount: Discounts };
        }

        updatedData.totalAmount = sumTotalAmount(
          subTotalAmount,
          sumTotalTaxes(updateTaxes),
          Discounts
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
        setInvoiceForm({});
        setIsViewMode(true);
        // }
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
    if (initLoading === false) {
      setInvoiceForm((prev) => ({
        ...prev,
        backgroundImage: currentBg,
        color: currentColor,
      }));
    }
  }, [currentBg, currentColor, initLoading]);

  function generateRandomString(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) =>
      ("0" + (byte & 0xff).toString(16)).slice(-2)
    ).join("");
  }

  // Generate a random invoice number
  const randomInvoiceNumber = `inv-${generateRandomString(8)}`;

  const handleSubmit = () => {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", authToken);

    const formdata = new FormData();
    formdata.append(
      "invoice_number",
      invoiceForm.invoiceNo || randomInvoiceNumber
    );
    formdata.append(
      "creation_date",
      new Date(invoiceForm.createdDate).toISOString().split("T")[0]
    );
    formdata.append(
      "due_date",
      new Date(invoiceForm.dueDate).toISOString().split("T")[0]
    );

    // Check if discounts exist and has at least one element, else default to 0
    const discountValue =
      invoiceForm?.discounts && invoiceForm.discounts.length > 0
        ? invoiceForm.discounts[0].value
        : 0;

    const discountAmount =
      invoiceForm?.discounts && invoiceForm.discounts.length > 0
        ? invoiceForm.discounts[0].amount
        : 0;


    formdata.append("currency", invoiceForm.currencyUnit);
    formdata.append("client_id", invoiceForm.clientDetail.id);
    formdata.append("product_category_id", invoiceForm.productCategoryId);
    formdata.append("invoice_type", "new");
    formdata.append("discount_per", discountValue);
    formdata.append("discounted_amount", discountAmount);
    formdata.append("sub_total", invoiceForm.totalAmount);
    formdata.append("total", invoiceForm.totalAmount);
    formdata.append(
      "client_category_id",
      invoiceForm.clientDetail.client_category_id
    );
    invoiceForm.products.forEach((product, index) => {
      formdata.append(`invoiceDetails[${index}][product_id]`, product.id);
      formdata.append(`invoiceDetails[${index}][product_name]`, product.name);
      formdata.append(`invoiceDetails[${index}][price]`, product.amount);
      formdata.append(`invoiceDetails[${index}][qty]`, product.quantity);
      formdata.append(
        `invoiceDetails[${index}][total]`,
        product.amount * product.quantity
      );
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(`${apiDomain}/invoice`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.errors) {
          Object.values(result.errors).forEach((errorArray) => {
            errorArray.forEach((errorMessage) => {
              toast.error(errorMessage, {
                position: "bottom-center",
                autoClose: 2000,
              });
            });
          });
        } else {
          toast.success(result.data.message || "Invoice created!", {
            position: "bottom-center",
            autoClose: 2000,
          });
        }
      })
      .catch((error) =>
        toast.error(error.message || "Something went wrong", {
          position: "bottom-center",
          autoClose: 2000,
        })
      );
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
                ? "py-5 px-8 bg-cover bg-center bg-slate-500 rounded-xl flex flex-row justify-between items-center"
                : "py-9 px-8 bg-cover bg-center bg-slate-500 rounded-xl flex flex-col sm:flex-row justify-between items-center"
            }
            // style={{
            //   backgroundImage: invoiceForm?.backgroundImage?.base64
            //     ? `url(${invoiceForm.backgroundImage.base64})`
            //     : `url(${invoiceForm.backgroundImage?.path})`,
            // }}
          >
            <div
              className={
                isExporting
                  ? "flex xflex-row items-center"
                  : "flex flex-col sm:flex-row items-center"
              }
            >
              {!invoiceForm?.companyDetail && <div>Loading...</div>}
              {invoiceForm?.companyDetail?.image ? (
                <img
                  className="flex justify-center items-center object-contain h-20 w-20 mr-3 rounded"
                  alt={invoiceForm?.companyDetail?.companyName}
                  src={invoiceForm?.companyDetail?.image}
                />
              ) : (
                <img
                  className="flex justify-center items-center object-contain h-20 w-20 mr-3 rounded"
                  alt={invoiceForm?.companyDetail?.companyName}
                  src={invoiceForm?.companyDetail?.image}
                />
              )}
              <div
                className={
                  isExporting
                    ? "text-white font-title text-left"
                    : "text-white font-title text-center sm:text-left"
                }
              >
                {invoiceForm ? (
                  <>
                    <p className="font-bold mb-2">
                      {invoiceForm.companyDetail?.companyName}
                    </p>
                    <p className="text-sm font-medium">
                      {invoiceForm.companyDetail?.billingAddress}
                    </p>
                    <p className="text-sm font-medium">
                      {invoiceForm.companyDetail?.companyMobile }
                    </p>
                    <p className="text-sm font-medium">
                      {invoiceForm.companyDetail?.companyEmail}
                    </p>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
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
                {selectedClient && (
                  <div className="client-form-wrapper sm:w-1/2">
                    <div
                      className={
                        "font-medium " +
                        (isExporting ? "text-xs" : "text-sm mb-1")
                      }
                    >
                      {selectedClient.name}
                    </div>
                    <div
                      className={
                        "font-medium " +
                        (isExporting ? "text-xs" : "text-sm mb-1")
                      }
                    >
                      {selectedClient.address}
                    </div>
                    <div
                      className={
                        "font-medium " +
                        (isExporting ? "text-xs" : "text-sm mb-1")
                      }
                    >
                      {selectedClient.category}
                    </div>
                  </div>
                )}

                {showClientModal && (
                  <ClientSelectionModal
                    clients={clients.data}
                    onClose={closeChooseClient}
                    onSelect={selectClient}
                    handlePageClick={handlePageClick}
                    pageCount={clients.pagination.pageCount}
                  />
                )}
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
                      {products.category.map((category) => (
                        <option
                          key={category.id}
                          value={category.name}
                          category-id={category.id}
                        >
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
                        selectedCategory={selectedCategoryId}
                        selectedClient={selectedClient}
                        onSelect={handleSelect}
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
                    onClick={() => {
                      onDiscountButtonClick(
                        selectedCategory,
                        invoiceForm?.clientDetail?.category
                      );
                    }}
                  >
                    <TaxesIcon style={IconStyle} className="h-5 w-5" />
                    Add Discount (%)
                  </Button>
                </div>
              </div>
            )}
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
              <Button size="sm" block={1} success={1} onClick={handleSubmit}>
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
