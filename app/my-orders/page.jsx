'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";

const MyOrders = () => {

    const { currency, orders, fetchOrders, emailConfirmations, resendEmailConfirmation, deleteOrder } = useAppContext();

    const [loading, setLoading] = useState(true);
    const [resendingEmails, setResendingEmails] = useState({});
    const [deletingOrders, setDeletingOrders] = useState({});

    const loadOrders = async () => {
        await fetchOrders();
        setLoading(false);
    }

    const handleResendEmail = async (orderId) => {
        setResendingEmails(prev => ({ ...prev, [orderId]: true }));
        
        try {
            const result = await resendEmailConfirmation(orderId);
            if (result.success) {
                alert('Email confirmation sent successfully!');
            } else {
                alert('Failed to send email confirmation. Please try again.');
            }
        } catch (error) {
            alert('Error sending email confirmation.');
        } finally {
            setResendingEmails(prev => ({ ...prev, [orderId]: false }));
        }
    }

    const handleDeleteOrder = async (orderId) => {
        console.log('Delete button clicked for order:', orderId);
        setDeletingOrders(prev => ({ ...prev, [orderId]: true }));
        
        try {
            const result = await deleteOrder(orderId);
            console.log('Delete result:', result);
            // Order is automatically removed from the list, no alert needed
        } catch (error) {
            console.error('Error deleting order:', error);
        } finally {
            setDeletingOrders(prev => ({ ...prev, [orderId]: false }));
        }
    }

    const getEmailStatus = (orderId) => {
        const confirmation = emailConfirmations[orderId];
        if (!confirmation) return { status: 'pending', message: 'Email not sent yet' };
        
        if (confirmation.sent) {
            return { 
                status: 'sent', 
                message: 'Email sent successfully',
                timestamp: confirmation.timestamp 
            };
        } else {
            return { 
                status: 'failed', 
                message: confirmation.message || 'Failed to send email',
                timestamp: confirmation.timestamp 
            };
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        console.log('Orders:', orders);
    }, [orders]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">My Orders</h2>
                    {loading ? <Loading /> : (<div className="max-w-5xl border-t border-gray-300 text-sm">
                        {orders && orders.length > 0 ? orders.map((order, index) => {
                            const emailStatus = getEmailStatus(order._id || order.orderId || order.id);
                            
                            return (
                            <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300">
                                <div className="flex-1 flex gap-5 max-w-80">
                                    <Image
                                        className="max-w-16 max-h-16 object-cover"
                                        src={assets.box_icon}
                                        alt="box_icon"
                                    />
                                    <p className="flex flex-col gap-3">
                                        <span className="font-medium text-base">
                                                {order.items && order.items.length > 0 
                                                    ? order.items.map((item) => 
                                                        (item.name || item.product?.name || 'Product') + ` x ${item.quantity || 1}`
                                                      ).join(", ")
                                                    : 'No items'
                                                }
                                        </span>
                                            <span>Items : {order.items?.length || 0}</span>
                                    </p>
                                </div>
                                <div>
                                    <p>
                                            <span className="font-medium">{order.customerName || 'Customer'}</span>
                                        <br />
                                            <span>{order.customerEmail || 'No email'}</span>
                                        <br />
                                            <span>Order ID: {order.orderId}</span>
                                        <br />
                                            <span>Payment: {order.paymentMethod?.toUpperCase() || 'COD'}</span>
                                    </p>
                                </div>
                                <p className="font-medium my-auto">{currency}{order.amount}</p>
                                <div>
                                    <p className="flex flex-col">
                                            <span>Method : {order.paymentMethod?.toUpperCase() || 'COD'}</span>
                                        <span>Date : {new Date(order.date).toLocaleDateString()}</span>
                                            <span>Status : {order.status || 'Processing'}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {/* Email Confirmation Status */}
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${
                                                emailStatus.status === 'sent' ? 'bg-green-500' :
                                                emailStatus.status === 'failed' ? 'bg-red-500' :
                                                'bg-yellow-500'
                                            }`}></div>
                                            <span className={`text-xs ${
                                                emailStatus.status === 'sent' ? 'text-green-600' :
                                                emailStatus.status === 'failed' ? 'text-red-600' :
                                                'text-yellow-600'
                                            }`}>
                                                {emailStatus.status === 'sent' ? 'Email Sent' :
                                                 emailStatus.status === 'failed' ? 'Email Failed' :
                                                 'Email Pending'}
                                            </span>
                                        </div>
                                        
                                        {/* Resend Email Button */}
                                        <button
                                            onClick={() => handleResendEmail(order._id)}
                                            disabled={resendingEmails[order._id]}
                                            className={`text-xs px-3 py-1 rounded ${
                                                resendingEmails[order._id]
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                            }`}
                                        >
                                            {resendingEmails[order._id] ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Sending...
                                                </div>
                                            ) : (
                                                'Resend Email'
                                            )}
                                        </button>
                                        
                                        {/* Delete Order Button */}
                                        <button
                                            onClick={() => {
                                                console.log('Order object:', order);
                                                console.log('Order ID to delete:', order._id || order.orderId || order.id);
                                                handleDeleteOrder(order._id || order.orderId || order.id);
                                            }}
                                            disabled={deletingOrders[order._id || order.orderId || order.id]}
                                            className={`text-xs px-3 py-1 rounded ${
                                                deletingOrders[order._id || order.orderId || order.id]
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-red-500 text-white hover:bg-red-600'
                                            }`}
                                        >
                                            {deletingOrders[order._id || order.orderId || order.id] ? (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Deleting...
                                                </div>
                                            ) : (
                                                'Delete Order'
                                            )}
                                        </button>
                                        
                                        {/* Email Timestamp */}
                                        {emailStatus.timestamp && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(emailStatus.timestamp).toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        )}
                    </div>)}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;