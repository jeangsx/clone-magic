import type { RouteObject } from "react-router-dom";
import RootLayout from "./__root";
import IndexPage from "./index";
import ProductPage from "./product";
import CheckoutPage from "./checkout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: "product", element: <ProductPage /> },
      { path: "checkout", element: <CheckoutPage /> },
    ],
  },
];
