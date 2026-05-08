import React from "react";

function Premium() {
  const BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://taskmatrix-backend-wo86.onrender.com";

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const res = await fetch(`${BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 50000 }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order creation failed");
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "TaskMatrix",
        description: "Premium Upgrade",
        order_id: data.order.id,

        handler: function (response) {
          alert("Payment Successful ✅");

          fetch(`${BASE_URL}/api/user/upgrade`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Upgrade to Premium 🚀</h2>

      <button
        onClick={handlePayment}
        style={{
          padding: "10px 20px",
          background: "gold",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Pay ₹500
      </button>
    </div>
  );
}

export default Premium;