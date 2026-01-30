// Enhanced Storage Manager - Handle localStorage operations with advanced features

const StorageManager = {
  PRODUCTS_KEY: 'affiliate_products',
  ADMIN_KEY: 'affiliate_admin',
  SETTINGS_KEY: 'affiliate_settings',
  ANALYTICS_KEY: 'affiliate_analytics',

  // Initialize default admin credentials and settings
  initAdmin() {
    // Do not create or force demo admin credentials here.
    // Leave admin unset so the project owner can create secure credentials via the UI.

    // Initialize default settings
    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
        siteName: 'Dreampins Store',
        theme: 'light',
        productsPerPage: 12,
        enableAnalytics: true,
        autoSave: true,
        notifications: true
      }));
    }

    // Initialize default settings
    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
        siteName: 'Dreampins Store',
        theme: 'light',
        productsPerPage: 12,
        enableAnalytics: true,
        autoSave: true,
        notifications: true
      }));
    }

    // Initialize analytics
    if (!localStorage.getItem(this.ANALYTICS_KEY)) {
      localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify({
        totalViews: 0,
        totalClicks: 0,
        popularProducts: [],
        dailyStats: {},
        lastUpdated: new Date().toISOString()
      }));
    }

    // Add sample products if none exist
    if (this.getAllProducts().length === 0) {
      this.addSampleProducts();
    }
  },

  // Add sample products for demo
  addSampleProducts() {
    const sampleProducts = [
      {
        title: 'Premium Wireless Headphones',
        description: 'High-quality audio with active noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.',
        price: '129.99',
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        affiliateLink: 'https://www.amazon.com/Sony-WH-1000XM4-Canceling-Headphones-phone-call/dp/B0863TXGM3?tag=dreampins-20'
      },
      {
        title: 'Stylish Running Shoes',
        description: 'Comfortable and durable running shoes with advanced cushioning technology. Ideal for daily workouts and marathons.',
        price: '89.99',
        category: 'sports',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
        affiliateLink: 'https://www.amazon.com/Nike-Revolution-Running-Shoes-Womens/dp/B07ZPCVR7M?tag=dreampins-20'
      },
      {
        title: 'Smart Home Security Camera',
        description: '1080p HD security camera with night vision, motion detection, and smartphone app control. Keep your home safe.',
        price: '79.99',
        category: 'electronics',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        affiliateLink: 'https://www.amazon.com/Ring-Indoor-Camera-Works-Alexa/dp/B07Q9VBYZN?tag=dreampins-20'
      },
      {
        title: 'Organic Skincare Set',
        description: 'Complete skincare routine with natural ingredients. Includes cleanser, toner, serum, and moisturizer for glowing skin.',
        price: '59.99',
        category: 'beauty',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop',
        affiliateLink: 'https://www.amazon.com/CeraVe-Moisturizing-Cream-Dermatologist-Fragrance/dp/B00TPD9T8E?tag=dreampins-20'
      },
      {
        title: 'Bestselling Fiction Novel',
        description: 'Award-winning novel that captivated millions of readers worldwide. A must-read for book lovers and literature enthusiasts.',
        price: '14.99',
        category: 'books',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop',
        affiliateLink: 'https://www.amazon.com/Where-Crawdads-Sing-Delia-Owens/dp/0735219095?tag=dreampins-20'
      },
      {
        title: 'Designer Casual T-Shirt',
        description: 'Premium cotton t-shirt with modern design. Comfortable fit and stylish look for everyday wear.',
        price: '29.99',
        category: 'fashion',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        affiliateLink: 'https://www.amazon.com/Hanes-EcoSmart-Fleece-Sweatshirt-Medium/dp/B07BJ8G8QC?tag=dreampins-20'
      }
    ];

    sampleProducts.forEach(product => {
      this.addProduct(product);
    });
  },

  // Get admin credentials
  getAdmin() {
    const item = localStorage.getItem(this.ADMIN_KEY);
    return item ? JSON.parse(item) : null;
  },

  // Update admin credentials
  updateAdmin(adminData) {
    const currentAdmin = this.getAdmin() || {};
    const updatedAdmin = { ...currentAdmin, ...adminData };
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(updatedAdmin));
    return updatedAdmin;
  },

  // Verify admin login
  verifyAdmin(username, password) {
    const admin = this.getAdmin();
    if (!admin || !admin.username || !admin.password) return false;

    const isValid = admin.username === username && admin.password === password;
    if (isValid) {
      this.updateAdmin({ lastLogin: new Date().toISOString() });
    }
    return isValid;
  },

  // Get settings
  getSettings() {
    return JSON.parse(localStorage.getItem(this.SETTINGS_KEY)) || {
      siteName: 'Dreampins Store',
      theme: 'light',
      productsPerPage: 12,
      enableAnalytics: true,
      autoSave: true,
      notifications: true
    };
  },

  // Update settings
  updateSettings(settings) {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
    return updatedSettings;
  },

  // Get analytics data
  getAnalytics() {
    return JSON.parse(localStorage.getItem(this.ANALYTICS_KEY)) || {
      totalViews: 0,
      totalClicks: 0,
      popularProducts: [],
      dailyStats: {},
      lastUpdated: new Date().toISOString()
    };
  },

  // Update analytics
  updateAnalytics(analyticsData) {
    const currentAnalytics = this.getAnalytics();
    const updatedAnalytics = { 
      ...currentAnalytics, 
      ...analyticsData,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(updatedAnalytics));
    return updatedAnalytics;
  },

  // Track product view
  trackProductView(productId) {
    const analytics = this.getAnalytics();
    analytics.totalViews++;
    
    const today = new Date().toISOString().split('T')[0];
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = { views: 0, clicks: 0 };
    }
    analytics.dailyStats[today].views++;
    
    this.updateAnalytics(analytics);
  },

  // Track product click
  trackProductClick(productId, productTitle) {
    const analytics = this.getAnalytics();
    analytics.totalClicks++;
    
    const today = new Date().toISOString().split('T')[0];
    if (!analytics.dailyStats[today]) {
      analytics.dailyStats[today] = { views: 0, clicks: 0 };
    }
    analytics.dailyStats[today].clicks++;
    
    // Update popular products
    const existingProduct = analytics.popularProducts.find(p => p.id === productId);
    if (existingProduct) {
      existingProduct.clicks++;
    } else {
      analytics.popularProducts.push({
        id: productId,
        title: productTitle,
        clicks: 1
      });
    }
    
    // Keep only top 10 popular products
    analytics.popularProducts.sort((a, b) => b.clicks - a.clicks);
    analytics.popularProducts = analytics.popularProducts.slice(0, 10);
    
    this.updateAnalytics(analytics);
  },

  // Get all products with enhanced features
  getAllProducts() {
    const products = localStorage.getItem(this.PRODUCTS_KEY);
    return products ? JSON.parse(products) : [];
  },

  // Get only active products
  getActiveProducts() {
    return this.getAllProducts().filter(product => product.enabled !== false);
  },

  // Get products by category
  getProductsByCategory(category) {
    return this.getActiveProducts().filter(product => product.category === category);
  },

  // Search products
  searchProducts(query) {
    const searchTerm = query.toLowerCase();
    return this.getActiveProducts().filter(product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      (product.category && product.category.toLowerCase().includes(searchTerm))
    );
  },

  // Get popular products
  getPopularProducts(limit = 5) {
    const analytics = this.getAnalytics();
    const popularIds = analytics.popularProducts.slice(0, limit).map(p => p.id);
    const allProducts = this.getActiveProducts();
    
    return popularIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean);
  },

  // Add product with enhanced features
  addProduct(product) {
    const products = this.getAllProducts();
    const newProduct = {
      ...product,
      id: Date.now() + Math.random(), // More unique ID
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      clicks: 0
    };
    
    products.push(newProduct);
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    
    // Auto-backup if enabled
    if (this.getSettings().autoSave) {
      this.createBackup();
    }
    
    return newProduct;
  },

  // Update product with enhanced features
  updateProduct(id, updatedProduct) {
    const products = this.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index !== -1) {
      products[index] = { 
        ...products[index], 
        ...updatedProduct, 
        id,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
      
      // Auto-backup if enabled
      if (this.getSettings().autoSave) {
        this.createBackup();
      }
      
      return products[index];
    }
    return null;
  },

  // Delete product
  deleteProduct(id) {
    const products = this.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(filtered));
    
    // Auto-backup if enabled
    if (this.getSettings().autoSave) {
      this.createBackup();
    }
  },

  // Bulk delete products
  bulkDeleteProducts(ids) {
    const products = this.getAllProducts();
    const filtered = products.filter(p => !ids.includes(p.id));
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(filtered));
    
    if (this.getSettings().autoSave) {
      this.createBackup();
    }
  },

  // Bulk update products
  bulkUpdateProducts(ids, updateData) {
    const products = this.getAllProducts();
    
    products.forEach(product => {
      if (ids.includes(product.id)) {
        Object.assign(product, updateData, {
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    
    if (this.getSettings().autoSave) {
      this.createBackup();
    }
  },

  // Get product by ID
  getProduct(id) {
    const products = this.getAllProducts();
    return products.find(p => p.id === id);
  },

  // Toggle product enabled/disabled
  toggleProduct(id) {
    const product = this.getProduct(id);
    if (product) {
      product.enabled = !product.enabled;
      product.updatedAt = new Date().toISOString();
      this.updateProduct(id, product);
      return product.enabled;
    }
    return false;
  },

  // Get categories with product counts
  getCategories() {
    const products = this.getActiveProducts();
    const categories = {};
    
    products.forEach(product => {
      const category = product.category || 'other';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return categories;
  },

  // Get product statistics
  getProductStats() {
    const allProducts = this.getAllProducts();
    const activeProducts = this.getActiveProducts();
    const categories = this.getCategories();
    const analytics = this.getAnalytics();
    
    return {
      total: allProducts.length,
      active: activeProducts.length,
      disabled: allProducts.length - activeProducts.length,
      categories: Object.keys(categories).length,
      totalViews: analytics.totalViews,
      totalClicks: analytics.totalClicks,
      conversionRate: analytics.totalViews > 0 ? (analytics.totalClicks / analytics.totalViews * 100).toFixed(2) : 0
    };
  },

  // Create backup
  createBackup() {
    const backupData = {
      products: this.getAllProducts(),
      admin: this.getAdmin(),
      settings: this.getSettings(),
      analytics: this.getAnalytics(),
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
    
    const backupKey = `affiliate_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backupData));
    
    // Keep only last 5 backups
    this.cleanupBackups();
    
    return backupKey;
  },

  // Get all backups
  getBackups() {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('affiliate_backup_')) {
        try {
          const backup = JSON.parse(localStorage.getItem(key));
          backups.push({
            key,
            timestamp: backup.timestamp,
            version: backup.version || '1.0',
            productsCount: backup.products ? backup.products.length : 0
          });
        } catch (e) {
          console.warn('Invalid backup found:', key);
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Restore from backup
  restoreFromBackup(backupKey) {
    try {
      const backupData = JSON.parse(localStorage.getItem(backupKey));
      
      if (backupData.products) {
        localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(backupData.products));
      }
      
      if (backupData.admin) {
        localStorage.setItem(this.ADMIN_KEY, JSON.stringify(backupData.admin));
      }
      
      if (backupData.settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(backupData.settings));
      }
      
      if (backupData.analytics) {
        localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(backupData.analytics));
      }
      
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  },

  // Cleanup old backups
  cleanupBackups() {
    const backups = this.getBackups();
    
    // Keep only the 5 most recent backups
    if (backups.length > 5) {
      const toDelete = backups.slice(5);
      toDelete.forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    }
  },

  // Export data
  exportData() {
    const exportData = {
      products: this.getAllProducts(),
      settings: this.getSettings(),
      analytics: this.getAnalytics(),
      exportedAt: new Date().toISOString(),
      version: '2.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  },

  // Import data
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(data.products));
      }
      
      if (data.settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
      }
      
      if (data.analytics) {
        localStorage.setItem(this.ANALYTICS_KEY, JSON.stringify(data.analytics));
      }
      
      // Create backup before import
      this.createBackup();
      
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },

  // Clear all data (with confirmation)
  clearAllData() {
    // Create final backup
    this.createBackup();
    
    localStorage.removeItem(this.PRODUCTS_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    localStorage.removeItem(this.ANALYTICS_KEY);
    
    // Reinitialize
    this.initAdmin();
  },

  // Get storage usage
  getStorageUsage() {
    let totalSize = 0;
    const breakdown = {};
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const size = localStorage[key].length;
        totalSize += size;
        
        if (key.startsWith('affiliate_')) {
          breakdown[key] = size;
        }
      }
    }
    
    return {
      total: totalSize,
      breakdown,
      percentage: (totalSize / (5 * 1024 * 1024) * 100).toFixed(2) // Assuming 5MB limit
    };
  }
};

// Initialize admin and settings on page load
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.initAdmin();
  
  // Force sample products creation if none exist
  setTimeout(() => {
    if (StorageManager.getAllProducts().length === 0) {
      StorageManager.addSampleProducts();
    }
  }, 100);
});
