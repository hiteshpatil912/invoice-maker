import { createSlice } from "@reduxjs/toolkit";
import localforage from "localforage";
import { nanoid } from "nanoid";
import { CATEGORYS_KEY, CATEGORY_FORM_KEY } from "../constants/localKeys";

const initialState = {
  openCategorySelector: false,
  selectedCategory: null,
  data: [],
  newForm: {
    id: nanoid(),
    clientCategory: false, // Add Categorycategory field to the form
    productCategory: false,
    amount: "",
  },
  editedID: null,
  deletedID: null,
};

export const CategorysSlice = createSlice({
  name: "Categorys",
  initialState,
  reducers: {
    addNewCategory: (state, action) => {
      const newDatas = [...state.data, action.payload];
      state.data = newDatas;
      localforage.setItem(CATEGORYS_KEY, newDatas);

      const reNewForm = {
        id: nanoid(),
        clientCategory: "", // Update to clientCategory
        productCategory: "", // Update to productCategory
        amount: "",
      };

      state.newForm = {
        ...reNewForm
      };
      localforage.setItem(CATEGORY_FORM_KEY, reNewForm);
    },

    updateNewCategoryForm: (state, action) => {
      state.newForm = {
        ...action.payload
      };
      localforage.setItem(CATEGORY_FORM_KEY, {
        ...state.newForm
      });
    },

    updateNewCategoryFormField: (state, action) => {
      state.newForm[action.payload.key] = action.payload.value;
      localforage.setItem(CATEGORY_FORM_KEY, {
        ...state.newForm
      });
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

    onConfirmDeletedCategory: (state, action) => {
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
        state.data[isFindIndex] = {
          ...action.payload
        };
      }
      state.editedID = null;
      localforage.setItem(CATEGORYS_KEY, [...state.data]);
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

export const getAllCategorysSelector = (state) => state.Categorys.data;

export const getCategoryNewForm = (state) => state.Categorys.newForm;

export const getDeletedCategoryForm = (state) => state.Categorys.deletedID;

export const getEditedIdForm = (state) => state.Categorys.editedID;

export const getIsOpenCategorySelector = (state) =>
  state.Categorys.openCategorySelector;

export const getSelectedCategory = (state) => state.Categorys.selectedCategory;

export default CategorysSlice.reducer;
