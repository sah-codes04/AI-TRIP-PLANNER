/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

import App from "./App";
import CreateTrip from "./create-trip";
import Header from "./components/custom/Header";
import MyTrips from "./my-trips";
import ViewTrip from "./view-trip/[tripId]";
import PlaceDetail from "./place/PlaceDetail";
import Profile from "./profile";
import Settings from "./settings";
import ChartAnalysis from "./chart-analysis";
import { ThemeProvider } from "./context/ThemeContext";

// Layout Component

function Layout() {
  return (
    <>
      <Header />
      <Toaster />
      <Outlet />
    </>
  );
}

// Router Configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "create-trip", element: <CreateTrip /> },
      { path: "view-trip/:tripId", element: <ViewTrip /> },
      { path: "place/:placeId", element: <PlaceDetail /> },
      { path: "my-trips", element: <MyTrips /> },
      { path: "chart-analysis", element: <ChartAnalysis /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

// Render App
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </GoogleOAuthProvider>
);
