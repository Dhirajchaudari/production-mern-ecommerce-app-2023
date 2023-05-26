import express from "express";
import { isAdmin, requireSignIn } from "./../middlewares/authMiddleWare.js";
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  productCategoryController,
  productCountController,
  productFilterController,
  productListController,
  productPhotoController,
  relatedProductController,
  searchProductController,
  singleProductController,
  updateProductController,
} from "../controllers/productControllers.js";
import formidable from "express-formidable";

const router = express.Router();

// routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

// update product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

// get all Products without photo
router.get("/get-product", getProductController);

// get single Product without photo
router.get("/get-product/:slug", singleProductController);

// get photo
router.get("/product-photo/:pid", productPhotoController);

// delete product
router.delete("/delete-product/:pid", deleteProductController);

// post filter Product
router.post("/product-filters", productFilterController)

// product count
router.get("/product-count", productCountController);

// product per page
router.get("/product-list/:page", productListController);

// search product
router.get("/search/:keyword", searchProductController);

// similar products
router.get("/related-product/:pid/:cid", relatedProductController);

// category wise product
router.get("/product-category/:slug", productCategoryController);

// payment routes
// token 
router.get("/braintree/token", braintreeTokenController);

// payment
router.post("/braintree/payment", requireSignIn, braintreePaymentController)

export default router;
