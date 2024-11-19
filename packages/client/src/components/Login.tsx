import { Button, Input } from "@mantine/core";
import { useState } from "react";

interface LoginProps {
  updateToken: (value: string) => void;
}

export const Login = (props: LoginProps) => {
  const [value, setValue] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value) {
      props.updateToken(value);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button type="submit">submit</Button>
    </form>
  );
};
