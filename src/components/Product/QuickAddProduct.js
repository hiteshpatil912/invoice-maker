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
import DeleteIcon from "../Icons/DeleteIcon";

const emptyForm = {
  image: "",
  productID: "",
  name: "",
  category: "",
  description: "",
  client_Categories: [{ Clientcategory: "", amount: "" }],
};

function QuickAddProduct({ selectedProduct, onNewUpdateProduct }) {
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
    client_Categories: true,
  });
  const [loading, setLoading] = useState(true);
  const [productCategories, setProductCategories] = useState([]);
  const [clientformData, setClientFormData] = useState({
    Clientcategory: "",
    amount: "",
  });
  const [formValues, setFormValues] = useState([]);

  const [clientCategories, setClientCategories] = useState([]);

  const apiDomain = process.env.REACT_APP_API_DOMAIN;

  const resetForm = () => {
    setProductForm({
      image: "", // Set your initial values here
      productID: "",
      name: "",
      category: "",
      description: "",
      client_Categories: [{ Clientcategory: "", amount: "" }],
    });
    setValidForm({
      image: false, // Set initial validation states here
      productID: false,
      name: false,
      category: false,
      description: false,
    });
  };

  const myHeaders = useMemo(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${authToken}`);
    return headers;
  }, [authToken]);

  const fetchCategories = useCallback(async () => {
    setLoading(false);
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
    } finally {
      setLoading(false);
    }
  }, [apiDomain, authToken, setLoading]);

  useEffect(() => {
    if (selectedProduct) {
      // Transform selectedProduct.product_categories to formattedData
      const formattedData = selectedProduct.product_categories.map((item) => ({
        Clientcategory: item.category_name,
        amount: item.price,
      }));

      // Set productForm with the transformed data
      setProductForm({
        ...selectedProduct,
        client_Categories: formattedData,
      });

      // Set formValues with the formatted data
      setFormValues(formattedData);
    }
  }, [selectedProduct]);


  const handleDelete = (indexToRemove) => {
    const updatedValues = formValues.filter((_, index) => index !== indexToRemove);
    setFormValues(updatedValues);

    setProductForm((prevProductForm) => ({
      ...prevProductForm,
      client_Categories: updatedValues,
    }));
  };
  const fetchClientCategories = useCallback(async () => {
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [apiDomain, authToken, setLoading]);

  useEffect(() => {
    if (authToken) {
      fetchCategories();
      fetchClientCategories();
    }
  }, [authToken, fetchCategories, fetchClientCategories]);

  // Callback function to handle image change
  const onChangeImage = useCallback((str) => {
    setProductForm((prev) => ({ ...prev, image: str }));
  }, []);

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
  const submitHandler = useCallback(async () => {
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
    productForm.client_Categories.forEach((clientCategory, index) => {
      formdata.append(
        `product_categories[${index}][price]`,
        clientCategory.amount
      );
      formdata.append(
        `product_categories[${index}][client_category]`,
        clientCategory.Clientcategory
      );
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      let response;
      if (selectedProduct) {
        response = await fetch(
          `${apiDomain}/product/${selectedProduct.id}`,
          requestOptions
        );
      } else {
        response = await fetch(`${apiDomain}/product`, requestOptions);
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      handleEditorNew(result);
      toast.success(result.data.message || "Product Added Successfully!", {
        position: "bottom-center",
        autoClose: 2000,
      });

      // Reset the form after successful submission
      resetForm();
      setFormValues([]);
    } catch (error) {
      toast.error("Failed to add/update product!", {
        position: "bottom-center",
        autoClose: 2000,
      });
    } finally {
      setIsTouched(false);
    }

    setIsTouched(false);
  }, [
    productForm,
    validForm,
    apiDomain,
    myHeaders,
    selectedProduct,
    handleEditorNew,
  ]);

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
    }));
  }, [productForm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientFormData({ ...clientformData, [name]: value });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    setIsTouched(true);

    if (clientformData.Clientcategory && clientformData.amount) {
      // Update the formValues state first
      setFormValues((prevFormValues) => {
        const updatedFormValues = [...prevFormValues, clientformData];

        // Update the productForm state based on the updated formValues
        setProductForm((prevProductForm) => ({
          ...prevProductForm,
          client_Categories: updatedFormValues, // Update the client_Categories array
        }));

        // Reset form fields after submission
        setClientFormData({ Clientcategory: "", amount: "" });

        return updatedFormValues;
      });
    }
    setIsTouched(false);
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

      <form className="flex mt-2" onSubmit={handleAddCategory}>
        <div className="w-3/6">
          <label
            className="font-title text-sm text-default-color"
            htmlFor="clientCategory"
          >
            Client Category
          </label>
          <select
            id="clientCategory"
            name="Clientcategory"
            className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 "
            value={clientformData.Clientcategory}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Category</option>
            {clientCategories.map((clientCategory, index) => (
              <option key={index} value={clientCategory.name}>
                {clientCategory.name}
              </option>
            ))}
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
                  name="amount"
                  className={
                    !validForm.amount && isTouched
                      ? defaultInputInvalidStyle
                      : defaultInputStyle
                  }
                  disabled={isInitLoading}
                  value={clientformData.amount}
                  onChange={handleInputChange}
                  required
                />
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-1/6 font-title text-md px-2 block border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-10 mt-7 bg-indigo-400 text-white hover:bg-indigo-500"
        >
          Add
        </button>
      </form>

      {formValues.length > 0 && (
        <div>
          {formValues.map((entry, index) => (
            <div key={index} className="flex mt-2">
              <div className="w-3/6">
                <p className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12">
                  {entry.Clientcategory}
                </p>
              </div>
              <div className="w-2/6 px-2 mt-1">
                <p className="font-title text-md px-2 block w-full border-solid border-2 rounded-xl py-2 focus:outline-none border-indigo-400 h-12">
                  {entry.amount}
                </p>
              </div>
              <div className="w-1/6 p-3 text-red-600 ">
                <DeleteIcon onClick={() => handleDelete(index)} />
              </div>
              {/* <button
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded-xl"
          onClick={() => handleDelete(index)} // Assuming you have a function handleDelete to remove the entry
        >
        </button> */}
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
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent focus:outline-none text-gray-500"
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
