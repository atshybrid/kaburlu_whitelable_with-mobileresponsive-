# Multi-Language Google Fonts Implementation

## 📚 Overview

Comprehensive language-specific Google Fonts integration for 10 Indian languages plus English, with automatic font switching based on the `defaultLanguage` setting from the backend.

## 🌍 Supported Languages

### **English (Default)**
- **Sans-serif**: Inter
- **Serif**: Merriweather  
- **Display/Headings**: Playfair Display
- **Font Code**: `en`

### **Indian Languages**

| Language | Code | Font Family | Script |
|----------|------|-------------|--------|
| **Telugu** | `te`, `telugu` | Noto Sans Telugu | Telugu |
| **Hindi** | `hi`, `hindi` | Noto Sans Devanagari | Devanagari |
| **Tamil** | `ta`, `tamil` | Noto Sans Tamil | Tamil |
| **Kannada** | `kn`, `kannada` | Noto Sans Kannada | Kannada |
| **Malayalam** | `ml`, `malayalam` | Noto Sans Malayalam | Malayalam |
| **Bengali** | `bn`, `bengali` | Noto Sans Bengali | Bengali |
| **Marathi** | `mr`, `marathi` | Noto Sans Devanagari | Devanagari |
| **Gujarati** | `gu`, `gujarati` | Noto Sans Gujarati | Gujarati |
| **Punjabi** | `pa`, `punjabi` | Noto Sans Gurmukhi | Gurmukhi |
| **Odia** | `or`, `odia` | Noto Sans Oriya | Oriya |
| **Urdu** | `ur`, `urdu` | Noto Nastaliq Urdu | Arabic (RTL) |

## 🎨 Font Variables

### CSS Custom Properties

```css
/* English/Default */
--font-sans: var(--font-inter)
--font-serif: var(--font-merriweather)
--font-display: var(--font-playfair)

/* Language-specific (auto-switched) */
--font-telugu
--font-devanagari (Hindi, Marathi)
--font-tamil
--font-kannada
--font-malayalam
--font-bengali
--font-gujarati
--font-gurmukhi (Punjabi)
--font-oriya (Odia)
--font-urdu
```

## 📐 Typography Hierarchy

### Font Application Rules

```css
/* Body text */
body {
  font-family: var(--font-sans);
}

/* Headings (h1-h6, .title, .heading) */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
}

/* Article content */
.article-content, .body-text {
  font-family: var(--font-serif);
}
```

## ⚙️ Configuration

### Backend Setting

The language is determined by the backend API setting:

```json
{
  "content": {
    "defaultLanguage": "telugu"
  }
}
```

Or:

```json
{
  "settings": {
    "content": {
      "defaultLanguage": "hi"
    }
  }
}
```

### Automatic Detection

The system automatically:
1. Fetches `defaultLanguage` from backend settings
2. Normalizes language codes (e.g., "telugu" → "te")
3. Sets `data-lang` attribute on `<html>` tag
4. CSS automatically applies language-specific fonts

## 📏 Font Size Adjustments

Different scripts require different sizing for optimal readability:

| Language | Size Adjust | Line Height |
|----------|-------------|-------------|
| English | 1.0 (16px) | 1.6 |
| Telugu | 1.08 (17.3px) | 1.75 |
| Hindi | 1.06 (17px) | 1.75 |
| Tamil | 1.08 (17.3px) | 1.75 |
| Kannada | 1.08 (17.3px) | 1.75 |
| Malayalam | 1.08 (17.3px) | 1.75 |
| Bengali | 1.06 (17px) | 1.75 |
| Marathi | 1.06 (17px) | 1.75 |
| Gujarati | 1.06 (17px) | 1.75 |
| Punjabi | 1.06 (17px) | 1.75 |
| Odia | 1.06 (17px) | 1.75 |
| Urdu | 1.15 (18.4px) | 1.9 |

## 🔄 RTL Language Support

### Urdu (RTL)

Automatic right-to-left text direction:

```css
html[data-lang='ur'] {
  direction: rtl;
}

html[data-lang='ur'] body {
  text-align: right;
}
```

## 🚀 Implementation Details

### 1. Font Loading (layout.tsx)

```typescript
import { 
  Inter, 
  Noto_Sans_Telugu, 
  Noto_Sans_Devanagari,
  // ... other fonts
} from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansTelugu = Noto_Sans_Telugu({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['telugu'],
  variable: '--font-telugu',
  display: 'swap',
});
```

### 2. Font Variable Application

```typescript
const fontClasses = [
  inter.variable,
  merriweather.variable,
  playfair.variable,
  notoSansTelugu.variable,
  // ... all font variables
].join(' ');

<html lang={primaryLang} data-lang={primaryLang} className={fontClasses}>
```

