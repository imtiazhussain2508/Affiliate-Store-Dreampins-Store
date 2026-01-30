# Affiliate Store - Frontend Only

A beautiful, fully-functional affiliate product website built with HTML, CSS, and JavaScript. No backend, no database, no server required!

## 🎯 Features

### Admin Panel
- ✅ Simple admin login (Demo: admin/123456)
- ✅ Add new products with title, description, price, image URL, and affiliate link
- ✅ Edit existing products
- ✅ Delete products
- ✅ Enable/Disable products
- ✅ All data saved in browser localStorage

### User Panel
- ✅ Display all active products in a beautiful grid layout
- ✅ Search products by title or description
- ✅ Show product image, title, price, description
- ✅ "Buy Now" button opens affiliate link in new tab
- ✅ Share button to share products (native share or copy to clipboard)
- ✅ **Pinterest sharing button** - Direct sharing to Pinterest with product image and affiliate link
- ✅ Responsive design (mobile + desktop)
- ✅ Pinterest + Daraz inspired layout

## 🛒 Amazon Affiliate Integration

This store is designed for Amazon affiliate marketing:

### How to Add Amazon Products:
1. Go to any Amazon product page
2. Copy the product URL
3. Add your affiliate tag to the URL (replace `youraffiliateid` with your actual Amazon Associate ID):
   ```
   https://www.amazon.com/dp/B08N5WRWNW?tag=youraffiliateid
   ```
4. In the admin panel, paste this URL as the "Amazon Affiliate Link"
5. Upload or provide the product image URL
6. Add title, description, price, and category

### Pinterest Sharing:
- Each product has a red Pinterest button (📌)
- Clicking it opens Pinterest with the product image, title, and your affiliate link
- Perfect for driving traffic from Pinterest back to your affiliate links

## 📁 Project Structure

```
affiliate-store/
├── index.html          # User-facing product display page
├── admin.html          # Admin panel for product management
├── css/
│   └── style.css       # Complete styling for all pages
└── js/
    ├── storage.js      # localStorage management
    ├── admin.js        # Admin panel functionality
    └── index.js        # User panel functionality
```

## 🚀 Getting Started

### Option 1: Open Directly in Browser
1. Open `index.html` in your web browser
2. To access admin panel, click "Admin" link or go to `admin.html`
3. Login with default credentials:
   - Username: `admin`
   - Password: `123456`

### Option 2: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"
3. Website opens at `http://localhost:5500`

### Option 3: Using Python Server
```bash
# Python 3
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser

## 💾 Data Storage

- All products are stored in **browser localStorage**
- Persistent across browser sessions
- Each product has:
  - Unique ID (timestamp-based)
  - Title, Description, Price
  - Image URL, Affiliate Link
  - Enabled/Disabled status
  - Creation timestamp

## 🔐 Admin Login

**Default Credentials:**
- Username: `admin`
- Password: `123456`

To change credentials, modify `storage.js` in the `initAdmin()` function or update localStorage directly.

## 🎨 Customization

### Change Colors
Edit the CSS variables in `css/style.css`:
```css
:root {
  --primary-color: #e84c3d;      /* Main color */
  --secondary-color: #f5a623;    /* Accent color */
  --dark-bg: #f8f8f8;            /* Background */
}
```

### Change Admin Credentials
Edit `js/storage.js`:
```javascript
localStorage.setItem(this.ADMIN_KEY, JSON.stringify({
  username: 'admin',
  password: 'newpassword'
}));
```

### Add Sample Products
Edit `js/storage.js` and add sample data in `initAdmin()` function.

## 🔍 How It Works

1. **Add Product (Admin)**
   - Fill form with product details
   - Data saved to localStorage
   - Product appears in list

2. **View Products (User)**
   - Page loads all active products from localStorage
   - Products displayed in responsive grid
   - Click "Buy Now" to open affiliate link

3. **Search**
   - Real-time filtering by title or description
   - Case-insensitive search

4. **Manage Products**
   - Edit: Update product information
   - Delete: Remove product permanently
   - Enable/Disable: Show/Hide from user panel

## 📱 Responsive Design

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## ⚠️ Limitations

- Data only stored locally (not synced across devices/browsers)
- Clearing browser cache deletes all data
- Not suitable for production without backend
- Image URLs must be publicly accessible

## 🛡️ Security Notes

- Default admin credentials are basic (change them!)
- No password hashing (frontend only)
- Use HTTPS in production
- Validate URLs before using

## 🎯 Use Cases

- Affiliate marketing websites
- Product showcase sites
- Quick store frontends
- Portfolio projects
- Learning JavaScript fundamentals

## 📝 Sample Product (Add via Admin)

```
Title: Premium Wireless Headphones
Description: High-quality audio with active noise cancellation
Price: 129.99
Image URL: https://images.example.com/headphones.jpg
Affiliate Link: https://amazon.com/dp/B123456789?tag=affiliate
```

## 🤝 Contributing

Feel free to fork, modify, and use this project however you like!

## 📄 License

Free to use and modify for personal and commercial projects.

---

**Created:** January 2026  
**Version:** 1.0.0
