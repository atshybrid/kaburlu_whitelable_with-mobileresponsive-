# Backend Integration Guide - Analytics & SEO

## 🎯 Backend API Requirements

Your backend needs to return the following fields in the `/api/v1/public/config` endpoint response.

---

## 📋 Complete Integration Schema

Add these fields to your `integrations` object in the config response:

### **1. Analytics Section**
```json
{
  "integrations": {
    "analytics": {
      "googleAnalytics": "G-XXXXXXXXXX",        // GA4 Measurement ID (nullable)
      "googleTagManager": "GTM-XXXXXXX",         // GTM Container ID (nullable)
      "enabled": true                             // Enable/disable analytics
    }
  }
}
```

**Admin Panel Fields:**
- Google Analytics Measurement ID (text input, validation: `/^G-[A-Z0-9]+$/`)
- Google Tag Manager ID (text input, validation: `/^GTM-[A-Z0-9]+$/`)
- Analytics Enabled (boolean toggle)

---

### **2. Verification Section** ⭐ NEW
```json
{
  "integrations": {
    "verification": {
      "googleSiteVerification": "NPuOT5KVK6Jzr4mlqrSido1dnIDys0",  // Google meta tag code
      "bingSiteVerification": "12345678901234567890"                 // Bing meta tag code
    }
  }
}
```

**Admin Panel Fields:**
- Google Site Verification (text input, 40-50 characters)
- Bing Site Verification (text input, 20-40 characters)

**How to get these values:**
- **Google:** https://search.google.com/search-console (Choose "HTML tag" method)
- **Bing:** https://www.bing.com/webmasters (Choose "Meta tag" method)

---

### **3. Ads Section** (Enhanced)
```json
{
  "integrations": {
    "ads": {
      "adsense": "ca-pub-1234567890123456",           // AdSense Client ID (nullable)
      "adManagerNetworkCode": "12345678",              // Ad Manager network code (nullable)
      "googleAdsConversionId": "AW-123456789",         // Google Ads conversion ID (nullable)
      "googleAdsConversionLabel": "conversion-label",  // Conversion label (nullable)
      "enabled": true                                   // Enable/disable ads
    }
  }
}
```

**Admin Panel Fields:**
- AdSense Client ID (text input, validation: `/^ca-pub-[0-9]+$/`)
- Ad Manager Network Code (text input, numeric only)
- Google Ads Conversion ID (text input, validation: `/^AW-[0-9]+$/`)
- Google Ads Conversion Label (text input)
- Ads Enabled (boolean toggle)

---

### **4. Push Notifications Section** (Enhanced)
```json
{
  "integrations": {
    "push": {
      "vapidPublicKey": "BFG...your-vapid-public-key",   // VAPID public key (nullable)
      "vapidPrivateKey": "PRIVATE_KEY_STORED_SECURELY",  // ⚠️ NEVER send to frontend
      "fcmSenderId": "123456789012",                      // FCM Sender ID (nullable)
      "fcmServerKey": "PRIVATE_FCM_KEY",                  // ⚠️ NEVER send to frontend
      "enabled": true                                      // Enable/disable push
    }
  }
}
```

**Admin Panel Fields:**
- VAPID Public Key (textarea, base64 encoded)
- VAPID Private Key (textarea, encrypted storage, never expose)
- FCM Sender ID (text input, 12 digits)
- FCM Server Key (text input, encrypted storage, never expose)
- Push Notifications Enabled (boolean toggle)

**How to generate VAPID keys:**
```bash
npx web-push generate-vapid-keys
```

**⚠️ SECURITY CRITICAL:**
- `vapidPrivateKey` and `fcmServerKey` should ONLY be stored in the backend database
- These should NEVER be included in the frontend config API response
- Use environment variables or encrypted database fields
- Only send `vapidPublicKey` and `fcmSenderId` to the frontend

---

### **5. Social Section** (Existing)
```json
{
  "integrations": {
    "social": {
      "facebookAppId": "123456789",     // Facebook App ID (nullable)
      "twitterHandle": "@yourhandle"    // Twitter handle (nullable)
    }
  }
}
```

---

## 🗄️ Database Schema Updates

**Table: `tenant_integrations` or `domain_integrations`**

Add these columns:

```sql
-- Verification fields
ALTER TABLE tenant_integrations ADD COLUMN google_site_verification VARCHAR(100);
ALTER TABLE tenant_integrations ADD COLUMN bing_site_verification VARCHAR(100);

-- Enhanced Ads fields
ALTER TABLE tenant_integrations ADD COLUMN ad_manager_network_code VARCHAR(50);
ALTER TABLE tenant_integrations ADD COLUMN google_ads_conversion_id VARCHAR(50);
ALTER TABLE tenant_integrations ADD COLUMN google_ads_conversion_label VARCHAR(100);

-- Enhanced Push fields
ALTER TABLE tenant_integrations ADD COLUMN vapid_public_key TEXT;
ALTER TABLE tenant_integrations ADD COLUMN vapid_private_key TEXT;  -- ENCRYPTED!
ALTER TABLE tenant_integrations ADD COLUMN fcm_sender_id VARCHAR(20);
ALTER TABLE tenant_integrations ADD COLUMN fcm_server_key TEXT;      -- ENCRYPTED!
```

