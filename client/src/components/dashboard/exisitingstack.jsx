import React, { useState, useEffect } from "react";
import { FaPlus, FaFileExport, FaBoxOpen, FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import "./stacks.css";

const Exisitingstack = () => {
  const [stacks, setStacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStacks();
  }, []);

  const fetchStacks = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/stacks`);
      setStacks(response.data);
    } catch (error) {
      console.error("Error fetching stacks:", error);
    }
  };

  const getColorHex = (colorName) => {
    const colors = {
      "Transparent": "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
      "Brown": "#A52A2A",
      "Spl Brown": "#8B4513",
      "Black": "#000000",
      "Red": "#FF0000",
      "Yellow": "#FFFF00",
      "Blue": "#0000FF",
      "Green": "#008000",
      "Orange": "#FFA500",
      "Milky White": "#F5F5F5"
    };
    return colors[colorName] || "";
  };

  const filteredStacks = stacks.filter(stack => 
    stack.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stack.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stack.micron.toString().includes(searchTerm) ||
    stack.meter.toString().includes(searchTerm)
  );

  return (
    <div className="main-content">
      <div className="content-header">
        <h1>
          <FaBoxOpen /> Stacks Details
        </h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search stacks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="action-buttons">
            <button className="btn btn-success">
              <FaFileExport /> Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Micron</th>
              <th>Meter</th>
              <th>Size</th>
              <th>Color</th>
              <th>Stock</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredStacks.length > 0 ? (
              filteredStacks.map((stack) => (
                <tr key={stack.id}>
                  <td>{stack.micron}</td>
                  <td>{stack.meter}</td>
                  <td>{stack.size}</td>
                  <td>
                    <span
                      className="color-swatch"
                      style={{
                        backgroundColor: getColorHex(stack.color),
                        backgroundImage:
                          stack.color === "Transparent"
                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                            : "none",
                        backgroundSize:
                          stack.color === "Transparent" ? "20px 20px" : "auto",
                        backgroundPosition:
                          stack.color === "Transparent"
                            ? "0 0, 10px 10px"
                            : "auto",
                      }}
                      title={stack.color}
                    />
                    {stack.color}
                  </td>
                  <td className={stack.stock < 5 ? "low-stock" : "stock"}>
                    {stack.stock}
                  </td>
                  <td>{new Date(stack.last_updated).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No stacks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Exisitingstack;