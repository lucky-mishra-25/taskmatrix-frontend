import React, { useState } from "react";

function Premium() {
  const BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://taskmatrix-backend-wo86.onrender.com";

  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD RAZORPAY SCRIPT
  // =========================
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // =========================
  // PAYMENT HANDLER
  // =========================
  const handlePayment = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        setLoading(false);
        return;
      }

      // Load Razorpay SDK
      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        alert("Failed to load Razorpay SDK");
        setLoading(false);
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
            amount: 50000, // ₹500 in paise
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Order creation failed");
        setLoading(false);
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
          try {
            alert("Payment Successful ✅");

            // Upgrade user
            await fetch(`${BASE_URL}/api/user/upgrade`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            window.location.href = "/success";
          } catch (err) {
            console.error("Upgrade Error:", err);
          }
        },

        prefill: {
          name: "User",
          email: "",
          contact: "",
        },

        theme: {
          color: "#FFD700",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Payment Failed:", response.error);
        alert("Payment failed ❌ Try again");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upgrade to Premium 🚀</h2>

      <p>Unlock all premium features for ₹500</p>

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Pay ₹500"}
      </button>
    </div>
  );
}

// =========================
// STYLES (Mobile Friendly)
// =========================
const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
    fontFamily: "Arial",
    padding: "20px",
  },
  button: {
    padding: "12px 25px",
    background: "gold",
    border: "none",
    fontSize: "18px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
};

export default Premium;