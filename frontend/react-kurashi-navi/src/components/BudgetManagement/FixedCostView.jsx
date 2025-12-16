import { useNavigate } from "react-router-dom";
import styles from "./FixedCostView.module.css";
import { Home, Plus } from "lucide-react";
import { useFixedCostApi } from "../../hooks/fixedCost/useFixedCostApi";
import LoadingSpinner from "../common/LoadingSpinner";
import { useEffect } from "react";

const FixedCostView = () => {
  const navigate = useNavigate();
  const { fixedCost, isGetLoading, getFixedCost } = useFixedCostApi();

  useEffect(() => {
    getFixedCost();
  }, []);

  return (
    <>
      {isGetLoading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles["main-container"]}>
          <button
            className={styles[""]}
            onClick={() => navigate("/budget-management/fixed-cost-create")}
          >
            <span className={styles[""]}>
              <Plus size={16} />
            </span>
            <span className={styles[""]}>固定費を追加</span>
          </button>

          {fixedCost.length > 0 && (
            <div>
              {fixedCost.map((item) => (
                <button key={item.id}>
                  <div>
                    <Home size={16} />
                  </div>
                  <div>
                    <span>{item.category_name}</span>
                    <span>{item.cost}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FixedCostView;