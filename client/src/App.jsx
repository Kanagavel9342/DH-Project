import './App.css'

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { OrdersProvider } from "./components/ordercontext";

// Login
import Login from "./components/loginform/loginform";
import Productionlogin from "./components/Production unit/productionlogin";

// Admin dashboard
import Dashboard from "./components/dashboard/dashboard";
import Stacks from "./components/dashboard/stacks";
import PlaceOrder from "./components/dashboard/placeoreder";
import Order from "./components/dashboard/order";
import Exisitingstack from "./components/dashboard/exisitingstack";

//produuction
import Productiondashboard from "./components/Production unit/production dashboard/productiondashboard";
import Productionstacks from "./components/Production unit/production dashboard/Productionstacks";
import Productionorder from "./components/Production unit/production dashboard/productionorder";

// Protected wrapper
import ProtectedRoute from "./components/route/ProtectedRoute";
import ProductionProtectedRoute from "./components/route/ProductionProtectedRoute";

function App() {
  return (
    <OrdersProvider>
      <Router>
        <Routes>
          {/* Public Routes  */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/production-login" element={<Productionlogin />} />

          {/* Protected Routes Wrapper */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            {/* Dashboard is the layout component */}
            <Route index element={<Dashboard />} />
            <Route path="stacks" element={<Stacks />} />
            <Route path="placeorder" element={<PlaceOrder />} />
            <Route path="order" element={<Order />} />
            <Route path="exisitingstack" element={<Exisitingstack />} />
            {/* <Route path="report" element={<Report />} /> */}
          </Route>

          <Route element={<ProductionProtectedRoute />}>
            <Route
              path="/production-dashboard" element={<Productiondashboard />}  />
            <Route path="/productionstacks" element={<Productionstacks />} />
            <Route path="/productionorder" element={<Productionorder />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </OrdersProvider>
  );
}

export default App;
