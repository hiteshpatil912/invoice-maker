import React, { useState, useCallback, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "nanoid";
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
import {
  addNewCategory,
  getCategoryNewForm,
  getSelectedCategory,
  updateNewCategoryFormField,
} from "../../store/discountSlice";

const emptyForm = {
  id: nanoid(),
  clientCategory: "", // Initialize as an empty string
  productCategory: "", // Initialize as an empty string
  percentage: 0,
};

function QuickAddCategory() {
  const dispatch = useDispatch();
  const categoryNewForm = useSelector(getCategoryNewForm);
  console.log({categoryNewForm})
  const { initLoading: isInitLoading } = useAppContext();

  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [validForm, setValidForm] = useState({
    id: false,
    clientCategory: false,
    productCategory: false,
    percentage: false,
  });
  const [categoryForm, setCategoryForm] = useState(emptyForm);
  const [clientCategories, setClientCategories] = useState([
    "Client Category 1",
    "Client Category 2",
    "Client Category 3",
  ]);
  const [productCategories, setProductCategories] = useState([
    "Electronics",
    "Books",
    "Clothing",
  ]);

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
          setClientCategories((prevCategories) => [...prevCategories, value.trim()]);
        }
        // Add the new category if it doesn't exist in productCategories
        if (value.trim() && !productCategories.includes(value.trim())) {
          setProductCategories((prevCategories) => [
            ...prevCategories,
            value.trim(),
          ]);
        }
      } else {
        dispatch(updateNewCategoryFormField({ key: keyName, value }));
      }
    },
    [dispatch, clientCategories, productCategories]
  )
  // Form submission handler
  const submitHandler = useCallback(() => {
    setIsTouched(true);
    const isValid = Object.values(validForm).every((value) => value);

    if (!isValid) {
      toast.error("Invalid Discount Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    toast.success("Discount Added Successfully!", {
      position: "bottom-center",
      autoClose: 2000,
    });

    dispatch(addNewCategory({ ...categoryForm, id: nanoid() }));
    setIsTouched(false);
  }, [categoryForm, dispatch, validForm]);

  // Effect to update validForm when categoryForm changes
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      id: !!categoryForm.id,
      clientCategory: categoryForm.clientCategory?.trim() ? true : false,
      productCategory: categoryForm.productCategory?.trim() ? true : false,
      percentage: categoryForm.percentage,
    }));
  }, [categoryForm]);

  // Effect to update productForm when categoryForm changes
  useEffect(() => {
    if (categoryNewForm) {
      setCategoryForm(categoryNewForm);
    }
  }, [categoryNewForm]);

    // Save form data to localStorage whenever it changes
    useEffect(() => {
      localStorage.setItem("categoryForm", JSON.stringify(categoryForm));
    }, [categoryForm]);

  // const dispatch = useDispatch();
  // const [categoryForm, setCategoryForm] = useState(emptyForm);

  // const clientCategories = ["Client Category 1", "Client Category 2", "Client Category 3"];
  // const productCategories = ["Electronics", "Books", "Clothing"];

  // const handleCategoryValue = useCallback((event, keyName) => {
  //   const value = event.target.value;
  //   setCategoryForm((prev) => ({
  //     ...prev,
  //     [keyName]: value,
  //   }));
  // }, []);

  // const submitHandler = useCallback(() => {
  //   if (!categoryForm.clientCategory || !categoryForm.productCategory) {
  //     toast.error("Please select both client and product categories", {
  //       position: "bottom-center",
  //       autoClose: 2000,
  //     });
  //     return;
  //   }

  //   if (categoryForm.percentage <= 0) {
  //     toast.error("Please enter a valid percentage", {
  //       position: "bottom-center",
  //       autoClose: 2000,
  //     });
  //     return;
  //   }

  //   const categoryData = {
  //     ...categoryForm,
  //     id: nanoid(),
  //   };

  //   dispatch(addNewCategory(categoryData));

  //   // Reset form after submission
  //   setCategoryForm(emptyForm);

  //   toast.success("Category added successfully!", {
  //     position: "bottom-center",
  //     autoClose: 2000,
  //   });
  // }, [categoryForm, dispatch]);

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
          value={categoryForm.clientCategory}
          onChange={(e) => handleCategoryValue(e, "clientCategory")}
          className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12"
        >
          <option value="">Select Category</option>
          {clientCategories.map((clientCategory) => (
            <option key={clientCategory} value={clientCategory}>
              {clientCategory}
            </option>
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
          value={categoryForm.productCategory}
          onChange={(e) => handleCategoryValue(e, "productCategory")}
          className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12"
        >
          <option value="">Select Category</option>
          {productCategories.map((productCategory) => (
            <option key={productCategory} value={productCategory}>
              {productCategory}
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
          value={categoryForm.percentage}
          onChange={(e) => handleCategoryValue(e, "percentage")}
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
