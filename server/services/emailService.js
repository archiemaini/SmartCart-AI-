/**
 * =====================================================================
 * Email Integration & Real Delivery Service
 * Supports:
 * 1. Real Gmail SMTP (using GMAIL_USER + GMAIL_APP_PASS in .env)
 * 2. Real Custom SMTP (Brevo, SendGrid, Hostinger, AWS SES)
 * 3. Real Ethereal SMTP with live web inboxes & instant preview links
 * 4. Recent Outgoing Emails Log for in-app viewing
 * =====================================================================
 */
import nodemailer from 'nodemailer';

let transporter = null;
let isEthereal = false;

// In-memory record of recent dispatched emails so testers can view preview links directly
const recentSentEmails = [];

export function getRecentSentEmails() {
  return recentSentEmails.slice(-10).reverse();
}

/**
 * Initialize or retrieve the active email transporter
 */
export async function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const GMAIL_USER = (process.env.GMAIL_USER || 'smartcartindia99@gmail.com').trim();
  const GMAIL_APP_PASS = (process.env.GMAIL_APP_PASS || 'guhlyygrbqthsdmy').trim();

  // If transporter already created and using custom credentials, reuse it
  if (transporter && (!isEthereal || (!GMAIL_USER && !SMTP_HOST))) {
    return transporter;
  }

  if (GMAIL_USER && GMAIL_APP_PASS) {
    // Gmail SMTP (Direct delivery to real Gmail / Google inboxes)
    const cleanPass = GMAIL_APP_PASS.replace(/\s+/g, '');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: cleanPass,
      },
      pool: true,
      maxConnections: 5,
    });
    isEthereal = false;
    console.log(`[Email] ✅ Configured Real Gmail SMTP for ${GMAIL_USER}`);
  } else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    // Custom Real SMTP (Brevo / SendGrid / AWS SES)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    isEthereal = false;
    console.log(`[Email] ✅ Configured Custom SMTP: ${SMTP_HOST}:${SMTP_PORT || 587}`);
  } else {
    // Real Ethereal SMTP account created on-the-fly for real RFC 822 email delivery & web inbox preview
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      console.log(`[Email] 🌐 Real Ethereal SMTP delivery initialized (Account: ${testAccount.user})`);
    } catch (err) {
      console.warn(`[Email] Could not create Ethereal account: ${err.message}. Using JSON transporter.`);
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
}

/**
 * Universal email dispatcher:
 * 1. Resend HTTP API (HTTPS port 443 - works everywhere, including Render Free Tier)
 * 2. Brevo HTTP API (HTTPS port 443 - works everywhere, including Render Free Tier)
 * 3. Gmail SMTP / Custom SMTP (Nodemailer - with timeout race so blocked SMTP ports on cloud hosts don't hang)
 */
async function dispatchEmail({ to, subject, html, text }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
  const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();

  // 1. Resend HTTP REST API (directly to the user recipient)
  if (RESEND_API_KEY) {
    try {
      const fromAddr = process.env.EMAIL_FROM || 'SmartCart <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [to],
          subject,
          html,
          text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[Email] ✅ Dispatched directly to ${to} via Resend (ID: ${data.id})`);
        return { success: true, messageId: data.id, isRealInboxDelivery: true, provider: 'Resend HTTP' };
      }
      console.warn(`[Email] Resend API error for ${to}: ${data.message || JSON.stringify(data)}`);
    } catch (err) {
      console.warn(`[Email] Resend fetch error: ${err.message}`);
    }
  }

  // 2. Brevo HTTP REST API (directly to the user recipient)
  if (BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'SmartCart India', email: 'smartcartindia99@gmail.com' },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`[Email] ✅ Dispatched directly to ${to} via Brevo (MessageId: ${data.messageId})`);
        return { success: true, messageId: data.messageId, isRealInboxDelivery: true, provider: 'Brevo HTTP' };
      }
      console.warn(`[Email] Brevo API error for ${to}: ${JSON.stringify(data)}`);
    } catch (err) {
      console.warn(`[Email] Brevo fetch error: ${err.message}`);
    }
  }

  // 3. Direct Gmail SMTP / Custom SMTP (Delivered directly to the user recipient)
  try {
    const client = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || (process.env.GMAIL_USER ? `"SmartCart Store" <${process.env.GMAIL_USER.trim()}>` : '"SmartCart Store" <smartcartindia99@gmail.com>');

    const info = await client.sendMail({
      from: fromAddress,
      replyTo: 'smartcartindia99@gmail.com',
      to,
      subject,
      text,
      html,
      headers: {
        'X-Mailer': 'SmartCart Storefront Engine',
        'List-Unsubscribe': '<mailto:smartcartindia99@gmail.com?subject=unsubscribe>',
        'Feedback-ID': 'smartcart:order-notification:gmail',
      },
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email] ✅ Dispatched directly via SMTP to ${to} (Message ID: ${info.messageId})`);
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      isRealInboxDelivery: !isEthereal,
      provider: 'SMTP',
    };
  } catch (smtpErr) {
    console.error(`[Email] SMTP delivery failed for ${to}: ${smtpErr.message}`);
    return { success: false, error: smtpErr.message, isRealInboxDelivery: false };
  }
}

