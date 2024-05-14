import React, { useState, useCallback, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "nanoid";
import Button from "../Button/Button";
import ImageUpload from "../Common/ImageUpload";
import SectionTitle from "../Common/SectionTitle";
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultInputLargeStyle,
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import { useAppContext } from "../../context/AppContext";
import {
  addNewClient,
  getClientNewForm,
  updateNewClientFormField,
} from "../../store/clientSlice";

const emptyForm = {
  id: "",
  image: "",
  name: "",
  mobileNumber: "",
  category: "",
  billingAddress: "",
};

function QuickAddClient() {
  const dispatch = useDispatch();
  const clientNewForm = useSelector(getClientNewForm);
  const { initLoading: isInitLoading } = useAppContext();

  // State variables
  const [isTouched, setIsTouched] = useState(false);
  const [clientForm, setClientForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState({
    id: false,
    image: false,
    name: false,
    mobileNumber: false,
    category: false,
    billingAddress: false,
  });

  // Callback function to handle image change
  const onChangeImage = useCallback(
    (str) => {
      setClientForm((prev) => ({ ...prev, image: str }));
      dispatch(updateNewClientFormField({ key: "image", value: str }));
    },
    [dispatch]
  );

  // Callback function to handle client form field changes
  const handleClientValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setClientForm((prev) => {
        return { ...prev, [keyName]: value };
      });

      // Include a condition to check if the keyName is "category"
      if (keyName === "category") {
        setValidForm((prev) => ({
          ...prev,
          [keyName]: !!value.trim(), // Validate the category field
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

  // Memoized class for image upload
  const imageUploadClasses = useMemo(() => {
    const defaultStyle = "rounded-xl ";
    return !clientForm.image
      ? defaultStyle + " border-dashed border-2 border-indigo-400 "
      : defaultStyle;
  }, [clientForm.image]);

  // Effect to update validForm when clientForm changes
  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      id: !!clientForm.id,
      image: clientForm.image,
      name: clientForm?.name?.trim() ? true : false,
      mobileNumber: clientForm?.mobileNumber?.trim() ? true : false,
      category: clientForm?.category?.trim() ? true : false,
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
      <SectionTitle> Quick Add Client </SectionTitle>
      <div className="flex mt-2">
        {isInitLoading ? (
          <Skeleton className="skeleton-input-radius skeleton-image border-dashed border-2" />
        ) : (
          <ImageUpload
            keyName="QuickEditImageUpload"
            className={imageUploadClasses}
            url={clientForm.image}
            onChangeImage={onChangeImage}
          />
        )}
      </div>
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
                onChange={(e) => handleClientValue(e, "name")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Mobile Number</div>
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
                onChange={(e) => handleClientValue(e, "mobileNumber")}
              />
            )}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Client Category</div>
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
              handleClientValue(e, "category");
            }}
            placeholder=""
            className={
              !validForm.category && isTouched
                ? defaultInputInvalidStyle
                : defaultInputStyle
            }
            disabled={isInitLoading}
          />
          {/* Spinner for predined categories*/}
          <select
            value={clientForm.category}
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
                ...prev,
                category: newValue,
              }));
              handleClientValue(e, "category");
            }}
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent text-gray-500"
          >
            <option value="">Select Category</option>
            <option value="X">X</option>
            <option value="Y">Y</option>
            <option value="Z">Z</option>
            {Array.from(new Set([clientForm.category, "X", "Y", "Z"]))
              .filter((cat) => cat && !["X", "Y", "Z"].includes(cat))
              .map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">Billing Address</div>
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
                onChange={(e) => handleClientValue(e, "billingAddress")}
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
export default QuickAddClient;
