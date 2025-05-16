import React, { useState } from "react";
import {
  FaPlusCircle,
  FaSync,
  FaInfoCircle,
  FaSpinner,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import "./OrderEntery.css";
import { useOrders } from "../ordercontext";

const OrderEntry = () => {
  const { orders, loading, error, fetchOrders, deleteOrder, updateOrder } =
    useOrders();
  const [editingOrder, setEditingOrder] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [loadingSave, setLoadingSave] = useState(false);

  const safe = (value) => value || "-";
  let rowCount = 1;

  const handleEditClick = (order, product) => {
    setEditingOrder({
      orderId: order.orderId, // ✅ Use `id` for updating
      productIndex: product.productIndex,
    });
    setFormData({
      customerName: order.customerName,
      contactNumber: order.contactNumber,
      district: order.district,
      micron: product.micron,
      meter: product.meter,
      size: product.size,
      color: product.color,
      nos: product.nos,
      quantity: product.quantity,
      unit: product.unit,
    });
  };
  
  const handleDeleteClick = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(orderId); // ✅ Keep using `orderId` for deletion
      fetchOrders();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // setShowEditForm(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSave(true);

    try {
      await updateOrder(
        editingOrder.orderId,
        editingOrder.productIndex,
        formData
      );
      setShowEditForm(false);
      await fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="order-entry-container">
      {showEditForm && (
        <div className="edit-form-overlay">
          <div className="edit-form-container">
            <button
              className="close-btn"
              onClick={() => setShowEditForm(false)}
            >
              <FaTimes />
            </button>
            <h3>Edit Order</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Micron</label>
                  <input
                    type="text"
                    name="micron"
                    value={formData.micron}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Meter</label>
                  <input
                    type="text"
                    name="meter"
                    value={formData.meter}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Nos</label>
                  <input
                    type="text"
                    name="nos"
                    value={formData.nos}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="text"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <button type="submit" className="btn-save" disabled={loadingSave}>
                {loadingSave ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card white-blue-theme">
        <div className="card-header">
          <h3>
            <FaPlusCircle /> Orders Details
          </h3>
          <button
            onClick={fetchOrders}
            className="btn-refresh"
            disabled={loading}
          >
            <FaSync className={loading ? "spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <FaInfoCircle /> {error}
          </div>
        )}

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>District</th>
                <th>Micron</th>
                <th>Meter</th>
                <th>Size</th>
                <th>Color</th>
                <th>Nos</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="13" className="loading-orders">
                    <FaSpinner className="spin" /> Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="13" className="no-orders">
                    <FaInfoCircle /> No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) =>
                  order.products.map((product, pIndex) => (
                    <tr key={`${order.orderId}-${pIndex}`}>
                      <td>{rowCount++}</td>
                      <td>{safe(order.customerName)}</td>
                      <td>{safe(order.contactNumber)}</td>
                      <td>{safe(order.district)}</td>
                      <td>{safe(product.micron)}</td>
                      <td>{safe(product.meter)}</td>
                      <td>{safe(product.size)}</td>
                      <td>{safe(product.color)}</td>
                      <td>{safe(product.nos)}</td>
                      <td>{safe(product.quantity)}</td>
                      <td>{safe(product.unit)}</td>
                      <td>
                        {new Date(order.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="actions">
                        <button
                          onClick={() =>
                            handleEditClick(order, {
                              ...product,
                              productIndex: pIndex,
                            })
                          }
                          className="btn-edit"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order.orderId)}
                          className="btn-delete"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="card-footer">
            <span className="order-count">
              {orders.reduce(
                (total, order) => total + order.products.length,
                0
              )}{" "}
              products
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderEntry;
