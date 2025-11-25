import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../../styles/Notifications/PriceInfo.module.css";
import { Undo2, ArrowRightLeft } from "lucide-react";

export default function PriceInfo() {
  const { productName } = useParams();
  const navigate = useNavigate();

  const [site, setSite] = useState("rakuten");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 商品名 or サイト切替で再取得
  useEffect(() => {
    if (!productName) return;
    fetchItems();
  }, [site, productName]);

  const fetchItems = async () => {
    setLoading(true);
    setItems([]);
    try {
      // ← ここをプロキシ経由に変更
      const url =
        site === "rakuten"
          ? `/api/rakuten?keyword=${encodeURIComponent(productName)}&hits=5`
          : `/api/yahoo/search?query=${encodeURIComponent(productName)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      // 楽天／Yahoo で共通フォーマットに変換
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
        const hits = data.hits || [];
        parsedItems = hits.map((item, idx) => ({
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

  return (
    <div className={styles.container}>
      {/* 戻るボタン */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <Undo2 />
      </button>

      <h2>「{productName}」の価格情報</h2>

      {/* 楽天 / ヤフー 切替 */}
      <div className={styles.switchContainer}>
        <span className={site === "rakuten" ? styles.activeLabel : ""}>楽天</span>

        <button
          className={styles.switchIconBtn}
          onClick={() => setSite(site === "rakuten" ? "yahoo" : "rakuten")}
        >
          <ArrowRightLeft size={24} />
        </button>

        <span className={site === "yahoo" ? styles.activeLabel : ""}>ヤフー</span>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : items.length === 0 ? (
        <p>商品が見つかりませんでした。</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.itemCard}>
              {item.image && <img src={item.image} alt={item.name} />}
              <div>
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
      )}
    </div>
  );
}
