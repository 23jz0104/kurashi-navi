import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../styles/Notifications/PriceInfo.module.css";
import Layout from "../../components/common/Layout";
import { ArrowRightLeft } from "lucide-react";


const getBaseUrl = () => {
  return window.location.origin + "/kakeibo/public";
};

export default function PriceInfo() {
  const { productName } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState("rakuten");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const baseUrl = getBaseUrl();

  useEffect(() => {
    if (!productName) return;
    fetchItems();
  }, [site, productName]);

  const fetchItems = async () => {
    setLoading(true);
    setItems([]);
    setVisibleCount(10);

    try {
      const apiQuery =
        site === "rakuten"
          ? `api/rakuten?keyword=${encodeURIComponent(productName)}&hits=30`
          : `api/yahoo/search?query=${encodeURIComponent(productName)}&hits=30`;

      const url = `${baseUrl}/${apiQuery}`;
      // console.log(url);      
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      let parsedItems = [];
      if (site === "rakuten") {
        parsedItems = (data.Items || []).map((itemWrapper, idx) => {
          const item = itemWrapper.Item;
          return {
            id: `rakuten-${item.itemCode || idx}`,
            name: item.itemName,
            price: item.itemPrice,
            shop: item.shopName,
            url: item.itemUrl,
            image: item.mediumImageUrls?.[0]?.imageUrl || ""
          };
        });
      } else {
        parsedItems = (data.hits || []).map((item, idx) => ({
          id: `yahoo-${item.code || idx}`,
          name: item.name,
          price: parseInt(item.price, 10) || 0,
          shop: item.seller?.name || "",
          url: item.url,
          image: item.image?.medium || ""
        }));
      }

      setItems(parsedItems);
    } catch (err) {
      console.error("APIエラー:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  return (
    <Layout 
      headerContent={<h2>参考価格</h2>}
      mainContent={
        <div className={`main-container ${styles.container}`}>
        <h2>「{productName}」の価格情報</h2>

        <div className={styles.switchContainer}>
          <button
            className={`${styles.switchBtn} ${site === "rakuten" ? styles.activeLabel : ""}`}
            onClick={() => setSite("rakuten")}>
            楽天
          </button>
          <span className={styles.switchIcon}>
            <ArrowRightLeft size={24} />
          </span>
          <button
            className={`${styles.switchBtn} ${site === "yahoo" ? styles.activeLabel : ""}`}
            onClick={() => setSite("yahoo")}>
            ヤフー
          </button>
        </div>

        {loading ? (
          <p>読み込み中...</p>
        ) : 
        items.length === 0 ? (
          <p>商品が見つかりませんでした。</p>
        ) : 
        (
          <>
            <ul className={styles.list}>
              {items.slice(0, visibleCount).map((item) => (
                <li key={item.id} className={styles.itemCard}>
                  {item.image && <img src={item.image} alt={item.name} />}
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemPrice}>{item.price.toLocaleString()} 円</p>
                    <p className={styles.shopName}>販売店：{item.shop}</p>
                    <a
                      className={styles.itemLink}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      商品ページへ
                    </a>
                  </div>
                </li>
              ))}
            </ul>
            {visibleCount < items.length && (
              <button className={styles.moreBtn} onClick={loadMore}>
                もっと見る
              </button>
            )}
          </>
        )}
        </div>
      }
    />
  );
}
