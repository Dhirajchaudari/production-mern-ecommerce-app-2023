import productModel from "../models/productModel.js";
import fs from "fs";
import slugify from "slugify";
import CategoryModel from "../models/CategoryModel.js";
import braintree from "braintree";
import orderModel from "../models/orderModel.js";
import dotenv from "dotenv";

dotenv.config();

// payment getway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHAND_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

// create product controller
export const createProductController = async (req, resp) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files; // to get files we use this

    //validations
    switch (true) {
      case !name:
        return resp.status(500).send({ message: "Name is required" });
      case !description:
        return resp.status(500).send({ message: "Description is required" });
      case !price:
        return resp.status(500).send({ message: "Price is required" });
      case !category:
        return resp.status(500).send({ message: "Category is required" });
      case !quantity:
        return resp.status(500).send({ message: "Quantity is required" });
      case photo && photo.size > 1000000:
        return resp
          .status(500)
          .send({ message: "Photo is required and should be less than 1mb" });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    resp.status(201).send({
      success: true,
      message: "Product Created Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error in creating product",
    });
  }
};

// get all products
export const getProductController = async (req, resp) => {
  try {
    const products = await productModel
      .find({})
      .select("-photo")
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });
    resp.status(200).send({
      success: true,
      countTotal: products.length,
      message: "AllProducts",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

// get single product

export const singleProductController = async (req, resp) => {
  try {
    // we are not requstring for photo for now
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    resp.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting single product",
      error: error.message,
    });
  }
};

// get photo
export const productPhotoController = async (req, resp) => {
  try {
    // select => select which data you want to get and if we dont want any specific data use -before that product name(
    const product = await productModel
      .findById(req?.params?.pid)
      .select("photo");
    if (product?.photo?.data) {
      resp.set("Content-type", product.photo.contentType);
      return resp.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while getting the photo",
      error,
    });
  }
};

// delete product
export const deleteProductController = async (req, resp) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    resp.status(200).send({
      success: true,
      message: "Product Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      succsss: false,
      message: "Error while deleting the product",
      error,
    });
  }
};

// update prouduct
export const updateProductController = async (req, resp) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files; // to get files we use this
    console.log("1");
    //validations
    switch (true) {
      case !name:
        return resp.status(500).send({ message: "Name is required" });
      case !description:
        return resp.status(500).send({ message: "Description is required" });
      case !price:
        return resp.status(500).send({ message: "Price is required" });
      case !category:
        return resp.status(500).send({ message: "Category is required" });
      case !quantity:
        return resp.status(500).send({ message: "Quantity is required" });
      case photo && photo.size > 1000000:
        return resp
          .status(500)
          .send({ message: "Photo is required and should be less than 1mb" });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    console.log("3");
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    console.log("4");
    await products.save();
    resp.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error in updating product",
    });
  }
};

// get filter product
export const productFilterController = async (req, resp) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    // checked is an array and to check it is true or not we are checking it via length of the it array
    if (checked.length > 0) args.category = checked;
    // mongoose property to check value is greater than and less tha $gte and $lte
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    resp.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in filtering products",
      error,
    });
  }
};

// get product count
export const productCountController = async (req, resp) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    resp.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error while counting the product",
      error,
    });
  }
};

// prodcut list base on page
export const productListController = async (req, resp) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    resp.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

// search product
export const searchProductController = async (req, resp) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo ");

    resp.json(result);
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in Search Product API",
      error,
    });
  }
};

// get similar product
export const relatedProductController = async (req, resp) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");

    resp.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in Related Product",
      error,
    });
  }
};

// get product by  category
export const productCategoryController = async (req, resp) => {
  try {
    const category = await CategoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    resp.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error in Getting Product",
      error,
    });
  }
};

// payment gatway Api
export const braintreeTokenController = async (req, resp) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        resp.status(500).send(err);
      } else {
        resp.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// payment
export const braintreePaymentController = async (req, resp) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          resp.json({ ok: true });
        } else {
          console.log(error);
          resp.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
