import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/MyPages/UserInfo.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { Undo2 } from "lucide-react";

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

function UserInfo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("userinfo");
  const [currentView, setCurrentView] = useState("userinfo");
  const userId = sessionStorage.getItem("userId");

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

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId
          }
        });
        const data = await res.json();
        if (res.ok) {
          setUserData({
            birthYear: data.year_of_born,
            address: data.address
          });
        } else {
          console.error("ユーザー情報取得エラー:", data);
        }
      } catch (error) {
        console.error("通信エラー:", error);
      }
    };
    fetchUser();
  }, [userId]);

  const goBack = () => navigate("/mypage");

  const tabs = [{ id: "userinfo", label: "登録情報", icon: null }];
  const headerContent = (
    <TabButton
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );

  // 戻るボタンでメッセージリセット
  const handleBack = () => {
    setPasswordMessage("");
    setBirthYearMessage("");
    setAddressMessage("");
    setCurrentView("userinfo");
  };

  // パスワード更新
  const updatePassword = async () => {
    if (!tempCurrentPassword) { setPasswordError("現在のパスワードを入力してください"); return; }
    if (!tempNewPassword) { setPasswordError("新しいパスワードを入力してください"); return; }
    if (tempNewPassword !== tempNewPasswordConfirm) { setPasswordError("新しいパスワードが一致しません"); return; }
    const passwordRegex = /^.{8,16}$/;
    if (!passwordRegex.test(tempNewPassword)) { setPasswordError("パスワードは8文字以上16文字以内で入力してください"); return; }

    setPasswordError("");

    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
        body: JSON.stringify({ password: tempNewPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("パスワードを更新しました!");
        setTempCurrentPassword("");
        setTempNewPassword("");
        setTempNewPasswordConfirm("");
      } else {
        setPasswordError(data.message || "更新に失敗しました");
      }
    } catch (error) {
      console.error(error);
      setPasswordError("通信エラーが発生しました");
    }
  };

  // 生まれた年更新
  const updateBirthYear = async () => {
    if (!tempBirthYear) { setBirthYearError("生まれた年を選択してください"); return; }
    setBirthYearError("");
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
        body: JSON.stringify({ year_of_born: tempBirthYear })
      });
      const data = await res.json();
      if (res.ok) {
        setUserData({ ...userData, birthYear: tempBirthYear });
        setBirthYearMessage("生まれた年を更新しました");
      } else {
        setBirthYearError(data.message || "更新に失敗しました");
      }
    } catch (error) {
      console.error(error);
      setBirthYearError("通信エラーが発生しました");
    }
  };

  // 住所更新
  const updateAddress = async () => {
    if (!tempAddress) { setAddressError("住所を入力してください"); return; }
    if (tempAddress.length > 40) { setAddressError("住所は40文字以内で入力してください"); return; }
    setAddressError("");
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
        body: JSON.stringify({ address: tempAddress })
      });
      const data = await res.json();
      if (res.ok) {
        setUserData({ ...userData, address: tempAddress });
        setAddressMessage("住所を更新しました");
      } else {
        setAddressError(data.message || "更新に失敗しました");
      }
    } catch (error) {
      console.error(error);
      setAddressError("通信エラーが発生しました");
    }
  };

  let content;
  if (currentView === "userinfo") {
    content = (
      <>
        <p className={styles.p}>基本情報</p>
        <div className={styles.divider}></div>
        <ul className={styles.ul}>
          <li className={`${styles.li} ${styles.singleRow}`}>
            <span>パスワード</span>
            <button className={styles.button} onClick={() => { setTempCurrentPassword(""); setTempNewPassword(""); setTempNewPasswordConfirm(""); setPasswordError(""); setCurrentView("password"); }}>変更</button>
          </li>
          <li className={styles.li}>
            <span>生まれた年</span>
            <div className={styles.valueRow}>
              {userData.birthYear ? (<input type="text" value={`${userData.birthYear}年`} className={styles.input} readOnly />) : (<span className={styles.emptyText}>未入力</span>)}
              <button className={styles.button} onClick={() => { setTempBirthYear(userData.birthYear || ""); setBirthYearError(""); setCurrentView("birthYear"); }}>変更</button>
            </div>
          </li>
          <li className={styles.li}>
            <span>住所</span>
            <div className={styles.valueRow}>
              {userData.address ? (<input type="text" value={userData.address} className={styles.input} readOnly />) : (<span className={styles.emptyText}>未入力</span>)}
              <button className={styles.button} onClick={() => { setTempAddress(userData.address || ""); setAddressError(""); setCurrentView("address"); }}>変更</button>
            </div>
          </li>
        </ul>

        <button
          className={styles.withdrawButton}
          onClick={async () => {
            if (!window.confirm("本当に退会しますか？ この操作は取り消せません。")) return;

            if (!userId) {
              alert("ユーザーIDが取得できませんでした");
              return;
            }

            try {
              console.log("DEBUG userId:", userId);
              const res = await fetch("https://t08pushtest.mydns.jp/kakeibo/public/api/user", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "X-User-ID": userId,
                }
              });

              const data = await res.json().catch(() => ({}));

              if (res.ok) {
                alert("退会が完了しました");
                sessionStorage.clear();
                navigate("/");
              } else {
                alert("退会に失敗しました：" + (data.message || "不明なエラー"));
              }
            } catch (error) {
              console.error(error);
              alert("通信エラーが発生しました");
            }
          }}
        >
          退会する
        </button>

      </>
    );
  }

  if (currentView === "password") {
    content = (
      <div className={styles.passwordForm}>
        <h2 className={styles.p}>パスワード変更</h2>
        <div className={styles.divider}></div>
        <input type="password" placeholder="現在のパスワード" value={tempCurrentPassword} className={styles.inputLarge} onChange={(e) => { setTempCurrentPassword(e.target.value); setPasswordMessage(""); }} />
        <input type="password" placeholder="新しいパスワード" value={tempNewPassword} className={styles.inputLarge} onChange={(e) => { setTempNewPassword(e.target.value); setPasswordMessage(""); }} />
        <input type="password" placeholder="新しいパスワード（確認）" value={tempNewPasswordConfirm} className={styles.inputLarge} onChange={(e) => { setTempNewPasswordConfirm(e.target.value); setPasswordMessage(""); }} />
        {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
        {passwordMessage && <div className={styles.successMessage}>{passwordMessage}</div>}
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
          {currentView === "userinfo" && (
            <button className={styles.modoru} onClick={goBack}><Undo2 /></button>
          )}
          <div className={`${styles["flex-userinfo"]} ${currentView === "userinfo" ? styles.userinfoMode : styles.passwordMode}`}>
            {content}
          </div>
        </div>
      }
    />
  );
}

export default UserInfo;