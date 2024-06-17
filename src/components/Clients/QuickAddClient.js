import React, { useState, useCallback, useEffect, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import Button from "../Button/Button";
import SectionTitle from "../Common/SectionTitle";
import { useAppContext } from "../../context/AppContext";
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import { useAuth } from "../../auth/AuthContext";

const emptyForm = {
  name: "",
  category: "",
  phone_number:"",
  address: "",
};

function QuickAddClient({selectedClient,onNewUpdateClient}) {
  const { initLoading: isInitLoading } = useAppContext();
  const { authToken } = useAuth();
  const apiDomain = process.env.REACT_APP_API_DOMAIN;


  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [clientForm, setClientForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [clientCategories, setClientCategories] = useState([]);
  const [validForm, setValidForm] = useState({
    name: false,
    category: false,
    phone_number:false,
    address: false,
  });

  const resetForm = () => {
    setClientForm({
      name: "",
      category: "",
      phone_number:"",
      address: "",
    });
    setValidForm({
      name: false,
      category: false,
      phone_number:false,
      address: false,
    });
  };

  const myHeaders = useMemo(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${authToken}`);
    return headers;
  }, [authToken]);

  // // Callback function to handle client form field changes
  const handlerClientValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setClientForm((prev) => {
        return { ...prev, [keyName]: value };
      });
      console.log({keyName})

      // Include a condition to check if the keyName is "category"
      if (keyName === "category") {
        setValidForm((prev) => ({
          ...prev,
          [keyName]: !!value.trim(), // Validate the category field
        }));

        // Add the new category if it doesn't exist
        if (value.trim() && !clientCategories.includes(value.trim())) {
          setClientCategories((prevCategories) => [...prevCategories, value.trim()]);
        }
      } 
    },
    [clientCategories]
  );

  const handleEditorNew = useCallback(
    (item) => {
      onNewUpdateClient(item); // Pass selected product to parent component
    },
    [onNewUpdateClient]
  );

  const fetchClientCategories = useCallback(async () => {
    setLoading(false)
    try {
      const response = await fetch(`${apiDomain}/clients`, {
        method: "GET",
        headers: {
          Authorization: authToken,
        },
      });
      const data = await response.json();
      console.log({data})
      setClientCategories(data.data.clientCategory); // Assuming the response is an array of products
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
      fetchClientCategories();
    }
  }, [authToken, fetchClientCategories]);


  useEffect(() => {
    if (selectedClient) {
      setClientForm(selectedClient);
    }
  }, [selectedClient]);
  

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
    formdata.append("name", clientForm.name);
    formdata.append("client_category", clientForm.category);
    formdata.append("phone_number",clientForm.phone_number);
    formdata.append("address",clientForm.address)

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };


    try {
      let response;
      if (selectedClient) {
        response = await fetch(`${apiDomain}/client/${selectedClient.id}`, requestOptions);
      } else {
        console.log({requestOptions})
        response = await fetch(`${apiDomain}/client`, requestOptions);
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
    resetForm();
    } catch (error) {
      toast.error("Failed to add/update product!", {
        position: "bottom-center",
        autoClose: 2000,
      });
    } finally {
      setIsTouched(false);
    }   
  }, [clientForm, validForm,apiDomain,myHeaders,selectedClient,handleEditorNew]);

  // Effect to update validForm when clientForm changes
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      name: clientForm?.name?.trim() ? true : false,
      category: clientForm?.category?.trim() ? true : false, // Ensure clientCategory validation
      phone_number: !!clientForm.phone_number,
      address: clientForm?.address?.trim() ? true : false,
    }));
  }, [clientForm]);



  return (
    <div className="bg-white rounded-xl p-4">
      <SectionTitle> Add Client </SectionTitle>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Client Name</div>
        <div className="flex">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                autoComplete="nope"
                placeholder="Client Name"
                type="text"
                className={
                  !validForm.name && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={clientForm.name}
                onChange={(e) => handlerClientValue(e, "name")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Mobile Number
        </div>
        <div className="flex">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                autoComplete="nope"
                placeholder="Mobile Number"
                type="text"
                className={
                  !validForm.phone_number && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={clientForm.phone_number}
                onChange={(e) => handlerClientValue(e, "phone_number")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Billing Address
        </div>
        <div className="flex">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                autoComplete="nope"
                placeholder="Billing Address"
                type="text"
                className={
                  !validForm.address && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={clientForm.address}
                onChange={(e) => handlerClientValue(e, "address")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Client Category
        </div>
        <div className="relative">
          <input
            value={clientForm.category}
            type="text"
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
                ...prev,
                category: newValue,
              }));
              handlerClientValue(e, "category");
            }}
            placeholder=""
            className={
              !validForm.category && isTouched
                ? defaultInputInvalidStyle
                : defaultInputStyle
            }
            disabled={isInitLoading}
          />
          {/* Spinner for predefined categories*/}
          <select
            value={clientForm.category}
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
                ...prev,
                category: newValue,
              }));
              handlerClientValue(e, "category");
            }}
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent text-gray-500"
          >
            <option value="">Select Category</option>
            {clientCategories.map((category) => (
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

export default QuickAddClient;
