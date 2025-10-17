import { useEffect, useRef, useState } from "react";
import styles from "./Calculator.module.css"

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isAfterOperator, setIsAfterOperator] = useState(false);
  const inputRef = useRef(null);
  const calculatorOverlayRef = useRef(null);

  //関係のない要素をクリックしたときに電卓を閉じる
  useEffect(() => {
    const handleClickOutSide = (event) => {
      if(
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        calculatorOverlayRef.current && 
        !calculatorOverlayRef.current.contains(event.target)
      ) {
        setShowCalculator(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutSide);
    return () => document.removeEventListener("mousedown", handleClickOutSide);
  }, []);

  const buttons = [
    "7", "8", "9", "÷", "AC",
    "4", "5", "6", "×", "Del",
    "1", "2", "3", "-", "Enter",
    "0", "00", "+",
  ];

  const handleFocus = () => {
    setShowCalculator(true);
  }
 
  const handleNumberClick = (num) => {
    console.log(expression)
    //演算子が選択されている場合は
    if(isAfterOperator) {
      setDisplayValue(num); //演算子の後に入力された数値のみを表示
      setExpression(expression + num); //内部的には前の数字と演算子を保持する
      setIsAfterOperator(false);
      return;
    }

    if(displayValue === "0") {
      setDisplayValue(num);
      setExpression(num);
    } else {
      setDisplayValue(displayValue + num);
      setExpression(expression + num);
    }
  };

  const handleOperatorClick = (operator) => {
    const operatorMap = {
      "×": "*",
      "÷": "/",
      "+": "+",
      "-": "-",
    };

    // expressionに演算子が既に含まれている場合は、まず計算を実行
    if(expression && /[+\-*/]/.test(expression)) {
      try {
        const result = Function('"use strict"; return (' + expression + ')')();
        const resultStr = String(result);
        
        // 計算結果を表示して、新しい演算子を追加
        setDisplayValue(resultStr);
        setExpression(resultStr + operatorMap[operator]);
        setSelectedOperator(operator);
        setIsAfterOperator(true);
      } catch(error) {
        // エラーの場合はそのまま演算子を追加
        setExpression(expression + operatorMap[operator]);
        setSelectedOperator(operator);
        setIsAfterOperator(true);
      }
    } else {
      // まだ演算子がない場合は、そのまま追加
      setExpression(expression + operatorMap[operator]);
      setSelectedOperator(operator);
      setIsAfterOperator(true);
    }
  }

  const handleCalculate = () => {
    try {
      if(expression === "") return;

      const result = Function('"use strict"; return (' + expression + ')')();
      const resultStr = String(result);
      setDisplayValue(resultStr);
      setExpression(resultStr);
      setSelectedOperator(null);
      setIsAfterOperator(false);
    } catch (error) {
      setDisplayValue("Error");
      setExpression("");
      setSelectedOperator(null);
      setIsAfterOperator(false);
    }
  }

  const handleDelete = () => {
    if(displayValue === "" || displayValue === "0") return;

    if(displayValue === "Error") {
      setDisplayValue("0");
      setExpression("");
      return;
    }

    const newDisplay = displayValue.slice(0, -1);
    const newExpression = expression.slice(0, -1);

    if(newDisplay === "") {
      setDisplayValue("0");
      setExpression("");
    } else {
      setDisplayValue(newDisplay);
      setExpression(newExpression);
    }
  }

  const handleClear = () => {
    setDisplayValue("0");
    setExpression("");
    setSelectedOperator(null);
    setIsAfterOperator(false);
  };

  return (
    <div className={styles["calculator-container"]}>
      <input 
        ref={inputRef}
        type="text"
        readOnly
        onFocus={handleFocus}
        placeholder=""
        value={displayValue}
      />

      <div ref={calculatorOverlayRef} className={`${styles["calculator-overlay"]} ${showCalculator ? styles["is-active"] : ""}`}>
        <div className={styles["calculator"]}>

          <div className={styles["calculator-buttons"]}>
            {buttons.map((btn) => {
              if(!isNaN(btn)) {
                return <button key={btn} className={`${styles["calculator-button"]} ${btn === "00" ? styles["span-2-column"] : ""}`} onClick={() => handleNumberClick(btn)}>{btn}</button>
              }
              
              if(["+" , "-", "×", "÷"].includes(btn)) {
                const isSelected = selectedOperator === btn;
                return <button key={btn} className={` ${styles["calculator-button"]} ${isSelected ? styles["selected"] : ""}`} onClick={() => handleOperatorClick(btn)}>{btn}</button>
              }

              if(btn === "AC") return <button key={btn} className={styles["calculator-button"]} onClick={handleClear}>{btn}</button>
              if(btn === "Del") return <button key={btn} className={styles["calculator-button"]} onClick={handleDelete}>{btn}</button>
              if(btn === "Enter") return <button key={btn} className={`${styles["span-2-rows"]} ${styles["calculator-button"]}`} onClick={handleCalculate}>{btn}</button>
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;