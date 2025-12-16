import React, { useEffect, useRef, useState } from "react";
import styles from "./DayPicker.module.css";
import { ChevronLeft, ChevronRight } from 'lucide-react';
 
const DayPicker = ( {date, onChange} ) => {

  const convertToDate = (dateString) => {
    const parts = dateString.split("-");

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    return new Date(year, month, day);
  };

  const getDefaultDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const [selectedDate, setSelectedDate] = useState(
    convertToDate(date || getDefaultDateString())
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const pickerRef = useRef();

  useEffect(() => {
    const handleClickOutSide = (event) => {
      if(pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutSide);
    return () => {
      document.removeEventListener("mousedown", handleClickOutSide);
    };
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];
    return `${year}/${month}/${day} (${weekday})`;
  }

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);

    if (onChange) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      onChange(formatted);
    }
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    for(let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for(let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  const selectDate = (date) => {
    setSelectedDate(date);
    setShowCalendar(false);

    if (onChange) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      onChange(formatted);
    }
  }

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  }

  const calendarDays = generateCalendarDays();

  return (
    <div ref={pickerRef} className={styles["date-picker-container"]}>
      <div className={styles["date-picker-display"]}>
        <button
          onClick={() => changeDate(-1)}
          className={styles["date-nav-button"]}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={styles["date-display-button"]}
        >
          {formatDate(selectedDate)}
        </button>
        
        <button
          onClick={() => changeDate(1)}
          className={styles["date-nav-button"]}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* カレンダー */}
      <div className={`${styles["calendar-dropdown"]} ${showCalendar ? styles["calendar-open"] : ""} `}>

        {/* 月を選択するためのヘッダー */}
        <div className={styles["calendar-header"]}>
          <button
            onClick={() => changeMonth(-1)}
            className={styles["month-nav-button"]}
          >
            <ChevronLeft size={20} />
          </button>

          <span className={styles["month-display"]}>
            {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
          </span>

          <button
            onClick={() => changeMonth(1)}
            className={styles["month-nav-button"]}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 曜日表示 */}
        <div className={styles["weekday-header"]}>
          {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
            <div
              key={day}
              className={`${styles.weekday} ${i === 0 ? styles["sunday"] : i === 6 ? styles["saturday"] : ""}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日付表示 */}
        <div className={styles["calendar-grid"]}>
          {calendarDays.map((date, index) => {
            if(!date) {
              return <div key={`empty-${index}`} className={styles["calendar-day-empty"]}></div>;
            }

            const isSelected = date.toString() === selectedDate.toString();
            const isToday = date.toDateString() === new Date().toDateString();
            const dayOfWeek = date.getDay();

            return (
              <button
                key={date.toISOString()}
                onClick={() => selectDate(date)}
                className={`
                  ${styles["calendar-day"]} 
                  ${isSelected ? styles["selected"] : ''}
                  ${isToday ? styles["today"] : ''}
                  ${dayOfWeek === 0 ? styles["sunday"] : dayOfWeek === 6 ? styles["saturday"] : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selectDate(new Date())}
          className={styles["today-button"]}
        >
          今日
        </button>

      </div>
    </div>
  )
}

export default DayPicker;