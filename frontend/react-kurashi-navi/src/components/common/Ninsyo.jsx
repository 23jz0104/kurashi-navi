import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Ninsyo({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true); 

  useEffect(() => {
    const token = sessionStorage.getItem("isLoggedIn");
    if (token !== "true") {
      navigate("/log");
    } else {
      setChecking(false);
    }
  }, [navigate]);

  if (checking) {
    // チェックが終わるまで真っ白
    return <div style={{ textAlign: "center", marginTop: "2rem" }}>認証確認中...</div>;
  }

  return <>{children}</>;
}

export default Ninsyo;
