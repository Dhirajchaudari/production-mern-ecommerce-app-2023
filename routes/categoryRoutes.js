import express from 'express';
import { isAdmin, requireSignIn } from '../middlewares/authMiddleWare.js';
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from '../controllers/categoryController.js';

const router = express.Router();

// routes
// create category || POST
router.post("/create-category", requireSignIn, isAdmin, createCategoryController)

// update category || PUT
router.put("/update-category/:_id", requireSignIn, isAdmin, updateCategoryController)

// getAll categories
router.get("/get-category", categoryController)

// getSingle category
router.get("/single-category/:slug", singleCategoryController) // slug is also unique 

// delete category by id else it will delete all
router.delete("/delete-category/:_id", requireSignIn, isAdmin, deleteCategoryController)

export default router;