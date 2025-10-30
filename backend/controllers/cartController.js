import userModel from "../models/userModel.js";

// Add items to user cart
const addToCart = async (req, res) => {
  try {
    // 1. Find the user's data (the user ID comes from the JWT/token)
    let userData = await userModel.findById(req.body.userId);

    // 2. Extract the existing cart data from the user
    let cartData = await userData.cartData;

    // 3. Check if the item is NEW or existing
    if (!cartData[req.body.itemId]) {
      // If NEW, initialize its quantity to 1
      cartData[req.body.itemId] = 1;
    } else {
      // If EXISTING, increase its quantity by 1
      cartData[req.body.itemId] += 1;
    }

    // 4. Save the updated cartData back to the user in the database
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding to cart" });
  }
};

// Remove items from user cart
const removeFromCart = async (req, res) => {
  try {
    // 1. Find the user's data
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;

    // 2. Check if the quantity is > 0 before decreasing
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }

    // 3. Save the updated cartData back to the database
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });

    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing from cart" });
  }
};

// --------------------------------------------------
// NEW LOGIC: Get user cart data from the database
// --------------------------------------------------

const getCart = async (req, res) => {
  try {
    // 1. Find the user's data based on the ID extracted from the JWT token
    let userData = await userModel.findById(req.body.userId);

    // 2. Extract the cart data object from the user's record
    let cartData = await userData.cartData;

    // 3. Send the cart data back to the frontend
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching cart data" });
  }
};

export { addToCart, removeFromCart, getCart }; // <-- CRUCIAL: Export all three functions!
