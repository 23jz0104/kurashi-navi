import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import styles from "../../styles/Notifications/PriceInfo.module.css";
import { Undo2 } from "lucide-react";

function PriceInfo() {
    const { productName } = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState("recommend"); 

    useEffect(() => {
        const fetchRakutenItems = async () => {
            try {
                const appId = "1031715228971555413";
                let allItems = [];
                let page = 1;
                let totalPages = 1;

                do {
                    const response = await fetch(
                        `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601?applicationId=${appId}&keyword=${encodeURIComponent(productName)}&hits=30&page=${page}`
                    );
                    const data = await response.json();
                    if (data.Items) {
                        allItems = allItems.concat(data.Items.map(i => i.Item));
                    }
                    totalPages = data.pageCount || 1;
                    page++;
                } while (page <= totalPages);

                setItems(allItems);
            } catch (error) {
                console.error("APIエラー:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRakutenItems();
    }, [productName]);

    // 表示順に応じてソート
    const sortedItems = [...items].sort((a, b) => {
        if (sortOrder === "cheap") {
            return a.itemPrice - b.itemPrice; // 安い順
        } else if (sortOrder === "recommend") {
            return b.reviewAverage - a.reviewAverage; // おすすめ順（レビュー平均が高い順）
        } else {
            return 0;
        }
    }).slice(0, 5); // 上位5件だけ表示

    const headerContent = <h2>「{productName}」の価格情報</h2>;

    const mainContent = (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <Undo2 />
            </button>

            <div className={styles.sortButtons}>
                <button
                    className={sortOrder === "recommend" ? styles.active : ""}
                    onClick={() => setSortOrder("recommend")}
                >
                    おすすめ順
                </button>
                <button
                    className={sortOrder === "cheap" ? styles.active : ""}
                    onClick={() => setSortOrder("cheap")}
                >
                    安い順
                </button>
            </div>

            {loading ? (
                <p>読み込み中...</p>
            ) : sortedItems.length === 0 ? (
                <p>商品が見つかりませんでした。</p>
            ) : (
                <ul className={styles.list}>
                    {sortedItems.map((item, index) => (
                        <li key={index} className={styles.itemCard}>
                            <img src={item.mediumImageUrls[0]?.imageUrl} alt={item.itemName} />
                            <div>
                                <p className={styles.itemName}>{item.itemName}</p>
                                <p className={styles.itemPrice}>{item.itemPrice}円</p>
                                <p className={styles.shopName}>販売店：{item.shopName}</p>
                                <a href={item.itemUrl} target="_blank" rel="noopener noreferrer">
                                    商品ページへ
                                </a>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default PriceInfo;
