import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Ninsyo({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("isLoggedIn");
    if (token !== "true") {
      navigate("/log");
    }
  }, [navigate]);

  return <>{children}</>;
}

export default Ninsyo;
