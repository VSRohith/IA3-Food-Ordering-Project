import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

// 1. Create the Context (the container for global data/functions)
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  // State variables
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  // Your local backend URL (from your .env setup)
  const url = "https://ia3-food-ordering-project.onrender.com";

  // Function to fetch the entire menu list from the backend
  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      setFoodList(response.data.data);
    } else {
      alert("Error! Products are not fetching.");
    }
  };

  // Corrected function to ADD item to the cart (Updates local state and API)
  const addToCart = async (itemId) => {
    // 1. Update local state immediately (for fast user feedback)
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    // 2. Send the update request to the backend API (REQUIRES token/login)
    if (localStorage.getItem("token")) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token: localStorage.getItem("token") } }
      );
    }
  };

  // Corrected function to REMOVE item from the cart (Updates local state and API)
  const removeFromCart = async (itemId) => {
    // 1. Update local state immediately
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) - 1,
    }));

    // 2. Send the update request to the backend API
    if (localStorage.getItem("token")) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token: localStorage.getItem("token") } }
      );
    }
  };

  // Function to retrieve the user's cart data from the database upon login/load
  const loadCardData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  // Calculates the total cost of items currently in the cart
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        // Safety check in case the item is not found in the list
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // useEffect hook runs once on component load to fetch food list and user token/cart
  useEffect(() => {
    async function loadData() {
      await fetchFoodList(); // Fetch all menu items
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCardData(localStorage.getItem("token")); // Load user's cart
      }
    }
    loadData();
  }, []); // Empty dependency array ensures it runs only once

  // The object containing all data and functions the rest of the app can access
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart, // <-- NEWLY added working function
    removeFromCart, // <-- NEWLY added working function
    getTotalCartAmount,
    url,
    token,
    setToken,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
