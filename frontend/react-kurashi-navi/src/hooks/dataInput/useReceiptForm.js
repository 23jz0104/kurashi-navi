import { useMemo, useState } from "react";

const DEFAULT_RECEIPT = {
  shop_name: "",
  shop_address: "",
  purchase_day: new Date().toISOString().split("T")[0],
  products: [],
};

export const useReceiptForm = (
  initialReceipt = DEFAULT_RECEIPT,
  initialPriceMode = "exclusive"
) => {
  const [receipt, setReceipt] = useState({
    ...DEFAULT_RECEIPT,
    ...initialReceipt,
    products: Array.isArray(initialReceipt.products)
      ? initialReceipt.products
      : [],
  });

  const [priceMode, setPriceMode] = useState(initialPriceMode);

  const calculated = useMemo(() => {
    const products = receipt.products ?? [];

    let grossTotal = 0; // 税込合計
    let netTotal = 0;   // 税抜合計
    const taxByRate = {};
    const totalByRate = {};

    products.forEach((item) => {
      const price = Number(item.product_price) || 0;
      const qty = Number(item.quantity) || 0;
      const discount = Number(item.discount) || 0;
      const rate = Number(item.tax_rate) || 0;

      if (price <= 0 || qty <= 0) return;

      const amount = price * qty - discount;

      if (!totalByRate[rate]) totalByRate[rate] = 0;
      totalByRate[rate] += amount;
    });

    Object.entries(totalByRate).forEach(([rateStr, amount]) => {
      const rate = Number(rateStr);

      if (priceMode === "inclusive") {
        const tax = Math.floor((amount * rate) / (100 + rate));
        const net = amount - tax;

        grossTotal += amount;
        netTotal += net;
        taxByRate[rate] = tax;
      } else {
        // 税抜
        const tax = Math.floor(amount * (rate / 100));

        netTotal += amount;
        grossTotal += amount + tax;
        taxByRate[rate] = tax;
      }
    });

    return {
      subTotal: netTotal,
      taxByRate,
      totalTax: Object.values(taxByRate).reduce((a, b) => a + b, 0),
      totalAmount: grossTotal,
    };
  }, [receipt.products, priceMode]);

  const addItem = (item) => {
    setReceipt((prev) => ({
      ...prev,
      products: [...prev.products, item],
    }));
  };

  const updateItem = (index, updates) => {
    setReceipt((prev) => {
      const products = [...prev.products];
      products[index] = { ...products[index], ...updates };
      return { ...prev, products };
    });
  };

  const deleteItem = (index) => {
    setReceipt((prev) => {
      const products = [...prev.products];
      products.splice(index, 1);
      return { ...prev, products };
    });
  };

  const updateReceiptInfo = (field, value) => {
    setReceipt((prev) => ({
      ...prev,
      [field]: value ?? "",
    }));
  };

  return {
    receipt,
    setReceipt,
    priceMode,
    setPriceMode,
    calculated,
    addItem,
    updateItem,
    deleteItem,
    updateReceiptInfo,
  };
};
