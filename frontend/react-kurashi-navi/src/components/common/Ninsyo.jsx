import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Ninsyo({ children }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      navigate("/log");
    } else {
      setChecking(false);
    }
  }, [navigate]);

  if (checking) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        認証確認中...
      </div>
    );
  }

  return <>{children}</>;
}

export default Ninsyo;
