// Email Service for Payment Confirmations
// This is a utility for sending email confirmations after successful payments

export const sendPaymentConfirmationEmail = async (orderData, customerEmail, customerName) => {
  try {
    // In a real application, you would integrate with services like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer (for Node.js backend)
    
    const emailData = {
      to: customerEmail,
      subject: `Payment Confirmation - Order #${orderData.orderId}`,
      html: generatePaymentConfirmationEmail(orderData, customerName),
      text: generatePaymentConfirmationText(orderData, customerName)
    };

    console.log('Email data:', emailData);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      message: 'Failed to send email'
    };
  }
};

const generatePaymentConfirmationEmail = (orderData, customerName) => {
  const itemsList = Array.isArray(orderData.items)
    ? orderData.items.map(item => 
      `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price * item.quantity}</td>
      </tr>`
    ).join('')
    : '';

  const paymentMethodStr = orderData.paymentMethod ? orderData.paymentMethod.toUpperCase() : 'N/A';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f97316;">QuickCart</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #28a745; margin-top: 0;">Payment Confirmation</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your order! Your payment has been processed successfully.</p>
        </div>
        
        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Payment Method:</strong> ${paymentMethodStr}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${orderData.status}</p>
        </div>
        
        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">Item</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">Quantity</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">Price</th>
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #eee;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>
        </div>
        
        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Payment Summary</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Subtotal:</span>
            <span>$${orderData.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Tax (2%):</span>
            <span>$${orderData.tax}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #eee; padding-top: 10px;">
            <span>Total:</span>
            <span>$${orderData.total}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            If you have any questions about your order, please contact our support team.
          </p>
          <p style="color: #666; font-size: 14px;">
            Thank you for choosing QuickCart!
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generatePaymentConfirmationText = (orderData, customerName) => {
  const itemsList = Array.isArray(orderData.items)
    ? orderData.items.map(item => 
      `${item.name} - Qty: ${item.quantity} - Price: $${item.price} - Total: $${item.price * item.quantity}`
    ).join('\n')
    : '';

  const paymentMethodStr = orderData.paymentMethod ? orderData.paymentMethod.toUpperCase() : 'N/A';

  return `
Payment Confirmation

Dear ${customerName},

Thank you for your order! Your payment has been processed successfully.

Order Details:
- Order ID: ${orderData.orderId}
- Payment Method: ${paymentMethodStr}
- Order Date: ${new Date(orderData.orderDate).toLocaleDateString()}
- Status: ${orderData.status}

Order Items:
${itemsList}

Payment Summary:
- Subtotal: $${orderData.subtotal}
- Tax (2%): $${orderData.tax}
- Total: $${orderData.total}

If you have any questions about your order, please contact our support team.

Thank you for choosing QuickCart!
  `;
};

// Email templates for different payment methods
export const getPaymentMethodEmailTemplate = (paymentMethod) => {
  const templates = {
    razorpay: {
      subject: 'Payment Confirmation - Razorpay',
      message: 'Your payment has been processed securely through Razorpay.'
    },
    stripe: {
      subject: 'Payment Confirmation - Stripe',
      message: 'Your payment has been processed securely through Stripe.'
    },
    paypal: {
      subject: 'Payment Confirmation - PayPal',
      message: 'Your payment has been processed securely through PayPal.'
    },
    cod: {
      subject: 'Order Confirmation - Cash on Delivery',
      message: 'Your order has been placed successfully. Please have cash ready for delivery.'
    }
  };

  return templates[paymentMethod] || templates.cod;
};