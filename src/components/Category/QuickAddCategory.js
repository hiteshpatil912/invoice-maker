import React, { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { nanoid } from "nanoid";
import Button from "../Button/Button";
import SectionTitle from "../Common/SectionTitle";

import { addNewClient } from "../../store/clientSlice"; // Importing addNewClient action creator
import { addNewProduct } from "../../store/productSlice"; // Importing addNewProduct action creator


const emptyForm ={
  clientCategories: "" ,
  productCategories:""
}

const clientemptyForm = {
  image: "",
  name: "",
  category: "", // Changed from 'categories'
  mobileNo:"",
  billingAddress: ""
};
const productemptyForm ={
  id: "",
  image: "",
  name: "",
  category: "", // Changed from 'categories'
  productID: "",
  amount: 0,
}

function QuickAddCategory() {
  const dispatch = useDispatch();

  const [clientForm, setClientForm] = useState(clientemptyForm);
  const [productForm, setProductForm] = useState(productemptyForm);

  const clientCategories = ["Client Category 1", "Client Category 2", "Client Category 3"];
  const productCategories = ["Product Category 1", "Product Category 2", "Product Category 3"];

  const handlerClientValue = useCallback((event, keyName) => {
    const value =
      typeof event === "string" ? new Date(event) : event?.target?.value;
    setClientForm((prev) => ({
      ...prev,
      [keyName]: value,
    }));
  }, []);

  const handlerProductValue = useCallback((event, keyName) => {
    const value =
      typeof event === "string" ? new Date(event) : event?.target?.value;
    setProductForm((prev) => ({
      ...prev,
      [keyName]: value,
    }));
  }, []);

  const submitHandler = useCallback(() => {
    if (!clientForm.category || !productForm.category) {
      toast.error("Please select both client and product categories", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    const clientData = {
      ...clientForm,
      id: nanoid(),
      category: clientForm.category, // adding category to the form data before dispatching
    };

    const productData = {
      ...productForm,
      id: nanoid(),
      category: productForm.category, // adding category to the form data before dispatching
    };

    dispatch(addNewClient(clientData));
    dispatch(addNewProduct(productData));

    // Reset forms after submission
    setClientForm(emptyForm);
    setProductForm(emptyForm);

    toast.success("Client and Product Added Successfully!", {
      position: "bottom-center",
      autoClose: 2000,
    });
  }, [clientForm, productForm, dispatch]);

  return (
    <div className="bg-white rounded-xl p-4">
      <SectionTitle> Quick Add Category </SectionTitle>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Client Category</div>
        <div className="relative">
          <select
            value={clientForm.clientCategories}
            onChange={(e) => handlerClientValue(e, "clientCategories")}
            className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl p-x2 focus:outline-none border-indigo-400 h-12 flex-1"
          >
            <option value="">Select Category</option>
            {clientCategories.map((clientCategories) => (
              <option key={clientCategories} value={clientCategories}>
                {clientCategories}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Product Category</div>
        <div className="relative">
          <select
            value={productForm.productCategories}
            onChange={(e) => handlerProductValue(e, "productCategories")}
            className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl p-x2 focus:outline-none border-indigo-400 h-12 flex-1"
          >
            <option value="">Select Category</option>
            {productCategories.map((productCategories) => (
              <option key={productCategories} value={productCategories}>
                {productCategories}
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
