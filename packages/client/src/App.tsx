import { useLocalStorage } from "@mantine/hooks";
import { tokenStorageKey } from "./config";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Button, Container, Flex } from "@mantine/core";

export const App = () => {
  const [token, setToken, clearToken] = useLocalStorage({
    key: tokenStorageKey,
    serialize: (v) => v,
  });

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <Container py="md">
      <Flex justify="end">
        <Button onClick={clearToken} variant="outline" color="red">
          Logout
        </Button>
      </Flex>
      <Dashboard />
    </Container>
  );
};
