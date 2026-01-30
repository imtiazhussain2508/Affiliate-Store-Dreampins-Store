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
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
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
    const formattedPrice = this.formatPrice(product.price);
    
    return `
      <div class="product-card" data-product-id="${product.id}">
        <img 
          src="${this.escapeHtml(product.imageUrl)}" 
          alt="${this.escapeHtml(product.title)}" 
          class="product-image" 
          onerror="this.src='https://via.placeholder.com/280x220/f8f9fa/6c757d?text=Product+Image'"
          loading="lazy"
        >
        <div class="product-details">
          <div class="product-category">${categoryEmoji} ${this.escapeHtml(product.category || 'Other')}</div>
          <h3>${this.escapeHtml(product.title)}</h3>
          <div class="product-price">${formattedPrice}</div>
          <p class="product-description">${this.escapeHtml(product.description)}</p>
          <div class="product-actions-user">
            <button class="btn-buy" onclick="affiliateStore.openAffiliateLink('${this.escapeHtml(product.affiliateLink)}', '${this.escapeHtml(product.title)}')">
              Buy Now
            </button>
            <button class="btn-share" onclick="affiliateStore.copyProductLink('${product.id}', '${this.escapeHtml(product.title)}')" title="Copy shareable link">
              🔗
            </button>
            <button class="btn-pinterest" onclick="affiliateStore.shareToPinterest('${this.escapeHtml(product.title)}', '${this.escapeHtml(product.affiliateLink)}', '${this.escapeHtml(product.imageUrl)}')" title="Share to Pinterest">
              📌
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

  formatPrice(price) {
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
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

  // Load custom domain from localStorage
  loadCustomDomain() {
    return localStorage.getItem('customDomain') || window.location.origin;
  }

  // Save custom domain to localStorage
  saveCustomDomain(domain) {
    localStorage.setItem('customDomain', domain);
    this.customDomain = domain;
    this.showToast('Domain updated successfully!', 'success');
  }

  // Generate product share link
  generateProductLink(productId, productTitle) {
    const baseUrl = this.customDomain;
    const productSlug = productTitle.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}?product=${productId}&name=${productSlug}`;
  }

  // Copy product link to clipboard
  copyProductLink(productId, productTitle) {
    const link = this.generateProductLink(productId, productTitle);
    this.fallbackCopyToClipboard(link);
    this.showToast('Product link copied! Share it anywhere! 🔗', 'success');
  }

  // Fallback copy to clipboard
  fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
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