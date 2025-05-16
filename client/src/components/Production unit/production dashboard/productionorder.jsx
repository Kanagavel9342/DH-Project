import React, { useEffect } from "react";
import { useOrders } from "../../ordercontext";
import { FaCheckCircle, FaSync } from "react-icons/fa";
import "./productionorder.css";

const ProductionOrder = () => {
  const { orders, loading, error, fetchOrders, markAsCompleted, setOrders } =
    useOrders();

  // Handle complete order functionality
  const handleComplete = async (orderId) => {
    const success = await markAsCompleted(orderId);
    if (success) {
      console.log("Order marked as completed");

      // Remove the completed order from the local frontend state
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );
    } else {
      console.error("Failed to complete order");
    }
  };

  // Refresh orders on initial load
  useEffect(() => {
    fetchOrders(); // initial fetch

    const interval = setInterval(() => {
      fetchOrders(); // fetch every 10 seconds
    }, 10000); // 10000 ms = 10 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [fetchOrders]);

  return (
    <div className="production-order-container">
      <div className="card white-blue-theme">
        <div className="card-header">
          <h3>
            <FaCheckCircle /> Production Orders
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

        {error && <div className="alert alert-error">{error}</div>}

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
                  <td colSpan="13">Loading production orders...</td>
                </tr>
              ) : orders.filter((o) => o.status !== "completed").length ===
                0 ? (
                <tr>
                  <td colSpan="13">No production orders found</td>
                </tr>
              ) : (
                orders
                  .filter((order) => order.status !== "completed")
                  .map((order, index) => (
                    <React.Fragment key={order.id}>
                      {order.products.map((product, pIndex) => (
                        <tr key={`${order.id}-${pIndex}`}>
                          <td>{index + 1}</td>
                          <td>{order.customerName}</td>
                          <td>{order.contactNumber}</td>
                          <td>{order.district}</td>
                          <td>{product.micron || "-"}</td>
                          <td>{product.meter || "-"}</td>
                          <td>{product.size || "-"}</td>
                          <td>{product.color || "-"}</td>
                          <td>{product.nos || "-"}</td>
                          <td>{product.quantity || "-"}</td>
                          <td>{product.unit || "-"}</td>
                          <td>
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td>
                            <button
                              onClick={() => handleComplete(order.id)}
                              className="btn-complete"
                            >
                              Complete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="card-footer">
            <span className="order-count">
              {orders
                .filter((o) => o.status !== "completed")
                .reduce(
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

export default ProductionOrder;
