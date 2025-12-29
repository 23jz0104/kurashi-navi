import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/MyPages/UserInfo.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";

// 年選択
function YearSelect({ selectedYear, setSelectedYear }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: `${year}年` };
  });

  const selected = options.find(opt => opt.value === selectedYear);

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
        <span
          className={`${styles.selectedText} ${
            !selected ? styles.unselected : ""
          }`}
        >
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
              onClick={() => {
                setSelectedYear(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// メインページ
function UserInfo() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const [activeTab] = useState("userinfo");
  const [currentView, setCurrentView] = useState("userinfo");

  const [userData, setUserData] = useState({
    birthYear: null,
    address: null,
  });

  const [tempCurrentPassword, setTempCurrentPassword] = useState("");
  const [tempNewPassword, setTempNewPassword] = useState("");
  const [tempNewPasswordConfirm, setTempNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [tempBirthYear, setTempBirthYear] = useState("");
  const [birthYearError, setBirthYearError] = useState("");
  const [birthYearMessage, setBirthYearMessage] = useState("");

  const [tempAddress, setTempAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressMessage, setAddressMessage] = useState("");

  /* ユーザー取得 */
  useEffect(() => {
    if (!userId) return;

    fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUserData({
          birthYear: data.year_of_born,
          address: data.address,
        });
      })
      .catch(console.error);
  }, [userId]);

  const tabs = [{ id: "userinfo", label: "登録情報" }];
  const headerContent = (
    <TabButton tabs={tabs} activeTab={activeTab} onTabChange={() => {}} />
  );

  const handleBack = () => {
    setPasswordMessage("");
    setBirthYearMessage("");
    setAddressMessage("");
    setCurrentView("userinfo");
  };

  // 更新処理
  const updatePassword = async () => {
    if (!tempNewPassword || tempNewPassword !== tempNewPasswordConfirm) {
      setPasswordError("パスワードが一致しません");
      return;
    }

    const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
      },
      body: JSON.stringify({ password: tempNewPassword }),
    });

    if (res.ok) {
      setPasswordMessage("パスワードを更新しました");
      setTempCurrentPassword("");
      setTempNewPassword("");
      setTempNewPasswordConfirm("");
    }
  };

  const updateBirthYear = async () => {
    const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
      },
      body: JSON.stringify({ year_of_born: tempBirthYear }),
    });

    if (res.ok) {
      setUserData({ ...userData, birthYear: tempBirthYear });
      setBirthYearMessage("更新しました");
    }
  };

  const updateAddress = async () => {
    const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
      },
      body: JSON.stringify({ address: tempAddress }),
    });

    if (res.ok) {
      setUserData({ ...userData, address: tempAddress });
      setAddressMessage("更新しました");
    }
  };

  // 表示切り替え
  let content;

  if (currentView === "userinfo") {
    content = (
      <>
        <p className={styles.p}>基本情報</p>
        <div className={styles.divider} />

        <ul className={styles.ul}>
          <li className={styles.li}>
            <span>パスワード</span>
            <button className={styles.button} onClick={() => setCurrentView("password")}>変更</button>
          </li>

          <li className={styles.li}>
            <span>生まれた年</span>
            <button className={styles.button} onClick={() => setCurrentView("birthYear")}>変更</button>
          </li>

          <li className={styles.li}>
            <span>住所</span>
            <button className={styles.button} onClick={() => setCurrentView("address")}>変更</button>
          </li>
        </ul>
      </>
    );
  }

  if (currentView === "password") {
    content = (
      <div className={styles.passwordForm}>
        <p className={styles.p}>パスワード変更</p>
        <div className={styles.divider}></div>
        <input type="password" placeholder="現在のパスワード" value={tempCurrentPassword} className={styles.inputLarge} onChange={(e) => { setTempCurrentPassword(e.target.value); setPasswordMessage(""); }} />
        <input type="password" placeholder="新しいパスワード" value={tempNewPassword} className={styles.inputLarge} onChange={(e) => { setTempNewPassword(e.target.value); setPasswordMessage(""); }} />
        <input type="password" placeholder="新しいパスワード（確認）" value={tempNewPasswordConfirm} className={styles.inputLarge} onChange={(e) => { setTempNewPasswordConfirm(e.target.value); setPasswordMessage(""); }} />
        {passwordError && <p>{passwordError}</p>}
        {passwordMessage && <p>{passwordMessage}</p>}
        <div className={styles.passwordButtons}>
          <button className={styles.updateButton} onClick={updatePassword}>更新する</button>
          <button className={styles.passwordBack} onClick={handleBack}>戻る</button>
        </div>
      </div>
    );
  }

  if (currentView === "birthYear") {
    content = (
      <div className={styles.changeForm}>
        <p className={styles.p}>生まれた年を変更</p>
        <div className={styles.divider}></div>
        <YearSelect selectedYear={tempBirthYear} setSelectedYear={setTempBirthYear} />
        {birthYearError && <div className={styles.errorMessage}>{birthYearError}</div>}
        {birthYearMessage && <div className={styles.successMessage}>{birthYearMessage}</div>}
        <div className={styles.passwordButtons}>
          <button className={styles.updateButton} onClick={updateBirthYear}>更新する</button>
          <button className={styles.passwordBack} onClick={handleBack}>戻る</button>
        </div>
      </div>
    );
  }

  if (currentView === "address") {
    content = (
      <div className={styles.changeForm}>
        <p className={styles.p}>住所を変更</p>
        <div className={styles.divider}></div>
        <input type="text" value={tempAddress} onChange={(e) => { const val = e.target.value; if (val.length <= 30) setTempAddress(val); if (val.length <= 30) setAddressError(""); else setAddressError("住所は30文字以内です"); }} className={styles.inputLarge} placeholder="新しい住所を入力" />
        {addressError && <div className={styles.errorMessage}>{addressError}</div>}
        {addressMessage && <div className={styles.successMessage}>{addressMessage}</div>}
        <div className={styles.passwordButtons}>
          <button className={styles.updateButton} onClick={updateAddress}>更新する</button>
          <button className={styles.passwordBack} onClick={handleBack}>戻る</button>
        </div>
      </div>
    );
  }

  return (
    <Layout
      headerContent={headerContent}
      mainContent={
        <div className={styles["flex-list"]}>
          <div className={styles["flex-userinfo"]}>{content}</div>
        </div>
      }
    />
  );
}

export default UserInfo;
