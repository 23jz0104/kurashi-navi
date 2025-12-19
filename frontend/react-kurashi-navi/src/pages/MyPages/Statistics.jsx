import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import styles from "../../styles/MyPages/Statistics.module.css";

const CalendarComponent = ({ date, onSelect }) => {
  const [selectedDate, setSelectedDate] = useState(date);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(date.getFullYear(), date.getMonth(), 1)
  );
  const pickerRef = useRef();

  useEffect(() => {
    setSelectedDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [date]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (d) => {
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
  };

  const changeMonth = (delta) => {
    const m = new Date(currentMonth);
    m.setMonth(m.getMonth() + delta);
    setCurrentMonth(m);
  };

  const selectDate = (d) => {
    const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    setSelectedDate(newDate);
    setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    setShowCalendar(false);
    onSelect && onSelect(newDate);
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = Array(firstDay).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(new Date(year, month, i));
    }
    return arr;
  };

  const days = generateCalendarDays();

  return (
    <div ref={pickerRef} className={styles["date-picker-container"]}>
      <div className={styles["date-picker-display"]}>
        <button
          className={styles["date-nav-button"]}
          onClick={() =>
            selectDate(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate() - 1
              )
            )
          }
        >
          <ChevronLeft />
        </button>

        <button
          className={styles["date-display-button"]}
          onClick={() => setShowCalendar(!showCalendar)}
        >
          {formatDate(selectedDate)}
        </button>

        <button
          className={styles["date-nav-button"]}
          onClick={() =>
            selectDate(
              new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate() + 1
              )
            )
          }
        >
          <ChevronRight />
        </button>
      </div>

      {showCalendar && (
        <div className={styles["calendar-dropdown"]}>
          <div className={styles["calendar-header"]}>
            <button onClick={() => changeMonth(-1)}>
              <ChevronLeft />
            </button>
            <span>
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </span>
            <button onClick={() => changeMonth(1)}>
              <ChevronRight />
            </button>
          </div>

          <div className={styles["calendar-grid"]}>
            {days.map((d, i) =>
              d ? (
                <button key={i} onClick={() => selectDate(d)}>
                  {d.getDate()}
                </button>
              ) : (
                <div key={i} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function Statistics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("statistics");

  const userId = sessionStorage.getItem("userId");

  // 日付フォーマット
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDate(d);
  });

  const [endDate, setEndDate] = useState(formatDate(new Date()));

  /* CSVダウンロード */
  const handleDownload = async () => {
    if (!userId) {
      alert("ユーザー情報が取得できていません");
      return;
    }

    try {
      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/statistical-data/download",
        {
          method: "GET",
          headers: {
            "X-User-ID": String(userId),
            "X-StartDate": startDate,
            "X-EndDate": endDate,
          },
        }
      );

      if (!res.ok) throw new Error(res.status);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `statistical_data_${startDate}_${endDate}.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("CSVダウンロードに失敗しました");
    }
  };

  return (
    <Layout
      headerContent={
        <TabButton
          tabs={[{ id: "statistics", label: "統計データ" }]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
      mainContent={
        <div className={styles["flex-statistics"]}>
          <button className={styles.modoru} onClick={() => navigate("/mypage")}>
            <Undo2 />
          </button>

          <p className={styles.time}>期間を選択</p>

          <div className={styles["custom-period"]}>
            <p>開始日</p>
            <CalendarComponent
              date={new Date(startDate)}
              onSelect={(d) => setStartDate(formatDate(d))}
            />

            <p>終了日</p>
            <CalendarComponent
              date={new Date(endDate)}
              onSelect={(d) => setEndDate(formatDate(d))}
            />
          </div>

          <button className={styles.download} onClick={handleDownload}>
            CSVダウンロード
          </button>
        </div>
      }
    />
  );
}

export default Statistics;