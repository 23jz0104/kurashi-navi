import React from "react";
import "../../src/index.css"
import "../styles/DataInput.css"

const DataInput = () => {
  return (
    <div className="body">
      <header>
        <div className="inner-header">
          <div>
            <a href="#">支出</a>
          </div>
          <div>
            <a href="#">収入</a>
          </div>
        </div>
      </header>

      <form>
        <div className="date-area">
          <input type="date"/>
        </div>

        <div className="memo-price-area">
          <div>
            <p>メモ</p>
            <input type="text" placeholder="未入力" />
          </div>
          <div>
            <p>金額</p>
            <input type="number" />
          </div>
        </div>

        <div className="category-area">
          <p>カテゴリ</p>
          <div className="categories">
            <div className="category1">
              <img src="../../public/kurashi-navi.png" alt="" />
              <p>くらしナビ</p>
            </div>
            <div className="category2">
              <img src="../../public/kurashi-navi.png" alt="" />
              <p>くらしナビ</p>
            </div>
          </div>
        </div>

        <div className="button">
          <button type="submit">追加</button>
        </div>
      </form>

      <footer>
        <div className="inner-footer">
          <div>
            <div><a href="#">履歴</a></div>
          </div>

          <div>
            <div><a href="#">予算</a></div>
          </div>
          <div>

            <div><a href="#">通知</a></div>
          </div>
          <div>

            <div><a href="#">マイページ</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DataInput;