interface LoginProps {
  updateToken: (token: string) => void;
}

export const Login = (props: LoginProps) => {
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const submitted = (e.target as any)[0].value;
          if (submitted) {
            props.updateToken(submitted);
          }
        }}
      >
        <input name="token" />
        <button type="submit">submit</button>
      </form>
    </div>
  );
};
