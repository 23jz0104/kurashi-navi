import { useEffect, useState } from "react";

export const useReceiptForm = (initialReceipt) => {
  const [receipt, setReceipt] = useState(initialReceipt);
  const [totalAmount, setTotalAmount] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    if(!receipt) return;

    const subTotals = receipt.products.reduce((sum, item) => {
      const product_price = item.product_price;
      const quantity = item.quantity;
      const discount = item.discount;
      return sum + (product_price * quantity) - discount;
    }, 0);

    setTotalAmount(subTotals);
    setTax(Math.floor(subTotals * (receipt.taxRate / 100)));
  }, [receipt.products, receipt.taxRate]);

  const addItem = (category_id, product_name, product_price, quantity, discount) => {
    const newItem = {category_id, product_name, product_price, quantity, discount};

    setReceipt(prev => ({
      ...prev,
      products: [...prev.products, newItem],
    }));
  };

  const updateItem = (index, updates) => {
    setReceipt(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], ...updates };
      return { ...prev, products: newProducts };
    });
  };

  const deleteItem = (index) => {
    setReceipt(prev => {
      const newProducts = [...prev.products];
      newProducts.splice(index, 1);
      return { ...prev, products: newProducts};
    });
  };

  const updateReceiptInfo = (field, value) => {
    setReceipt(prev => ({ ...prev, [field]: value}));
  };
  
  return { receipt, totalAmount, tax, addItem, updateItem, deleteItem, updateReceiptInfo };
};