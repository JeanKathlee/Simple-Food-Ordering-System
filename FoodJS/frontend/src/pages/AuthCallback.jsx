import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveAuthSession } from "../lib/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = params.get("code");

      if (!code) {
        alert("No authorization code received");
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("/api/auth/google/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (res.ok) {
          saveAuthSession({ token: data.token, user: data.user });
          navigate("/menu");
        } else {
          alert(data.message || "Login failed");
          navigate("/login");
        }
      } catch (err) {
        alert("Error: " + err.message);
        navigate("/login");
      }
    };

    handleCallback();
  }, [params, navigate]);

  return <p>Authenticating with Google...</p>;
}
