import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/MyPages/UserInfo.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton"; 
import { Undo2 } from 'lucide-react';

function UserInfo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("userinfo"); 

  const goBack = () => navigate("/mypage");

  const tabs = [{ id: "userinfo", label: "登録情報", icon: null }];
  const headerContent = <TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />;

  const mainContent = (
    <div className={styles['flex-list']}>
      <button className={styles.modoru} onClick={goBack}><Undo2 /></button>
      <div className={styles['flex-userinfo']}>
        <p className={styles.p}>基本情報</p>
        <div className={styles.divider}></div>
        <ul className={styles.ul}>
          <li className={styles.li}>名前 <button className={styles.button}>変更</button></li>
          <li className={styles.li}>生年月日 <button className={styles.button}>変更</button></li>
          <li className={styles.li}>住所 <button className={styles.button}>変更</button></li>
        </ul>
      </div>
      <button className={styles.withdraw}>退会する</button>
    </div>
  );

  return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default UserInfo;
