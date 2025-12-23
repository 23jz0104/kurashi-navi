import { useEffect, useMemo } from "react";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";
import LoadingSpinner from "../common/LoadingSpinner";
import styles from "./BudgetView.module.css";
import { ChevronRight, Home, House, Plus } from "lucide-react";
import { useGetRecordTest } from "../../hooks/history/useGetRecordTest";
import { Navigate, useNavigate } from "react-router-dom";
import { useMonthPicker } from "../../hooks/common/useMonthPicker";
import MonthPicker from "../common/MonthPicker";
import { getIcon } from "../../constants/categories";

const BudgetView = () => {
  const navigate = useNavigate();
  const { isGetLoading, budget, getBudget } = useBudgetApi();
  const { selectedMonth, changeMonth, setMonth, getMonthString } = useMonthPicker();

  const monthString = getMonthString(selectedMonth);
  const { isLoading: isRecordLoading, record } = useGetRecordTest(monthString);

  useEffect(() => {
    getBudget();
  }, [monthString]);

  const filterBudgetByMonth = (budgetData, targetMonth) => {
    if (!budgetData || !targetMonth) return [];

    return budgetData.filter((item) => {
      const itemMonth = item.created_at.slice(0, 7);
      return itemMonth === targetMonth;
    });
  };

  const filteredBudget = useMemo(() => {
    return filterBudgetByMonth(budget, monthString);
  }, [budget, monthString]);

  const getTotalByCategory = (categoryName) => {
    if (!record?.monthly) return 0;

    const matchedRecord = record.monthly.find(
      (item) => item.category_name === categoryName
    );

    return matchedRecord ? matchedRecord.total : 0;
  };

  const calculateProgress = (total, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((total / limit) * 100, 100);
  };

  const showBudgetInfo = (item) => {
    navigate("/budget-management/edit", { state: { budgetData: item } });
  };

  // ==== ローディング判定を return の前に移動 ====
  if (isGetLoading || isRecordLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles["main-container"]}>
      <div className={styles["budget-container"]}>
        <MonthPicker
          selectedMonth={selectedMonth}
          onMonthChange={changeMonth}
          onMonthSelect={setMonth}
        />

        <button
          className={styles["add-budget-button"]}
          onClick={() => navigate("/budget-management/create")}
        >
          <span className={styles["add-button-icon"]}>
            <Plus size={16} />
          </span>
          <span className={styles["add-budget-title"]}>予算を追加</span>
        </button>

        {filteredBudget.map((item) => {
          const total = getTotalByCategory(item.category_name);
          const progressPercentage = calculateProgress(
            total,
            item.budget_limit
          );
          
          const IconComponent = getIcon(item.icon_name);

          return (
            <button
              className={styles["budget-button"]}
              key={item.id}
              onClick={() => showBudgetInfo({ ...item, total })}
            >
              <div className={styles["budget-header"]}>
                <div className={styles["icon"]} style={{ backgroundColor: `${item.category_color}` }}>
                  <IconComponent size={18}/>
                </div>

                <div className={styles["budget-info"]}>
                  <p className={styles["category-name"]}>
                    {item.category_name}
                  </p>
                  <p className={styles["budget-price"]}>
                    ¥{Number(item.budget_limit).toLocaleString()} / 月
                  </p>
                </div>

                <div className={styles["raito"]}>
                  <p>
                    {((total / Number(item.budget_limit)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className={styles["budget-progress"]}>
                <div className={styles["progress-bar"]}>
                  <div
                    className={styles["progress-fill"]}
                    style={{ width: `${progressPercentage}%`, backgroundColor: `${item.category_color}`}}
                  ></div>
                </div>

                <div className={styles["price-info"]}>
                  <span className={styles["expense-price"]}>
                    ¥{total.toLocaleString()}
                  </span>
                  <span className={styles["rest-price"]}>
                    残り ¥
                    {(Number(item.budget_limit) - total).toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetView;
