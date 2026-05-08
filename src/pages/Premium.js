import React from "react";

function Premium() {
  const BASE_URL = "https://taskmatrix-backend-wo86.onrender.com";

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      // =========================
      // CREATE ORDER
      // =========================
      const res = await fetch(
        `${BASE_URL}/api/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: 50000, // ₹500
          }),
        }
      );

      const data = await res.json();

      console.log("PAYMENT RESPONSE:", data);

      if (!data.success) {
        alert(data.message || "Order creation failed");
        return;
      }

      // =========================
      // RAZORPAY OPTIONS
      // =========================
      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "TaskMatrix",
        description: "Premium Upgrade",
        order_id: data.order.id,

        handler: async function (response) {
          alert("Payment Successful ✅");

          console.log("Payment Response:", response);

          // OPTIONAL: VERIFY PAYMENT
          try {
            await fetch(`${BASE_URL}/api/user/upgrade`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (err) {
            console.error(err);
          }

          window.location.href = "/success";
        },

        theme: {
          color: "#3399cc",
        },
      };

      // =========================
      // CHECK SDK
      // =========================
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      // =========================
      // OPEN PAYMENT WINDOW
      // =========================
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment failed");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        fontFamily: "Arial",
      }}
    >
      <h2>Upgrade to Premium 🚀</h2>

      <p>Unlock premium features for ₹500</p>

      <button
        onClick={handlePayment}
        style={{
          padding: "12px 25px",
          background: "gold",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          borderRadius: "8px",
          fontWeight: "bold",
        }}
      >
        Pay ₹500
      </button>
    </div>
  );
}

export default Premium;