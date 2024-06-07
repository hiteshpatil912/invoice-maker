import { createSlice } from "@reduxjs/toolkit";
import localforage from "localforage";
import { nanoid } from "nanoid";
import { CATEGORYS_KEY, CATEGORY_FORM_KEY } from "../constants/localKeys";
// import { useEffect } from "react";

const initialState = {
  openCategorySelector: false,
  selectedCategory: null,
  data: [],
  newForm: {
    id: nanoid(),
    clientCategory: "", // Initialize as an empty string
    productCategory: "", // Initialize as an empty string
    percentage: "",
  },
  editedID: null,
  deletedID: null,
};



export const CategorysSlice = createSlice({
  name: "categorys",
  initialState,
  reducers: {
    addNewCategory: (state, action) => {
      const newDatas = [...state.data, action.payload];
      console.log({newDatas})
      state.data = newDatas;
      localforage.setItem(CATEGORYS_KEY, newDatas);

      const reNewForm = {
        id: nanoid(),
        clientCategory: "", // Update to clientCategory
        productCategory: "", // Update to productCategory
        percentage: "",
      };

      state.newForm = reNewForm;
      localforage.setItem(CATEGORY_FORM_KEY, reNewForm);
    },

    updateNewCategoryForm: (state, action) => {
      state.newForm = action.payload;
      localforage.setItem(CATEGORY_FORM_KEY, action.payload);
    },

    updateNewCategoryFormField: (state, action) => {
      const newFormCopy = { ...state.newForm }; // Clone state.newForm
      newFormCopy[action.payload.key] = action.payload.value;
      state.newForm = newFormCopy;
      localforage.setItem(CATEGORY_FORM_KEY, newFormCopy);
    },
    

    setAllCategorys: (state, action) => {
      state.data = action.payload;
    },

    setDeleteId: (state, action) => {
      state.deletedID = action.payload;
    },

    setEditedId: (state, action) => {
      state.editedID = action.payload;
    },

    onConfirmDeletedCategory: (state) => {
      const newDatas = state.data.filter(
        (category) => category.id !== state.deletedID
      );
      state.data = newDatas;
      state.deletedID = null;
      localforage.setItem(CATEGORYS_KEY, newDatas);
    },

    onConfirmEditCategory: (state, action) => {
      const isFindIndex = state.data.findIndex(
        (category) => category.id === state.editedID
      );
      if (isFindIndex !== -1) {
        state.data[isFindIndex] = action.payload;
      }
      state.editedID = null;
      localforage.setItem(CATEGORYS_KEY, state.data);
    },

    setOpenCategorySelector: (state, action) => {
      state.openCategorySelector = action.payload;
      if (!action.payload) {
        state.selectedCategory = null;
      }
    },

    setCategorySelector: (state, action) => {
      const isFindIndex = state.data.findIndex(
        (category) => category.id === action.payload
      );
      if (isFindIndex !== -1) {
        state.selectedCategory = state.data[isFindIndex];
      }
    },
    
  },
});

export const {
  addNewCategory,
  updateNewCategoryForm,
  updateNewCategoryFormField,
  setAllCategorys,
  setDeleteId,
  setEditedId,
  onConfirmDeletedCategory,
  onConfirmEditCategory,
  setOpenCategorySelector,
  setCategorySelector,
} = CategorysSlice.actions;

export const getAllCategorysSelector = (state) => state.categorys.data;

export const getCategoryNewForm = (state) => state.categorys.newForm;

export const getDeletedCategoryForm = (state) => state.categorys.deletedID;

export const getEditedIdForm = (state) => state.categorys.editedID;

export const getIsOpenCategorySelector = (state) =>
  state.categorys.openCategorySelector;

export const getSelectedCategory = (state) => state.categorys.selectedCategory;

export default CategorysSlice.reducer;
