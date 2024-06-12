import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useSelector } from "react-redux";
import HomeIcon from "../Icons/HomeIcon";
import ProductIcon from "../Icons/ProductIcon";
import InvoiceIcon from "../Icons/InvoiceIcon";
import ClientPlusIcon from "../Icons/ClientPlusIcon";
import SalesOrderIcon from "../Icons/SalesOrderIcon";
import CreditIcon from "../Icons/CreditIcon";
import ReturnIcon from "../Icons/ReturnIcon";
import DeleteIcon from "../Icons/DeleteIcon";
import SecurityIcon from "../Icons/SecurityIcon";
import InvoiceNavbarLoading from "../Loading/InvoiceNavbarLoading";
import { getCompanyData } from "../../store/companySlice";

import Skeleton from "react-loading-skeleton";
import axios from "axios";

const NAV_DATA = [
  {
    title: "Dashboard",
    link: "/",
    Icon: HomeIcon,
  },
  {
    title: "Invoices",
    link: "invoices",
    Icon: InvoiceIcon,
  },
  {
    title: "Clients",
    link: "clients",
    Icon: ClientPlusIcon,
  },
  {
    title: "Products",
    link: "products",
    Icon: ProductIcon,
  },
  {
    title: "Discount",
    link: "discount",
    Icon: ProductIcon,
  },
  {
    title: "CashInvoice",
    link: "cashInvoice",
    Icon: ProductIcon,
  },
  {
    title: "SalesOrder",
    link: "salesorderInvoice",
    Icon: SalesOrderIcon,
  },
  {
    title: "CreditInvoice",
    link: "creditInvoice",
    Icon: CreditIcon,
  },
  {
    title: "SalesReturn",
    link: "returnInvoice",
    Icon: ReturnIcon,
  },

];

const navDefaultClasses =
  "fixed inset-0 duration-200 transform lg:opacity-100 z-10 w-72 bg-white h-screen p-3";

const navItemDefaultClasses = "block px-4 py-2 rounded-md flex flex-1";

function Sidebar() {
  const { showNavbar, initLoading, toggleNavbar } = useAppContext();
  const { pathname } = useLocation();
  const company = useSelector(getCompanyData);
  const [error, setError] = useState("");
  const apiDomain = process.env.REACT_APP_API_DOMAIN || "";
  const navigate = useNavigate();

  const myHeaders = useMemo(() => {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    return headers;
  }, []);

  const onClickNavbar = useCallback(() => {
    const width = window.innerWidth;

    if (width <= 767 && showNavbar) {
      toggleNavbar();
    }
  }, [showNavbar, toggleNavbar]);

  const aboutRoute = useMemo(() => pathname === "/about", [pathname]);

  const handleLogout = async () => {
    setError("");
    const authData = JSON.parse(localStorage.getItem("auth"));
    const userId = authData?.userId;

    try {
      const formData = new FormData();
      formData.append("user_id", userId);

      const myHeaders = new Headers();

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formData,
        redirect: "follow",
      };

      const response = await fetch(`${apiDomain}/logout`, requestOptions);

      if (response.ok) {
        localStorage.removeItem("auth");
        navigate("/login");
        window.location.reload();
      } else {
        setError(response.data.message || "Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      <nav
        className={
          showNavbar
            ? navDefaultClasses + " translate-x-0 ease-in"
            : navDefaultClasses + " -translate-x-full ease-out"
        }
      >
        <div className="flex justify-between">
          <motion.span
            className="font-bold font-title text-2xl sm:text-2xl p-2 flex justify-center items-center"
            initial={{
              translateX: -300,
            }}
            animate={{
              translateX: showNavbar ? -40 : -300,
              color: "#0066FF",
            }}
            transition={{
              type: "spring",
              damping: 18,
            }}
          >
            <span className="nav-loading">
              <InvoiceNavbarLoading loop />
            </span>
            Invoice Logo
          </motion.span>
        </div>

        {initLoading && <Skeleton className="px-4 py-5 rounded-md" />}
        {!!company?.image && !initLoading && (
          <motion.span
            className={
              navItemDefaultClasses + " bg-gray-50 flex items-center px-3"
            }
          >
            <button
              onClick={handleLogout} // Define this function to handle the logout logic
              className="mr-2 px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
            <img
              className={"object-cover h-10 w-10 rounded-lg"}
              src={company?.image}
              alt="upload_image"
            />
            <span className="flex-1 pl-2 font-title rounded-r py-1 border-r-4 border-indigo-400 flex items-center inline-block whitespace-nowrap text-ellipsis overflow-hidden ">
              {company.companyName}
            </span>
          </motion.span>
        )}
        <ul className="mt-4">
          {NAV_DATA.map(({ title, link, Icon }) => (
            <li key={title} className="mb-2">
              <NavLink
                to={link}
                className={" rounded-md side-link"}
                onClick={onClickNavbar}
              >
                {({ isActive }) => (
                  <motion.span
                    key={`${title}_nav_item`}
                    className={
                      isActive
                        ? navItemDefaultClasses + " primary-self-text "
                        : navItemDefaultClasses + " text-default-color "
                    }
                    whileHover={{
                      color: "rgb(0, 102, 255)",
                      backgroundColor: "rgba(0, 102, 255, 0.1)",
                      translateX: isActive ? 0 : 4,
                      transition: {
                        backgroundColor: {
                          type: "spring",
                          damping: 18,
                        },
                      },
                    }}
                    whileTap={{ scale: isActive ? 1 : 0.9 }}
                  >
                    <Icon className="h-6 w-6 mr-4" />
                    {title}
                  </motion.span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <hr />

        <div className="my-4">
          <NavLink to={"about"}>
            <motion.span
              className="block px-4 py-2 rounded-md flex text-default-color"
              style={{
                color: aboutRoute ? "rgb(14 136 14)" : "#777",
              }}
              whileHover={{
                scale: [1.03, 1, 1.03, 1, 1.03, 1, 1.03, 1],
                color: "rgb(14 136 14)",
                textShadow: "0px 0px 3px #85FF66",
                transition: {
                  backgroundColor: {
                    type: "spring",
                    damping: 18,
                  },
                },
              }}
              whileTap={{ scale: 0.9 }}
            >
              <SecurityIcon className="h-6 w-6 mr-4" />
              About Me
            </motion.span>
          </NavLink>
        </div>

        <hr />

        {/* <div className="mt-4">
          <motion.a
            href={"#!"}
            className="block px-4 py-2 rounded-md flex"
            initial={{
              color: "#EC7474",
              backgroundColor: "#FFEEEE",
            }}
            whileHover={{
              translateX: 6,
              color: "#777",
              backgroundColor: "#dfdfdf",
              transition: {
                backgroundColor: {
                  type: "spring",
                  damping: 18,
                },
              },
            }}
            whileTap={{ scale: 0.9 }}
          >
            <DeleteIcon className="h-6 w-6 mr-4" />
            Clear Data
          </motion.a>
        </div> */}
      </nav>
    </>
  );
}

export default Sidebar;
