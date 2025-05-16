// ProductionProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProductionProtectedRoute = () => {
  const productionUser = localStorage.getItem("productionUser");
  return productionUser ? <Outlet /> : <Navigate to="/production-login" />;
};

export default ProductionProtectedRoute;
