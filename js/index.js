// Advanced User Panel JavaScript with Modern Features

class AffiliateStore {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.displayedProducts = [];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.currentCategory = '';
    this.currentSort = 'newest';
    this.searchTerm = '';
    this.isLoading = false;
    this.customDomain = this.loadCustomDomain();
    
    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
    this.initializeTheme();
    this.setupBackToTop();
    this.updateStats();
    this.setupMobileMenuListeners();
    this.handleSharedProduct(); // Handle shared product links
  }

  // Load and display products
  loadProducts() {
    this.allProducts = StorageManager.getActiveProducts();
    this.filteredProducts = [...this.allProducts];
    this.applyFiltersAndSort();
    this.updateStats();
  }

  // Show/hide loading spinner
  showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('productsGrid');
    
    if (show) {
      spinner.style.display = 'flex';
      this.isLoading = true;
    } else {
      spinner.style.display = 'none';
      this.isLoading = false;
    }
  }

  // Apply filters and sorting
  applyFiltersAndSort() {
    let products = [...this.allProducts];

    // Apply category filter
    if (this.currentCategory) {
      products = products.filter(product => 
        product.category === this.currentCategory
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    products = this.sortProducts(products, this.currentSort);

    this.filteredProducts = products;
    this.currentPage = 1;
    this.displayProducts();
    this.updateResultsInfo();
  }

  // Sort products
  sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      case 'price-low':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price || 0);
          const priceB = parseFloat(b.price || 0);
          return priceA - priceB;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const priceA = parseFloat(a.price || 0);
          const priceB = parseFloat(b.price || 0);
          return priceB - priceA;
        });
      case 'name-az':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-za':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sorted;
    }
  }

  // Display products with pagination
  displayProducts() {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    this.displayedProducts = this.filteredProducts.slice(0, endIndex);

    this.renderProducts();
    this.updateLoadMoreButton();
  }

  // Render products to DOM
  renderProducts() {
    const container = document.getElementById('productsGrid');
    
    if (this.displayedProducts.length === 0) {
      container.innerHTML = this.getEmptyStateHTML();
      return;
    }

    container.innerHTML = this.displayedProducts.map(product => 
      this.getProductCardHTML(product)
    ).join('');
  }

  // Get product card HTML
  getProductCardHTML(product) {
    const categoryEmoji = this.getCategoryEmoji(product.category);
    const formattedPrice = this.formatPrice(product);
    const categoryName = product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Other';
    
    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-container" onclick="affiliateStore.showProductFullView('${product.id}')">
          <img 
            src="${this.escapeHtml(product.imageUrl)}" 
            alt="${this.escapeHtml(product.title)}" 
            class="product-image" 
            onerror="this.src='https://via.placeholder.com/280x220/f8f9fa/6c757d?text=Product+Image'"
            loading="lazy"
          >
          <div class="view-overlay">
            <span>👁️ View Details</span>
          </div>
        </div>
        <div class="product-details">
          <div class="product-category">${categoryEmoji} ${categoryName}</div>
          <h3 class="product-title" onclick="affiliateStore.showProductFullView('${product.id}')">${this.escapeHtml(product.title)}</h3>
          <div class="product-price">${formattedPrice}</div>
          <p class="product-description">${this.escapeHtml(product.description)}</p>
          <div class="product-actions-user">
            <button class="btn-buy" onclick="affiliateStore.openAffiliateLink('${this.escapeHtml(product.affiliateLink)}', '${this.escapeHtml(product.title)}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Buy Now
            </button>
            <button class="btn-share" onclick="affiliateStore.shareProduct('${product.id}', '${this.escapeHtml(product.title)}', '${this.escapeHtml(product.imageUrl)}', '${this.escapeHtml(product.affiliateLink)}')" title="Share product">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            <button class="btn-pinterest" onclick="affiliateStore.shareToPinterest('${this.escapeHtml(product.title)}', '${this.escapeHtml(product.affiliateLink)}', '${this.escapeHtml(product.imageUrl)}')" title="Share to Pinterest">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 11.5a2.5 2.5 0 0 1 2.5-2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5z"></path>
                <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5-.1-.93-.18-2.37.04-3.39.2-.92 1.32-5.6 1.32-5.6s-.34-.68-.34-1.68c0-1.57.91-2.74 2.05-2.74.97 0 1.43.73 1.43 1.6 0 .97-.62 2.42-.94 3.76-.27 1.14.57 2.07 1.69 2.07 2.03 0 3.59-2.14 3.59-5.23 0-2.73-1.96-4.64-4.76-4.64-3.24 0-5.14 2.43-5.14 4.94 0 .98.38 2.03.85 2.6a.3.3 0 0 1 .07.29c-.08.31-.25 1.02-.29 1.16-.05.2-.17.24-.39.15-1.36-.63-2.21-2.61-2.21-4.21 0-3.42 2.49-6.56 7.17-6.56 3.77 0 6.7 2.69 6.7 6.28 0 3.75-2.36 6.77-5.64 6.77-1.1 0-2.14-.57-2.49-1.25 0 0-.55 2.09-.68 2.61-.25.94-.92 2.12-1.37 2.84A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Get empty state HTML
  getEmptyStateHTML() {
    const message = this.searchTerm || this.currentCategory 
      ? 'No products found matching your criteria' 
      : 'No products available';
    
    const suggestion = this.searchTerm || this.currentCategory
      ? 'Try adjusting your search or filter settings'
      : 'Check back soon for amazing deals!';

    return `
      <div class="empty-state">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🛍️</div>
        <h2>${message}</h2>
        <p>${suggestion}</p>
        ${this.searchTerm || this.currentCategory ? 
          '<button class="btn-load-more" onclick="affiliateStore.clearFilters()" style="margin-top: 1rem;">Clear Filters</button>' : 
          ''
        }
      </div>
    `;
  }

  // Animate products on load
  animateProducts() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }

  // Update load more button
  updateLoadMoreButton() {
    const container = document.getElementById('loadMoreContainer');
    const hasMore = this.displayedProducts.length < this.filteredProducts.length;
    
    container.style.display = hasMore ? 'block' : 'none';
  }

  // Load more products
  loadMoreProducts() {
    if (this.isLoading) return;
    
    this.currentPage++;
    this.displayProducts();
    
    // Smooth scroll to new products
    setTimeout(() => {
      const newProducts = document.querySelectorAll('.product-card');
      if (newProducts.length > 0) {
        const lastProduct = newProducts[Math.min(this.displayedProducts.length - this.productsPerPage, newProducts.length - 1)];
        lastProduct.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Update results info
  updateResultsInfo() {
    const info = document.getElementById('resultsInfo');
    const total = this.filteredProducts.length;
    const showing = this.displayedProducts.length;
    
    if (total === 0) {
      info.style.display = 'none';
      return;
    }
    
    info.style.display = 'block';
    
    let text = `Showing ${showing} of ${total} products`;
    
    if (this.currentCategory) {
      const categoryName = this.currentCategory.charAt(0).toUpperCase() + this.currentCategory.slice(1);
      text += ` in ${categoryName}`;
    }
    
    if (this.searchTerm) {
      text += ` for "${this.searchTerm}"`;
    }
    
    info.textContent = text;
  }

  // Update stats
  updateStats() {
    const totalProducts = this.allProducts.length;
    const categories = new Set(this.allProducts.map(p => p.category).filter(Boolean)).size;
    
    const totalElement = document.getElementById('totalProducts');
    const categoriesElement = document.getElementById('totalCategories');
    
    if (totalElement) {
      this.animateNumber(totalElement, totalProducts);
    }
    
    if (categoriesElement) {
      this.animateNumber(categoriesElement, categories);
    }
  }

  // Animate number counting
  animateNumber(element, target) {
    const start = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (target - start) * progress);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  // Filter by category
  filterByCategory(category = null) {
    if (category === null) {
      category = document.getElementById('categoryFilter').value;
    } else {
      document.getElementById('categoryFilter').value = category;
    }
    
    this.currentCategory = category;
    this.applyFiltersAndSort();
  }

  // Sort products
  sortProducts() {
    this.currentSort = document.getElementById('sortFilter').value;
    this.applyFiltersAndSort();
  }

  // Search products
  searchProducts() {
    const input = document.getElementById('searchInput');
    this.searchTerm = input.value.trim();
    this.applyFiltersAndSort();
  }

  // Clear all filters
  clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = 'newest';
    document.getElementById('searchInput').value = '';
    
    this.currentCategory = '';
    this.currentSort = 'newest';
    this.searchTerm = '';
    
    this.applyFiltersAndSort();
  }

  // Open affiliate link
  openAffiliateLink(url, productTitle) {
    if (!url || !this.isValidUrl(url)) {
      this.showToast('Invalid product link', 'error');
      return;
    }
    
    // Track click (you can integrate with analytics here)
    this.trackProductClick(productTitle, url);
    
    window.open(url, '_blank', 'noopener,noreferrer');
    this.showToast('Opening product page...', 'success');
  }

  // Share product
  async shareProduct(title, link) {
    const shareData = {
      title: `Check out: ${title}`,
      text: `Amazing product: "${title}"`,
      url: link
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        this.showToast('Product shared successfully!', 'success');
      } else {
        // Fallback: Copy to clipboard
        const shareText = `${shareData.text} - ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        this.showToast('Product link copied to clipboard!', 'success');
      }
    } catch (error) {
      // Final fallback
      const shareText = `${shareData.text} - ${shareData.url}`;
      this.fallbackCopyToClipboard(shareText);
      this.showToast('Product link copied!', 'success');
    }
  }

  // Share product to Pinterest
  shareToPinterest(title, link, imageUrl) {
    // Create a compelling description for Pinterest
    const description = `${title} - Check out this amazing product! Shop now and save. #shopping #deals #affiliate`;
    
    // Create Pinterest share URL
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(link)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`;
    
    // Open Pinterest in new window
    window.open(pinterestUrl, '_blank', 'width=600,height=600');
    
    this.showToast('Opening Pinterest to share this product!', 'success');
  }

  // Track product click (for analytics)
  trackProductClick(productTitle, url) {
    // You can integrate with Google Analytics, Facebook Pixel, etc.
    console.log('Product clicked:', { title: productTitle, url: url, timestamp: new Date() });
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'product_click', {
        'product_name': productTitle,
        'product_url': url
      });
    }
  }

  // Show toast notification
  showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;

    // Add toast styles
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background-color: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideUp 0.3s ease;
      max-width: 350px;
      word-wrap: break-word;
    `;

    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

  // Setup event listeners
  setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchProducts(), 300);
    });

    // Enter key for search
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        this.searchProducts();
      }
    });

    // Filter and sort changes
    document.getElementById('categoryFilter').addEventListener('change', () => this.filterByCategory());
    document.getElementById('sortFilter').addEventListener('change', () => this.sortProducts());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      
      // Escape to clear search
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        this.searchProducts();
        searchInput.blur();
      }
    });

    // Infinite scroll (optional)
    window.addEventListener('scroll', this.throttle(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        if (this.displayedProducts.length < this.filteredProducts.length && !this.isLoading) {
          this.loadMoreProducts();
        }
      }
    }, 200));
  }

  // Initialize theme
  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  // Toggle theme
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    this.updateThemeIcon(newTheme);
    
    this.showToast(`Switched to ${newTheme} mode`, 'success');
  }

  // Update theme icon
  updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Setup back to top button
  setupBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    window.addEventListener('scroll', this.throttle(() => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }, 100));
  }

  // Scroll to top
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Mobile menu toggle
  toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-toggle');
    
    // Toggle menu visibility
    navLinks.classList.toggle('mobile-open');
    menuBtn.classList.toggle('active');
  }
  
  // Setup mobile menu event listeners
  setupMobileMenuListeners() {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-toggle');
    
    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        menuBtn.classList.remove('active');
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const nav = document.querySelector('nav');
      if (!nav.contains(e.target) && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        menuBtn.classList.remove('active');
      }
    });
  }

  // Utility functions
  getCategoryEmoji(category) {
    const emojis = {
      electronics: '📱',
      fashion: '👕',
      home: '🏠',
      sports: '⚽',
      books: '📚',
      beauty: '💄',
      toys: '🧸',
      other: '📦'
    };
    return emojis[category] || '📦';
  }

  formatPrice(product) {
    const price = parseFloat(product.price) || 0;
    const currency = product.currency || 'USD';
    
    if (currency === 'PKR') {
      return `₨${price.toLocaleString('en-PK')}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Privacy policy modal
  showPrivacyPolicy() {
    this.showModal('Privacy Policy', `
      <h3>Information We Collect</h3>
      <p>We collect information you provide directly to us and information about your use of our services.</p>
      
      <h3>How We Use Information</h3>
      <p>We use the information to provide, maintain, and improve our services.</p>
      
      <h3>Information Sharing</h3>
      <p>We do not sell, trade, or otherwise transfer your information to third parties without your consent.</p>
      
      <h3>Contact Us</h3>
      <p>If you have questions about this Privacy Policy, please contact us at info@dreampins.com</p>
    `);
  }

  // Terms of service modal
  showTerms() {
    this.showModal('Terms of Service', `
      <h3>Acceptance of Terms</h3>
      <p>By using our service, you agree to these terms.</p>
      
      <h3>Use License</h3>
      <p>Permission is granted to temporarily use our service for personal, non-commercial transitory viewing only.</p>
      
      <h3>Disclaimer</h3>
      <p>The materials on our website are provided on an 'as is' basis.</p>
      
      <h3>Limitations</h3>
      <p>In no event shall our company be liable for any damages arising out of the use or inability to use our service.</p>
    `);
  }

  // Show modal
  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--bg-overlay);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .modal-content {
        background-color: var(--bg-primary);
        border-radius: var(--border-radius);
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 2rem;
        box-shadow: var(--shadow-lg);
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
      }
      .modal-header h2 {
        margin: 0;
        color: var(--primary-color);
      }
      .modal-close {
        font-size: 2rem;
        cursor: pointer;
        color: var(--text-secondary);
        transition: color var(--transition-fast);
      }
      .modal-close:hover {
        color: var(--text-primary);
      }
      .modal-body {
        padding: 1.5rem;
        line-height: 1.6;
      }
      .modal-body h3 {
        color: var(--text-primary);
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
      }
      .modal-body h3:first-child {
        margin-top: 0;
      }
      .modal-body p {
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Handle shared product links
  handleSharedProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    const productName = urlParams.get('name');
    
    if (productId) {
      // Find the product
      const product = this.allProducts.find(p => p.id == productId);
      
      if (product) {
        // Show product highlight
        setTimeout(() => {
          this.highlightSharedProduct(productId, product.title);
        }, 1000);
        
        // Track the shared link visit
        StorageManager.trackProductView(productId);
      } else {
        // Product not found
        this.showToast('Product not found or no longer available', 'error');
      }
      
      // Clean URL after handling
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  // Highlight shared product
  highlightSharedProduct(productId, productTitle) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    
    if (productCard) {
      // Scroll to product
      productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight effect
      productCard.style.border = '3px solid var(--primary-color)';
      productCard.style.boxShadow = '0 0 20px rgba(232, 76, 61, 0.3)';
      productCard.style.transform = 'scale(1.02)';
      
      // Show notification
      this.showToast(`🎆 Featured Product: ${productTitle}`, 'success');
      
      // Remove highlight after 5 seconds
      setTimeout(() => {
        productCard.style.border = '';
        productCard.style.boxShadow = '';
        productCard.style.transform = '';
        productCard.style.transition = 'all 0.3s ease';
      }, 5000);
    }
  }

  // Generate product share link
  generateProductLink(productId, productTitle) {
    const baseUrl = window.location.origin + window.location.pathname;
    const productSlug = productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return `${baseUrl}?product=${productId}&name=${encodeURIComponent(productSlug)}`;
  }

  // Copy product link to clipboard
  async copyProductLink(productId, productTitle) {
    const link = this.generateProductLink(productId, productTitle);
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        this.fallbackCopyToClipboard(link);
      }
      this.showToast(`Product link copied! Share it anywhere! 🔗\n${link}`, 'success');
    } catch (error) {
      this.fallbackCopyToClipboard(link);
      this.showToast('Product link copied to clipboard! 📋', 'success');
    }
  }

  // Share product with multiple options
  async shareProduct(productId, productTitle, productImage, affiliateLink) {
    const shareLink = this.generateProductLink(productId, productTitle);
    const shareData = {
      title: `Check out: ${productTitle}`,
      text: `Amazing product: "${productTitle}" - Get it now!`,
      url: shareLink
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        this.showToast('Product shared successfully!', 'success');
      } else {
        // Show share options modal
        this.showShareModal(productTitle, shareLink, productImage, affiliateLink);
      }
    } catch (error) {
      this.showShareModal(productTitle, shareLink, productImage, affiliateLink);
    }
  }

  // Show share modal with multiple options
  showShareModal(productTitle, shareLink, productImage, affiliateLink) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modal-content share-modal">
        <div class="modal-header">
          <h2>Share Product</h2>
          <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        </div>
        <div class="modal-body">
          <div class="product-preview">
            <img src="${productImage}" alt="${productTitle}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div>
              <h4>${productTitle}</h4>
              <p>Share this amazing product with others!</p>
            </div>
          </div>
          
          <div class="share-link-section">
            <label>Product Link:</label>
            <div class="link-input-group">
              <input type="text" value="${shareLink}" readonly id="shareLink" class="share-link-input">
              <button onclick="affiliateStore.copyText('shareLink')" class="copy-btn">Copy</button>
            </div>
          </div>
          
          <div class="share-options">
            <h4>Share on Social Media:</h4>
            <div class="share-buttons">
              <button onclick="affiliateStore.shareToFacebook('${encodeURIComponent(shareLink)}', '${encodeURIComponent(productTitle)}')" class="share-btn facebook">
                📘 Facebook
              </button>
              <button onclick="affiliateStore.shareToTwitter('${encodeURIComponent(shareLink)}', '${encodeURIComponent(productTitle)}')" class="share-btn twitter">
                🐦 Twitter
              </button>
              <button onclick="affiliateStore.shareToPinterest('${encodeURIComponent(productTitle)}', '${encodeURIComponent(affiliateLink)}', '${encodeURIComponent(productImage)}')" class="share-btn pinterest">
                📌 Pinterest
              </button>
              <button onclick="affiliateStore.shareToWhatsApp('${encodeURIComponent(shareLink)}', '${encodeURIComponent(productTitle)}')" class="share-btn whatsapp">
                💬 WhatsApp
              </button>
              <button onclick="affiliateStore.shareToTelegram('${encodeURIComponent(shareLink)}', '${encodeURIComponent(productTitle)}')" class="share-btn telegram">
                ✈️ Telegram
              </button>
              <button onclick="affiliateStore.shareViaEmail('${encodeURIComponent(shareLink)}', '${encodeURIComponent(productTitle)}')" class="share-btn email">
                📧 Email
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addShareModalStyles();
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Add styles for share modal
  addShareModalStyles() {
    if (document.getElementById('shareModalStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'shareModalStyles';
    style.textContent = `
      .share-modal .modal-content {
        max-width: 500px;
        width: 90%;
      }
      .product-preview {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
      }
      .product-preview h4 {
        margin: 0 0 0.5rem 0;
        color: var(--text-primary);
      }
      .product-preview p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      .share-link-section {
        margin-bottom: 1.5rem;
      }
      .share-link-section label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary);
      }
      .link-input-group {
        display: flex;
        gap: 0.5rem;
      }
      .share-link-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.9rem;
      }
      .copy-btn {
        padding: 0.75rem 1rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      .copy-btn:hover {
        background: var(--primary-dark);
      }
      .share-options h4 {
        margin: 0 0 1rem 0;
        color: var(--text-primary);
      }
      .share-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 0.75rem;
      }
      .share-btn {
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
        text-align: center;
        font-size: 0.9rem;
      }
      .share-btn.facebook { background: #1877f2; color: white; }
      .share-btn.twitter { background: #1da1f2; color: white; }
      .share-btn.pinterest { background: #bd081c; color: white; }
      .share-btn.whatsapp { background: #25d366; color: white; }
      .share-btn.telegram { background: #0088cc; color: white; }
      .share-btn.email { background: #6c757d; color: white; }
      .share-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);
  }

  // Social media sharing functions
  shareToFacebook(link, title) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
    window.open(url, '_blank', 'width=600,height=400');
  }

  shareToTwitter(link, title) {
    const text = `Check out this amazing product: ${decodeURIComponent(title)}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${link}`;
    window.open(url, '_blank', 'width=600,height=400');
  }

  shareToWhatsApp(link, title) {
    const text = `Check out this amazing product: ${decodeURIComponent(title)} ${decodeURIComponent(link)}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  shareToTelegram(link, title) {
    const text = `Check out this amazing product: ${decodeURIComponent(title)}`;
    const url = `https://t.me/share/url?url=${link}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  shareViaEmail(link, title) {
    const subject = `Check out this product: ${decodeURIComponent(title)}`;
    const body = `I found this amazing product and thought you might be interested:\n\n${decodeURIComponent(title)}\n\n${decodeURIComponent(link)}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  // Show product full view modal
  showProductFullView(productId) {
    const product = this.allProducts.find(p => p.id == productId);
    if (!product) return;

    const categoryEmoji = this.getCategoryEmoji(product.category);
    const formattedPrice = this.formatPrice(product);
    const categoryName = product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Other';

    const modal = document.createElement('div');
    modal.className = 'modal show product-modal';
    modal.innerHTML = `
      <div class="modal-content product-full-view">
        <div class="modal-header">
          <h2>${this.escapeHtml(product.title)}</h2>
          <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
        </div>
        <div class="modal-body">
          <div class="product-full-content">
            <div class="product-full-image">
              <img src="${this.escapeHtml(product.imageUrl)}" alt="${this.escapeHtml(product.title)}" onerror="this.src='https://via.placeholder.com/400x400/f8f9fa/6c757d?text=Product+Image'">
            </div>
            <div class="product-full-details">
              <div class="product-category">${categoryEmoji} ${categoryName}</div>
              <h1>${this.escapeHtml(product.title)}</h1>
              <div class="product-price-large">${formattedPrice}</div>
              <div class="product-description-full">
                <h3>Description</h3>
                <p>${this.escapeHtml(product.description)}</p>
              </div>
              <div class="product-actions-full">
                <button class="btn-buy-large" onclick="affiliateStore.openAffiliateLink('${this.escapeHtml(product.affiliateLink)}', '${this.escapeHtml(product.title)}')">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16,17 21,12 16,7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Buy Now
                </button>
                <button class="btn-share-large" onclick="affiliateStore.shareProduct('${product.id}', '${this.escapeHtml(product.title)}', '${this.escapeHtml(product.imageUrl)}', '${this.escapeHtml(product.affiliateLink)}')">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Share
                </button>
                <button class="btn-pinterest-large" onclick="affiliateStore.shareToPinterest('${this.escapeHtml(product.title)}', '${this.escapeHtml(product.affiliateLink)}', '${this.escapeHtml(product.imageUrl)}')">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 11.5a2.5 2.5 0 0 1 2.5-2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5a2.5 2.5 0 0 1-2.5-2.5z"></path>
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5-.1-.93-.18-2.37.04-3.39.2-.92 1.32-5.6 1.32-5.6s-.34-.68-.34-1.68c0-1.57.91-2.74 2.05-2.74.97 0 1.43.73 1.43 1.6 0 .97-.62 2.42-.94 3.76-.27 1.14.57 2.07 1.69 2.07 2.03 0 3.59-2.14 3.59-5.23 0-2.73-1.96-4.64-4.76-4.64-3.24 0-5.14 2.43-5.14 4.94 0 .98.38 2.03.85 2.6a.3.3 0 0 1 .07.29c-.08.31-.25 1.02-.29 1.16-.05.2-.17.24-.39.15-1.36-.63-2.21-2.61-2.21-4.21 0-3.42 2.49-6.56 7.17-6.56 3.77 0 6.7 2.69 6.7 6.28 0 3.75-2.36 6.77-5.64 6.77-1.1 0-2.14-.57-2.49-1.25 0 0-.55 2.09-.68 2.61-.25.94-.92 2.12-1.37 2.84A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"></path>
                  </svg>
                  Pinterest
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addProductModalStyles();
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Track product view
    StorageManager.trackProductView(productId);
  }

  // Add styles for product modal
  addProductModalStyles() {
    if (document.getElementById('productModalStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'productModalStyles';
    style.textContent = `
      .product-modal .modal-content {
        max-width: 900px;
        width: 95%;
      }
      .product-full-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        align-items: start;
      }
      .product-full-image img {
        width: 100%;
        height: auto;
        max-height: 400px;
        object-fit: contain;
        border-radius: 8px;
        background: var(--bg-secondary);
      }
      .product-full-details h1 {
        font-size: 1.5rem;
        margin: 1rem 0;
        color: var(--text-primary);
      }
      .product-price-large {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin: 1rem 0;
      }
      .product-description-full h3 {
        color: var(--text-primary);
        margin: 1.5rem 0 0.5rem 0;
      }
      .product-description-full p {
        color: var(--text-secondary);
        line-height: 1.6;
      }
      .product-actions-full {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        flex-wrap: wrap;
      }
      .btn-buy-large {
        flex: 1;
        padding: 1rem 1.5rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
      }
      .btn-buy-large:hover {
        background: var(--primary-hover);
        transform: translateY(-2px);
      }
      .btn-share-large, .btn-pinterest-large {
        padding: 1rem;
        background: var(--secondary-color);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
      }
      .btn-pinterest-large {
        background: #e60023;
      }
      .btn-share-large:hover, .btn-pinterest-large:hover {
        transform: translateY(-2px);
      }
      .view-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        border-radius: 8px 8px 0 0;
      }
      .product-image-container:hover .view-overlay {
        opacity: 1;
      }
      .product-title {
        cursor: pointer;
        transition: color 0.3s ease;
      }
      .product-title:hover {
        color: var(--primary-color);
      }
      @media (max-width: 768px) {
        .product-full-content {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .product-actions-full {
          flex-direction: column;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Fallback copy to clipboard
  fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  // Copy text from input field
  async copyText(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(input.value);
        } else {
          input.select();
          document.execCommand('copy');
        }
        this.showToast('Link copied to clipboard! 📋', 'success');
      } catch (error) {
        input.select();
        document.execCommand('copy');
        this.showToast('Link copied! 📋', 'success');
      }
    }
  }
}

// Global functions for HTML onclick events
let affiliateStore;

function filterByCategory(category) {
  affiliateStore.filterByCategory(category);
}

function sortProducts() {
  affiliateStore.sortProducts();
}

function searchProducts() {
  affiliateStore.searchProducts();
}

function loadMoreProducts() {
  affiliateStore.loadMoreProducts();
}

function toggleTheme() {
  affiliateStore.toggleTheme();
}

function scrollToTop() {
  affiliateStore.scrollToTop();
}

function toggleMobileMenu() {
  affiliateStore.toggleMobileMenu();
}

function showPrivacyPolicy() {
  affiliateStore.showPrivacyPolicy();
}

function showTerms() {
  affiliateStore.showTerms();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    affiliateStore.showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    affiliateStore.showToast('Failed to copy', 'error');
  });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  affiliateStore = new AffiliateStore();
});

// Add CSS animations for toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100px);
      opacity: 0;
    }
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toast-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: auto;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .toast-close:hover {
    opacity: 1;
  }

  .nav-links.mobile-open {
    display: flex !important;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--bg-primary);
    flex-direction: column;
    padding: 1rem;
    box-shadow: var(--shadow-md);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
  }

  @media (max-width: 768px) {
    .nav-links {
      display: none;
    }
  }
`;
document.head.appendChild(toastStyles);