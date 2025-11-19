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

  return (
    <div className={styles["form-container"]}>
      <div className={styles["header-container"]}>
        <DayPicker
          date={income.date}
          onChange={(newDate) => updateIncomeInfo("date", newDate)}
        />
        
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
          <span>収入元</span>
          <input
            className={styles["store-name-value"]}
            type="text"
            placeholder="未入力"
            value={income.shop_name}
            onChange={(e) => updateIncomeInfo("shop_name", e.target.value)}
          />
        </div>
        
        <div className={styles["header-container-row"]}>
          <span>住　所</span>
          <input
            className={styles["store-address-value"]}
            type="text"
            placeholder="未入力"
            value={income.shop_address}
            onChange={(e) => updateIncomeInfo("shop_address", e.target.value)}
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

      <button onClick={() => {
        console.log("receipt", JSON.stringify(income, null, 1));
      }}>収入フィールドを表示</button>
    </div>
  );
};

export default IncomeManualInput;