import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { routes } from "./routes/routes";
import { AuthProvider } from "./contexts/AuthContext";
import theme from "./theme/theme";

export default function App() {
  const router = createBrowserRouter(routes);

  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <AuthProvider onLoginSuccess={() => {}} onLogout={() => {}}>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  );
}
