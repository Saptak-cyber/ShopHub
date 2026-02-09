import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private static fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

  static async sendOrderConfirmation(to: string, orderData: {
    orderId: string;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    shippingAddress: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Order Confirmation - #${orderData.orderId.slice(0, 8)}`,
        html: this.generateOrderConfirmationHTML(orderData)
      });

      if (error) {
        console.error("Error sending order confirmation:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      return { success: false, error };
    }
  }

  static async sendShippingNotification(to: string, orderData: {
    orderId: string;
    status: string;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Order Update - #${orderData.orderId.slice(0, 8)}`,
        html: this.generateShippingNotificationHTML(orderData)
      });

      if (error) {
        console.error("Error sending shipping notification:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error sending shipping notification:", error);
      return { success: false, error };
    }
  }

  static async sendWelcomeEmail(to: string, name: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to,
        subject: "Welcome to ShopHub!",
        html: this.generateWelcomeEmailHTML(name)
      });

      if (error) {
        console.error("Error sending welcome email:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }
  }

  // HTML Email Templates
  private static generateOrderConfirmationHTML(orderData: {
    orderId: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    shippingAddress: string;
  }): string {
    const itemsHTML = orderData.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.name}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">ShopHub</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">Order Confirmed! 🎉</h2>
              <p style="color: #6b7280; margin: 0 0 24px 0; line-height: 1.5;">
                Thank you for your order! We're getting it ready for shipment.
              </p>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">Order Number</p>
                <p style="color: #111827; margin: 0; font-weight: bold; font-size: 18px;">
                  #${orderData.orderId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              
              <h3 style="color: #111827; margin: 0 0 16px 0;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600;">Item</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-weight: 600;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                  <tr>
                    <td colspan="2" style="padding: 16px 12px; font-weight: bold; color: #111827;">Total</td>
                    <td style="padding: 16px 12px; text-align: right; font-weight: bold; color: #6366f1; font-size: 18px;">
                      $${orderData.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <h3 style="color: #111827; margin: 0 0 12px 0;">Shipping Address</h3>
              <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 32px;">
                <p style="color: #6b7280; margin: 0; line-height: 1.6; white-space: pre-line;">
                  ${orderData.shippingAddress}
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 32px;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/orders" 
                   style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Order Details
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Questions? Contact us at support@shophub.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateShippingNotificationHTML(orderData: {
    orderId: string;
    status: string;
  }): string {
    const statusMessages: Record<string, string> = {
      processing: "Your order is being processed",
      shipped: "Your order has been shipped! 📦",
      delivered: "Your order has been delivered! 🎉"
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Update</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">ShopHub</h1>
            </div>
            
            <div style="padding: 40px 20px; text-align: center;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">
                ${statusMessages[orderData.status] || "Order Status Update"}
              </h2>
              <p style="color: #6b7280; margin: 0 0 32px 0; line-height: 1.5;">
                Order #${orderData.orderId.slice(0, 8).toUpperCase()}
              </p>
              
              <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/orders" 
                 style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Track Your Order
              </a>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Questions? Contact us at support@shophub.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static generateWelcomeEmailHTML(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ShopHub</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">ShopHub</h1>
            </div>
            
            <div style="padding: 40px 20px;">
              <h2 style="color: #111827; margin: 0 0 16px 0;">Welcome, ${name}! 👋</h2>
              <p style="color: #6b7280; margin: 0 0 24px 0; line-height: 1.5;">
                Thanks for joining ShopHub! We're excited to have you as part of our community.
              </p>
              
              <p style="color: #6b7280; margin: 0 0 32px 0; line-height: 1.5;">
                Start exploring our curated collection of premium tech products and accessories.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/products" 
                   style="display: inline-block; background-color: #6366f1; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Start Shopping
                </a>
              </div>
            </div>
            
            <div style="background-color: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Questions? Contact us at support@shophub.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
