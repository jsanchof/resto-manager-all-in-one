// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { RegisterPage } from "./pages/RegisterPage";
import { Contact } from "./pages/Contact";
import { LoginPage } from "./pages/LoginPage";
import { AboutUs } from "./pages/AboutUs";
import { Menu } from "./pages/Menu";
import { Reservations } from "./pages/Reservations";
import { EditProfile } from "./pages/EditProfile";
// Componente rutas protegidas
import ProtectedRoute from "./components/ProtectedRoute";
// Componentes Cliente
import LayoutClient from "./layouts/LayoutClient";
import CreateOrder from "./pages/user/CreateOrder";
import MyOrders from "./pages/user/MyOrders";
import { VerifyEmail } from "./pages/user/VerifyEmail";
// Componentes Cocina
import KitchenView from "./pages/kitchen/KitchenView";
import LayoutKitchen from "./layouts/LayoutKitchen";
// Componentes Admin
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminIngredients from "./pages/admin/Ingredients";
import LayoutAdmin from "./layouts/LayoutAdmin";
import AdminReservations from "./pages/admin/AdminReservations";
// Componentes Mesero
import Layout from "./pages/waitress/Layout";
import Orders from "./pages/waitress/Orders";
import Tables from "./pages/waitress/Tables";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.
    // Create your routes here, if you want to keep the Navbar and Footer in all views, add your new routes inside the containing Route.
    // Root, on the contrary, create a sister Route, if you have doubts, try it!
    // Note: keep in mind that errorElement will be the default page when you don't get a route, customize that page to make your project more attractive.
    // Note: The child paths of the Layout element replace the Outlet component with the elements contained in the "element" attribute of these child paths.
    <>
      // Root Route: All navigation will start from here.
      <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

        {/* Nested Routes: Defines sub-routes within the BaseHome component. */}
        <Route path="/" element={<Home />} />
        <Route path="/single/:theId" element={<Single />} />  {/* Dynamic route for single items */}
        <Route path="/demo" element={<Demo />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Cliente */}
      <Route
        element={
          <ProtectedRoute requiredRole="CLIENT">
            <LayoutClient />
          </ProtectedRoute>
        }
      >
        <Route path="/client/create-order" element={<CreateOrder />} />
        <Route path="/client/my-orders" element={<MyOrders />} />
      </Route>

      {/* Administrador */}
      <Route
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/ingredients" element={<AdminIngredients />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
      </Route>

      {/* Cocina */}
      <Route
        element={
          <ProtectedRoute requiredRole="KITCHEN">
            <LayoutKitchen />
          </ProtectedRoute>
        }
      >
        <Route path="/kitchen" element={<KitchenView />} />
      </Route>

      {/* Mesero */}
      <Route
        element={
          <ProtectedRoute requiredRole="WAITER">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/waitress/orders" element={<Orders />} />
        <Route path="/waitress/tables" element={<Tables />} />
      </Route>
    </>
  )
);