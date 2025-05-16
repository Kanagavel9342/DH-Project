import React, { useState, useEffect } from "react";
import {
  FaPlusCircle,
  FaSave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaPlus,
  FaMinus
} from "react-icons/fa";
import axios from "axios";
import "./PlaceOrder.css";

const PlaceOrder = () => {
  const [orders, setOrders] = useState([]);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [order, setOrder] = useState({
    customerName: "",
    contactNumber: "",
    district: "",
    transport: "",
    products: [
      {
        micron: "",
        meter: "",
        size: "",
        color: "",
        nos: "",
        unit: "Pcs",
        quantity: 1,
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [apiError, setApiError] = useState(null);

  const districts = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri",
    "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris",
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga",
    "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
    "Viluppuram", "Virudhunagar"
  ];

  const productOptions = [
    { micron: "36", meter: "20", sizes: ['1/2"'], colors: ["Transparent"] },
    { micron: "38", meter: "25", sizes: ['3/4"'], colors: ["Brown"] },
    { micron: "40", meter: "30", sizes: ['1"'], colors: ["Spl Brown"] },
    { micron: "42", meter: "35", sizes: ['1 1/2"'], colors: ["Black"] },
    { micron: "44", meter: "40", sizes: ['2"'], colors: ["Red"] },
    { micron: "48", meter: "45", sizes: ['2 1/2"'], colors: ["Yellow"] },
    { micron: "50", meter: "50", sizes: ['3"'], colors: ["Blue"] },
    { micron: "52", meter: "55", sizes: ['3 1/2"'], colors: ["Green"] },
    { micron: "54", meter: "60", sizes: ['4"'], colors: ["Orange"] },
    { micron: "", meter: "65", sizes: ['5"'], colors: ["Milky White"] },
  ];

  const sizeOptions = [
    '1/2"', '3/4"', '1"', '1 1/2"', '2"', '2 1/2"', '3"', '3 1/2"', '4"', '5"'
  ];

  const colorOptions = [
    "Transparent", "Brown", "Spl Brown", "Black", "Red",
    "Yellow", "Blue", "Green", "Orange", "Milky White",
  ];

  const unitOptions = ["Pcs", "Roll", "Box"];

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentOrders = response.data.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate > twentyFourHoursAgo;
      });
      setOrders(recentOrders);

      if (placedOrder && !recentOrders.some(o => o.id === placedOrder.id)) {
        setPlacedOrder(null);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };


  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(fetchOrders, 10000); // Check every 10 seconds
    
    const handleOrderUpdate = () => {
      fetchOrders();
    };
    
    window.addEventListener("order-updated", handleOrderUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("order-updated", handleOrderUpdate);
    };
  }, [placedOrder]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = [...new Set(districts)]
        .filter((district) => district.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
  }, [searchTerm]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!order.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (order.customerName.trim().length < 3) {
      newErrors.customerName = "Name must be at least 3 characters";
    }
    
    if (!order.contactNumber.trim()) {
      newErrors.contactNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(order.contactNumber)) {
      newErrors.contactNumber = "Valid 10-digit phone number is required";
    }
    
    if (!order.district.trim()) {
      newErrors.district = "District is required";
    }
    
    // Validate each product
    order.products.forEach((product, index) => {
      if (!product.quantity || product.quantity <= 0) {
        newErrors[`products[${index}].quantity`] = "Valid quantity is required";
      } else if (product.quantity > 1000) {
        newErrors[`products[${index}].quantity`] = "Quantity cannot exceed 1000";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/place-order`, {
        customerName: order.customerName,
        contactNumber: order.contactNumber,
        district: order.district,
        transport: order.transport,
        products: order.products.map(p => ({
          micron: p.micron,
          meter: p.meter,
          size: p.size,
          color: p.color,
          nos: p.nos,
          unit: p.unit,
          quantity: p.quantity
        }))
      });
      
      if (response.data.success) {
        const now = new Date();
        const placedOrderData = {
          ...response.data,
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: now.toLocaleDateString()
        };

        setOrders(prev => [placedOrderData, ...prev]);
        setPlacedOrder(placedOrderData);
        setOrderPlaced(true);
        resetForm();

        window.dispatchEvent(new CustomEvent('new-order', { detail: placedOrderData }));
        setTimeout(() => setOrderPlaced(false), 5000);
      }
    } catch (error) {
      console.error("Order submission error:", error);
      setApiError(
        error.response?.data?.message || 
        error.message || 
        "Failed to place order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setOrder({
      customerName: "", 
      contactNumber: "", 
      district: "", 
      transport: "",
      products: [
        {
          micron: "",
          meter: "",
          size: "",
          color: "",
          nos: "",
          unit: "Pcs",
          quantity: 1,
        }
      ]
    });
    setSearchTerm("");
    setFilteredDistricts([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const processedValue = name.includes("quantity") || name.includes("nos") 
      ? value.replace(/\D/g, '') 
      : value;
    
    setOrder(prev => ({ 
      ...prev, 
      [name]: processedValue 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    
    const processedValue = name.includes("quantity") || name.includes("nos") 
      ? value.replace(/\D/g, '') 
      : value;
    
    setOrder(prev => {
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        [name]: processedValue
      };
      return { ...prev, products: updatedProducts };
    });
    
    // Clear error if it exists
    if (errors[`products[${index}].${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`products[${index}].${name}`];
        return newErrors;
      });
    }
  };

  const handleDistrictSelect = (district) => {
    setOrder(prev => ({ ...prev, district }));
    setSearchTerm(district);
    setFilteredDistricts([]);
    
    if (errors.district) {
      setErrors(prev => ({ ...prev, district: "" }));
    }
  };

  const addProduct = () => {
    if (order.products.length < 5) {
      setOrder(prev => ({
        ...prev,
        products: [
          ...prev.products,
          {
            micron: "",
            meter: "",
            size: "",
            color: "",
            nos: "",
            unit: "Pcs",
            quantity: 1,
          }
        ]
      }));
    }
  };

  const removeProduct = (index) => {
    if (order.products.length > 1) {
      setOrder(prev => {
        const updatedProducts = [...prev.products];
        updatedProducts.splice(index, 1);
        return { ...prev, products: updatedProducts };
      });
    }
  };

  return (
    <div className="place-order-container">
      <div className="form-card">
        <h2 className="form-title">
          <FaPlusCircle /> Place New Order
        </h2>

        {apiError && (
          <div className="alert alert-danger">
            <FaExclamationTriangle /> {apiError}
          </div>
        )}

        {orderPlaced && (
          <div className="alert alert-success fade-in">
            <FaCheckCircle /> Order placed successfully!
            <button 
              className="close-alert" 
              onClick={() => setOrderPlaced(false)}
            >
              <FaTimes />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="order-form">
          {/* Customer Info */}
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name*</label>
              <input 
                type="text" 
                name="customerName" 
                value={order.customerName} 
                onChange={handleChange}
                className={errors.customerName ? "error" : ""} 
                required 
                maxLength={50}
              />
              {errors.customerName && (
                <span className="error-message">{errors.customerName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Contact Number*</label>
              <input 
                type="tel" 
                name="contactNumber" 
                value={order.contactNumber} 
                onChange={handleChange}
                className={errors.contactNumber ? "error" : ""} 
                required 
                pattern="[0-9]{10}"
                maxLength={10}
              />
              {errors.contactNumber && (
                <span className="error-message">{errors.contactNumber}</span>
              )}
            </div>
          </div>

          {/* District + Transport */}
          <div className="form-row">
            <div className="form-group">
              <label>District*</label>
              <div className="district-search-container">
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search district..." 
                  className={errors.district ? "error" : ""} 
                  required 
                />
                {filteredDistricts.length > 0 && (
                  <ul className="district-results">
                    {filteredDistricts.map((district, index) => (
                      <li 
                        key={index} 
                        onClick={() => handleDistrictSelect(district)}
                      >
                        {district}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.district && (
                <span className="error-message">{errors.district}</span>
              )}
            </div>

            <div className="form-group">
              <label>Transport</label>
              <input 
                type="text" 
                name="transport" 
                value={order.transport} 
                onChange={handleChange}
                maxLength={50}
              />
            </div>
          </div>

          {/* Product Sections */}
          {order.products.map((product, index) => (
            <div key={index} className="product-section">
              <div className="product-header">
                <h4>Product {index + 1}</h4>
                {index > 0 && (
                  <button 
                    type="button" 
                    className="btn-remove-product"
                    onClick={() => removeProduct(index)}
                    title="Remove product"
                  >
                    <FaMinus />
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Micron</label>
                  <select 
                    name="micron" 
                    value={product.micron} 
                    onChange={(e) => handleProductChange(index, e)}
                  >
                    <option value="">Select</option>
                    {productOptions.filter(p => p.micron).map((p, i) => (
                      <option key={i} value={p.micron}>
                        {p.micron}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Meter</label>
                  <select 
                    name="meter" 
                    value={product.meter} 
                    onChange={(e) => handleProductChange(index, e)}
                  >
                    <option value="">Select</option>
                    {productOptions.filter(p => p.meter).map((p, i) => (
                      <option key={i} value={p.meter}>
                        {p.meter}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Size</label>
                  <select 
                    name="size" 
                    value={product.size} 
                    onChange={(e) => handleProductChange(index, e)}
                  >
                    <option value="">Select</option>
                    {sizeOptions.map((size, i) => (
                      <option key={i} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <select 
                    name="color" 
                    value={product.color} 
                    onChange={(e) => handleProductChange(index, e)}
                  >
                    <option value="">Select</option>
                    {colorOptions.map((color, i) => (
                      <option key={i} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nos</label>
                  <input 
                    type="text" 
                    name="nos" 
                    value={product.nos} 
                    onChange={(e) => handleProductChange(index, e)}
                    maxLength={10}
                  />
                </div>

                <div className="form-group">
                  <label>Unit</label>
                  <select 
                    name="unit" 
                    value={product.unit} 
                    onChange={(e) => handleProductChange(index, e)}
                  >
                    {unitOptions.map((unit, i) => (
                      <option key={i} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity*</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    value={product.quantity} 
                    onChange={(e) => handleProductChange(index, e)}
                    min="1" 
                    max="1000"
                    required 
                    className={errors[`products[${index}].quantity`] ? "error" : ""}
                  />
                  {errors[`products[${index}].quantity`] && (
                    <span className="error-message">
                      {errors[`products[${index}].quantity`]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Product Button */}
          {order.products.length < 5 && (
            <div className="add-product-container">
              <button 
                type="button" 
                className="btn-add-product"
                onClick={addProduct}
              >
                <FaPlus /> Add Another Product
              </button>
            </div>
          )}

          {/* Submit Button with Loading Animation */}
          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-submit"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="spin" /> Processing...
                </>
              ) : (
                <>
                  <FaSave /> Place Order
                </>
              )}
            </button>
          </div>
        </form>

        {/* Display the placed order */}
        {placedOrder && (
          <div className="placed-order-container">
            <div className="placed-order-header">
              <h3>Your Placed Order</h3>
              <button 
                className="btn-close"
                onClick={() => setPlacedOrder(null)}
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>District</th>
                    <th>Products</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{placedOrder.customerName}</td>
                    <td>{placedOrder.contactNumber}</td>
                    <td>{placedOrder.district}</td>
                    <td>
                      <ul className="product-list">
                        {placedOrder.products.map((product, index) => (
                          <li key={index}>
                            {product.size} {product.color} ({product.quantity} {product.unit})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{placedOrder.time}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent orders table (last 24 hours) */}
        {orders.length > 0 && (
          <div className="orders-table-container">
            <h3 className="table-title">
              Recent Orders (Last 24 Hours)
              <span className="order-count">{orders.length} orders</span>
            </h3>
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>District</th>
                    <th>Products</th>
                    <th>Time</th>
                  </tr>

                  
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id || index}>
                      <td>{index + 1}</td>
                      <td>{order.customerName}</td>
                      <td>{order.contactNumber}</td>
                      <td>{order.district}</td>
                      <td>
                        <ul className="product-list">
                          {order.products.map((product, pIndex) => (
                            <li key={pIndex}>
                              {product.size} {product.color} ({product.quantity} {product.unit})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;