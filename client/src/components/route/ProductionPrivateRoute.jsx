// ProductionPrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

const ProductionPrivateRoute = () => {
  const isAuthenticated = localStorage.getItem("productionUser");

  return isAuthenticated ? <Outlet /> : <Navigate to="/production-login" />;
};

export default ProductionPrivateRoute;
