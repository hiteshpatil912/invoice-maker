import React, { useState, useCallback, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Button from "../Button/Button";
import ImageUpload from "../Common/ImageUpload";
import SectionTitle from "../Common/SectionTitle";
import { useAppContext } from "../../context/AppContext";
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultInputLargeStyle,
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import { useAuth } from "../../auth/AuthContext";

const emptyForm = {
  client_category_id: "",
  product_category_id: "",
  discount_percentage: 0,
};

function QuickAddCategory({ selectedDiscount, onNewUpdateDiscount }) {
  const { initLoading: isInitLoading } = useAppContext();
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();
  const apiDomain = process.env.REACT_APP_API_DOMAIN;
  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [validForm, setValidForm] = useState({
    client_category_id: false,
    product_category_id: false,
    discount_percentage: false,
  });
  const [categoryForm, setCategoryForm] = useState(emptyForm);
  const [clientCategories, setClientCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);

  const resetForm = () => {
    setCategoryForm({
      client_category_id: "",
      product_category_id: "",
      discount_percentage: 0,
    });
    setValidForm({
      client_category_id: false,
      product_category_id: false,
      discount_percentage: false,
    });
  };

  const myHeaders = useMemo(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${authToken}`);
    return headers;
  }, [authToken]);

  // Callback function to handle Category form field changes
  const handleCategoryValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setCategoryForm((prev) => ({ ...prev, [keyName]: value }));
      setValidForm((prev) => ({
        ...prev,
        [keyName]: !!value.trim(),
      }));

      if (keyName === "category") {
        // Add the new category if it doesn't exist in clientCategories
        if (value.trim() && !clientCategories.includes(value.trim())) {
          setClientCategories((prevCategories) => [
            ...prevCategories,
            value.trim(),
          ]);
        }
        // Add the new category if it doesn't exist in productCategories
        if (value.trim() && !productCategories.includes(value.trim())) {
          setProductCategories((prevCategories) => [
            ...prevCategories,
            value.trim(),
          ]);
        }
      }
    },
    [clientCategories, productCategories]
  );

  const handleEditorNew = useCallback(
    (item) => {
      console.log({item})
      onNewUpdateDiscount(item); // Pass selected product to parent component
    },
    [onNewUpdateDiscount]
  );

  const fetchDiscountCategories = useCallback(async () => {
    setLoading(false);
    try {
      const response = await fetch(`${apiDomain}/discounts`, {
        method: "GET",
        headers: {
          Authorization: authToken,
        },
      });
      const data = await response.json();
      setClientCategories(data.data.clientCategory); // Assuming the response is an array of products
      setProductCategories(data.data.productCategory);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [apiDomain, authToken, setLoading]);

  useEffect(() => {
    if (authToken) {
      fetchDiscountCategories();
    }
  }, [authToken, fetchDiscountCategories]);

  useEffect(() => {
    if (selectedDiscount) {
      setCategoryForm(selectedDiscount);
    }
  }, [selectedDiscount]);

  // Form submission handler
  const submitHandler = useCallback(async () => {
    setIsTouched(true);
    const isValid = Object.values(validForm).every((value) => value);

    if (!isValid) {
      toast.error("Invalid Client Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }
    const formdata = new FormData();
    formdata.append("client_category_id", Number(categoryForm.client_category_id));
    formdata.append("product_category_id", Number(categoryForm.product_category_id));
    formdata.append("discount_percentage", Number(categoryForm.discount_percentage));


    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      let response;
      if (selectedDiscount) {
        response = await fetch(
          `${apiDomain}/discount/${selectedDiscount.id}`,
          requestOptions
        );
      } else {
        console.log({ requestOptions });
        response = await fetch(`${apiDomain}/discount`, requestOptions);
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log({ result });
      handleEditorNew(result);
      toast.success(result.data.message || "Product Added Successfully!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      resetForm();
    } catch (error) {
      toast.error("Failed to add/update product!", {
        position: "bottom-center",
        autoClose: 2000,
      });
    } finally {
      setIsTouched(false);
    }
  }, [
    categoryForm,
    validForm,
    apiDomain,
    myHeaders,
    selectedDiscount,
    handleEditorNew,
  ]);

  // Effect to update validForm when categoryForm changes
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      client_category_id: categoryForm.client_category_id
      ? true
        : false,
      product_category_id: categoryForm.product_category_id
        ? true
        : false,
      discount_percentage: categoryForm.discount_percentage
      ? true
      : false
      ,
    }));
  }, [categoryForm]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <SectionTitle>Quick Add Category</SectionTitle>
      <div className="mt-2">
        <label
          className="font-title text-sm text-default-color"
          htmlFor="clientCategory"
        >
          Client Category
        </label>
        <select
          id="clientCategory"
          value={categoryForm.client_category_id}
          onChange={(e) => handleCategoryValue(e, "client_category_id")}
          className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12"
        >
          <option value="">Select Category</option>
          {clientCategories.map((clientCategory) => (
            <option key={clientCategory.id} value={clientCategory.id}>{clientCategory.name}</option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <label
          className="font-title text-sm text-default-color"
          htmlFor="productCategory"
        >
          Product Category
        </label>

        <select
          id="productCategory"
          value={categoryForm.product_category_id}
          onChange={(e) => handleCategoryValue(e, "product_category_id")}
          className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12"
        >
          <option value="">Select Category</option>
          {productCategories.map((productCategory) => (
            <option key={productCategory.id} value={productCategory.id}>
              {productCategory.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <label
          className="font-title text-sm text-default-color"
          htmlFor="percentage"
        >
          Discount Percentage
        </label>
        <input
          id="percentage"
          autoComplete="off"
          placeholder="percentage"
          type="number"
          className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12"
          value={categoryForm.discount_percentage}
          onChange={(e) => handleCategoryValue(e, "discount_percentage")}
        />
      </div>
      <div className="mt-3">
        <Button onClick={submitHandler} block={1}>
          <span className="inline-block ml-2">Submit</span>
        </Button>
      </div>
    </div>
  );
}

export default QuickAddCategory;
