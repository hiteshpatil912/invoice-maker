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
  //defaultInputLargeStyle,
  //defaultSkeletonLargeStyle,
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
  mobileNo: "",
  clientCategory: "",
};

function ClientChooseModal() {
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
    mobileNo: false,
    clientCategory: false,
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
  const handlerClientValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setClientForm((prev) => {
        return { ...prev, [keyName]: value };
      });

      setValidForm((prev) => ({
        ...prev,
        [keyName]: !!value.trim(),
      }));

      dispatch(updateNewClientFormField({ key: keyName, value }));
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
      mobileNo: clientForm?.mobileNo?.trim() ? true : false,
      clientCategory: clientForm?.clientCategory?.trim() ? true : false,
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
      <SectionTitle> Add New Client </SectionTitle>
      <div className="flex mt-2">
        {isInitLoading ? (
          <Skeleton className="skeleton-input-radius skeleton-image border-dashed border-2" />
        ) : (
          <ImageUpload
            keyName="ClientChooseImageUpload"
            className={imageUploadClasses}
            url={clientForm.image}
            onChangeImage={onChangeImage}
          />
        )}
      </div>
      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Client Name
        </div>
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
                  !validForm.mobileNo && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                disabled={isInitLoading}
                value={clientForm.mobileNo}
                onChange={(e) => handlerClientValue(e, "mobileNo")}
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

export default ClientChooseModal;
