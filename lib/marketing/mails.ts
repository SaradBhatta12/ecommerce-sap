// Welcome Email
export const welcomeEmail = `
Subject: Welcome to Our Store 🎉

Hi {{name}},

Welcome to {{storeName}}! We’re excited to have you on board.  
Browse our latest collections and enjoy exclusive offers just for you.

Happy Shopping,  
The {{storeName}} Team
`;

// Login Notification Email
export const loginEmail = `
Subject: New Login to Your Account 🔐

Hi {{name}},

We noticed a login to your account on {{date}} from {{location}}.  
If this was you, no worries! If not, please reset your password immediately.

Stay Secure,  
{{storeName}} Security Team
`;

// Account Deactivation Email
export const deactivateAccountEmail = `
Subject: Your Account Has Been Deactivated ❌

Hi {{name}},

We’re sorry to see you go. Your account with {{storeName}} has been deactivated.  
If this was a mistake, you can reactivate anytime by logging back in.  

Best Wishes,  
The {{storeName}} Team
`;

// Order Confirmation Email
export const orderConfirmationEmail = `
Subject: Order Confirmation - #{{orderId}} ✅

Hi {{name}},

Thank you for your order! 🎉  
Your order #{{orderId}} has been successfully placed.  

Order Summary:  
- Items: {{items}}  
- Total: {{total}}  
- Estimated Delivery: {{deliveryDate}}

We’ll notify you once your order is shipped.  

Thanks for shopping with us,  
The {{storeName}} Team
`;

// Order Shipped Email
export const orderShippedEmail = `
Subject: Your Order #{{orderId}} Has Been Shipped 📦

Hi {{name}},

Great news! Your order #{{orderId}} is on its way.  
Track your package here: {{trackingLink}}  

We’ll let you know once it’s delivered.  

Happy Shopping,  
The {{storeName}} Team
`;

// Order Delivered Email
export const orderDeliveredEmail = `
Subject: Your Order #{{orderId}} Has Been Delivered 🎁

Hi {{name}},

Your package has been delivered successfully.  
We hope you love it! Don’t forget to leave us a review.

Enjoy your new purchase,  
The {{storeName}} Team
`;

// Abandoned Cart Email
export const abandonedCartEmail = `
Subject: You Left Something in Your Cart 🛒

Hi {{name}},

Looks like you left some items in your cart. Don’t miss out!  
Complete your purchase today and enjoy {{discount}}% off with code: {{discountCode}}  

Finish Your Order Here 👉 {{cartLink}}  

Cheers,  
The {{storeName}} Team
`;

// Password Reset Email
export const passwordResetEmail = `
Subject: Reset Your Password 🔑

Hi {{name}},

We received a request to reset your password.  
Click the link below to set up a new password:  
{{resetLink}}  

If you didn’t request this, please ignore this email.  

Stay Safe,  
{{storeName}} Security Team
`;

// Account Reactivation Email
export const accountReactivationEmail = `
Subject: Welcome Back to {{storeName}} 🎉

Hi {{name}},

Your account has been successfully reactivated.  
We’re so happy to have you back! Check out our latest products and offers.  

See What’s New 👉 {{storeLink}}  

The {{storeName}} Team
`;

// Review Request Email
export const reviewRequestEmail = `
Subject: How Was Your Experience with Order #{{orderId}}? ⭐

Hi {{name}},

We’d love to hear your feedback on your recent purchase.  
Leave a quick review and help other shoppers!  

Leave a Review 👉 {{reviewLink}}  

Thank you for being part of our community,  
The {{storeName}} Team
`;

// Newsletter / Promotion Email
export const newsletterEmail = `
Subject: Don’t Miss This Week’s Special Offers 🔥

Hi {{name}},

Check out our latest deals and trending products handpicked for you.  
Exclusive discounts available only this week!  

Shop Now 👉 {{storeLink}}  

Happy Shopping,  
The {{storeName}} Team
`;
