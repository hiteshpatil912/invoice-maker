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
  addNewProduct,
  getProductNewForm,
  updateNewProductFormField,
} from "../../store/productSlice";

const emptyForm = {
  id: "",
  image: "",
  productID: "",
  name: "",
  category: "", // Changed from 'categories'
  amount: 0,
};

function QuickAddProduct() {
  const dispatch = useDispatch();
  const productNewForm = useSelector(getProductNewForm);
  const { initLoading: isInitLoading } = useAppContext();

  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [productForm, setProductForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState({
    id: false,
    image: false,
    productID: false,
    name: false,
    category: false,
    amount: false,
  });

  // Callback function to handle image change
  const onChangeImage = useCallback(
    (str) => {
      setProductForm((prev) => ({ ...prev, image: str }));
      dispatch(updateNewProductFormField({ key: "image", value: str }));
    },
    [dispatch]
  );

  // Callback function to handle product form field changes
  // Callback function to handle product form field changes
const handlerProductValue = useCallback(
  (event, keyName) => {
    const value = event.target.value;

    setProductForm((prev) => {
      return { ...prev, [keyName]: value };
    });

    // Include a condition to check if the keyName is "category"
    if (keyName === "category") {
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

  // Memoized class for image upload
  const imageUploadClasses = useMemo(() => {
    const defaultStyle = "rounded-xl ";
    return !productForm.image
      ? defaultStyle + " border-dashed border-2 border-indigo-400 "
      : defaultStyle;
  }, [productForm.image]);

  // Effect to update validForm when productForm changes
  // Effect to update validForm when productForm changes
useEffect(() => {
  setValidForm((prev) => ({
    ...prev,
    id: !!productForm.id,
    image: productForm.image,
    productID: !!productForm.productID,
    name: productForm?.name?.trim() ? true : false,
    category: productForm?.category?.trim() ? true : false, // Ensure category validation
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
      <SectionTitle> Quick Add Product </SectionTitle>
      <div className="flex mt-2">
        {isInitLoading ? (
          <Skeleton className="skeleton-input-radius skeleton-image border-dashed border-2" />
        ) : (
          <ImageUpload
            keyName="QuickEditImageUpload"
            className={imageUploadClasses}
            url={productForm.image}
            onChangeImage={onChangeImage}
          />
        )}

        <div className="flex-1 pl-3">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonLargeStyle} />
          ) : (
            <div>
              <input
                autoComplete="nope"
                value={productForm.productID}
                placeholder="Product ID"
                className={defaultInputLargeStyle}
                onChange={(e) => handlerProductValue(e, "productID")}
                disabled={isInitLoading}
              />
            </div>
          )}
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Name
        </div>
        <div className="flex">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                autoComplete="nope"
                placeholder="Product Name"
                type="text"
                className={
                  !validForm.name && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={productForm.name}
                onChange={(e) => handlerProductValue(e, "name")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Category
        </div>
        <div className="flex">
          <select
            value={productForm.category}
            onChange={(e) => handlerProductValue(e, "category")} // Fixed the onChange handler
            className={defaultInputStyle}
            disabled={isInitLoading}
          >
            <option value="">Select Category</option>
            <option value="clothing">Clothing</option>
            <option value="Electronic">Electronic</option>
            <option value="accessories">Accessories</option>
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
          <span className="inline-block ml-2"> Submit </span>
        </Button>
      </div>
    </div>
  );
}

export default QuickAddProduct;
