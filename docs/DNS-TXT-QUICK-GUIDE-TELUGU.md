# DNS TXT Record Setup - Quick Guide (Telugu)

## 🎯 మీరు చేయాల్సిన Steps

### **ప్రతి Domain కోసం ఈ process follow అవండి:**

---

## 📋 Step-by-Step Process

### **1. Google Search Console నుండి TXT Record పొందండి**

```
1. https://search.google.com/search-console కి వెళ్ళండి
2. "Add property" click చేయండి
3. "Domain" option ఎంచుకోండి
4. మీ domain enter చేయండి (e.g., prashnaayudham.com)
5. "Continue" click చేయండి
6. TXT record copy చేయండి:

google-site-verification=ABC123XYZ...
```

---

### **2. DNS Provider లో TXT Record Add చేయండి**

#### **Cloudflare (Most Common):**
```
Dashboard → DNS → Add Record

Type: TXT
Name: @ (లేదా blank)
Content: google-site-verification=ABC123XYZ...
TTL: Auto
Proxy status: DNS only (grey cloud ☁️)

Save చేయండి ✅
```

#### **GoDaddy:**
```
DNS Management → Add → TXT

Type: TXT
Host: @
TXT Value: google-site-verification=ABC123XYZ...
TTL: 1 Hour

Save చేయండి ✅
```

#### **Other Providers:**
```
Look for "DNS Management" or "DNS Records"
Add new TXT record:
  Host/Name: @ or blank (for root domain)
  Value: google-site-verification=ABC123XYZ...
  TTL: Auto/Default
```

---

### **3. DNS Propagation Wait చేయండి**

```bash
# 5-30 minutes wait చేయండి
# Online tool తో check చేయండి:

https://dnschecker.org
→ TXT Record select చేయండి
→ మీ domain enter చేయండి
→ Green checks ✅ అంతా కనిపించాలి
```

**లేదా Command Line:**
```bash
dig TXT prashnaayudham.com

# Output లో ఇలా కనిపించాలి:
"google-site-verification=ABC123XYZ..."
```

---

### **4. Google Search Console లో Verify చేయండి**

```
1. Search Console కి వెళ్ళండి
2. "Verify" button click చేయండి
3. ✅ Success message వస్తుంది!

ఒకవేళ fail అయితే:
- 10-15 minutes ఇంకా wait చేయండి
- మళ్ళీ "Verify" try చేయండి
```

---

## 🌐 మీ అన్ని Domains కోసం

### **prashnaayudham.com**
```
1. Search Console → Add prashnaayudham.com
2. Copy TXT record
3. Cloudflare/DNS provider లో add చేయండి
4. Wait & Verify ✅
```

### **kaburlutoday.com**
```
1. Search Console → Add kaburlutoday.com
2. Copy TXT record (different from above!)
3. Cloudflare/DNS provider లో add చేయండి
4. Wait & Verify ✅
```

### **m4news.in**
```
1. Search Console → Add m4news.in
2. Copy TXT record (different!)
3. DNS provider లో add చేయండి
4. Wait & Verify ✅
```

### **daxintimes.com**
```
1. Search Console → Add daxintimes.com
2. Copy TXT record (different!)
3. DNS provider లో add చేయండి
4. Wait & Verify ✅
```

**⚠️ Important:** ప్రతి domain కి వేరే TXT record ఉంటుంది!

---

## ✅ Verification Check

### **Success అయిందా Check చేయండి:**

```bash
# Method 1: dig command
dig TXT prashnaayudham.com +short

# Should show:
"google-site-verification=ABC123..."

# Method 2: Online tool
https://dnschecker.org
→ Select TXT
→ Enter: prashnaayudham.com
→ All green ✅ = propagated globally!

# Method 3: Search Console
https://search.google.com/search-console
→ Your domain should show green checkmark ✅
```

---

## 🎯 Example (Real Process)

### **prashnaayudham.com Setup:**

