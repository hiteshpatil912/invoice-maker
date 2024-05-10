import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  getAllClientsSelector,
  getEditedIdForm,
  setEditedId,
  onConfirmEditClient,
  updateNewClientFormField,
} from "../../store/clientSlice";
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultInputLargeStyle,
  defaultInputLargeInvalidStyle,
} from "../../constants/defaultStyles";
import ImageUpload from "../Common/ImageUpload";

const emptyForm = {
  id: "",
  image: "",
  name: "",
  clientCategory: "", // Updated to include clientCategory
  billingAddress: "",
  mobileNo: "",
};

function ClientEditModal(props) {
  const dispatch = useDispatch();
  const [isInitLoading, setIsInitLoading] = useState(true);
  const editedID = useSelector(getEditedIdForm);
  const clients = useSelector(getAllClientsSelector);
  const [animate, setAnimate] = useState(true);
  const [clientForm, setClientForm] = useState(emptyForm);
  const [isTouched, setIsTouched] = useState(false);

  const [validForm, setValidForm] = useState(
    Object.keys(emptyForm).reduce((a, b) => {
      return { ...a, [b]: false };
    }, {})
  );

  const onEditHandler = useCallback(() => {
    setIsTouched(true);
    const isValid = Object.values(validForm).every((value) => value);

    if (!isValid) {
      toast.error("Invalid Client Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    toast.success("Successfully Updated Client!", {
      position: "bottom-center",
      autoClose: 2000,
    });

    dispatch(onConfirmEditClient(clientForm));
    setIsTouched(false);
  }, [dispatch, validForm, clientForm]);

  const handlerClientValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setClientForm((prev) => ({
        ...prev,
        [keyName]: value,
      }));

      // Dispatch the update for clientCategory
      if (keyName === "clientCategory") {
        dispatch(updateNewClientFormField({ key: keyName, value }));
      }
    },
    [dispatch]
  );

  const onChangeImage = useCallback(
    (str) => {
      setClientForm((prev) => ({ ...prev, image: str }));
      dispatch(updateNewClientFormField({ key: "image", value: str }));
    },
    [dispatch]
  );

  const onCancelHandler = useCallback(() => {
    dispatch(setEditedId(null));
  }, [dispatch]);

  const imageUploadClasses = useMemo(() => {
    const defaultStyle = "rounded-xl ";

    if (!clientForm.image) {
      return defaultStyle + " border-dashed border-2 border-indigo-400 ";
    }

    return defaultStyle;
  }, [clientForm]);

  useEffect(() => {
    setValidForm((prev) => ({
      ...prev,
      id: true,
      image: true,
      name: clientForm?.name?.trim() ? true : false,
      clientCategory: clientForm?.clientCategory?.trim() ? true : false, // Updated to include clientCategory
      billingAddress: clientForm?.billingAddress?.trim() ? true : false,
      mobileNo: clientForm?.mobileNo?.trim() ? true : false,
    }));
  }, [clientForm]);

  useEffect(() => {
    if (editedID !== null) {
      setAnimate(true);
      const isFindIndex = clients.findIndex((client) => client.id === editedID);
      if (isFindIndex !== -1) {
        const updatedClientForm = { ...clients[isFindIndex] };
        // Check if any property is null and replace it with an empty string
        for (const key in updatedClientForm) {
          if (updatedClientForm[key] === null) {
            updatedClientForm[key] = "";
          }
        }
        setClientForm(updatedClientForm);
      }
      setIsInitLoading(false);
    } else {
      setAnimate(false);
      setIsInitLoading(true);
    }
  }, [clients, editedID]);

  return editedID !== null ? (
    <motion.div
      className="modal-container"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: animate ? 1 : 0,
      }}
      transition={{
        type: "spring",
        damping: 18,
      }}
    >
      <div className="relative">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Edited Client Form
                    </h3>
                    <div className="mt-2">
                      <div className="bg-white rounded-xl mt-4">
                        <div className="flex mt-2">
                          <ImageUpload
                            keyName="QuickEditImageUpload"
                            className={imageUploadClasses}
                            url={clientForm.image}
                            onChangeImage={onChangeImage}
                          />

                          <div className="flex-1 pl-3">
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
                            />
                          </div>
                        </div>
                        <div className="flex mt-2">
                          <select
                            value={clientForm.clientCategory}
                            onChange={(e) =>
                              handlerClientValue(e, "clientCategory")
                            } // Ensure correct keyName is passed
                            className={defaultInputStyle}
                          >
                            <option value="">Select Category</option>
                            <option value="category 1">category 1</option>
                            <option value="category 2">category 2</option>
                            <option value="category 3">category 3</option>
                          </select>
                        </div>
                        <div className="flex mt-2">
                          <div className="flex-1">
                            <input
                              autoComplete="nope"
                              placeholder="Mobile No"
                              className={
                                !validForm.mobileNo && isTouched
                                  ? defaultInputInvalidStyle
                                  : defaultInputStyle
                              }
                              value={clientForm.mobileNo}
                              onChange={(e) =>
                                handlerClientValue(e, "mobileNo")
                              }
                            />
                          </div>
                        </div>
                        <div className="flex mt-2">
                          <div className="flex-1">
                            <input
                              autoComplete="nope"
                              placeholder="Billing Address"
                              className={
                                !validForm.billingAddress && isTouched
                                  ? defaultInputInvalidStyle
                                  : defaultInputStyle
                              }
                              value={clientForm.billingAddress}
                              onChange={(e) =>
                                handlerClientValue(e, "billingAddress")
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onEditHandler}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onCancelHandler}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ) : null;
}

export default ClientEditModal;
