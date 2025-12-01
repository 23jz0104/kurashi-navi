import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/NewLog.module.css";
import TabButton from "../../components/common/TabButton";
import { EyeOff, Eye, TrendingUp, CircleAlert, Mail, Lock, Cake, Home } from "lucide-react";
import Layout from "../../components/common/Layout";
import SubmitButton from "../../components/common/SubmitButton";

// 生まれた年セレクト
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
        className={styles["input-field"]}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={`${styles.selectedText} ${!selected ? styles.unselected : ""}`}>
          {selected ? selected.label : "生年月日（任意）"}
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
  const [address, setAddress] = useState("");
  const [errorAddress, setErrorAddress] = useState("");
  const [errors, setErrors] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    console.log("handleSubmit()");

    // 必須チェック 後で細かく修正 
    // if (!email.trim()) {
    //   newErrors.form = "メールアドレスを入力してください。";
    // } else {
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(email)) {
    //     newErrors.form = "正しいメールアドレスを入力してください。";
    //   }
    // }

    // if (!password.trim()) {
    //   newErrors.form = "パスワードを入力してください。";
    // } else {
    //   const passwordRegex = /^.{8,16}$/;
    //   if (!passwordRegex.test(password)) {
    //     newErrors.form = "パスワードは8文字以上16文字以内で入力してください。";
    //   }
    // }

    // // 生まれた年チェック
    // const yearToSend = year || null;
    // if (yearToSend !== null && !Number.isInteger(yearToSend)) {
    //   newErrors.form = "生まれた年の形式が不正です。";
    // }

    // // 住所チェック
    // const addressToSend = address.trim() === "" ? null : address.trim();
    // if (addressToSend && addressToSend.length > 40) {
    //   newErrors.form = "住所は40文字以内で入力してください。";
    // }

    if(!email.trim() || !password.trim()) {
      console.log("未入力項目あり")
      setErrors("未入力の項目があります。");
      return;
    }

    const yearToSend = year || null;
    const addressToSend = address.trim() === "" ? null : address.trim();


    // API に送るデータ
    const payload = {
      mail_address: email.trim(),
      password: password,
      year_of_born: yearToSend,
      address: addressToSend
    };

    try {
      setIsLoading(true);
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage("登録が完了しました！");
      } else {
        // バックの validation を日本語化
        let errorMsg = data.message || "登録に失敗しました";

        if (data.errors) {
          if (data.errors.mail_address) {
            const mailError = data.errors.mail_address[0];
            if (mailError === "validation.unique") {
              errorMsg = "このメールアドレスは既に登録されています。";
            } else if (mailError === "validation.required") {
              errorMsg = "メールアドレスは必須です。";
            }
          }

          if (data.errors.password) {
            const passError = data.errors.password[0];
            if (passError === "validation.required") {
              errorMsg = "パスワードは必須です。";
            }
          }

        }

        setErrors("登録に失敗しました。");
      }
    } catch (error) {
      console.error("通信エラー", error);
      setErrors("通信エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout 
      headerContent={
        <TabButton 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      mainContent={
        <div className={styles["main-container"]}>
          <div className={styles["main-inner"]}>
            <div className={styles["main-header"]}>
              <h1>くらしナビ</h1>
            </div>

            <div className={styles["input-section"]}>
              <div className={styles["input-wrapper"]}>
                <span className={styles["icon"]}><Mail size={16} /></span>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value); 
                  }}
                  className={styles["input-field"]}
                />
              </div>

              <div className={styles["input-wrapper"]}>
                <span className={styles["icon"]}><Lock size={16} /></span>
                <input 
                  type={showPassword ? "text": "password"}
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className={styles["input-field"]}
                />
                <span
                  onClick={() => setShowPassword(prev => !prev)}
                  className={styles["eye-icon"]}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>

              <div className={styles["input-wrapper"]}>
                <span className={styles["icon"]}><Cake size={16} /></span>
                <YearSelect selectedYear={year} setSelectedYear={setYear}/>
              </div>

              <div className={styles["input-wrapper"]}>
                <span className={styles["icon"]}><Home size={16}/></span>
                <input 
                  type="text"
                  placeholder="住所（任意）"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                  }}
                  className={styles["input-field"]}
                />
              </div>

              <SubmitButton onClick={handleSubmit}/>

              {errors && (
                <div className={styles["error-container"]}>
                  <span className={styles["error-icon"]}><CircleAlert size={16} /></span>
                  <p>{errors}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      hideNavigation={true}
    />
  );
}

export default NewLog;