import { useEffect, useState } from "react";

export const useReceiptForm = (initialReceipt) => {
  const [receipt, setReceipt] = useState(initialReceipt);
  const [totalAmount, setTotalAmount] = useState(0);
  const [tax, setTax] = useState(0);

  useEffect(() => {
    if(!receipt) return;

    const subTotals = receipt.items.reduce((sum, item) => {
      const price = item.price;
      const quantity = item.quantity;
      const discount = item.discount;
      return sum + (price * quantity) - discount;
    }, 0);

    setTotalAmount(subTotals);
    setTax(Math.floor(subTotals * (receipt.taxRate / 100)));
  }, [receipt.items, receipt.taxRate]);

  const addItem = (categoryId, productName, price, quantity, discount) => {
    const newItem = {categoryId, productName, price, quantity, discount};

    setReceipt(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (index, updates) => {
    setReceipt(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], ...updates };
      return { ...prev, items: newItems };
    });
  };

  const deleteItem = (index) => {
    setReceipt(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems};
    });
  };

  const updateReceiptInfo = (field, value) => {
    setReceipt(prev => ({ ...prev, [field]: value}));
  };
  
  return { receipt, totalAmount, tax, addItem, updateItem, deleteItem, updateReceiptInfo };
};