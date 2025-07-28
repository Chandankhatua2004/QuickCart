'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { sendPaymentConfirmationEmail } from "@/lib/email-service";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(true)
    const [cartItems, setCartItems] = useState({})
    const [orders, setOrders] = useState([])
    const [emailConfirmations, setEmailConfirmations] = useState({})
    const [addresses, setAddresses] = useState([]);

    const fetchProductData = async () => {
        setProducts(productsDummyData)
    }

    const fetchUserData = async () => {
        setUserData(userDummyData)
    }

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const createOrder = async (orderData) => {
        // Build the order object for the database
        const newOrder = {
            userId: user?.id || "guest",
            customerName: user?.firstName || orderData.customerName || 'Customer',
            customerEmail: user?.emailAddresses?.[0]?.emailAddress || orderData.customerEmail || '',
            items: orderData.items.map(item => ({
                productId: item.productId,
                name: item.name, // product name
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal
            })),
            amount: orderData.total,
            address: orderData.deliveryAddress,
            status: "Order Placed",
            date: new Date(),
            paymentMethod: orderData.paymentMethod,
            paymentId: orderData.paymentId
        };

        // Save to MongoDB via API
        let savedOrder = null;
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });
            savedOrder = await res.json();
            setOrders(prevOrders => [savedOrder, ...prevOrders]);
        } catch (err) {
            console.error('Failed to save order to database:', err);
        }

        // Send email confirmation
        let emailResult = null;
        try {
            emailResult = await sendPaymentConfirmationEmail(
                savedOrder || newOrder,
                newOrder.customerEmail,
                newOrder.customerName
            );
            setEmailConfirmations(prev => ({
                ...prev,
                [savedOrder?._id || newOrder._id]: {
                    sent: emailResult.success,
                    timestamp: Date.now(),
                    message: emailResult.message
                }
            }));
        } catch (error) {
            console.error('Failed to send email confirmation:', error);
            setEmailConfirmations(prev => ({
                ...prev,
                [savedOrder?._id || newOrder._id]: {
                    sent: false,
                    timestamp: Date.now(),
                    message: 'Failed to send email'
                }
            }));
        }

        // After saving order and sending email:
        await fetchOrders(); // fetch latest orders after placing one
        return { order: savedOrder || newOrder, emailResult };
    }

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    const resendEmailConfirmation = async (orderId) => {
        const order = orders.find(o => o._id === orderId);
        if (!order) return;

        try {
            const emailResult = await sendPaymentConfirmationEmail(
                order,
                order.customerEmail,
                order.customerName
            );
            
            setEmailConfirmations(prev => ({
                ...prev,
                [orderId]: {
                    sent: emailResult.success,
                    timestamp: Date.now(),
                    message: emailResult.message
                }
            }));
            
            return emailResult;
        } catch (error) {
            console.error('Failed to resend email:', error);
            return { success: false, message: 'Failed to resend email' };
        }
    }

    const deleteOrder = async (orderId) => {
        try {
            console.log('Attempting to delete order:', orderId);
            console.log('Current orders:', orders);
            
            // Remove from state - check both _id and orderId fields
            setOrders(prevOrders => {
                const filtered = prevOrders.filter(order => 
                    order._id !== orderId && 
                    order.orderId !== orderId &&
                    order.id !== orderId
                );
                console.log('Orders after filtering:', filtered);
                return filtered;
            });
            
            // Remove from localStorage - check both _id and orderId fields
            const storedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            const updatedOrders = storedOrders.filter(order => 
                order._id !== orderId && 
                order.orderId !== orderId &&
                order.id !== orderId
            );
            localStorage.setItem('userOrders', JSON.stringify(updatedOrders));
            
            // Remove email confirmation tracking
            setEmailConfirmations(prev => {
                const newConfirmations = { ...prev };
                delete newConfirmations[orderId];
                return newConfirmations;
            });
            
            console.log('Order deleted successfully');
            return { success: true, message: 'Order deleted successfully' };
        } catch (error) {
            console.error('Failed to delete order:', error);
            return { success: false, message: 'Failed to delete order' };
        }
    }

    const saveAddress = async (address) => {
        try {
            const res = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(address)
            });
            const saved = await res.json();
            setAddresses(prev => Array.isArray(prev) ? [saved, ...prev] : [saved]);
            return saved;
        } catch (err) {
            console.error('Failed to save address:', err);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await fetch('/api/addresses');
            const data = await res.json();
            setAddresses(data);
        } catch (err) {
            console.error('Failed to fetch addresses:', err);
        }
    };

    useEffect(() => {
        fetchProductData();
        fetchAddresses(); // fetch addresses on mount
    }, [])

    useEffect(() => {
        fetchUserData()
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [])

    const value = {
        user,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount,
        orders, createOrder, fetchOrders,
        emailConfirmations, resendEmailConfirmation, deleteOrder,
        addresses, saveAddress, fetchAddresses
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}