/**
 * Send Welcome Email upon successful user registration
 * Feature 1: Send a welcome email to users whenever they successfully register.
 * Includes account details: Login Email and Account Password.
 */
export async function sendWelcomeEmail({ name, email, password }) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #a7f3d0; }
          .body { padding: 32px 28px; color: #1e293b; font-size: 14px; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
          .credentials-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
          .credentials-box h3 { margin: 0 0 12px; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .cred-row:last-child { border-bottom: none; }
          .cred-label { color: #64748b; font-weight: 500; }
          .cred-val { font-weight: 700; color: #0f172a; font-family: monospace; font-size: 14px; }
          .highlight-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .highlight-card h3 { margin: 0 0 8px; color: #166534; font-size: 15px; }
          .highlight-card ul { margin: 0; padding-left: 20px; color: #15803d; font-size: 13px; }
          .highlight-card li { margin-bottom: 6px; }
          .cta-btn { display: inline-block; background: #059669; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; margin-top: 12px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart<span style="color: #34d399;">Cart</span></h1>
            <p>Welcome to India's Smartest AI-Powered Storefront</p>
          </div>
          <div class="body">
            <div class="greeting">Hello ${name}! 👋</div>
            <p>Thank you for creating an account with <strong>SmartCart</strong>. Your account is active and ready to use.</p>
            
            <!-- Account Info Box -->
            <div class="credentials-box">
              <h3>Account Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Registered Email:</td>
                  <td style="padding: 8px 0; font-weight: 700; color: #0f172a; text-align: right;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Access Password:</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #0f172a; font-family: monospace; font-size: 13px; text-align: right;">${password || '••••••••'}</td>
                </tr>
              </table>
              <p style="font-size: 11px; color: #64748b; margin: 10px 0 0;">
                You can use this email and password to sign in to your SmartCart account.
              </p>
            </div>

            <p>You can now explore thousands of top-tier electronics, laptops, smartphones, and fashion items priced in Indian Rupees (₹), receive tailored recommendations, and chat with our intelligent AI Shopping Assistant!</p>
            
            <div class="highlight-card">
              <h3>What you can do right away:</h3>
              <ul>
                <li><strong>AI Shopping Assistant:</strong> Ask natural queries like <em>"Laptops under ₹50,000"</em> or <em>"Best gaming headphones"</em>.</li>
                <li><strong>Multiple Delivery Addresses:</strong> Save your home, office, and campus addresses for one-click checkout.</li>
                <li><strong>UPI & Card Payments:</strong> Checkout instantly via UPI (GPay, PhonePe, Paytm) and Cards.</li>
                <li><strong>Personalized Recommendations:</strong> Get custom product picks tailored to your style.</li>
              </ul>
            </div>

            <p style="text-align: center; margin-top: 28px;">
              <a href="http://localhost:5173/login" class="cta-btn">Sign in to SmartCart →</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SmartCart E-Commerce. All rights reserved.<br>Delivered to ${email}.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await dispatchEmail({
      to: email,
      subject: `Welcome to SmartCart, ${name}`,
      text: `Hello ${name},\n\nWelcome to SmartCart! Your account has been created successfully.\n\nAccount Details:\n• Email: ${email}\n• Password: ${password}\n\nSign in: http://localhost:5173/login\n\nThank you,\nSmartCart Team`,
      html: htmlContent,
    });

    const record = {
      type: 'Welcome Email',
      to: email,
      recipientName: name,
      subject: `Welcome to SmartCart, ${name}`,
      messageId: result.messageId || `msg_${Date.now()}`,
      previewUrl: result.previewUrl || null,
      deliveredAt: new Date().toISOString(),
      isRealInboxDelivery: Boolean(result.isRealInboxDelivery),
      provider: result.provider || 'System',
    };
    recentSentEmails.push(record);

    return result;
  } catch (error) {
    console.error(`[Email] Failed to send welcome email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send Order Confirmation Email whenever a user successfully places an order
 * Feature 1: Send an order confirmation email whenever a user successfully places an order.
 * Include relevant order details: order ID, purchased products, total amount, order status, address.
 */
export async function sendOrderConfirmationEmail({ order, user }) {
  try {
    const client = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || (process.env.GMAIL_USER ? `"SmartCart India" <${process.env.GMAIL_USER.trim()}>` : '"SmartCart Orders" <orders@smartcart.com>');
    let recipientEmail = user?.email || order.shippingAddress?.email;

    if (!recipientEmail && order.user) {
      try {
        const User = (await import('../models/User.js')).default;
        const dbUser = await User.findById(order.user).select('email name');
        if (dbUser) {
          recipientEmail = dbUser.email;
          if (!user) user = dbUser;
        }
      } catch (err) {
        // ignore lookup error
      }
    }

    if (!recipientEmail) {
      console.warn('[Email] Cannot send order confirmation email: recipient email missing');
      return { success: false, error: 'Recipient email missing' };
    }

    const recipientName = user?.name || order.shippingAddress?.fullName || 'Valued Customer';
    const orderId = String(order._id || order.id || 'SC-ORD');
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsRows = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px;">
            <img src="${item.image}" alt="${item.title}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />
            <div>
              <div style="font-weight: 600; color: #0f172a; font-size: 13px;">${item.title}</div>
              <div style="font-size: 11px; color: #64748b;">Qty: ${item.qty}</div>
            </div>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a; font-size: 13px;">
            ₹${(item.price * item.qty).toLocaleString('en-IN')}
          </td>
        </tr>
      `
      )
      .join('');

    const address = order.shippingAddress || {};
    const formattedAddress = [
      address.fullName,
      address.houseNo,
      address.street,
      `${address.city}, ${address.state} - ${address.pinCode}`,
      `Phone: ${address.mobileNumber}`,
    ]
      .filter(Boolean)
      .join('<br>');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 24px; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .badge { display: inline-block; background: #059669; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 8px; }
          .body { padding: 28px; color: #1e293b; font-size: 14px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; }
          .meta-item span { color: #64748b; display: block; margin-bottom: 2px; }
          .meta-item strong { color: #0f172a; font-size: 13px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .summary-table { width: 100%; margin-top: 16px; font-size: 13px; }
          .summary-table td { padding: 6px 0; }
          .total-row { font-size: 16px; font-weight: 700; color: #064e3b; border-top: 2px solid #e2e8f0; padding-top: 12px !important; }
          .address-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #166534; line-height: 1.5; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart<span style="color: #34d399;">Cart</span></h1>
            <div class="badge">Order Confirmed</div>
            <p style="margin: 6px 0 0; color: #a7f3d0; font-size: 13px;">Thank you for your purchase!</p>
          </div>

          <div class="body">
            <p style="margin-top: 0;">Hi <strong>${recipientName}</strong>,</p>
            <p>Your order has been received and confirmed! We are preparing your items for delivery.</p>

            <div class="meta-box">
              <div class="meta-item">
                <span>Order ID:</span>
                <strong>#${orderId}</strong>
              </div>
              <div class="meta-item">
                <span>Order Date:</span>
                <strong>${orderDate}</strong>
              </div>
              <div class="meta-item">
                <span>Order Status:</span>
                <strong style="color: #059669;">${order.status || 'Confirmed'}</strong>
              </div>
              <div class="meta-item">
                <span>Payment Method:</span>
                <strong>${order.paymentMethod || 'Online Payment'} (${order.paymentStatus || 'Completed'})</strong>
              </div>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin: 20px 0 10px;">Purchased Products</h3>
            <table class="items-table">
              ${itemsRows}
            </table>

            <table class="summary-table">
              <tr>
                <td style="color: #64748b;">Items Subtotal:</td>
                <td style="text-align: right; font-weight: 600;">₹${Number(order.itemsPrice || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Shipping Fee:</td>
                <td style="text-align: right; font-weight: 600; color: ${order.shippingPrice === 0 ? '#059669' : '#0f172a'};">
                  ${order.shippingPrice === 0 ? 'FREE' : '₹' + Number(order.shippingPrice).toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td style="color: #64748b;">Estimated Taxes (18% GST):</td>
                <td style="text-align: right; font-weight: 600;">₹${Number(order.taxPrice || 0).toLocaleString('en-IN')}</td>
              </tr>
              <tr class="total-row">
                <td>Total Amount Paid:</td>
                <td style="text-align: right;">₹${Number(order.totalPrice || 0).toLocaleString('en-IN')}</td>
              </tr>
            </table>

            <div class="address-card">
              <strong style="display: block; margin-bottom: 6px; font-size: 14px;">📍 Delivery Address:</strong>
              ${formattedAddress}
            </div>

            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              You can track your package anytime from your <strong>My Orders</strong> page on SmartCart.
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} SmartCart E-Commerce. Need help? Reply directly to this email or visit our help center.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await dispatchEmail({
      to: recipientEmail,
      subject: `SmartCart Order Confirmation #${orderId}`,
      text: `Hello ${recipientName},\n\nYour order #${orderId} has been confirmed.\nTotal Amount: ₹${Number(order.totalPrice || 0).toLocaleString('en-IN')}\nStatus: ${order.status || 'Confirmed'}\n\nThank you for shopping with SmartCart.\nTrack your order at: http://localhost:5173/orders`,
      html: htmlContent,
    });

    const record = {
      type: 'Order Confirmation Invoice',
      to: recipientEmail,
      recipientName,
      orderId,
      totalAmount: order.totalPrice,
      subject: `Order Confirmation #${orderId}`,
      messageId: result.messageId || `msg_${Date.now()}`,
      previewUrl: result.previewUrl || null,
      deliveredAt: new Date().toISOString(),
      isRealInboxDelivery: Boolean(result.isRealInboxDelivery),
      provider: result.provider || 'System',
    };
    recentSentEmails.push(record);

    return result;
  } catch (error) {
    console.error(`[Email] Failed to send order confirmation email: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send Login OTP Verification Email
 * Feature: Two-Factor Authentication on User Login
 */
export async function sendLoginOtpEmail({ name, email, otp }) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 24px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #a7f3d0; }
          .body { padding: 32px 28px; color: #1e293b; font-size: 14px; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
          .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 14px; padding: 24px 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #064e3b; font-family: monospace; margin: 8px 0; }
          .otp-caption { font-size: 12px; color: #166534; font-weight: 500; }
          .notice { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 20px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Smart<span style="color: #34d399;">Cart</span></h1>
            <p>Two-Factor Authentication Security</p>
          </div>
          <div class="body">
            <div class="greeting">Hello ${name || 'Shopper'}! 👋</div>
            <p>You recently attempted to sign in to your SmartCart account. Use the 6-digit verification code below to verify your identity and access your account:</p>
            
            <div class="otp-box">
              <div class="otp-caption">YOUR ONE-TIME PASSWORD (OTP)</div>
              <div class="otp-code">${otp}</div>
              <div class="otp-caption">Valid for 10 minutes • Do not share this code with anyone</div>
            </div>

            <div class="notice">
              🔒 <strong>Security Tip:</strong> If you did not attempt to sign in, someone may have entered your email address. You can safely ignore this email; no one can log in without this code.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} SmartCart India. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await dispatchEmail({
      to: email,
      subject: `Your SmartCart Login OTP: ${otp}`,
      text: `Hello ${name || 'Shopper'},\n\nYour SmartCart login verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this code, please ignore this email.\n\n- SmartCart Team`,
      html: htmlContent,
    });

    const record = {
      type: 'Login OTP Verification',
      to: email,
      recipientName: name,
      subject: `Your SmartCart Login OTP: ${otp}`,
      messageId: result.messageId || `msg_${Date.now()}`,
      previewUrl: result.previewUrl || null,
      deliveredAt: new Date().toISOString(),
      isRealInboxDelivery: Boolean(result.isRealInboxDelivery),
      provider: result.provider || 'System',
    };
    recentSentEmails.push(record);

    return result;
  } catch (error) {
    console.error(`[Email] Failed to send login OTP email: ${error.message}`);
    return { success: false, error: error.message };
  }
}
