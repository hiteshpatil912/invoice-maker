import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  defaultInputLargeInvalidStyle,
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import { useAuth } from "../../auth/AuthContext";

const emptyForm = {
  id: "",
  image: "",
  companyName: "",
  companyEmail: "",
  companyMobile: "",
  billingAddress: "",
};

function QuickEditCompany({ isShowDetail = false, alreadySet = false }) {
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";
  const { initLoading: isInitLoading } = useAppContext();
  const { authToken } = useAuth();
  const [isTouched, setIsTouched] = useState(false);
  const [companyForm, setCompanyForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState(
    Object.keys(emptyForm).reduce((a, b) => {
      return { ...a, [b]: false };
    }, {})
  );

  const onChangeImage = useCallback((str) => {
    setCompanyForm((prev) => ({ ...prev, image: str }));
  }, []);

  const handlerCompanyValue = useCallback((event, keyName) => {
    const value = event.target.value;
    setCompanyForm((prev) => ({ ...prev, [keyName]: value }));
  }, []);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await fetch(`${apiDomain}/company/1/edit`, {
        method: "GET",
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setCompanyForm({
        id: data.data[0].id,
        image: data.data[0].image,
        companyName: data.data[0].name,
        companyEmail: data.data[0].email,
        companyMobile: data.data[0].phone,
        billingAddress: data.data[0].address,
      });
    } catch (error) {
      toast.error("Failed to fetch company details", {
        position: "bottom-center",
        autoClose: 2000,
      });
    }
  }, [apiDomain, authToken]);

  useEffect(() => {
    if (authToken) {
      fetchCompanyDetails();
    }
  }, [fetchCompanyDetails, authToken]);

  const myHeaders = useMemo(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${authToken}`);
    return headers;
  }, [authToken]);

  const submitHandler = useCallback(async () => {
    setIsTouched(true);

    const isValid = Object.keys(validForm).every((key) => validForm[key]);

    if (!isValid) {
      toast.error("Invalid Company Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      // Create FormData object
      const formData = new FormData();
      console.log({ companyForm });
      formData.append("name", companyForm.companyName);
      formData.append("address", companyForm.billingAddress);
      formData.append("phone", companyForm.companyMobile);
      formData.append("email", companyForm.companyEmail);
      // Conditionally append image only if user has selected a new image
      if (companyForm.image && !companyForm.image.startsWith("http")) {
        formData.append("image", companyForm.image);
      }
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
      };

      const response = await fetch(
        `${apiDomain}/company/${companyForm.id}`,
        requestOptions
      );

      // Check if the response is not OK
      if (!response.ok) {
        const errorText = await response.json(); // Get the response text (which might be HTML)
        throw new Error(
          `Failed to update company details: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      if (result.success) {
        fetchCompanyDetails();
        toast.success("Company details updated successfully!", {
          position: "bottom-center",
          autoClose: 2000,
        });
      } else {
        throw new Error("Failed to update company details");
      }
    } catch (error) {
      console.error("Failed to update company details:", error);
      toast.error(`Failed to update company details: ${error.message}`, {
        position: "bottom-center",
        autoClose: 2000,
      });
    }
  }, [companyForm, validForm, apiDomain, myHeaders]);

  const imageUploadClasses = useMemo(() => {
    const defaultStyle = "rounded-xl ";

    if (isTouched && !companyForm.image) {
      return defaultStyle + " border-dashed border-2 border-red-400 ";
    }

    if (!companyForm.image) {
      return defaultStyle + " border-dashed border-2 border-indigo-400 ";
    }

    return defaultStyle;
  }, [companyForm, isTouched]);

  useEffect(() => {
    setValidForm((prev) => ({
      id: true,
      image: companyForm.image ? true : false,
      companyName: companyForm.companyName ? true : false,
      companyEmail: companyForm.companyEmail ? true : false,
      companyMobile: companyForm.companyMobile ? true : false,
      billingAddress: companyForm.billingAddress ? true : false,
    }));
  }, [companyForm]);

  return (
    <div className="bg-white rounded-xl p-4 mt-4">
      <SectionTitle> Quick Edit Company </SectionTitle>
      <div className="flex mt-2">
        {isInitLoading ? (
          <Skeleton className="skeleton-input-radius skeleton-image border-dashed border-2" />
        ) : (
          <ImageUpload
            onChangeImage={onChangeImage}
            keyName="QuickEditImageUpload"
            className={imageUploadClasses}
            url={companyForm.image}
          />
        )}

        <div className="flex-1 pl-3">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonLargeStyle} />
          ) : (
            <input
              value={companyForm.companyName}
              placeholder="Company Name"
              className={
                !validForm.companyName && isTouched
                  ? defaultInputLargeInvalidStyle
                  : defaultInputLargeStyle
              }
              onChange={(e) => handlerCompanyValue(e, "companyName")}
              disabled={isInitLoading}
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
              value={companyForm.billingAddress}
              placeholder="Company Address"
              className={
                !validForm.billingAddress && isTouched
                  ? defaultInputInvalidStyle
                  : defaultInputStyle
              }
              onChange={(e) => handlerCompanyValue(e, "billingAddress")}
              disabled={isInitLoading}
            />
          )}
        </div>
      </div>

      <>
        <div className="flex mt-2">
          <div className="flex-1">
            {isInitLoading ? (
              <Skeleton className={defaultSkeletonNormalStyle} />
            ) : (
              <input
                value={companyForm.companyEmail}
                placeholder="Company Email"
                className={
                  !validForm.companyEmail && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                onChange={(e) => handlerCompanyValue(e, "companyEmail")}
                disabled={isInitLoading}
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
                value={companyForm.companyMobile}
                placeholder="Company Phone"
                className={
                  !validForm.companyMobile && isTouched
                    ? defaultInputInvalidStyle
                    : defaultInputStyle
                }
                onChange={(e) => handlerCompanyValue(e, "companyMobile")}
                disabled={isInitLoading}
              />
            )}
          </div>
        </div>
      </>

      <div className="mt-3">
        <Button onClick={submitHandler} block={1}>
          <span className="inline-block ml-2"> Submit </span>
        </Button>
      </div>
    </div>
  );
}

export default QuickEditCompany;
