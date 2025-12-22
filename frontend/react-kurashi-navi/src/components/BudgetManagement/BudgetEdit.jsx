import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../common/Layout";
import styles from "./BudgetEdit.module.css";
import { useNumberInput } from "../../hooks/common/useNumberInput";
import { House } from "lucide-react";
import Categories from "../common/Categories";
import { useCategories } from "../../hooks/common/useCategories";
import { useState } from "react";
import SubmitButton from "../common/SubmitButton";
import LoadingSpinner from "../common/LoadingSpinner";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";

const BudgetEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBudget, setSelectedBudget] = useState(
    location.state?.budgetData
  );
  const {isDeleteLoading, deleteBudget} = useBudgetApi();
  const { isLoading: isCategoryLoading, categories } = useCategories(2); //収入
  const { isPatchLoading, patchBudget } = useBudgetApi();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  const budget_limit = useNumberInput(
    selectedBudget ? selectedBudget.budget_limit : 0
  );

  const calculateProgress = (total, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((total / limit) * 100, 100);
  };

  const progressPercentage = calculateProgress(
    selectedBudget.total,
    selectedBudget.budget_limit
  );

  const handleSubmit = async () => {
    const payload = {
      id: selectedBudget.id,
      budget_limit: selectedBudget.budget_limit,
      category_id: selectedBudget.category_id,
    }
    const result = await patchBudget(payload);

    if (result?.status === "success") {
      setMessage("変更しました。");
    } else {
      setMessage("変更に失敗しました。");
    }

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  }

  const deleteSubmit = async () => {
    const result = await deleteBudget(selectedBudget.id);

    if(result?.status === "success") {
      navigate("/budget-management");
    }
  }

  return (
    <Layout
      onDeleteButtonClick={handleDelete}
      headerContent={<p>予算編集</p>}
      redirectPath={"/budget-management"}
      mainContent={
        <>
          {isCategoryLoading ? (
            <>
              <LoadingSpinner />
            </>
          ) : (
            <>
              <div className={styles["main-container"]}>
                <div className={styles["budget-info-card"]}>
                  <div className={styles["category-display"]}>
                    <span className={styles["icon"]}>
                      <House size={16} />
                    </span>
                    <span className={styles["category-name"]}>
                      {selectedBudget.category_name}
                    </span>
                    <span className={styles["usage-percentage"]}>
                      {selectedBudget.budget_limit > 0
                        ? (
                            (selectedBudget.total /
                              selectedBudget.budget_limit) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>

                  <div className={styles["budget-input-container"]}>
                    <span className={styles["currency-symbol"]}>¥</span>
                    <input
                      value={budget_limit.displayValue}
                      onChange={(e) => {
                        budget_limit.handleChange(e.target.value);
                        setSelectedBudget((prev) => ({
                          ...prev,
                          budget_limit:
                            Number(e.target.value.replace(/,/g, "")) || 0,
                        }));
                      }}
                      className={styles["budget-limit-input"]}
                    />
                    <span className={styles["per-month"]}> / 月</span>
                  </div>

                  <div className={styles["budget-progress"]}>
                    <div className={styles["progress-bar"]}>
                      <div
                        className={styles["progress-fill"]}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>

                    <div className={styles["price-info"]}>
                      <span className={styles["expense-price"]}>
                        使用済み ¥{selectedBudget.total.toLocaleString()}
                      </span>

                      <span className={styles["rest-price"]}>
                        残り ¥
                        {(
                          Number(selectedBudget.budget_limit) -
                          selectedBudget.total
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles["category-card"]}>
                  <p>カテゴリ</p>
                  <Categories
                    categories={categories}
                    selectedCategoryId={selectedBudget.category_id}
                    onSelectedCategory={(id) => {
                      const selected = categories.find((c) => c.id === id);
                      setSelectedBudget((prev) => ({
                        ...prev,
                        category_id: id,
                        category_name:
                          selected?.category_name ?? prev.category_name,
                      }));
                    }}
                  />
                </div>

                <SubmitButton
                  disabled={isPatchLoading} 
                  text={isPatchLoading ? "変更中..." : "変更"}
                  onClick={() => handleSubmit()}
                />

                {message && (
                  <p>{message}</p>
                )}

                {showDeleteDialog && (
                  <div className={styles["delete-dialog"]}>
                    <div className={styles["dialog-content"]}>

                      {isDeleteLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <p className={styles["confirm-text"]}>予算を削除しますか？</p>
                            <div className={styles["dialog-buttons"]}>
                              <button 
                                className={styles["button-cancel"]}
                                onClick={() => setShowDeleteDialog(false)}
                              >
                                キャンセル
                              </button>
                              <button 
                                className={styles["button-delete"]}
                                onClick={() => deleteSubmit()}
                                disabled={isDeleteLoading}
                              >
                                削除
                              </button>
                            </div>
                          </>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      }
      hideNavigation={true}
    />
  );
};

export default BudgetEdit;
 