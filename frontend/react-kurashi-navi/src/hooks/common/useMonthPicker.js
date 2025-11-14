import { useState } from "react"

export const useMonthPicker = (initialMonth = null) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if(initialMonth) return new Date(initialMonth);
    const date = new Date();
    date.setDate(1);
    return date;
  });

  const changeMonth = (offset) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setSelectedMonth(newMonth);
  };

  const setMonth = (year, monthIndex) => {
    const newDate = new Date(year, monthIndex, 1);
    setSelectedMonth(newDate);
  }

  const getMonthString = () => {
    const year = selectedMonth.getFullYear();
    const month = String(selectedMonth.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  return { selectedMonth, changeMonth, setMonth, getMonthString };
}