import { useEffect, useRef, useState } from "react";
import styles from "./Calculator.module.css"

const Calculator = ({ onChange, className }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isAfterOperator, setIsAfterOperator] = useState(false);
  const inputRef = useRef(null);
  const calculatorOverlayRef = useRef(null);
  
  useEffect(() => {
    if (onChange) {
      onChange(displayValue);
    }
  }, [displayValue]);

  const calculate = (expr) => {
    if(!expr || typeof expr !== "string") return "0";

    const operatorMatch = expr.match(/[+\-*/]/);
    if(!operatorMatch) {
      const num = parseInt(expr);
      return isNaN(num) ? "0" : String(num);
    }

    const operator = operatorMatch[0];
    const operatorIndex = expr.indexOf(operator);

    let leftStr;
    let rightStr;

    //負の値の場合の計算
    if(operator === "-" && operatorIndex === 0) {
      const nextOperatorMatch = expr.slice(1).match(/[+\-*/]/); //最初の-を除いた式がnextOperatorMatchに代入される

      if(!nextOperatorMatch) {
        const num = parseInt(expr);
        return isNaN(num) ? "0" : String(num); 
      }

      const realOperatorIndex = 1 + expr.slice(1).indexOf(nextOperatorMatch[0]);
      leftStr = expr.slice(0, realOperatorIndex);
      rightStr = expr.slice(realOperatorIndex + 1);
    } else {
      leftStr = expr.slice(0, operatorIndex);
      rightStr = expr.slice(operatorIndex + 1);
    }

    const left = parseInt(leftStr);
    const right = parseInt(rightStr);

    if(isNaN(left) || isNaN(right)) return String(left);

    switch(operator === "-" && operatorIndex === 0 ? expr.slice(1).match(/[+\-*/]/)?.[0] : operator) {
      case "+":
        return String(left + right);
      case "-":
        return String(left - right);
      case "*":
        return String(left * right);
      case "/":
        return right === 0 ? "0" : String(Math.floor(left / right)); //零徐算の場合は0を返す
      default:
        return "0";
    }
  };

  const formatNumberWithCommas = (value) => {
    // "Error" や空文字はそのまま返す
    if (value === "Error" || value === "") return value;
  
    // マイナス符号を保持
    const isNegative = value.startsWith("-");
    const absValue = isNegative ? value.slice(1) : value;
  
    // 整数部分にカンマを追加（小数点処理は削除）
    const formattedInteger = absValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
    // マイナス符号を戻して返す
    return isNegative ? "-" + formattedInteger : formattedInteger;
  };  

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

    if(displayValue === "0" && num === "00") {
      num = "0";
    }

    //演算子が選択されている場合は
    if(isAfterOperator) {
      num = num === "00" ? "0" : num;
      setDisplayValue(num); //演算子の後に入力された数値のみを表示
      setExpression(expression + num); //内部的には前の数字と演算子を保持する
      setIsAfterOperator(false);
      return;
    }

    if(displayValue === "0" && expression === "") {
      setDisplayValue(num);
      setExpression(num);
    } else if (displayValue === "0") {
      setDisplayValue(num);
      setExpression(expression.slice(0, -1) + num);
    } else if (displayValue !== "0" && expression === "") {
      setDisplayValue(displayValue + num);
      setExpression(displayValue + num);
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

    const currentExpression = expression === "" ? displayValue : expression;

    //expressionの最後が演算子かどうかを確認
    const lastChar = currentExpression.slice(-1);
    const isLastCharOperator = /[+\-*/]/.test(lastChar);

    if(isLastCharOperator) {
      setExpression(currentExpression.slice(0, -1) + operatorMap[operator]);
      setSelectedOperator(operator);
      setIsAfterOperator(true);
      return;
    }

    // currentExpressionに演算子が既に含まれている場合は、まず計算を実行
    if(currentExpression && /[+\-*/]/.test(currentExpression)) {
      try {
        const result = calculate(currentExpression);
        const resultStr = String(result);
        
        // 計算結果を表示して、新しい演算子を追加
        setDisplayValue(resultStr);
        setExpression(resultStr + operatorMap[operator]);
        setSelectedOperator(operator);
        setIsAfterOperator(true);
      } catch(error) {
        // エラーの場合はそのまま演算子を追加
        setExpression(currentExpression + operatorMap[operator]);
        setSelectedOperator(operator);
        setIsAfterOperator(true);
      }
    } else {
      // まだ演算子がない場合は、そのまま追加
      setExpression(currentExpression + operatorMap[operator]);
      setSelectedOperator(operator);
      setIsAfterOperator(true);
    }
  }

  const handleCalculate = () => {

    const hasOperator = expression && /[+\-*/]/.test(expression);

    if(expression === "" || !hasOperator) {
      setShowCalculator(false);
      return;
    }

    try {
      const result = calculate(expression);
      const resultStr = String(result);
      setDisplayValue(resultStr);
      setExpression("");
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

    const lastChar = expression.slice(-1);
    const isLastCharOperator = /[+\-*/]/.test(lastChar);

    //最後の文字が演算子の場合、演算子とその前の数値を合わせて削除する
    if(isLastCharOperator) {
      setDisplayValue(displayValue.slice(0, -1));
      setExpression(expression.slice(0, -2));
      setIsAfterOperator(false);
      setSelectedOperator(null);
      return;
    }

    const newDisplay = displayValue.slice(0, -1);
    const newExpression = expression.slice(0, -1);

    if(newDisplay === "" && expression === "") {
      setDisplayValue("0");
      setExpression("");
    //文字がすべて削除され、かつ演算子を挟んでいない場合
    } else if (newDisplay === "") {
      setDisplayValue("0")
      setExpression(newExpression);
      setIsAfterOperator(true);
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
        className={`${className ? className : styles["calculator-display"]}`} 
        ref={inputRef}
        type="text"
        readOnly
        onFocus={handleFocus}
        placeholder=""
        value={formatNumberWithCommas(displayValue)}
      />

      <div ref={calculatorOverlayRef} className={`${styles["calculator-overlay"]} ${showCalculator ? styles["is-active"] : ""}`}>
        <div className={styles["calculator"]}>

          <div className={styles["calculator-buttons"]}>
            {buttons.map((btn) => {
              if(!isNaN(btn)) {
                return <button key={btn} className={`${styles["calculator-button"]} ${styles["calculator-button-number"]} ${btn === "00" ? styles["span-2-column"] : ""}`} onClick={() => handleNumberClick(btn)}>{btn}</button>
              }
              
              if(["+" , "-", "×", "÷"].includes(btn)) {
                const isSelected = selectedOperator === btn;
                return <button key={btn} className={` ${styles["calculator-button"]} ${styles["calculator-button-operator"]} ${isSelected ? styles["selected"] : ""}`} onClick={() => handleOperatorClick(btn)}>{btn}</button>
              }

              if(btn === "AC") return <button key={btn} className={`${styles["calculator-button"]} ${styles["calculator-button-function"]}`} onClick={handleClear}>{btn}</button>
              if(btn === "Del") return <button key={btn} className={`${styles["calculator-button"]} ${styles["calculator-button-function"]}`} onClick={handleDelete}>{btn}</button>
              if(btn === "Enter") {
                const hasOperator = expression && /[+\-*/]/.test(expression);
                return <button key={btn} className={`${styles["span-2-rows"]} ${styles["calculator-button"]} ${styles["calculator-button-function"]} `} onClick={handleCalculate}>{hasOperator ? "Enter" : "OK"}</button>
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;