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
  defaultInputLargeStyle,
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import {
  addNewClient,
  getClientNewForm,
  updateNewClientFormField,
} from "../../store/clientSlice";

const emptyForm = {
  id: "",
  name: "",
  clientCategory: "",
  mobileNumber: "",
  billingAddress: "",
};

function Add() {
  const dispatch = useDispatch();
  const clientNewForm = useSelector(getClientNewForm);
  const { initLoading: isInitLoading } = useAppContext();

  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [clientForm, setClientForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState({
    id: false,
    name: false,
    clientCategory: false,
    mobileNumber: false,
    billingAddress: false,
  });

  // Callback function to handle client form field changes
  const handlerClientValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setClientForm((prev) => {
        return { ...prev, [keyName]: value };
      });

      // Include a condition to check if the keyName is "clientCategory"
      if (keyName === "clientCategory") {
        setValidForm((prev) => ({
          ...prev,
          [keyName]: !!value.trim(), // Validate the clientCategory field
        }));
      } else {
        dispatch(updateNewClientFormField({ key: keyName, value }));
      }
    },
    [dispatch]
  );

  // Form submission handler
  const submitHandler = useCallback(() => {
    setIsTouched(true);
    const isValid = Object.values(validForm).every((value) => value);

    if (!isValid) {
      toast.error("Invalid Client Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    toast.success("Client Added Successfully!", {
      position: "bottom-center",
      autoClose: 2000,
    });

    dispatch(addNewClient({ ...clientForm, id: nanoid() }));
    setIsTouched(false);
  }, [clientForm, dispatch, validForm]);

  // Effect to update validForm when clientForm changes
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      id: !!clientForm.id,
      name: clientForm?.name?.trim() ? true : false,
      clientCategory: clientForm?.clientCategory?.trim() ? true : false, // Ensure clientCategory validation
      mobileNumber: !!clientForm.mobileNumber,
      billingAddress: clientForm?.billingAddress?.trim() ? true : false,
    }));
  }, [clientForm]);

  // Effect to update clientForm when clientNewForm changes
  useEffect(() => {
    if (clientNewForm) {
      setClientForm(clientNewForm);
    }
  }, [clientNewForm]);

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
          Client Category
        </div>
        <div className="relative">
          <input
            value={clientForm.clientCategory}
            type="text"
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
                ...prev,
                clientCategory: newValue,
              }));
              handlerClientValue(e, "clientCategory");
            }}
            placeholder=""
            className={
              !validForm.clientCategory && isTouched
                ? defaultInputInvalidStyle
                : defaultInputStyle
            }
            disabled={isInitLoading}
          />
          {/* Spinner for predefined categories*/}
          <select
            value={clientForm.clientCategory}
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
                ...prev,
                clientCategory: newValue,
              }));
              handlerClientValue(e, "clientCategory");
            }}
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent text-gray-500"
          >
            <option value="">Select Category</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            {Array.from(new Set([clientForm.clientCategory, "A", "B", "C"]))
              .filter((cat) => cat && !["A", "B", "C"].includes(cat))
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
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
                  !validForm.mobileNumber && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={clientForm.mobileNumber}
                onChange={(e) => handlerClientValue(e, "mobileNumber")}
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
                  !validForm.billingAddress && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={clientForm.billingAddress}
                onChange={(e) => handlerClientValue(e, "billingAddress")}
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

export default Quickadd;
