import React from "react";

function Premium() {

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 50000 }), // ₹500 in paise
      });

      const data = await res.json();

      if (!data.success) {
        alert("Order creation failed");
        return;
      }

      const options = {
        key: data.key, // 🔥 from backend (NOT hardcoded)
        amount: data.order.amount,
        currency: "INR",
        name: "TaskMatrix",
        description: "Premium Upgrade",
        order_id: data.order.id,

        handler: function (response) {
          alert("Payment Successful ✅");

          console.log("Payment Response:", response);

          // OPTIONAL: call backend to mark premium
          fetch("http://localhost:5000/api/user/upgrade", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        },
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

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