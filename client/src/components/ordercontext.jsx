import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const OrderContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create axios instance with base configuration
  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  // Enhanced fetch function with error handling
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/orders");
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced delete function
  const deleteOrder = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/orders/${id}`);
      setOrders(prevOrders => prevOrders.filter(order => order.orderId !== id));
    } catch (err) {
      console.error("Delete order error:", err);
      setError(err.response?.data?.message || "Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced update function
  const updateOrder = async (orderId, productIndex, updatedProduct) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(
        `/orders/${orderId}/products/${productIndex}`,
        updatedProduct
      );
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === orderId
            ? {
                ...order,
                products: order.products.map((product, index) =>
                  index === productIndex ? response.data : product
                )
              }
            : order
        )
      );
    } catch (err) {
      console.error("Update product error:", err);
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced completion function
  const markAsCompleted = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(`/orders/${id}/complete`);
      setOrders(prevOrders => prevOrders.filter(order => order.orderId !== id));
      return true;
    } catch (err) {
      console.error("Complete order error:", err);
      setError(err.response?.data?.message || "Failed to complete order");
      await fetchOrders(); // Refresh orders on error
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial load and polling
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 5000);
    const handleNewOrder = (event) => {
      setOrders(prev => [event.detail, ...prev]);
    };

    window.addEventListener("new-order", handleNewOrder);

    return () => {
      clearInterval(interval);
      window.removeEventListener("new-order", handleNewOrder);
    };
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        fetchOrders,
        deleteOrder,
        updateOrder,
        markAsCompleted
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);