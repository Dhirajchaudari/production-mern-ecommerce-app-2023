import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, resp) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    // validations
    if (!name) {
      return resp.send({ message: "Name is Required" });
    }
    if (!email) {
      return resp.send({ message: "Email is Required" });
    }
    if (!password) {
      return resp.send({ message: "Password is Required" });
    }
    if (!phone) {
      return resp.send({ message: "Phone is Required" });
    }
    if (!address) {
      return resp.send({ message: "Address is Required" });
    }
    if (!answer) {
      return resp.send({ message: "Answer is Required" });
    }

    // check user
    const existingUser = await userModel.findOne({ email });
    // exitsting user
    if (existingUser) {
      return resp.status(200).send({
        success: false,
        message: "Already Registered Please Login",
      });
    }

    // register user
    const hashedPassword = await hashPassword(password);
    // save user
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      answer,
      password: hashedPassword,
    }).save();

    resp.status(201).send({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    resp.status(200).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

export const loginController = async (req, resp) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return resp.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return resp.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return resp.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }
    // token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return resp.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error in Login",
      error,
    });
  }
};

export const forgotPasswordController = async (req, resp) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email) {
      resp.status(400).send({ message: "Email is require" });
    }
    if (!answer) {
      resp.status(400).send({ message: "answer is require" });
    }
    if (!newPassword) {
      resp.status(400).send({ message: "NewPassowrd  is require" });
    }
    // check
    const user = await userModel.findOne({ email, answer });

    if (!user) {
      return resp.status(404).send({
        success: false,
        message: "Wrong Email or Answer",
      });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
    });
    resp.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// test controller
export const testController = (req, resp) => {
  resp.send("Protected Routers");
};

// update user profile
export const updateProfileController = async (req, resp) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await userModel.findById(req.user._id);
    // password
    if (password && password.length < 6) {
      return resp.json({ error: "Password is required and 6 character long" });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        address: address || user.address,
        phone: phone || user.phone,
      },
      { new: true }
    );

    resp.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    resp.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

// orders
export const getOrdersController = async (req, resp) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    resp.json(orders);
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error While Getting the Orders",
      error,
    });
  }
};

// all orders
export const getAllOrdersController = async (req, resp) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    resp.json(orders);
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error While Getting the Orders",
      error,
    });
  }
};

// order status
export const orderStatusController = async (req, resp) =>{
  try {
    const { orderId} = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(orderId,{status},{new:true});
    resp.json(orders);
  } catch (error) {
    console.log(error);
    resp.status(500).send({
      success: false,
      message: "Error while Updating the Status",
      error
    })
  }
}