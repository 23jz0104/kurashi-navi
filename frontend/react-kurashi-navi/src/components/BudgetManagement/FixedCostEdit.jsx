import { useLocation } from "react-router-dom";
import Layout from "../common/Layout";
import { startTransition, useState } from "react";
import styles from "./FixedCostEdit.module.css";
import { House } from "lucide-react";
import { useNumberInput } from "../../hooks/common/useNumberInput";
import { useCategories } from "../../hooks/common/useCategories";
import Categories from "../common/Categories";
import LoadingSpinner from "../common/LoadingSpinner";
import SubmitButton from "../common/SubmitButton";
import { useFixedCostApi } from "../../hooks/fixedCost/useFixedCostApi";

const FixedCostEdit = () => {
  const location = useLocation();
  const [selectedFixedCostItem, setSelectedFixedCostItem] = useState(
    location.state?.fixedCostData,
  );

  const [message, setMessage] = useState("");

  const fixedCost = useNumberInput(selectedFixedCostItem?.cost || 0);

  const {isLoading: isIncomeCategoryLoading, categories: incomecategories} = useCategories(1)
  const {isLoading: isExpenseCategoryLoading, categories: expensecategories} = useCategories(2);
  const [transactionType, setTransactionType] = useState("expense");

  const categories = transactionType === "expense" ? expensecategories : incomecategories;
  
  const {isPatchLoading, patchFixedCost} = useFixedCostApi();

  const handleSubmit = async () => {
    const payload = {
      id: selectedFixedCostItem.id,
      cost: selectedFixedCostItem.cost,
      category_id: selectedFixedCostItem.category_id,
    }
    const result = await patchFixedCost(payload);

    if (result?.status === "success") {
      setMessage("変更しました。");
    } else {
      setMessage("変更に失敗しました。");
    }

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  return (
    <Layout 
      hideNavigation={true}
      redirectPath={"/budget-management"}
      state={{"initialTab": "fixedCostView"}}
      headerContent={<p>固定費編集</p>}
      mainContent={
        <>
          {isIncomeCategoryLoading || isExpenseCategoryLoading ? (
            <LoadingSpinner />
          ) : (
            <div className={styles["main-container"]}>

              <div className={styles["toggle-button-container"]}>
                <div className={styles["toggle-inner"]}>
                  <div 
                    className={`${styles["toggle-slider"]} ${
                      transactionType === "expense"
                      ? styles["slider-expense"]
                      : styles["slider-income"]
                    }`} 
                  />
                  <button
                    onClick={() => {
                      setTransactionType("expense");
                      setSelectedFixedCostItem((prev) => ({
                        ...prev,
                        type_id: 2,
                      }))
                    }}
                    className={`${styles["toggle-button"]} ${
                      transactionType === "expense"
                      ? styles["active"] : ""
                    }`}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => {
                      setTransactionType("income");
                      setSelectedFixedCostItem((prev) => ({
                        ...prev,
                        type_id: 1,
                      }))
                    }}
                    className={`${styles["toggle-button"]} ${
                      transactionType === "income"
                      ? styles["active"] : ""
                    }`}
                  >
                    収入
                  </button>
                </div>
              </div>

              <div className={styles["fixed-cost-card"]}>
    
                <div className={styles["card-header"]}>
                  <div className={styles["category-icon"]}>
                    <House size={16}/>
                  </div>
                  <span>{selectedFixedCostItem.category_name}</span>
                </div>
    
                <div className={styles["fixed-cost-amount"]}>
                  <span>¥</span>
                  <input
                    value={fixedCost.displayValue}
                    onChange={(e) => {
                      fixedCost.handleChange(e.target.value);
                      setSelectedFixedCostItem((prev) => ({
                        ...prev, cost: Number(e.target.value.replace(/,/g, "") || 0),
                      }))
                    }}
                    className={styles["cost-input"]}
                  />
                  <span>/ 月</span>
                </div>

              </div>

              <div className={styles["category-card"]}>
                <p>カテゴリ</p>
                <Categories 
                  categories={categories}
                  selectedCategoryId={selectedFixedCostItem.category_id}
                  onSelectedCategory={(id) => {
                    const selected = categories.find((c) => c.id === id);
                      setSelectedFixedCostItem((prev) => ({
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
                <div>{message}</div>
              )}
            </div>
          )}
        </>
      }
    />
  )
}

export default FixedCostEdit;