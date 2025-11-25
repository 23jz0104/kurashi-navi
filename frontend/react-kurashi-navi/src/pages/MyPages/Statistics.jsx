import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Undo2, ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import styles from "../../styles/MyPages/Statistics.module.css";

function Statistics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("statistics");
  const [mode, setMode] = useState("custom");
  const [period, setPeriod] = useState("week");
  const [displayUnit, setDisplayUnit] = useState("day"); // "day" or "month"
  const [mounted, setMounted] = useState(false);
  const now = new Date();

  // 日付文字列 ⇄ Date
  const parseLocalDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatLocalDate(d);
  });
  const [customEnd, setCustomEnd] = useState(formatLocalDate(new Date()));
  const [customData, setCustomData] = useState([]);

  const goBack = () => navigate("/mypage");
  const tabs = [{ id: "statistics", label: "統計データ", icon: null }];
  const handleTabChange = (id) => setActiveTab(id);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (customStart && customEnd) {
      setCustomData(
        generateData(parseLocalDate(customStart), parseLocalDate(customEnd))
      );
    }
  }, [customStart, customEnd]);

  // 日単位ダミーデータ生成
  const generateData = (startDate, endDate) => {
    const data = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      data.push({
        日付: `${d.getMonth() + 1}/${d.getDate()}`,
        合計: Math.floor(Math.random() * 20000),
      });
    }
    return data;
  };

  // プリセットデータ
  const emptyDataMap = {
    week: generateData(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6), now),
    month: generateData(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), now),
    threeMonths: generateData(new Date(now.getFullYear(), now.getMonth() - 2, 1), now),
    year: generateData(new Date(now.getFullYear(), 0, 1), now),
  };

  // 月単位集計（期間限定）
  const aggregateMonthlyData = (dailyData, startDate, endDate) => {
    const monthlyMap = {};

    dailyData.forEach(({ 日付, 合計 }) => {
      const [m, d] = 日付.split("/").map(Number);
      const year = startDate.getFullYear(); // 年は開始日と同じ
      const currentDate = new Date(year, m - 1, d);

      // 指定期間外はスキップ
      if (currentDate < startDate || currentDate > endDate) return;

      monthlyMap[m] = (monthlyMap[m] || 0) + 合計;
    });

    return Object.entries(monthlyMap)
      .sort((a, b) => a[0] - b[0])
      .map(([month, total]) => ({
        日付: `${month}月`,
        合計: total,
      }));
  };

  // チャートデータ取得
  const chartData = () => {
    let data = [];
    const start = parseLocalDate(customStart);
    const end = parseLocalDate(customEnd);

    if (mode === "custom") {
      data = customData;
    } else {
      data = emptyDataMap[period] || [];
    }

    if (displayUnit === "month") {
      data = aggregateMonthlyData(data, start, end);
    }

    return data;
  };

  // CSV 変換
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    return `${header}\n${rows}`;
  };

  // CSV ダウンロード
  const handleDownload = () => {
    const start = parseLocalDate(customStart);
    const end = parseLocalDate(customEnd);

    let dataToDownload = [];
    if (mode === "custom") {
      dataToDownload = customData;
    } else {
      const data = emptyDataMap[period] || [];
      dataToDownload = data;
    }

    if (displayUnit === "month") {
      dataToDownload = aggregateMonthlyData(dataToDownload, start, end);
    }

    const csv = convertToCSV(dataToDownload);
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statistics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calendar Component
  const CalendarComponent = ({ date, onSelect }) => {
    const [selectedDate, setSelectedDate] = useState(date);
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(date.getFullYear(), date.getMonth(), 1));
    const pickerRef = useRef();

    useEffect(() => {
      setSelectedDate(date);
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }, [date]);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowCalendar(false);
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
      for (let i = 1; i <= daysInMonth; i++) arr.push(new Date(year, month, i));
      return arr;
    };

    const days = generateCalendarDays();

    return (
      <div ref={pickerRef} className={styles["date-picker-container"]}>
        <div className={styles["date-picker-display"]}>
          <button
            className={styles["date-nav-button"]}
            onClick={() => selectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))}
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
            onClick={() => selectDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))}
          >
            <ChevronRight />
          </button>
        </div>

        {showCalendar && (
          <div className={`${styles["calendar-dropdown"]} ${styles["calendar-open"]}`}>
            <div className={styles["calendar-header"]}>
              <button className={styles["month-nav-button"]} onClick={() => changeMonth(-1)}><ChevronLeft /></button>
              <span className={styles["month-display"]}>{currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月</span>
              <button className={styles["month-nav-button"]} onClick={() => changeMonth(1)}><ChevronRight /></button>
            </div>
            <div className={styles["weekday-header"]}>
              {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => <div key={i} className={`${styles.weekday} ${i === 0 ? styles.sunday : i === 6 ? styles.saturday : ""}`}>{d}</div>)}
            </div>
            <div className={styles["calendar-grid"]}>
              {days.map((d, i) => d ? (
                <button key={i}
                  className={`${styles["calendar-day"]} ${selectedDate.toDateString() === d.toDateString() ? styles.selected : ""} ${d.getDay() === 0 ? styles.sunday : d.getDay() === 6 ? styles.saturday : ""} ${d.toDateString() === new Date().toDateString() ? styles.today : ""}`}
                  onClick={() => selectDate(d)}
                >
                  {d.getDate()}
                </button>
              ) : <div key={i} className={styles["calendar-day-empty"]}></div>)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const headerContent = <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />;

  const mainContent = (
    <div className={styles["flex-statistics"]}>
      <button className={styles.modoru} onClick={goBack}><Undo2 /></button>
      <p className={styles.time}>期間を選択</p>

      <div className={styles.period}>
        <ul className={styles.ul}>
          <li className={styles.li}><button className={`${styles.custom} ${mode === "custom" ? styles.active : ""}`} onClick={() => setMode("custom")}>支出</button></li>
          <li className={styles.li}><button className={`${styles.purisetto} ${mode === "preset" ? styles.active : ""}`} onClick={() => setMode("preset")}>収入</button></li>
        </ul>
      </div>

      {(mode === "preset" || mode === "custom") && (
        <div className={styles["custom-period"]}>
          <p>開始日</p>
          <CalendarComponent date={parseLocalDate(customStart)} onSelect={(d) => setCustomStart(formatLocalDate(d))} />
          <p>終了日</p>
          <CalendarComponent date={parseLocalDate(customEnd)} onSelect={(d) => setCustomEnd(formatLocalDate(d))} />
        </div>
      )}

      {/* 日ごと／月ごと切替ボタン */}
      <div className={styles["unit-toggle"]}>
        <button className={displayUnit === "day" ? styles.active : ""} onClick={() => setDisplayUnit("day")}>日ごと</button>
        <button className={displayUnit === "month" ? styles.active : ""} onClick={() => setDisplayUnit("month")}>月ごと</button>
      </div>

      <div className={styles["flex-view"]}>
        <p className={styles.view}>プレビュー</p>
        <div className={styles["chart-wrapper"]}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData()}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="日付" />
                <YAxis tickFormatter={(v) => v.toLocaleString()} domain={[0, "dataMax"]} />
                <Tooltip />
                <Line type="monotone" dataKey="合計" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <button className={styles.download} onClick={handleDownload}>ダウンロード</button>
    </div>
  );

  return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default Statistics;