### 3. CSS Language Detection (globals.css)

```css
html[data-lang='te'],
html[data-lang='telugu'] {
  --font-sans: var(--font-telugu);
  --font-serif: var(--font-telugu);
  --font-display: var(--font-telugu);
}

html[data-lang='te'] body {
  font-family: var(--font-telugu), 'Nirmala UI', sans-serif;
}
```

## 📦 Font Weight Options

All Indian language fonts include 5 weights:
- **400** - Regular (body text)
- **500** - Medium (subtitles)
- **600** - Semibold (subheadings)
- **700** - Bold (headings)
- **800** - Extrabold (hero titles)

English fonts:
- **Merriweather**: 300, 400, 700
- **Playfair Display**: 400, 700, 900
- **Inter**: All weights (variable font)

## 🎯 Usage Examples

### Setting Language via Backend

```json
// Telugu news site
{
  "content": {
    "defaultLanguage": "telugu"
  }
}

// Hindi news site
{
  "content": {
    "defaultLanguage": "hi"
  }
}

// Kannada news site
{
  "content": {
    "defaultLanguage": "kannada"
  }
}
```

### Title Styles

```tsx
// Automatically uses display font based on language
<h1 className="text-4xl font-bold">
  {article.title}
</h1>

// Telugu: Uses Noto Sans Telugu 800
// Hindi: Uses Noto Sans Devanagari 700
// English: Uses Playfair Display 900
```

### Article Content

```tsx
// Automatically uses serif font based on language
<div className="article-content">
  {article.content}
</div>

// Telugu: Uses Noto Sans Telugu 400
// Hindi: Uses Noto Sans Devanagari 400
// English: Uses Merriweather 400
```

## ⚡ Performance Optimizations

1. **Font Display Swap**: Prevents FOIT (Flash of Invisible Text)
2. **Subset Loading**: Only loads required character sets
3. **Variable Injection**: CSS variables prevent duplication
4. **Next.js Optimization**: Automatic font optimization and self-hosting

## 🔧 Font Loading Strategy

```typescript
// All fonts use 'swap' for better performance
display: 'swap'

// Loads only required subsets
subsets: ['telugu']  // Not 'latin' for Indian languages

// Multiple weights for flexibility
weight: ['400', '500', '600', '700', '800']
```

## 📱 Responsive Typography

Font sizes and line heights automatically adjust:

```css
body {
  font-size: calc(1rem * var(--font-size-adjust));
  line-height: var(--line-height-adjust);
}
```

## 🌟 Benefits

1. ✅ **Native Language Support** - Professional fonts for each language
2. ✅ **Automatic Switching** - Based on backend language setting
3. ✅ **Optimal Readability** - Custom size/line-height per script
4. ✅ **Performance** - Next.js font optimization
5. ✅ **Fallback Support** - System fonts as backup
6. ✅ **RTL Support** - Proper Urdu text direction
7. ✅ **Typography Hierarchy** - Different fonts for titles/body/headings
8. ✅ **Professional Quality** - Google Noto Sans family

## 🔍 Debugging

### Check Active Language

Open browser console:
```javascript
document.documentElement.getAttribute('data-lang')
// Returns: 'te', 'hi', 'en', etc.
```

### Verify Font Loading

```javascript
getComputedStyle(document.body).fontFamily
// Returns active font family
```

### Check Font Variables

```javascript
getComputedStyle(document.documentElement).getPropertyValue('--font-sans')
// Returns active sans-serif font variable
```

## 📝 Language Code Mappings

The system supports both ISO 639-1 codes and full names:

```javascript
// All these work for Telugu:
"te", "telugu", "Telugu"

// All these work for Hindi:
"hi", "hindi", "Hindi"

// Language normalization happens automatically
```

## 🎨 Customization

### Adding a New Language

1. Import font in `layout.tsx`:
```typescript
import { Noto_Sans_NewLanguage } from 'next/font/google';
```

2. Configure font:
```typescript
const notoSansNew = Noto_Sans_NewLanguage({
  weight: ['400', '700'],
  subsets: ['new-language'],
  variable: '--font-new',
  display: 'swap',
});
```

3. Add to fontClasses array

4. Add CSS rules in `globals.css`:
```css
html[data-lang='nl'] {
  --font-sans: var(--font-new);
  --font-serif: var(--font-new);
  --font-display: var(--font-new);
}
```

---

**Version**: 1.0.0  
**Last Updated**: January 11, 2026  
**Total Languages Supported**: 11 (English + 10 Indian Languages)
