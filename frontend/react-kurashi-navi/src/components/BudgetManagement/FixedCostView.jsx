import { useNavigate } from "react-router-dom";
import styles from "./FixedCostView.module.css";
import { ChevronRight, Home, Plus } from "lucide-react";
import { useFixedCostApi } from "../../hooks/fixedCost/useFixedCostApi";
import LoadingSpinner from "../common/LoadingSpinner";
import { useEffect } from "react";

const FixedCostView = () => {
  const navigate = useNavigate();
  const { fixedCost, isGetLoading, getFixedCost } = useFixedCostApi();

  useEffect(() => {
    getFixedCost();
  }, []);

  const showFixedCostInfo = (item) => {
    navigate("/budget-management/fixed-cost-edit", { state: { fixedCostData: item } });
  };

  return (
    <>
      {isGetLoading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles["main-container"]}>
          <button
            className={styles["add-fixed-cost-button"]}
            onClick={() => navigate("/budget-management/fixed-cost-create")}
          >
            <span className={styles["add-icon"]}>
              <Plus size={16} />
            </span>
            <span className={styles["add-title"]}>固定費を追加</span>
          </button>

          {fixedCost.length > 0 && (
            <div className={styles["fixed-cost-list"]}>
              {fixedCost.map((item) => (
                <button key={item.id}
                  className={styles["fixed-cost-item"]}
                  onClick={() => showFixedCostInfo({ ...item })}
                >
                  <div className={styles["fixed-cost-header"]}>
                    <div className={styles["category-icon"]}>
                      <Home size={16}/>
                    </div>
                    <span className={styles["category-name"]}>{item.category_name}</span>
                    <span className={styles["cost-price"]}>¥ {Number(item.cost).toLocaleString()} / 月 <ChevronRight size={15}/></span>
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