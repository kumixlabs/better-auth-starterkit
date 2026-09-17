import { useEffect, useRef } from "react";
import type { CaptchaRenderProps } from "@better-auth-ui/react/plugins/captcha";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export function TurnstileWidget({ setToken, clearToken, setReset }: CaptchaRenderProps) {
  const ref = useRef<TurnstileInstance>(null);

  useEffect(() => {
    setReset(() => ref.current?.reset());
    return () => setReset(null);
  }, [setReset]);

  return (
    <Turnstile
      ref={ref}
      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY as string}
      onSuccess={setToken}
      onError={clearToken}
      onExpire={clearToken}
      options={{ size: "flexible" }}
    />
  );
}
