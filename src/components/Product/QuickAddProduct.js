import React, { useState, useCallback, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
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
  image: "",
  productID: "",
  name: "",
  category: "",
  description: "",
  amount: 0,
};

function QuickAddProduct({ selectedProduct ,onNewUpdateProduct}) {
  const { initLoading: isInitLoading } = useAppContext();
  const { authToken } = useAuth();
  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [productForm, setProductForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState({
    image: false,
    productID: false,
    name: false,
    category: false,
    description: false,
    amount: false,
  });
  const [loading, setLoading] = useState(true);
  const [productCategories, setProductCategories] = useState([]);
  const apiDomain = process.env.REACT_APP_API_DOMAIN;

  const resetForm = () => {
    setProductForm({
      image: "", // Set your initial values here
      productID: "",
      name: "",
      category: "",
      description: "",
      amount: ""
    });
    setValidForm({
      image: false, // Set initial validation states here
      productID: false,
      name: false,
      category: false,
      description: false,
      amount: false
    });
  };

  const myHeaders = useMemo(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${authToken}`);
    return headers;
  }, [authToken]);


  const fetchCategories = useCallback(async () => {
    setLoading(false)
    try {
      const response = await fetch(`${apiDomain}/products`, {
        method: "GET",
        headers: {
          Authorization: authToken,
        },
      });
      const data = await response.json();
      setProductCategories(data.data.category); // Assuming the response is an array of products
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }finally{
      setLoading(false)
    }
  }, [apiDomain, authToken,setLoading]);

  useEffect(() => {
    if (authToken) {
      fetchCategories();
    }
  }, [authToken, fetchCategories]);

  useEffect(() => {
    if (selectedProduct) {
      setProductForm(selectedProduct);
    }
  }, [selectedProduct]);

  // Callback function to handle image change
  const onChangeImage = useCallback(
    (str) => {
      setProductForm((prev) => ({ ...prev, image: str }));
    },
    []
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
      } 
    },
    [productCategories]
  );


  const handleEditorNew = useCallback(
    (item) => {
      onNewUpdateProduct(item); // Pass selected product to parent component
    },
    [onNewUpdateProduct]
  );

  // Form submission handler
  const submitHandler = useCallback(async() => {
    setIsTouched(true);
    const isValid = Object.values(validForm).every((value) => value);

    if (!isValid) {
      toast.error("Invalid Product Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    const formdata = new FormData();
    formdata.append("image", productForm.image);
    formdata.append("productID", productForm.productID);
    formdata.append("name", productForm.name);
    formdata.append("category", productForm.category);
    formdata.append("description", productForm.description);
    formdata.append("amount", productForm.amount);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      let response;
      if (selectedProduct) {
        response = await fetch(`${apiDomain}/product/${selectedProduct.id}`, requestOptions);
      } else {
        response = await fetch(`${apiDomain}/product`, requestOptions);
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      handleEditorNew(result)
      toast.success(result.data.message || "Product Added Successfully!", {
        position: "bottom-center",
        autoClose: 2000,
      });

          // Reset the form after successful submission
    resetForm();

    } catch (error) {
      toast.error("Failed to add/update product!", {
        position: "bottom-center",
        autoClose: 2000,
      });
    } finally {
      setIsTouched(false);
    }


    setIsTouched(false);

  }, [productForm, validForm, apiDomain, myHeaders, selectedProduct,handleEditorNew]);



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
      image: productForm.image,
      productID: !!productForm.productID,
      name: productForm?.name?.trim() ? true : false,
      category: productForm?.category?.trim() ? true : false,
      description: productForm?.description?.trim() ? true : false,
      amount: productForm.amount > 0,
    }));
  }, [productForm]);




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
              <option key={category.id} value={category.name}>
                {category.name}
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
