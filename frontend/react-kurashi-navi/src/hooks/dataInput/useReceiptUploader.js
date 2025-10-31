export const useReceiptUploader = () => {
  const uploadReceipt = async (receipt) => {
    const formattedItems = receipt.items.map(item => {
        const { discount, ...restItem } = item;

        const finalPrice = item.price - discount;

        return {
          ...restItem,
          price: finalPrice,
        };
      });

      const formattedReceipt = {
        ...receipt,
        items: formattedItems,
      };
    try {
      const response = await fetch("https://example.com/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedReceipt),
      });

      if(!response.ok) {
        //えらー
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
    } finally {

    }
  };

  return { uploadReceipt };
};