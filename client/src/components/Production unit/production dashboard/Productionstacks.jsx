import React from "react";
import axios from "axios";
import StackManager from "../../StackManager/StackManager";

const fetchData = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stacks`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch production stacks:", error);
    throw new Error("Failed to load production stacks. Please try again later.");
  }
};

const saveData = async (stackData) => {
  try {
    if (stackData.id) {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/stacks/${stackData.id}`,
        stackData
      );
      return response.data;
    } else {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/stacks`,
        stackData
      );
      return response.data;
    }
  } catch (error) {
    console.error("Failed to save production stack:", error);
    throw new Error(
      error.response?.data?.message || 
      "Failed to save production stack. Please check your data and try again."
    );
  }
};

const deleteData = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/api/stacks/${id}`);
    return true;
  } catch (error) {
    console.error("Failed to delete production stack:", error);
    throw new Error(
      error.response?.data?.message ||
      "Failed to delete production stack. Please try again."
    );
  }
};

const Productionstacks = () => (
  <StackManager
    title="Production Stacks"
    fetchData={fetchData}
    saveData={saveData}
    deleteData={deleteData}
  />
);

export default Productionstacks;