---

## 🔐 Security Implementation

### **Frontend Response (Safe to expose)**
```json
{
  "integrations": {
    "analytics": { "googleAnalytics": "...", "googleTagManager": "...", "enabled": true },
    "verification": { "googleSiteVerification": "...", "bingSiteVerification": "..." },
    "ads": { "adsense": "...", "adManagerNetworkCode": "...", "enabled": true },
    "push": { 
      "vapidPublicKey": "...",   // ✅ Safe to expose
      "fcmSenderId": "...",       // ✅ Safe to expose
      "enabled": true 
    },
    "social": { "facebookAppId": "...", "twitterHandle": "..." }
  }
}
```

### **Backend Only (NEVER expose to frontend)**
```typescript
// These should only be used in backend API routes for sending push notifications
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const fcmServerKey = process.env.FCM_SERVER_KEY
```

---

## 📊 Admin Panel UI Mockup

### **Analytics & Tag Manager Section**
```
┌─────────────────────────────────────────────────────────────┐
│ Analytics & Tag Manager                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Google Analytics Measurement ID                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ G-XXXXXXXXXX                                          │   │
│ └───────────────────────────────────────────────────────┘   │
│ Example: G-XXXXXXXXXX                                        │
│                                                               │
│ Google Tag Manager ID                                        │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ GTM-XXXXXXX                                           │   │
│ └───────────────────────────────────────────────────────┘   │
│ Example: GTM-XXXXXXX                                         │
│                                                               │
│ ☑ Enable Analytics                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Search Console Verification Section**
```
┌─────────────────────────────────────────────────────────────┐
│ Search Console Verification                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Google Site Verification                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ NPuOT5KVK6Jzr4mlqrSido1dnIDys0                        │   │
│ └───────────────────────────────────────────────────────┘   │
│ Get from: Google Search Console → Settings → Ownership      │
│                                                               │
│ Bing Site Verification                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 12345678901234567890                                  │   │
│ └───────────────────────────────────────────────────────┘   │
│ Get from: Bing Webmaster Tools → Settings → Verify Site     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Ads Integration Section**
```
┌─────────────────────────────────────────────────────────────┐
│ Google Ads & AdSense                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ AdSense Client ID                                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ca-pub-1234567890123456                               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Ad Manager Network Code                                      │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 12345678                                              │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Google Ads Conversion ID                                     │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ AW-123456789                                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ Google Ads Conversion Label                                  │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ conversion-label                                      │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ☑ Enable Ads                                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Push Notifications Section**
```
┌─────────────────────────────────────────────────────────────┐
│ Web Push Notifications                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ VAPID Public Key                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ BFG...your-vapid-public-key                           │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ VAPID Private Key 🔒                                        │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••••••••••                        │   │
│ └───────────────────────────────────────────────────────┘   │
│ ⚠️ Stored encrypted, never exposed to frontend              │
│                                                               │
│ FCM Sender ID                                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 123456789012                                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ FCM Server Key 🔒                                           │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ••••••••••••••••••••••••••••••                        │   │
│ └───────────────────────────────────────────────────────┘   │
│ ⚠️ Stored encrypted, never exposed to frontend              │
│                                                               │
│ ☑ Enable Push Notifications                                │
│                                                               │
│ [Generate New VAPID Keys]                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

After implementing backend changes:

1. **Test Config API Response**
   ```bash
   curl https://api.kaburlumedia.com/api/v1/public/config?tenantSlug=kaburlutoday | jq '.integrations'
   ```

2. **Verify Fields Present**
   - ✅ `analytics.googleAnalytics`
   - ✅ `analytics.googleTagManager`
   - ✅ `verification.googleSiteVerification`
   - ✅ `verification.bingSiteVerification`
   - ✅ `ads.adManagerNetworkCode`
   - ✅ `ads.googleAdsConversionId`
   - ✅ `push.vapidPublicKey`
   - ✅ `push.fcmSenderId`

3. **Verify Security**
   - ❌ Response should NOT contain `vapidPrivateKey`
   - ❌ Response should NOT contain `fcmServerKey`

4. **Test Frontend Integration**
   ```bash
   # View page source
   curl https://kaburlutoday.com | grep 'google-site-verification'
   curl https://kaburlutoday.com | grep 'googletagmanager'
   ```

---

## 🚀 Deployment Steps

1. **Update Backend Database Schema**
   - Run migration to add new columns
   - Update ORM models

2. **Update Config API Controller**
   - Add new fields to response
   - Implement security filtering (remove private keys)

3. **Update Admin Panel**
   - Add form fields for new integrations
   - Add validation rules
   - Add help text/tooltips

4. **Test in Staging**
   - Verify all fields return correctly
   - Test admin panel CRUD operations

5. **Deploy to Production**
   - Deploy backend first
   - Deploy frontend (already done!)
   - Verify in production

---

## 📞 Questions?

Contact the frontend team if you need:
- Clarification on any field
- Help with validation rules
- Testing support
- Documentation updates

---

**🎯 Priority: HIGH - Required for best SEO rankings!**
