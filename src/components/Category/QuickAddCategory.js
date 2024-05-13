import React, { useState, useCallback, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "nanoid";
import Button from "../Button/Button";
import SectionTitle from "../Common/SectionTitle";
import { useAppContext } from "../../context/AppContext";
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import {
  addNewProduct,
  getProductNewForm,
  updateNewProductFormField,
} from "../../store/productSlice";

const emptyForm = {
  id: "",
//   image: "",
//   productID: "",
//   name: "",
  clientCategory: "",
  productCategory: "",
  amount: 0,
};

function QuickAddCategory() {
  const dispatch = useDispatch();
  const productNewForm = useSelector(getProductNewForm);
  const { initLoading: isInitLoading } = useAppContext();

  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [productForm, setProductForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState({
    id: false,
    // image: false,
    // productID: false,
    // name: false,
    clientCategory: false,
    productCategory: false,
    amount: false,
  });

  // Callback function to handle product form field changes
  const handlerProductValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setProductForm((prev) => ({ ...prev, [keyName]: value }));

      // Include a condition to check if the keyName is "clientCategory" or "productCategory"
      if (keyName === "clientCategory" || keyName === "productCategory") {
        setValidForm((prev) => ({
          ...prev,
          [keyName]: !!value.trim(), // Validate the category field
        }));
      } else {
        dispatch(updateNewProductFormField({ key: keyName, value }));
      }
    },
    [dispatch]
  );

  // Form submission handler
  const submitHandler = useCallback(() => {
    setIsTouched(true);
    const isValid = Object.values(validForm).every((value) => value);
// console.log(validForm);
    if (!isValid) {
      toast.error("Invalid Product Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    toast.success("Product Added Successfully!", {
      position: "bottom-center",
      autoClose: 2000,
    });

    dispatch(addNewProduct({ ...productForm, id: nanoid() }));
    setIsTouched(false);
  }, [productForm, dispatch, validForm]);

  // Effect to update validForm when productForm changes
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      id: !!productForm.id,
    //   image: productForm.image,
    //   productID: !!productForm.productID,
    //   name: productForm?.name?.trim() ? true : false,
      clientCategory: productForm?.clientCategory?.trim() ? true : false,
      productCategory: productForm?.productCategory?.trim() ? true : false,
      amount: productForm.amount > 0,
    }));
  }, [productForm]);

  // Effect to update productForm when productNewForm changes
  useEffect(() => {
    if (productNewForm) {
      setProductForm(productNewForm);
    }
  }, [productNewForm]);

  return (
    <div className="bg-white rounded-xl p-4">
      <SectionTitle>Quick Add Product</SectionTitle>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Client Category
        </div>
        <div className="flex">
          <select
            value={productForm.clientCategory}
            onChange={(e) => handlerProductValue(e, "clientCategory")}
            className={defaultInputStyle}
            disabled={isInitLoading}
          >
            <option value="">Select Category</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            {/* Add more options as needed */}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Category
        </div>
        <div className="flex">
          <select
            value={productForm.productCategory}
            onChange={(e) => handlerProductValue(e, "productCategory")}
            className={defaultInputStyle}
            disabled={isInitLoading}
          >
            <option value="">Select Category</option>
            <option value="X">X</option>
            <option value="Y">Y</option>
            <option value="Z">Z</option>
            {/* Add more options as needed */}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Amount
        </div>
        <div className="flex">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                autoComplete="nope"
                placeholder="Amount"
                type="number"
                className={
                  !validForm.amount && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={productForm.amount}
                onChange={(e) => handlerProductValue(e, "amount")}
              />
            )}
          </div>
        </div>
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
