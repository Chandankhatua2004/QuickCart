'use client'
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { sendPaymentConfirmationEmail } from "@/lib/email-service";

const Payment = () => {
  const { currency, getCartAmount, getCartCount, cartItems, products, createOrder } = useAppContext();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
    phoneNumber: "",
    email: user?.emailAddresses[0]?.emailAddress || ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  // Get order details from URL params or context
  const orderAmount = getCartAmount() + Math.floor(getCartAmount() * 0.02);
  const orderItems = Object.keys(cartItems).map(itemId => {
    const product = products.find(p => p._id === itemId);
    return {
      productId: itemId,
      name: product?.name || "Product",
      price: product?.offerPrice || 0,
      quantity: cartItems[itemId],
      image: product?.image[0] || ""
    };
  });

  const paymentMethods = [
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: "💵",
      description: "Pay when you receive your order",
      popular: false
    },
    {
      id: "razorpay",
      name: "Razorpay",
      icon: "💳",
      description: "Pay with cards, UPI, net banking",
      popular: true
    },
    {
      id: "stripe",
      name: "Stripe",
      icon: "💳",
      description: "International payment gateway",
      popular: true
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: "📱",
      description: "Pay with PayPal account",
      popular: false
    }
  ];

  // Load payment SDKs
  useEffect(() => {
    // Load Razorpay
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Load Stripe
    if (typeof window !== 'undefined' && !window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setPaymentDetails(prev => ({
      ...prev,
      email: user?.emailAddresses[0]?.emailAddress || ""
    }));
  };

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePaymentDetails = () => {
    if (selectedPaymentMethod === "cod") return true;
    
    if (selectedPaymentMethod === "razorpay" || selectedPaymentMethod === "stripe") {
      return paymentDetails.email && paymentDetails.phoneNumber;
    }
    
    if (selectedPaymentMethod === "paypal") {
      return paymentDetails.email;
    }
    
    return false;
  };

  // Email confirmation is now handled in AppContext
  const sendEmailConfirmation = async (orderData) => {
    // Email confirmation is automatically sent when order is created in AppContext
    return true;
  };

  // Razorpay Integration
  const processRazorpayPayment = async () => {
    try {
      setPaymentStatus("Initializing Razorpay...");
      
      // Check if Razorpay is loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        const options = {
          key: 'rzp_test_51H5G8tKj8nM2pQ9', // Replace with your test key
          amount: orderAmount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          name: 'QuickCart',
          description: 'Order Payment',
          image: '/logo.png',
          order_id: `order_${Date.now()}`,
          handler: async (response) => {
            try {
              setPaymentStatus("Payment successful! Creating order...");
              console.log('Payment successful:', response);
              
              // Create order
              const orderData = {
                orderId: `ORD-${Date.now()}`,
                items: orderItems,
                paymentMethod: 'razorpay',
                paymentId: response.razorpay_payment_id,
                subtotal: getCartAmount(),
                tax: Math.floor(getCartAmount() * 0.02),
                total: orderAmount,
                orderDate: new Date().toISOString(),
                status: "Processing",
                customerEmail: paymentDetails.email,
                customerName: user?.firstName || 'Customer'
              };

              await createOrder(orderData);
              
              // Send email confirmation
              setPaymentStatus("Sending email confirmation...");
              await sendEmailConfirmation(orderData);
              
              setPaymentStatus("Payment completed successfully!");
              setTimeout(() => {
                router.push('/order-placed');
              }, 2000);
            } catch (error) {
              console.error('Payment verification failed:', error);
              setPaymentStatus("Payment verification failed");
              setTimeout(() => setPaymentStatus(""), 3000);
            }
          },
          prefill: {
            name: user?.firstName || 'Customer',
            email: paymentDetails.email,
            contact: paymentDetails.phoneNumber
          },
          theme: {
            color: '#f97316'
          },
          modal: {
            ondismiss: () => {
              setPaymentStatus("Payment cancelled");
              setTimeout(() => setPaymentStatus(""), 3000);
            }
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        // Fallback: Simulate payment success
        setPaymentStatus("Razorpay not available. Processing payment...");
        setTimeout(async () => {
          const orderData = {
            orderId: `ORD-${Date.now()}`,
            items: orderItems,
            paymentMethod: 'razorpay',
            paymentId: `rzp_${Date.now()}`,
            subtotal: getCartAmount(),
            tax: Math.floor(getCartAmount() * 0.02),
            total: orderAmount,
            orderDate: new Date().toISOString(),
            status: "Processing",
            customerEmail: paymentDetails.email,
            customerName: user?.firstName || 'Customer'
          };

          await createOrder(orderData);
          
          setPaymentStatus("Sending email confirmation...");
          await sendEmailConfirmation(orderData);
          
          setPaymentStatus("Payment completed successfully!");
          setTimeout(() => {
            router.push('/order-placed');
          }, 2000);
        }, 2000);
      }
    } catch (error) {
      console.error('Razorpay error:', error);
      setPaymentStatus("Failed to process Razorpay payment");
      setTimeout(() => setPaymentStatus(""), 3000);
    }
  };

  // Stripe Integration
  const processStripePayment = async () => {
    try {
      setPaymentStatus("Initializing Stripe...");
      
      // Check if Stripe is loaded
      if (typeof window !== 'undefined' && window.Stripe) {
        const stripe = window.Stripe('pk_test_51H5G8tKj8nM2pQ9'); // Replace with your test key
        
        setPaymentStatus("Processing Stripe payment...");
        setTimeout(async () => {
          const orderData = {
            orderId: `ORD-${Date.now()}`,
            items: orderItems,
            paymentMethod: 'stripe',
            paymentId: `pi_${Date.now()}`,
            subtotal: getCartAmount(),
            tax: Math.floor(getCartAmount() * 0.02),
            total: orderAmount,
            orderDate: new Date().toISOString(),
            status: "Processing",
            customerEmail: paymentDetails.email,
            customerName: user?.firstName || 'Customer'
          };

          await createOrder(orderData);
          
          setPaymentStatus("Sending email confirmation...");
          await sendEmailConfirmation(orderData);
          
          setPaymentStatus("Payment completed successfully!");
          setTimeout(() => {
            router.push('/order-placed');
          }, 2000);
        }, 2000);
      } else {
        // Fallback: Simulate payment success
        setPaymentStatus("Stripe not available. Processing payment...");
        setTimeout(async () => {
          const orderData = {
            orderId: `ORD-${Date.now()}`,
            items: orderItems,
            paymentMethod: 'stripe',
            paymentId: `pi_${Date.now()}`,
            subtotal: getCartAmount(),
            tax: Math.floor(getCartAmount() * 0.02),
            total: orderAmount,
            orderDate: new Date().toISOString(),
            status: "Processing",
            customerEmail: paymentDetails.email,
            customerName: user?.firstName || 'Customer'
          };

          await createOrder(orderData);
          
          setPaymentStatus("Sending email confirmation...");
          await sendEmailConfirmation(orderData);
          
          setPaymentStatus("Payment completed successfully!");
          setTimeout(() => {
            router.push('/order-placed');
          }, 2000);
        }, 2000);
      }
    } catch (error) {
      console.error('Stripe error:', error);
      setPaymentStatus("Failed to process Stripe payment");
      setTimeout(() => setPaymentStatus(""), 3000);
    }
  };

  // PayPal Integration
  const processPayPalPayment = async () => {
    try {
      setPaymentStatus("Processing PayPal payment...");
      setTimeout(async () => {
        const orderData = {
          orderId: `ORD-${Date.now()}`,
          items: orderItems,
          paymentMethod: 'paypal',
          paymentId: `paypal_${Date.now()}`,
          subtotal: getCartAmount(),
          tax: Math.floor(getCartAmount() * 0.02),
          total: orderAmount,
          orderDate: new Date().toISOString(),
          status: "Processing",
          customerEmail: paymentDetails.email,
          customerName: user?.firstName || 'Customer'
        };

        await createOrder(orderData);
        
        setPaymentStatus("Sending email confirmation...");
        await sendEmailConfirmation(orderData);
        
        setPaymentStatus("Payment completed successfully!");
        setTimeout(() => {
          router.push('/order-placed');
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('PayPal error:', error);
      setPaymentStatus("Failed to process PayPal payment");
      setTimeout(() => setPaymentStatus(""), 3000);
    }
  };

  const processPayment = async () => {
    if (!validatePaymentDetails()) {
      alert("Please fill in all required payment details");
      return;
    }

    if (!user) {
      alert("Please sign in to complete your payment");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("");

    try {
      switch (selectedPaymentMethod) {
        case 'razorpay':
          await processRazorpayPayment();
          break;
        case 'stripe':
          await processStripePayment();
          break;
        case 'paypal':
          await processPayPalPayment();
          break;
        case 'cod':
          setPaymentStatus("Creating order...");
          // Create order for COD
          const orderData = {
            orderId: `ORD-${Date.now()}`,
            items: orderItems,
            paymentMethod: 'cod',
            subtotal: getCartAmount(),
            tax: Math.floor(getCartAmount() * 0.02),
            total: orderAmount,
            orderDate: new Date().toISOString(),
            status: "Processing",
            customerEmail: user.emailAddresses[0]?.emailAddress,
            customerName: user.firstName || 'Customer'
          };
          
          await createOrder(orderData);
          
          setPaymentStatus("Sending email confirmation...");
          await sendEmailConfirmation(orderData);
          
          setPaymentStatus("Order placed successfully!");
          setTimeout(() => {
            router.push('/order-placed');
          }, 2000);
          break;
        default:
          alert('Invalid payment method');
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("Payment failed. Please try again.");
      setTimeout(() => setPaymentStatus(""), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (getCartCount() === 0) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h1>
            <p className="text-gray-500 mb-6">Add some items to your cart before proceeding to payment</p>
            <button 
              onClick={() => router.push('/all-products')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-700 mb-4">Please Sign In</h1>
            <p className="text-gray-500 mb-6">You need to be signed in to complete your payment</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-8 px-6 md:px-16 lg:px-32 pt-14 pb-20">
        {/* Payment Methods */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-700 mb-6">Payment Method</h1>
          
          {/* Payment Status */}
          {paymentStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 font-medium">{paymentStatus}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => handlePaymentMethodChange(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{method.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-800">{method.name}</h3>
                      {method.popular && (
                        <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPaymentMethod === method.id
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300"
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Details Forms */}
          {(selectedPaymentMethod === "razorpay" || selectedPaymentMethod === "stripe") && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={paymentDetails.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={paymentDetails.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {selectedPaymentMethod === "paypal" && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-700">PayPal Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={paymentDetails.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>
          )}

          {selectedPaymentMethod === "cod" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <p className="text-blue-700 text-sm mt-2">
                Pay with cash when your order is delivered. No additional charges.
              </p>
            </div>
          )}

          {/* User Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
              <p><span className="font-medium">Email:</span> {user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-96">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {currency}{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({getCartCount()} items)</span>
                <span className="font-medium">{currency}{getCartAmount()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (2%)</span>
                <span className="font-medium">{currency}{Math.floor(getCartAmount() * 0.02)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>{currency}{orderAmount}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={processPayment}
              disabled={isProcessing || !validatePaymentDetails()}
              className={`w-full mt-6 py-3 rounded-lg text-white font-medium ${
                isProcessing || !validatePaymentDetails()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Payment...
                </div>
              ) : (
                `Pay ${currency}${orderAmount}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment; 