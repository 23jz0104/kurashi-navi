import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import styles from "../../styles/MyPages/Statistics.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import DayPicker from "../../components/common/DayPicker";
import { Undo2, Calendar, Clock, TrendingUp, ChartLine } from 'lucide-react';

function Statistics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("statistics");
  const [mode, setMode] = useState("custom");
  const [period, setPeriod] = useState("week");
  const [mounted, setMounted] = useState(false);
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6); // 過去7日間
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [customData, setCustomData] = useState([]);

  const goBack = () => navigate("/mypage");

  const tabs = [{ id: "statistics", label: "統計データ", icon: null }];
  const handleTabChange = (id) => setActiveTab(id);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setMounted(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 日付範囲に応じて customData を自動生成
  useEffect(() => {
    if (customStart && customEnd) {
      setCustomData(generateData(customStart, customEnd));
    }
  }, [customStart, customEnd]);

  const generateData = (startDate, endDate) => {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        amount: Math.floor(Math.random() * 20000),
      });
    }
    return data;
  };

  const emptyDataMap = {
    week: generateData(new Date(new Date().setDate(new Date().getDate() - 6)), new Date()),
    month: generateData(new Date(new Date().setDate(new Date().getDate() - 29)), new Date()),
    threeMonths: generateData(new Date(new Date().setDate(new Date().getDate() - 89)), new Date()),
    year: generateData(new Date(new Date().setDate(new Date().getDate() - 364)), new Date()),
  };

  const handleDownload = () => {
    const dataToDownload = mode === "custom" ? customData : emptyDataMap[period];
    const csv = convertToCSV(dataToDownload);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statistics.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const header = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    return `${header}\n${rows}`;
  };

  const headerContent = <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />;

  const mainContent = (
    <div className={styles['flex-statistics']}>
      <button className={styles.modoru} onClick={goBack}><Undo2 /></button>
      <p className={styles.time}>期間を選択</p>

      <div className={styles.period}>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <button className={`${styles.custom} ${mode === "custom" ? styles.active : ""}`} onClick={() => setMode("custom")}>
              カスタム期間
            </button>
          </li>
          <li className={styles.li}>
            <button className={`${styles.purisetto} ${mode === "preset" ? styles.active : ""}`} onClick={() => setMode("preset")}>
              プリセット
            </button>
          </li>
        </ul>
      </div>

      {mode === "preset" && (
        <div className={styles['flex-past']}>
          <button className={`${styles.button} ${period === "week" ? styles.active : ""}`} onClick={() => setPeriod("week")}><Clock />過去一週間</button>
          <button className={`${styles.button} ${period === "month" ? styles.active : ""}`} onClick={() => setPeriod("month")}><Calendar />過去１か月</button>
          <button className={`${styles.button} ${period === "threeMonths" ? styles.active : ""}`} onClick={() => setPeriod("threeMonths")}><TrendingUp />過去３か月</button>
          <button className={`${styles.button} ${period === "year" ? styles.active : ""}`} onClick={() => setPeriod("year")}><ChartLine />過去一年間</button>
        </div>
      )}

      {mode === "custom" && (
        <div className={styles['custom-period']}>
          <div style={{ marginBottom: "10px" }}>
            <p>開始日</p>
            <DayPicker
              selected={new Date(customStart)}
              onSelect={(date) => date && setCustomStart(date.toISOString().slice(0, 10))}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <p>終了日</p>
            <DayPicker
              selected={new Date(customEnd)}
              onSelect={(date) => date && setCustomEnd(date.toISOString().slice(0, 10))}
            />
          </div>

          <button className={styles['btn-custom']} onClick={() => setCustomData(generateData(customStart, customEnd))}>
            表示
          </button>
        </div>
      )}

      <div className={styles['flex-view']}>
        <p className={styles.view}>プレビュー</p>
        <div className={styles['chart-wrapper']}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mode === "custom" ? customData : emptyDataMap[period]}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => value.toLocaleString()} domain={[0, 'dataMax']} />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
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
