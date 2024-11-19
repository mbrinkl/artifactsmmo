import { useState } from "react";
import { tokenStorageKey } from "./config";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Button, Container } from "@mantine/core";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem(tokenStorageKey));

  const updateToken = (value: string) => {
    localStorage.setItem(tokenStorageKey, value);
    setToken(value);
  };

  const clearToken = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
  };

  if (!token) {
    return <Login updateToken={updateToken} />;
  }

  return (
    <Container>
      <Button onClick={clearToken}>Clear Token</Button>
      <Dashboard token={token} />
    </Container>
  );
};

export default App;
