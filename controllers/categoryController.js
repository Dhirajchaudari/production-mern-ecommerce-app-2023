import categoryModel from "../models/CategoryModel.js";
import slugify from "slugify";

// create category
export const createCategoryController = async (req, resp) => {
  try {
    const { name } = req.body;
    if (!name) {
      return resp.status(401).send({
        message: "Name is required",
      });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return resp.status(200).send({
        success: false,
        message: "Category Already Exits.",
      });
    }

    const category = await categoryModel({ name, slug: slugify(name) }).save(); // if ther any space it will replace it with "-" with slug
    resp.status(201).send({
      success: true,
      message: "New Category Created",
      category,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error in Category",
      error,
    });
  }
};

// update category
export const updateCategoryController = async (req, resp) => {
  try {
    const { name } = req.body;
    const { _id } = req.params; // we are getting the id from url
    const category = await categoryModel.findByIdAndUpdate(
      _id,
      { name, slug: slugify(name) },
      { new: true }
    ); // to update we have to pass 3 parameter
    resp.status(200).send({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while updating category",
      error,
    });
  }
};

// getAll category
export const categoryController = async (req, resp) => {
  try {
    const category = await categoryModel.find({});
    resp.status(200).send({
      success: true,
      message: "All Category List",
      category,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting all category",
    });
  }
};

// getSingle Category
export const singleCategoryController = async (req, resp) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    resp.status(200).send({
      success: true,
      message: "Got the Single Category",
      category,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting single Category",
    });
  }
};

// delete category
export const deleteCategoryController = async (req, resp) => {
  try {
    const {_id} = req.params
    await categoryModel.findByIdAndDelete(_id);
    resp.status(200).send({
        success: true,
        message: "Category Deleted Successfully",
      });


  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while deling Category",
    });
  }
};
    