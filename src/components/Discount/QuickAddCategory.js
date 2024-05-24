import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { nanoid } from "nanoid";
import Button from "../Button/Button";
import SectionTitle from "../Common/SectionTitle";

import { addNewCategory } from "../../store/discountSlice"; // Importing addNewCategory action creator

const emptyForm ={
  clientCategory: "" ,
  productCategory: ""
}

const categoryemptyForm ={
    id: "",
    clientCategory: "",
    productCategory: "",
    amount: 0,
  }

function QuickAddCategory() {
  const dispatch = useDispatch();

  const [categoryForm, setCategoryForm] = useState(categoryemptyForm);

  const clientCategories = ["Client Category 1", "Client Category 2", "Client Category 3"];
  const productCategories = ["Electronics", "Books", "Clothing"];

  
  const handlerCategoryValue = useCallback((event, keyName) => {
    const value = event.target.value;
    setCategoryForm((prev) => ({
      ...prev,
      [keyName]: value,
    }));
  }, []);


  const submitHandler = useCallback(() => {
    console.log(categoryForm);
    if (!categoryForm.clientCategory || !categoryForm.productCategory) {
      toast.error("Please select both client and product categories", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    const categoryData = {
      ...categoryForm,
      id: nanoid(),
    };

    
    dispatch(addNewCategory(categoryData));

    // Reset form after submission
    setCategoryForm(emptyForm);

    toast.success("Category added Successfully!", {
      position: "bottom-center",
      autoClose: 2000,
    });
  }, [categoryForm, dispatch]);

  return (
    <div className="bg-white rounded-xl p-4">
      <SectionTitle> Quick Add Category </SectionTitle>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Client Category</div>
        <div className="relative">
          <select
            value={categoryForm.clientCategory}
            onChange={(e) => handlerCategoryValue(e, "clientCategory")}
            className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl p-x2 focus:outline-none border-indigo-400 h-12 flex-1"
          >
            <option value="">Select Category</option>
            {clientCategories.map((clientCategory) => (
              <option key={clientCategory} value={clientCategory}>
                {clientCategory}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Product Category</div>
        <div className="relative">
          <select
            value={categoryForm.productCategory}
            onChange={(e) => handlerCategoryValue(e, "productCategory")}
            className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl p-x2 focus:outline-none border-indigo-400 h-12 flex-1"
          >
            <option value="">Select Category</option>
            {productCategories.map((productCategory) => (
              <option key={productCategory} value={productCategory}>
                {productCategory}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Amount
        </div>
        <div className="flex">
          <div className="flex-1">
            {/* Your input field for product amount */}
            <input
                autoComplete="nope"
                placeholder="Amount"
                type="number"
                className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl p-x2 focus:outline-none border-indigo-400 h-12 flex-1"
                value={categoryForm.amount}
                onChange={(e) => handlerCategoryValue(e, "amount")}
              />
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Button onClick={submitHandler} block={1}>
          <span className="inline-block ml-2"> Submit </span>
        </Button>
      </div>
    </div>
  );
}

export default QuickAddCategory;
