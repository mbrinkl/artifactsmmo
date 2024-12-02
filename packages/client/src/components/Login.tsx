import { Button, Center, Container, Input, Stack } from "@mantine/core";
import { useState } from "react";

interface LoginProps {
  onLogin: (value: string) => void;
}

export const Login = (props: LoginProps) => {
  const [value, setValue] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) {
      console.log("GOT VALUE", value, "asdf");
      console.log(value);
      props.onLogin(value);
    }
  };

  return (
    <Container size="xs" h="100dvh">
      <Center h="100%">
        <form onSubmit={onSubmit}>
          <Stack>
            <Input placeholder="token" value={value} onChange={(e) => setValue(e.target.value)} />
            <Button type="submit">submit</Button>
          </Stack>
        </form>
      </Center>
    </Container>
  );
};
