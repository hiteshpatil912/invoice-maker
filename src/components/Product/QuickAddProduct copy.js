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
  category: "",
  description: "",
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
    description: false,
    amount: false,
  });

  const [productCategories, setProductCategories] = useState(["X", "Y", "Z"]);

  // Callback function to handle image change
  const onChangeImage = useCallback(
    (str) => {
      setProductForm((prev) => ({ ...prev, image: str }));
      dispatch(updateNewProductFormField({ key: "image", value: str }));
    },
    [dispatch]
  );

  // Callback function to handle product form field changes
  const handlerProductValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setProductForm((prev) => ({ ...prev, [keyName]: value }));

      if (keyName === "category") {
        setValidForm((prev) => ({
          ...prev,
          [keyName]: !!value.trim(),
        }));

        if (value.trim() && !productCategories.includes(value.trim())) {
          setProductCategories((prevCategories) => [
            ...prevCategories,
            value.trim(),
          ]);
        }
      } else {
        dispatch(updateNewProductFormField({ key: keyName, value }));
      }
    },
    [dispatch, productCategories]
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
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      id: !!productForm.id,
      image: productForm.image,
      productID: !!productForm.productID,
      name: productForm?.name?.trim() ? true : false,
      category: productForm?.category?.trim() ? true : false,
      description: productForm?.description?.trim() ? true : false,
      amount: productForm.amount > 0,
    }));
  }, [productForm]);

  // Effect to update productForm when productNewForm changes
  useEffect(() => {
    if (productNewForm) {
      setProductForm(productNewForm);
    }
  }, [productNewForm]);
  const [formValues, setFormValues] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { category, amount };
    setFormValues([...formValues, newEntry]);
    setCategory("");
    setAmount("");
  };
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
      <from className="flex mt-2" onSubmit={handleSubmit}>
        <div className="w-3/6">
          <label
            className="font-title text-sm text-default-color"
            htmlFor="clientCategory"
          >
            Client Category
          </label>
          <select
            id="clientCategory"
            className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 "
            value={category}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Client Category 1">Client Category 1</option>
            <option value="Client Category 2">Client Category 2</option>
            <option value="Client Category 3">Client Category 3</option>
            <option value="Client Category 4">Client Category 4</option>
            <option value="Client Category 5">Client Category 5</option>
            <option value="Client Category 6">Client Category 6</option>
            <option value="Client Category 7">Client Category 7</option>
            <option value="Client Category 8">Client Category 8</option>
            <option value="Client Category 9">Client Category 9</option>
            <option value="Client Category 10">Client Category 10</option>
            {/* {productCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))} */}
          </select>
        </div>
        <div className="w-2/6 px-2 mt-1">
          <div className="font-title text-sm text-default-color">Price</div>
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
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          onClick={handleSubmit}
          className="w-1/6 font-title text-md px-2 block border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-10 mt-7 bg-indigo-400 text-white hover:bg-indigo-500"
        >
          Add
        </button>
      </from>
      {formValues.length > 0 && (
        <div>
          {/* <h2>Submitted Forms</h2> */}
          {formValues.map((entry, index) => (
            <div key={index} className="flex mt-2">
              <div className="w-3/6">
                {/* <label
                  className="font-title text-sm text-default-color"
                  htmlFor="clientCategory"
                >
                  Client Category
                </label> */}
                <p className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12">{entry.category}</p>
              </div>
              <div className="w-2/6 px-2 mt-1">
                {/* <label
                  className="font-title text-sm text-default-color"
                  htmlFor="clientCategory"
                >
                  Amount
                </label> */}
                <p className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12">{entry.amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Description
        </div>
        <div className="flex">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                autoComplete="nope"
                placeholder="Product Description"
                type="text"
                className={
                  !validForm.description && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={productForm.description}
                onChange={(e) => handlerProductValue(e, "description")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Product Category
        </div>
        <div className="relative">
          <input
            value={productForm.category}
            type="text"
            onChange={(e) => handlerProductValue(e, "category")}
            placeholder="Category"
            className={
              !validForm.category && isTouched
                ? defaultInputInvalidStyle
                : defaultInputStyle
            }
            disabled={isInitLoading}
          />
          <select
            value={productForm.category}
            onChange={(e) => handlerProductValue(e, "category")}
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent text-gray-500"
          >
            <option value="">Select Category</option>
            {productCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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
