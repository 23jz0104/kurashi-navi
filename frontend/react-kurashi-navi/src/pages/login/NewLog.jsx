import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/NewLog.module.css";
import TabButton from "../../components/common/TabButton";
import { EyeOff, Eye } from "lucide-react";

// カスタムセレクト（生まれた年）
function YearSelect({ selectedYear, setSelectedYear }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: `${year}年` };
  });

  const selected = options.find(opt => opt.value === selectedYear);

  const handleSelect = (val) => {
    setSelectedYear(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.categorySelectWrapper} ref={wrapperRef}>
      <div
        className={styles.selectedCategory}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={`${styles.selectedText} ${!selected ? styles.unselected : ""}`}>
          {selected ? selected.label : "生まれた年を選択"}
        </span>
        <span className={styles.arrow}>▾</span>
      </div>

      {isOpen && (
        <div className={styles.dropdownList}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={styles.dropdownItem}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewLog() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState("");
  const [errorAddress, setErrorAddress] = useState("");

  const tabs = [
    { id: "login", label: "ログイン", icon: null },
    { id: "signup", label: "新規登録", icon: null },
  ];

  const activeTab = location.pathname === "/newlog" ? "signup" : "login";

  const handleTabChange = (id) => {
    if (id === "signup") navigate("/newlog");
    else navigate("/");
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!email.trim() || !password.trim()) {
      newErrors.form = "メールアドレスまたはパスワードが未入力です。";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.form = "正しいメールアドレスを入力してください。";
      }

      const passwordRegex = /^.{8,16}$/;
      if (!passwordRegex.test(password)) {
        newErrors.form = "パスワードは8文字以上16文字以内で入力してください。";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    // API に送るデータ
    const payload = {
      mail_address: email,
      password: password,
      year_of_born: year,
      address: address
    };

    try {
      const res = await fetch("http://localhost/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert("登録が完了しました！");
        navigate("/");
      } else {
        alert("登録に失敗しました：" + data.message);
      }

    } catch (error) {
      console.error("通信エラー", error);
      alert("通信エラーが発生しました");
    }
  };

  return (
    <div className={styles.main}>
      {/* 上部タブ */}
      <div className={styles["flex-log"]}>
        <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* フォーム部分 */}
      <div className={styles.flexText}>
        {/* メールアドレス */}
        <div className={styles.inputWrapper}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.form) setErrors(prev => ({ ...prev, form: undefined }));
            }}
          />
          <span className={styles.required}>*</span>
        </div>

        {/* パスワード */}
        <div className={styles.inputWrapper} style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="パスワード"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.form) setErrors(prev => ({ ...prev, form: undefined }));
            }}
            style={{ paddingRight: "36px" }}
          />
          <span className={styles.required}>*</span>

          <span
            onClick={() => setShowPassword(prev => !prev)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#555",
            }}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
        </div>

        {/* 生まれた年 */}
        <div className={styles.inputWrapper}>
          <YearSelect selectedYear={year} setSelectedYear={setYear} />
        </div>

        {/* 住所 */}
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="住所"
            value={address}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length > 30) {
                setErrorAddress("住所は30文字以内で入力してください");
                return;
              } else {
                setErrorAddress("");
              }
              setAddress(val);
            }}
          />
          {errorAddress && <div className={styles.errorMessage}>{errorAddress}</div>}
        </div>

        {errors.form && <div className={styles.errorMessage}>{errors.form}</div>}

        {/* 新規登録ボタン */}
        <button className={styles.newBtnLog} onClick={handleSubmit}>
          新規登録
        </button>
      </div>

      {/* 下枠 */}
      <div className={styles["flex-soko"]}></div>
    </div>
  );
}

export default NewLog;
