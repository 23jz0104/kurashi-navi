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

  const [userData, setUserData] = useState({
    birthYear: null,
    address: null,
  });

  // 一時入力用ステート
  const [tempCurrentPassword, setTempCurrentPassword] = useState("");
  const [tempNewPassword, setTempNewPassword] = useState("");
  const [tempNewPasswordConfirm, setTempNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [tempBirthYear, setTempBirthYear] = useState("");
  const [birthYearError, setBirthYearError] = useState("");

  const [tempAddress, setTempAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const goBack = () => navigate("/mypage");

  const tabs = [{ id: "userinfo", label: "登録情報", icon: null }];
  const headerContent = (
    <TabButton
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );

  let content;

  /* ▼ メイン画面 */
  if (currentView === "userinfo") {
    content = (
      <>
        <p className={styles.p}>基本情報</p>
        <div className={styles.divider}></div>

        <ul className={styles.ul}>
          {/* パスワード */}
          <li className={`${styles.li} ${styles.singleRow}`}>
            <span>パスワード</span>
            <button
              className={styles.button}
              onClick={() => {
                // 入室時にリセット
                setTempCurrentPassword("");
                setTempNewPassword("");
                setTempNewPasswordConfirm("");
                setPasswordError("");
                setCurrentView("password");
              }}
            >
              変更
            </button>
          </li>

          {/* 生まれた年 */}
          <li className={styles.li}>
            <span>生まれた年</span>
            <div className={styles.valueRow}>
              {userData.birthYear ? (
                <input
                  type="text"
                  value={`${userData.birthYear}年`}
                  className={styles.input}
                  readOnly
                />
              ) : (
                <span className={styles.emptyText}>未入力</span>
              )}
              <button
                className={styles.button}
                onClick={() => {
                  setTempBirthYear(userData.birthYear || "");
                  setBirthYearError("");
                  setCurrentView("birthYear");
                }}
              >
                変更
              </button>
            </div>
          </li>

          {/* 住所 */}
          <li className={styles.li}>
            <span>住所</span>
            <div className={styles.valueRow}>
              {userData.address ? (
                <input type="text" value={userData.address} className={styles.input} readOnly />
              ) : (
                <span className={styles.emptyText}>未入力</span>
              )}
              <button
                className={styles.button}
                onClick={() => {
                  setTempAddress("");
                  setAddressError("");
                  setCurrentView("address");
                }}
              >
                変更
              </button>
            </div>
          </li>
        </ul>
      </>
    );
  }

  /* ▼ パスワード変更画面 */
  if (currentView === "password") {
    content = (
      <div className={styles.passwordForm}>
        <h2 className={styles.p}>パスワード変更</h2>
        <div className={styles.divider}></div>

        <input
          type="password"
          placeholder="現在のパスワード"
          value={tempCurrentPassword}
          className={styles.inputLarge}
          onChange={(e) => setTempCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="新しいパスワード"
          value={tempNewPassword}
          className={styles.inputLarge}
          onChange={(e) => setTempNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="新しいパスワード（確認）"
          value={tempNewPasswordConfirm}
          className={styles.inputLarge}
          onChange={(e) => setTempNewPasswordConfirm(e.target.value)}
        />

        {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}

        <div className={styles.passwordButtons}>
          <button
            className={styles.updateButton}
            onClick={() => {
              if (!tempCurrentPassword) {
                setPasswordError("現在のパスワードを入力してください");
                return;
              }
              if (!tempNewPassword) {
                setPasswordError("新しいパスワードを入力してください");
                return;
              }
              if (tempNewPassword !== tempNewPasswordConfirm) {
                setPasswordError("新しいパスワードが一致しません");
                return;
              }
              setPasswordError("");
              // 更新処理（ここにAPI連携など）
              setCurrentView("userinfo");
            }}
          >
            更新する
          </button>
          <button
            className={styles.passwordBack}
            onClick={() => setCurrentView("userinfo")}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  /* ▼ 生まれた年変更画面 */
  if (currentView === "birthYear") {
    content = (
      <div className={styles.changeForm}>
        <p className={styles.p}>生まれた年を変更</p>
        <div className={styles.divider}></div>

        <YearSelect
          selectedYear={tempBirthYear}
          setSelectedYear={(year) => setTempBirthYear(year)}
        />

        {birthYearError && <div className={styles.errorMessage}>{birthYearError}</div>}

        <div className={styles.passwordButtons}>
          <button
            className={styles.updateButton}
            onClick={() => {
              if (!tempBirthYear) {
                setBirthYearError("生まれた年を選択してください");
                return;
              }
              setUserData({ ...userData, birthYear: tempBirthYear });
              setCurrentView("userinfo");
            }}
          >
            更新する
          </button>
          <button
            className={styles.passwordBack}
            onClick={() => setCurrentView("userinfo")}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  /* ▼ 住所変更画面 */
  if (currentView === "address") {
    content = (
      <div className={styles.changeForm}>
        <p className={styles.p}>住所を変更</p>
        <div className={styles.divider}></div>

        <div className={styles.currentAddress}>
          現在の住所: {userData.address || "未入力"}
        </div>

        <input
          type="text"
          value={tempAddress}
          onChange={(e) => {
            const val = e.target.value;
            if (val.length <= 30) setTempAddress(val);
            else setAddressError("住所は30文字以内で入力してください");
            if (val.length <= 30) setAddressError(""); // 文字数内ならエラー消す
          }}
          className={styles.inputLarge}
          placeholder="新しい住所を入力"
        />

        {/* エラーメッセージ表示 */}
        {addressError && <div className={styles.errorMessage}>{addressError}</div>}

        <div className={styles.passwordButtons}>
          <button
            className={styles.updateButton}
            onClick={() => {
              if (!tempAddress) {
                setAddressError("住所を入力してください");
                return;
              }
              setUserData({ ...userData, address: tempAddress });
              setCurrentView("userinfo");
            }}
          >
            更新する
          </button>
          <button
            className={styles.passwordBack}
            onClick={() => setCurrentView("userinfo")}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const mainContent = (
    <div className={styles["flex-list"]}>
      {currentView === "userinfo" && (
        <button className={styles.modoru} onClick={goBack}>
          <Undo2 />
        </button>
      )}

      <div
        className={`${styles["flex-userinfo"]} ${currentView === "userinfo"
          ? styles.userinfoMode
          : styles.passwordMode
          }`}
      >
        {content}

        {currentView === "userinfo" && (
          <button className={styles.withdraw}>退会する</button>
        )}
      </div>
    </div>
  );

  return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default UserInfo;
