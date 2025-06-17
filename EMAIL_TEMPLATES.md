# NixR Email Templates

## 1. Welcome Email

**Subject:** Welcome to NixR! Your journey to freedom starts now 🎉

**From:** NixR Team <hello@nixr.com>

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to NixR, {{first_name}}!</h1>
    </div>
    <div class="content">
      <p>Congratulations on taking the first step toward a nicotine-free life! 🎊</p>
      
      <p>You've just joined a supportive community of thousands who are on the same journey. Here's what you can do right now:</p>
      
      <h3>🚀 Get Started</h3>
      <ul>
        <li><strong>Meet your AI Coach:</strong> Available 24/7 to support you through cravings and challenges</li>
        <li><strong>Set your quit date:</strong> Whether it's today or next week, we'll be with you every step</li>
        <li><strong>Join the community:</strong> Share your story and connect with others</li>
      </ul>
      
      <center>
        <a href="{{app_link}}" class="button">Open NixR App</a>
      </center>
      
      <h3>💡 Quick Tip</h3>
      <p>The first 72 hours can be challenging, but remember: every craving you resist makes you stronger. Your AI coach is always there when you need support.</p>
      
      <p>You've got this, and we've got you!</p>
      
      <p>With support and encouragement,<br>
      The NixR Team</p>
    </div>
    <div class="footer">
      <p>Questions? Reply to this email or visit our <a href="https://nixr.com/help">Help Center</a></p>
      <p>© 2025 NixR, Inc. | <a href="https://nixr.com/privacy">Privacy</a> | <a href="https://nixr.com/terms">Terms</a></p>
    </div>
  </div>
</body>
</html>
```

## 2. Password Reset Email

**Subject:** Reset your NixR password

**From:** NixR Security <security@nixr.com>

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 10px; }
    .button { display: inline-block; padding: 12px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Password Reset Request</h2>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      
      <p>We received a request to reset your NixR password. Click the button below to create a new password:</p>
      
      <center>
        <a href="{{reset_link}}" class="button">Reset Password</a>
      </center>
      
      <p><small>Or copy and paste this link: {{reset_link}}</small></p>
      
      <div class="warning">
        <strong>⚠️ Important:</strong> This link expires in 1 hour for security reasons. If you didn't request this reset, please ignore this email - your password won't be changed.
      </div>
      
      <p>Stay strong on your journey!</p>
      
      <p>The NixR Security Team</p>
    </div>
    <div class="footer">
      <p>This is an automated security email. Please don't reply.</p>
      <p>© 2025 NixR, Inc.</p>
    </div>
  </div>
</body>
</html>
```

## 3. Subscription Confirmation

**Subject:** Welcome to NixR Premium! 🌟

