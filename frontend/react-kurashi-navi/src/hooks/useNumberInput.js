import { useState } from "react";

export const useNumberInput = (initialValue = 0) => {
  const [displayValue, setDisplayValue] = useState(
    initialValue > 0 ? initialValue.toLocaleString() : ""
  );
  const [actualValue, setActualValue] = useState(initialValue);

  const handleChange = (input) => {
    const cleaned = input.replace(/[^\d,-]/g, "");
    const isNegative = cleaned.startsWith("-");
    const numericString = cleaned.replace(/[,-]/g, "");

    if (numericString === "") {
      setDisplayValue(isNegative ? "-" : "");
      setActualValue(0);
      return;
    }

    const withoutLeadingZeros = numericString.replace(/^0+/, "") || "0";
    const valueWithSign = isNegative
      ? "-" + withoutLeadingZeros
      : withoutLeadingZeros;
    const formatted = Number(valueWithSign).toLocaleString();

    setDisplayValue(formatted);
    setActualValue(Number(valueWithSign));
  };

  return { 
    displayValue,   // 表示用の値（カンマ区切り）
    actualValue,    // 実際の数値
    handleChange    // 変更ハンドラー
  };
}