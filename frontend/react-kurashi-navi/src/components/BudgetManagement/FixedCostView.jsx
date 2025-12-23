import { useNavigate } from "react-router-dom";
import styles from "./FixedCostView.module.css";
import { Calendar, ChevronRight, Home, Plus } from "lucide-react";
import { useFixedCostApi } from "../../hooks/fixedCost/useFixedCostApi";
import LoadingSpinner from "../common/LoadingSpinner";
import { useEffect } from "react";
import { getIcon } from "../../constants/categories";

const FixedCostView = () => {
  const navigate = useNavigate();
  const { fixedCost, isGetLoading, getFixedCost } = useFixedCostApi();

  console.log("fixedCost", JSON.stringify(fixedCost, null, 2));

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
              {fixedCost.map((item) => {
                const IconComponent = getIcon(item.icon_name);
                return (
                  <button key={item.id}
                    className={styles["fixed-cost-item"]}
                    onClick={() => showFixedCostInfo({ ...item })}
                  >
                    <div className={styles["fixed-cost-header"]}>
                      <div 
                        className={styles["category-icon"]}
                        style={{ backgroundColor: `${item.category_color}` }}
                      >
                        <IconComponent size={16}/>
                      </div>
                      <span className={styles["category-name"]}>{item.category_name}</span>
                    </div>
                    <div className={styles["fixed-cost-info"]}>
                      <span className={styles["cost-price"]}>¥ {Number(item.cost).toLocaleString()} / 月</span>
                      <div className={styles["flex"]}>
                        <span><Calendar size={16} className={styles["calendar-icon"]}/></span>
                        <span>{item.rule_name_jp}</span>
                      </div>
                    </div>
                  </button>
                )
            })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FixedCostView;