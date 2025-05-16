require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL database");
});

// Get API base URL from environment variable
const API_BASE_URL = process.env.API_BASE_URL || '';

// Reusable DB query handler
const handleQuery = (res, query, params, callback) => {
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? err.message : null,
      });
    }
    callback(results);
  });
};

// ---------- Login Routes (Without Bcrypt) ----------
app.post(`${API_BASE_URL}/login`, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Username and password are required" 
    });
  }

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  handleQuery(res, query, [username, password], (results) => {
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials" 
      });
    }
    const user = results[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
      },
    });
  });
});

// ---------- Production Login (Without Bcrypt) ----------
app.post(`${API_BASE_URL}/production-login`, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Username and password are required" 
    });
  }

  const query = "SELECT * FROM production_users WHERE username = ? AND password = ?";
  handleQuery(res, query, [username, password], (results) => {
    if (results.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid production credentials" 
      });
    }
    const user = results[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  });
});

// ---------- Stack CRUD Routes ----------
app.post(`${API_BASE_URL}/stacks`, (req, res) => {
  const { micron, meter, size, color, stock } = req.body;
  const query = "INSERT INTO stacks (micron, meter, size, color, stock) VALUES (?, ?, ?, ?, ?)";
  handleQuery(res, query, [micron, meter, size, color, stock], (result) => {
    res.status(201).json({ 
      success: true,
      message: "Stack created", 
      id: result.insertId 
    });
  });
});

app.get(`${API_BASE_URL}/stacks`, (req, res) => {
  handleQuery(res, "SELECT * FROM stacks", [], (results) => res.json(results));
});

app.put(`${API_BASE_URL}/stacks/:id`, (req, res) => {
  const { id } = req.params;
  const { micron, meter, size, color, stock } = req.body;
  const query = "UPDATE stacks SET micron=?, meter=?, size=?, color=?, stock=? WHERE id=?";
  handleQuery(res, query, [micron, meter, size, color, stock, id], () =>
    res.json({ 
      success: true,
      message: "Stack updated", 
      id 
    })
  );
});

app.delete(`${API_BASE_URL}/stacks/:id`, (req, res) => {
  handleQuery(res, "DELETE FROM stacks WHERE id = ?", [req.params.id], () =>
    res.json({ 
      success: true,
      message: "Stack deleted", 
      id: req.params.id 
    })
  );
});

// ---------- Order Management ----------
app.post(`${API_BASE_URL}/place-order`, (req, res) => {
  const { customerName, contactNumber, district, transport, products } = req.body;

  if (!customerName || !contactNumber || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      message: "Customer name, contact number, and at least one product are required",
    });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Transaction error:", err);
      return res.status(500).json({ 
        success: false,
        error: "Failed to start transaction" 
      });
    }

    const orderQuery = `INSERT INTO orders (customerName, contactNumber, district, transport) VALUES (?, ?, ?, ?)`;
    db.query(orderQuery, [customerName, contactNumber, district, transport], (err, orderResult) => {
      if (err) {
        return db.rollback(() => {
          console.error("❌ Order creation error:", err);
          res.status(500).json({ 
            success: false,
            error: "Failed to create order" 
          });
        });
      }

      const orderId = orderResult.insertId;
      const productInserts = products.map((product) => [
        orderId,
        product.micron,
        product.meter,
        product.size,
        product.color,
        product.nos || "",
        product.unit || "Pcs",
        product.quantity,
      ]);

      const productQuery = `INSERT INTO order_products (order_id, micron, meter, size, color, nos, unit, quantity) VALUES ?`;
      db.query(productQuery, [productInserts], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Product insertion error:", err);
            res.status(500).json({ 
              success: false,
              error: "Failed to add products" 
            });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Commit error:", err);
              res.status(500).json({ 
                success: false,
                error: "Failed to commit transaction" 
              });
            });
          }

          res.status(201).json({
            success: true,
            orderId,
            message: "Order placed successfully",
          });
        });
      });
    });
  });
});

// ---------- Get All Orders ----------
app.get(`${API_BASE_URL}/orders`, (req, res) => {
  const query = `
    SELECT o.id AS orderId, o.customerName, o.contactNumber, o.district, o.transport, o.created_at,
           o.status,
           op.id AS productId, op.micron, op.meter, op.size, op.color, op.nos, op.unit, op.quantity
    FROM orders o
    LEFT JOIN order_products op ON o.id = op.order_id
    ORDER BY o.created_at DESC
  `;

  handleQuery(res, query, [], (results) => {
    const ordersMap = {};

    results.forEach((row) => {
      if (!ordersMap[row.orderId]) {
        ordersMap[row.orderId] = {
          orderId: row.orderId,
          customerName: row.customerName,
          contactNumber: row.contactNumber,
          district: row.district,
          transport: row.transport,
          created_at: row.created_at,
          status: row.status,
          products: [],
        };
      }

      if (row.productId) {
        ordersMap[row.orderId].products.push({
          productId: row.productId,
          micron: row.micron,
          meter: row.meter,
          size: row.size,
          color: row.color,
          nos: row.nos,
          unit: row.unit,
          quantity: row.quantity,
        });
      }
    });

    const orders = Object.values(ordersMap);
    res.json({ 
      success: true,
      orders 
    });
  });
});

// ---------- Update Order Status ----------
app.patch(`${API_BASE_URL}/orders/:id`, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ 
      success: false,
      error: "Status is required" 
    });
  }

  const query = "UPDATE orders SET status = ? WHERE id = ?";
  handleQuery(res, query, [status, id], (result) => {
    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false,
        error: "Order not found" 
      });
    } else {
      res.json({ 
        success: true,
        message: "Order status updated successfully" 
      });
    }
  });
});

// ---------- Delete Order ----------
app.delete(`${API_BASE_URL}/orders/:orderId`, (req, res) => {
  const { orderId } = req.params;

  db.beginTransaction((err) => {
    if (err) {
      console.error("❌ Transaction error:", err);
      return res.status(500).json({ 
        success: false,
        error: "Failed to start transaction" 
      });
    }

    const deleteProductsQuery = "DELETE FROM order_products WHERE order_id = ?";
    db.query(deleteProductsQuery, [orderId], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error("❌ Product deletion error:", err);
          res.status(500).json({ 
            success: false,
            error: "Failed to delete order products" 
          });
        });
      }

      const deleteOrderQuery = "DELETE FROM orders WHERE id = ?";
      db.query(deleteOrderQuery, [orderId], (err) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Order deletion error:", err);
            res.status(500).json({ 
              success: false,
              error: "Failed to delete order" 
            });
          });
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("❌ Commit error:", err);
              res.status(500).json({ 
                success: false,
                error: "Failed to commit transaction" 
              });
            });
          }

          res.json({ 
            success: true,
            message: "Order deleted successfully" 
          });
        });
      });
    });
  });
});

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `Route ${req.method} ${req.path} does not exist`,
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: "An unexpected error occurred",
    details: process.env.NODE_ENV === "development" ? err.message : null,
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});