import React, { useState, useCallback, useMemo, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "nanoid";
import Button from "../Button/Button";
import ImageUpload from "../Common/ImageUpload";
import SectionTitle from "../Common/SectionTitle";
<<<<<<< HEAD
=======
import { useAppContext } from "../../context/AppContext";
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultInputLargeStyle,
<<<<<<< HEAD
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import { useAppContext } from "../../context/AppContext";
=======
  defaultInputLargeInvalidStyle,
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
import {
  addNewClient,
  getClientNewForm,
  updateNewClientFormField,
} from "../../store/clientSlice";

<<<<<<< HEAD
=======
// const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
const emptyForm = {
  id: "",
  image: "",
  name: "",
<<<<<<< HEAD
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
=======
  // email: "",
  billingAddress: "",
  mobileNo: "",
 clientCategory: "", // AddclientCategory field to the form
};

function QuickAddClient({ editForm }) {
  const dispatch = useDispatch();
  const clientNewForm = useSelector(getClientNewForm);
  const { initLoading: isInitLoading } = useAppContext();
  const [isTouched, setIsTouched] = useState(false);
  const [clientForm, setClientForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState(
    Object.keys(emptyForm).reduce((a, b) => {
      return { ...a, [b]: false };
    }, {})
  );

>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
  const onChangeImage = useCallback(
    (str) => {
      setClientForm((prev) => ({ ...prev, image: str }));
      dispatch(updateNewClientFormField({ key: "image", value: str }));
    },
    [dispatch]
  );
<<<<<<< HEAD

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
=======
  const handlerClientValue  = useCallback((event, keyName) => {
    const value =
      typeof event === "string" ? new Date(event) : event?.target?.value;

      setClientForm((prev) => {
      return {
        ...prev,
        clientDetail: { ...prev.clientDetail, [keyName]: value },
      };
    });
          dispatch(updateNewClientFormField({ key: keyName, value }));
  }, [dispatch]
);

//   const handlerClientValue = useCallback(
//     (event, keyName) => {
//       const value = event.target.value;

//       setClientForm((prev) => {
//         return { ...prev, [keyName]: value };
//       });

//       dispatch(updateNewClientFormField({ key: keyName, value }));
//     },
//     [dispatch]
//   );

  const submitHandler = useCallback(() => {
    setIsTouched(true);

    const isValid = Object.keys(validForm).every((key) => validForm[key]);
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5

    if (!isValid) {
      toast.error("Invalid Client Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

<<<<<<< HEAD
    toast.success("Client Added Successfully!", {
=======
    toast.success("Wow so easy to Update!", {
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
      position: "bottom-center",
      autoClose: 2000,
    });

    dispatch(addNewClient({ ...clientForm, id: nanoid() }));
    setIsTouched(false);
  }, [clientForm, dispatch, validForm]);

<<<<<<< HEAD
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
=======
  const imageUploadClasses = useMemo(() => {
    const defaultStyle = "rounded-xl ";

    if (!clientForm.image) {
      return defaultStyle + " border-dashed border-2 border-indigo-400 ";
    }

    return defaultStyle;
  }, [clientForm]);

  useEffect(() => {
    // const isValidEmail =
    //   clientForm?.email?.trim() && clientForm?.email.match(emailRegex);

    setValidForm((prev) => ({
      id: true,
      image: true,
      name: clientForm?.name?.trim() ? true : false,
      billingAddress: clientForm?.billingAddress?.trim() ? true : false,
      mobileNo: clientForm?.mobileNo?.trim() ? true : false,
     clientCategory: clientForm?.clientcategory?.trim() ? true : false, // AddclientCategory validation
    }));
  }, [clientForm]);

>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
  useEffect(() => {
    if (clientNewForm) {
      setClientForm(clientNewForm);
    }
  }, [clientNewForm]);

  return (
    <div className="bg-white rounded-xl p-4">
<<<<<<< HEAD
      <SectionTitle> Quick Add Client </SectionTitle>
=======
      <SectionTitle>Quick Add Client</SectionTitle>
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
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
<<<<<<< HEAD
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
=======

        <div className="flex-1 pl-3">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonLargeStyle} />
          ) : (
            <div>
              <input
                autoComplete="nope"
                value={clientForm.name}
                placeholder="User Name"
                className={
                  !validForm.name && isTouched
                    ? defaultInputLargeInvalidStyle
                    : defaultInputLargeStyle
                }
                onChange={(e) => handlerClientValue(e, "name")}
                disabled={isInitLoading}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        <div className="font-title text-sm text-default-color">
          Client Category
        </div>
        {/*  */}
        <div className="relative">
          <input
            value={clientForm.clientCategory}
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
            type="text"
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
<<<<<<< HEAD
                ...prev,
                category: newValue,
              }));
              handleClientValue(e, "category");
            }}
            placeholder=""
            className={
              !validForm.category && isTouched
=======
              ...prev,
              clientCategory: newValue,
            }));
            handlerClientValue(e, "clientCategory");
          }}
          placeholder="clientCategory"
            className={
              !validForm.name && isTouched
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
                ? defaultInputInvalidStyle
                : defaultInputStyle
            }
            disabled={isInitLoading}
          />
          {/* Spinner for predined categories*/}
          <select
<<<<<<< HEAD
            value={clientForm.category}
=======
            value={clientForm.clientCategory}
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
            onChange={(e) => {
              const newValue = e.target.value;
              setClientForm((prev) => ({
                ...prev,
                category: newValue,
              }));
<<<<<<< HEAD
              handleClientValue(e, "category");
            }}
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent text-gray-500"
=======
              handlerClientValue(e, "clientCategory");
            }}
            className="absolute inset-y-0 right-0 pr-3 py-2 bg-transparent text-gray-500 focus:outline-none"
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
          >
            <option value="">Select Category</option>
            <option value="X">X</option>
            <option value="Y">Y</option>
            <option value="Z">Z</option>
<<<<<<< HEAD
            {Array.from(new Set([clientForm.category, "X", "Y", "Z"]))
              .filter((cat) => cat && !["X", "Y", "Z"].includes(cat))
              .map((category) => (
                <option key={category} value={category}>
                  {category}
=======
            {Array.from(new Set([clientForm.clientCategory, "X", "Y", "Z"]))
              .filter((cat) => cat && !["X", "Y", "Z"].includes(cat))
              .map((clientCategory) => (
                <option key={clientCategory} value={clientCategory}>
                  {clientCategory}
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
                </option>
              ))}
          </select>
        </div>
<<<<<<< HEAD
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
=======
        {/*  */}
        {/* <div className="flex">
          <select
            value={clientForm.clientcategory} // Set value toclientCategory field
            onChange={(e) => handlerClientValue(e, "clientcategory")} // HandleclientCategory change
            className={defaultInputStyle}
          >
            <option value="">Select Category</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div> */}
      </div>

      <div className="flex mt-2">
        <div className="flex-1">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonNormalStyle} />
          ) : (
            <input
              autoComplete="nope"
              placeholder="Mobile No"
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
      <div className="flex mt-2">
        <div className="flex-1">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonNormalStyle} />
          ) : (
            <input
              autoComplete="nope"
              placeholder="Billing Address"
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

      <div className="mt-3">
        <Button onClick={submitHandler} block={1}>
          <span className="inline-block ml-2">Submit</span>
>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
        </Button>
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> 4146949c984bb8a0996bbbd55e6e1b2545fdcaf5
export default QuickAddClient;
