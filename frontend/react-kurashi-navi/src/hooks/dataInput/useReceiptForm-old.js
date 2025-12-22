import { useEffect, useState } from "react";

export const useReceiptForm = (initialReceipt = {
  shop_name: "",
  shop_address: "",
  purchase_day: new Date().toISOString().split("T")[0],
  products: [],
  total_amount: "0",
}) => {
  const [receipt, setReceipt] = useState(initialReceipt);

  const [totalAmount, setTotalAmount] = useState(0);
  const [tax, setTax] = useState({}); // ← 多税率なのでオブジェクトに変更

  useEffect(() => {
    if (!receipt) return;

    // 商品の小計（税抜）
    const subTotal = receipt.products.reduce((sum, item) => {
      const price = item.product_price;
      const qty = item.quantity;
      const discount = item.discount || 0;
      return sum + price * qty - discount;
    }, 0);

    // 税率ごとに仕分けする
    const taxByRate = {};

    receipt.products.forEach((item) => {
      const rate = item.tax_rate || 0; // ← 商品の tax_rate
      const price = item.product_price * item.quantity - (item.discount ?? 0);

      if (!taxByRate[rate]) taxByRate[rate] = 0;

      taxByRate[rate] += price * (rate / 100);
    });

    // 小数点切り捨て
    Object.keys(taxByRate).forEach((rate) => {
      taxByRate[rate] = Math.floor(taxByRate[rate]);
    });

    const totalTax = Object.values(taxByRate).reduce((a, b) => a + b, 0);

    setTotalAmount(subTotal);

    const tax_details = {
      tax_8_percent: taxByRate[8] || 0,
      tax_10_percent: taxByRate[10] || 0,
    };

    setTax(taxByRate);

    // 合計金額（税抜 + 税額合計）
    setReceipt((prev) => ({
      ...prev,
      total_amount: subTotal + totalTax,
      tax_details,
    }));
  }, [receipt.products]);

  // ---------- 操作関数 ----------
  const addItem = (category_id, product_name, product_price, quantity, discount, tax_rate) => {
    const newItem = {
      category_id,
      product_name,
      product_price,
      quantity,
      discount,
      tax_rate,
    };

    setReceipt((prev) => ({
      ...prev,
      products: [...prev.products, newItem],
    }));
  };

  const updateItem = (index, updates) => {
    setReceipt((prev) => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], ...updates };
      return { ...prev, products: newProducts };
    });
  };

  const deleteItem = (index) => {
    setReceipt((prev) => {
      const newProducts = [...prev.products];
      newProducts.splice(index, 1);
      return { ...prev, products: newProducts };
    });
  };

  const updateReceiptInfo = (field, value) => {
    setReceipt((prev) => ({ ...prev, [field]: value }));
  };

  return { receipt, totalAmount, tax, addItem, updateItem, deleteItem, updateReceiptInfo };
};