```
Step 1: Search Console నుండి
-------
Domain: prashnaayudham.com
TXT Record: google-site-verification=NPuOT5KVK6Jzr4mlqrSido1dnIDys0

Step 2: Cloudflare DNS లో
-------
Type: TXT
Name: @
Content: google-site-verification=NPuOT5KVK6Jzr4mlqrSido1dnIDys0
TTL: Auto
[Save]

Step 3: Wait (15 minutes)
-------
☕ Coffee break...

Step 4: Check
-------
dig TXT prashnaayudham.com
✅ Record visible!

Step 5: Verify
-------
Search Console → Verify button
✅ Ownership verified!
```

---

## 🔍 Bing కోసం కూడా

Same process Bing Webmaster Tools కోసం:

```
1. https://www.bing.com/webmasters
2. Add site → Domain method
3. Get TXT record
4. Add to DNS (same place as Google)
5. Verify

Note: You can have both Google and Bing TXT records 
      in same domain - it's perfectly fine!
```

---

## 🚨 Common Problems & Solutions

### **Problem 1: TXT Record Not Found**
```
Solution:
- Check Host/Name is "@" (not www or blank space)
- Check for typos in TXT value
- Wait 30 more minutes
- Try different DNS checker tool
```

### **Problem 2: Verification Failed**
```
Solution:
- DNS propagation incomplete - wait longer
- Clear your DNS cache:
  Mac: sudo dscacheutil -flushcache
  Windows: ipconfig /flushdns
- Try verifying from different network/device
```

### **Problem 3: Multiple TXT Records**
```
Answer: ✅ This is OK!
- You can have multiple TXT records
- Google will find the right one
- Common to have Google + Bing + others
```

---

## 💡 Pro Tips

1. **Save TXT Records** - Document చేయండి for future reference
2. **Both Methods** - DNS TXT + Meta tag రెండూ keep చేయండి (backup)
3. **All Domains** - అన్ని domains verify చేయండి same time లో
4. **Both Tools** - Google + Bing రెండూ set up చేయండి
5. **Sitemap Submit** - Verification తరువాత sitemap submit చేయండి

---

## 📊 Final Checklist

### **ప్రతి Domain కోసం:**

- [ ] Search Console లో domain add చేశాను
- [ ] TXT record copy చేశాను
- [ ] DNS provider లో TXT record add చేశాను
- [ ] 15-30 minutes wait చేశాను
- [ ] `dig TXT domain.com` తో check చేశాను
- [ ] DNSChecker.org లో verify చేశాను (all green)
- [ ] Search Console లో "Verify" click చేశాను
- [ ] ✅ Green checkmark వచ్చింది
- [ ] Sitemap submit చేశాను
- [ ] Bing Webmaster లో repeat చేశాను

---

## 🎯 Next Steps After Verification

```
1. ✅ Submit Sitemap
   → Search Console → Sitemaps
   → Add: https://prashnaayudham.com/sitemap.xml

2. ✅ Enable Email Alerts
   → Settings → Users and permissions
   → Add your email

3. ✅ Request Indexing
   → URL Inspection tool
   → Enter homepage URL
   → Request indexing

4. ✅ Monitor Performance
   → Check weekly for issues
   → Review search queries
   → Fix any errors
```

---

## 🔗 Quick Links

| Tool | URL |
|------|-----|
| Google Search Console | https://search.google.com/search-console |
| Bing Webmaster | https://www.bing.com/webmasters |
| DNS Checker | https://dnschecker.org |
| Google DNS Lookup | https://dns.google |

---

## ✅ Summary

**మీరు చేస్తున్న Method:** DNS TXT Records ✅  
**Best Practice:** ✅ Production కోసం best method!  
**Time Needed:** 30-60 minutes (అన్ని domains కలిపి)  
**Difficulty:** Easy (instructions follow అవ్వండి)  

**ప్రతి domain verification తరువాత sitemap submit చేయడం మర్చిపోవద్దు!** 🚀

---

**Need Help?**
- Check documentation: `/docs/SEARCH-CONSOLE-VERIFICATION-COMPLETE.md`
- DNS specific guide: `/docs/GOOGLE-SEARCH-CONSOLE-DNS.md`

**Good luck! 🎉**