**From:** NixR Team <hello@nixr.com>

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .benefits { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to NixR Premium! 🌟</h1>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      
      <p>Thank you for upgrading to NixR Premium! Your support helps us continue building the best recovery platform while unlocking powerful features for your journey.</p>
      
      <div class="benefits">
        <h3>Your Premium Benefits:</h3>
        <ul>
          <li>✨ <strong>Unlimited AI Coach Sessions</strong> - Get support anytime, as much as you need</li>
          <li>📊 <strong>Advanced Analytics</strong> - Deep insights into your patterns and progress</li>
          <li>🎯 <strong>Custom Recovery Plans</strong> - Personalized strategies based on your data</li>
          <li>🏆 <strong>Exclusive Achievements</strong> - Special badges and rewards</li>
          <li>🚀 <strong>Early Access</strong> - Be first to try new features</li>
          <li>💜 <strong>Premium Support</strong> - Priority response from our team</li>
        </ul>
      </div>
      
      <h3>Subscription Details:</h3>
      <p>
        Plan: {{plan_name}}<br>
        Price: {{price}}<br>
        Next billing date: {{next_billing_date}}<br>
      </p>
      
      <center>
        <a href="{{app_link}}" class="button">Explore Premium Features</a>
      </center>
      
      <p>Thank you for believing in your journey and in NixR. Together, we're stronger! 💪</p>
      
      <p>With gratitude,<br>
      The NixR Team</p>
    </div>
    <div class="footer">
      <p>Manage your subscription in the app under Settings > Subscription</p>
      <p>© 2025 NixR, Inc. | <a href="https://nixr.com/privacy">Privacy</a> | <a href="https://nixr.com/terms">Terms</a></p>
    </div>
  </div>
</body>
</html>
```

## 4. Milestone Achievement Email

**Subject:** 🎉 Amazing! You've reached {{milestone_name}}!

**From:** NixR Celebrations <celebrate@nixr.com>

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 10px; }
    .content { padding: 30px; }
    .achievement { background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0; }
    .stats { display: flex; justify-content: space-around; margin: 20px 0; }
    .stat { text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Incredible Achievement!</h1>
      <h2>{{milestone_name}}</h2>
    </div>
    <div class="content">
      <p>{{first_name}}, this is HUGE!</p>
      
      <div class="achievement">
        <h3>You've been nicotine-free for</h3>
        <p style="font-size: 48px; font-weight: bold; color: #667eea; margin: 10px 0;">{{days_clean}} DAYS</p>
      </div>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${{money_saved}}</div>
          <div>Money Saved</div>
        </div>
        <div class="stat">
          <div class="stat-number">{{units_avoided}}</div>
          <div>{{unit_type}} Avoided</div>
        </div>
        <div class="stat">
          <div class="stat-number">{{life_regained}}h</div>
          <div>Life Regained</div>
        </div>
      </div>
      
      <p>Your dedication is inspiring! Every day you choose freedom, you're not just changing your life - you're showing others it's possible.</p>
      
      <center>
        <a href="{{share_link}}" class="button">Share Your Success</a>
      </center>
      
      <p>Keep going, champion! The best is yet to come. 🚀</p>
      
      <p>Celebrating with you,<br>
      The NixR Team</p>
    </div>
    <div class="footer">
      <p>You're receiving this because you hit an amazing milestone!</p>
      <p>© 2025 NixR, Inc.</p>
    </div>
  </div>
</body>
</html>
```

## 5. Subscription Renewal Reminder

**Subject:** Your NixR Premium renewal is coming up

**From:** NixR Billing <billing@nixr.com>

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 10px; }
    .info-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 25px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h2>Hi {{first_name}},</h2>
      
      <p>Just a friendly reminder that your NixR Premium subscription will renew in 3 days.</p>
      
      <div class="info-box">
        <h3>Renewal Details:</h3>
        <p>
          Plan: {{plan_name}}<br>
          Amount: {{price}}<br>
          Renewal Date: {{renewal_date}}<br>
          Payment Method: {{payment_method}}
        </p>
      </div>
      
      <p>No action needed - your subscription will automatically renew so you can continue enjoying all Premium features without interruption.</p>
      
      <p>Thank you for continuing your journey with NixR Premium! 💜</p>
      
      <center>
        <a href="{{manage_subscription_link}}" class="button">Manage Subscription</a>
      </center>
      
      <p>Questions? Just reply to this email.</p>
      
      <p>Best,<br>
      The NixR Team</p>
    </div>
    <div class="footer">
      <p>Update payment or cancel anytime in Settings > Subscription</p>
      <p>© 2025 NixR, Inc.</p>
    </div>
  </div>
</body>
</html>
```

---

## Email Configuration Notes

1. **Sender Configuration:**
   - Configure SPF, DKIM, and DMARC records
   - Use subdomains for different email types (hello@, security@, billing@)
   - Set up proper reply-to addresses

2. **Template Variables:**
   - All {{variable}} placeholders should be replaced dynamically
   - Ensure proper escaping of user-generated content
   - Test with various name lengths and special characters

3. **Responsive Design:**
   - All templates are mobile-responsive
   - Test on various email clients (Gmail, Outlook, Apple Mail)
   - Provide plain text alternatives

4. **Tracking:**
   - Add UTM parameters to all links
   - Track open rates and click-through rates
   - A/B test subject lines for optimization 