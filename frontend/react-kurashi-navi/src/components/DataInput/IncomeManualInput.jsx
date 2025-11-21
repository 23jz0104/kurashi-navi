import styles from "./IncomeManualInput.module.css";
import DayPicker from "../common/DayPicker";
import Categories from "../common/Categories";
import SubmitButton from "../common/SubmitButton";
import { useIncomeForm } from "../../hooks/dataInput/useIncomeForm";

const IncomeManualInput = ({ categories }) => {
  const {
    income,
    updateIncomeInfo,
    handleSubmit,
    isSubmitting
  } = useIncomeForm();

  const validateForm = () => {
    if(!receipt.products || receipt.products.length === 0) {
      return "データを入力してください。";
    }

    return null;
  }

  return (
    <div className={styles["form-container"]}>
      <div className={styles["ajusted-space"]}></div>
      <DayPicker
        date={income.date}
        onChange={(newDate) => updateIncomeInfo("date", newDate)}
      />
      <div className={styles["header-container"]}>
 
        <div className={styles["header-container-row"]}>
          <span>金　額</span>
          <input
            className={styles["amount-input"]}
            type="number"
            placeholder="0"
            value={income.amount || ""}
            onChange={(e) => updateIncomeInfo("amount", Number(e.target.value))}
          />
        </div>

        <div className={styles["header-container-row"]}>
          <span>メ　モ</span>
          <input
            className={styles["memo-input"]}
            type="text"
            placeholder="未入力"
            value={income.memo}
            onChange={(e) => updateIncomeInfo("memo", e.target.value)}
          />
        </div>
      </div>

      <div className={styles["header-container"]}>
        <Categories
          categories={categories}
          selectedCategoryId={income.categoryId}
          onSelectedCategory={(categoryId) =>
            updateIncomeInfo("categoryId", categoryId)
          }
        />
      </div>

      <SubmitButton
        text="送信"
        onClick={handleSubmit}
        disabled={isSubmitting}
      />
    </div>
  );
};

export default IncomeManualInput;