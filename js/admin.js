// Advanced Admin Panel JavaScript with Modern Features

class AdminPanel {
  constructor() {
    this.editingProductId = null;
    this.isFormMinimized = false;
    this.currentImageData = null;
    this.filteredProducts = [];
    this.allProducts = [];
    this.currentAdminCategory = '';
    this.currentAdminStatus = '';
    this.adminSearchTerm = '';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeTheme();
    this.setupFormValidation();
    this.loadProducts();
    this.updateStats();
    this.loadCustomDomain();
  }

  // Setup event listeners
  setupEventListeners() {
    // Form submission
    document.getElementById('productForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Character counters
    this.setupCharacterCounters();

    // Image upload drag and drop
    this.setupImageUpload();

    // Admin search with debounce
    const adminSearchInput = document.getElementById('adminSearchInput');
    let searchTimeout;
    
    adminSearchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.searchAdminProducts(), 300);
    });

    // Filter changes
    document.getElementById('adminCategoryFilter').addEventListener('change', () => this.filterAdminProducts());
    document.getElementById('adminStatusFilter').addEventListener('change', () => this.filterAdminProducts());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S to save form
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('adminSection').style.display !== 'none') {
          this.handleFormSubmit();
        }
      }
      
      // Escape to cancel edit
      if (e.key === 'Escape' && this.editingProductId) {
        this.cancelEdit();
      }
    });
  }

  // Setup character counters
  setupCharacterCounters() {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');

    titleInput.addEventListener('input', () => {
      this.updateCharacterCount(titleInput, 100);
    });

    descriptionInput.addEventListener('input', () => {
      this.updateCharacterCount(descriptionInput, 500);
    });
  }

  // Update character count
  updateCharacterCount(input, maxLength) {
    const current = input.value.length;
    const counter = input.parentElement.querySelector('.char-count');
    
    if (counter) {
      counter.textContent = `${current}/${maxLength}`;
      counter.style.color = current > maxLength ? 'var(--error-color)' : 'var(--text-muted)';
    }
  }

  // Setup image upload with drag and drop
  setupImageUpload() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.getElementById('imageFile');

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--primary-color)';
      uploadArea.style.backgroundColor = 'var(--bg-tertiary)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border-color)';
      uploadArea.style.backgroundColor = 'var(--bg-secondary)';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--border-color)';
      uploadArea.style.backgroundColor = 'var(--bg-secondary)';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleImageFile(files[0]);
      }
    });
  }

  // Setup form validation
  setupFormValidation() {
    const form = document.getElementById('productForm');
    const inputs = form.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  // Validate individual field
  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    this.clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Specific field validations
    switch (field.id) {
      case 'title':
        if (value && value.length > 100) {
          isValid = false;
          errorMessage = 'Title must be 100 characters or less';
        }
        break;
      
      case 'description':
        if (value && value.length > 500) {
          isValid = false;
          errorMessage = 'Description must be 500 characters or less';
        }
        break;
      
      case 'price':
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
          isValid = false;
          errorMessage = 'Price must be a valid positive number';
        }
        break;
      
      case 'imageUrl':
        if (value && !this.isValidUrl(value) && !value.startsWith('data:image/')) {
          isValid = false;
          errorMessage = 'Please provide a valid image URL';
        }
        break;
      
      case 'affiliateLink':
        if (value && !this.isValidUrl(value)) {
          isValid = false;
          errorMessage = 'Please provide a valid affiliate link';
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  // Show field error
  showFieldError(field, message) {
    field.style.borderColor = 'var(--error-color)';
    
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('small');
      errorElement.className = 'field-error';
      errorElement.style.cssText = `
        color: var(--error-color);
        font-size: var(--font-size-xs);
        margin-top: var(--spacing-xs);
        display: block;
      `;
      field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  // Clear field error
  clearFieldError(field) {
    field.style.borderColor = 'var(--border-color)';
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  // Handle form submission
  async handleFormSubmit() {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    
    // Show loading state
    this.setFormLoading(true);

    try {
      // Validate all fields
      const inputs = form.querySelectorAll('input, textarea, select');
      let isFormValid = true;
      
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        this.showAlert('Please fix the errors in the form', 'error');
        this.setFormLoading(false);
        return;
      }

      // Collect form data
      const productData = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        price: document.getElementById('price').value.trim(),
        category: document.getElementById('category').value.trim(),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        affiliateLink: document.getElementById('affiliateLink').value.trim()
      };

      // Additional validation
      if (!productData.imageUrl) {
        this.showAlert('Please upload an image or provide an image URL', 'error');
        this.setFormLoading(false);
        return;
      }

      // Save product
      if (this.editingProductId) {
        StorageManager.updateProduct(this.editingProductId, productData);
        this.showAlert('Product updated successfully!', 'success');
      } else {
        StorageManager.addProduct(productData);
        this.showAlert('Product added successfully!', 'success');
      }

      // Reset form and reload
      this.resetForm();
      this.loadProducts();
      this.updateStats();

    } catch (error) {
      console.error('Form submission error:', error);
      this.showAlert('An error occurred while saving the product', 'error');
    } finally {
      this.setFormLoading(false);
    }
  }

  // Set form loading state
  setFormLoading(loading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    if (loading) {
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnSpinner.style.display = 'block';
    } else {
      submitBtn.disabled = false;
      btnText.style.display = 'block';
      btnSpinner.style.display = 'none';
    }
  }

  // Handle image upload
  handleImageUpload(input) {
    const file = input.files[0];
    if (file) {
      this.handleImageFile(file);
    }
  }

  // Handle image file
  handleImageFile(file) {
    // Validate file
    if (!this.validateImageFile(file)) {
      return;
    }

    // Show loading
    this.showImageLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      document.getElementById('imageUrl').value = imageData;
      this.currentImageData = imageData;
      this.showImagePreview(imageData);
      this.showImageLoading(false);
      this.showAlert('Image uploaded successfully!', 'success');
    };

    reader.onerror = () => {
      this.showImageLoading(false);
      this.showAlert('Failed to read image file', 'error');
    };

    reader.readAsDataURL(file);
  }

  // Validate image file
  validateImageFile(file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.showAlert('Image size must be less than 5MB', 'error');
      return false;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      this.showAlert('Please select a valid image file', 'error');
      return false;
    }

    // Check file format
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.showAlert('Supported formats: JPG, PNG, GIF, WebP', 'error');
      return false;
    }

    return true;
  }

  // Show image loading
  showImageLoading(show) {
    const uploadArea = document.querySelector('.upload-area');
    
    if (show) {
      uploadArea.innerHTML = `
        <div class="upload-loading">
          <div class="spinner"></div>
          <p>Uploading image...</p>
        </div>
      `;
    } else {
      uploadArea.innerHTML = `
        <div class="upload-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21,15 16,10 5,21"></polyline>
          </svg>
          <p>Click to upload image</p>
          <small>JPG, PNG, GIF (Max 5MB)</small>
        </div>
      `;
    }
  }

  // Show image preview
  showImagePreview(imageSrc) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    
    previewImg.src = imageSrc;
    preview.style.display = 'flex';
  }

  // Remove image
  removeImage() {
    document.getElementById('imageFile').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    this.currentImageData = null;
    this.showAlert('Image removed', 'success');
  }

  // Handle URL change
  handleUrlChange() {
    const urlInput = document.getElementById('imageUrl');
    const preview = document.getElementById('imagePreview');
    
    if (urlInput.value && this.isValidUrl(urlInput.value)) {
      this.showImagePreview(urlInput.value);
      document.getElementById('imageFile').value = '';
      this.currentImageData = null;
    } else if (!urlInput.value.startsWith('data:image/')) {
      preview.style.display = 'none';
    }
  }

  // Test affiliate link
  async testAffiliateLink() {
    const linkInput = document.getElementById('affiliateLink');
    const url = linkInput.value.trim();

    if (!url) {
      this.showAlert('Please enter an affiliate link first', 'error');
      return;
    }

    if (!this.isValidUrl(url)) {
      this.showAlert('Please enter a valid URL', 'error');
      return;
    }

    try {
      // Test if URL is accessible
      const testBtn = document.querySelector('.btn-test-link');
      const originalText = testBtn.innerHTML;
      
      testBtn.innerHTML = '<div class="btn-spinner"></div> Testing...';
      testBtn.disabled = true;

      // Open in new tab to test
      window.open(url, '_blank', 'noopener,noreferrer');
      
      setTimeout(() => {
        testBtn.innerHTML = originalText;
        testBtn.disabled = false;
        this.showAlert('Link opened in new tab', 'success');
      }, 1000);

    } catch (error) {
      this.showAlert('Failed to test link', 'error');
    }
  }

  // Load and display products
  loadProducts() {
    this.allProducts = StorageManager.getAllProducts();
    this.filteredProducts = [...this.allProducts];
    this.applyAdminFilters();
  }

  // Apply admin filters
  applyAdminFilters() {
    let products = [...this.allProducts];

    // Apply category filter
    if (this.currentAdminCategory) {
      products = products.filter(product => 
        product.category === this.currentAdminCategory
      );
    }

    // Apply status filter
    if (this.currentAdminStatus) {
      if (this.currentAdminStatus === 'active') {
        products = products.filter(product => product.enabled !== false);
      } else if (this.currentAdminStatus === 'disabled') {
        products = products.filter(product => product.enabled === false);
      }
    }

    // Apply search filter
    if (this.adminSearchTerm) {
      const term = this.adminSearchTerm.toLowerCase();
      products = products.filter(product =>
        product.title.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term))
      );
    }

    this.filteredProducts = products;
    this.displayProducts();
  }

  // Display products
  displayProducts() {
    const productsList = document.getElementById('productsList');
    
    if (this.filteredProducts.length === 0) {
      productsList.innerHTML = '<div class="no-products">No products found</div>';
      return;
    }

    productsList.innerHTML = this.filteredProducts.map(product => 
      this.getProductItemHTML(product)
    ).join('');
  }

  // Get product item HTML
  getProductItemHTML(product) {
    const statusClass = product.enabled !== false ? 'active' : 'disabled';
    const statusText = product.enabled !== false ? '✅ Active' : '❌ Disabled';
    
    return `
      <div class="product-item" data-product-id="${product.id}">
        <img 
          src="${this.escapeHtml(product.imageUrl)}" 
          alt="${this.escapeHtml(product.title)}" 
          class="product-thumbnail"
          onerror="this.src='https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image'"
        >
        <div class="product-info">
          <h3>${this.escapeHtml(product.title)}</h3>
          <p><strong>Category:</strong> ${this.getCategoryDisplay(product.category)}</p>
          <p><strong>Price:</strong> ${this.formatPrice(product.price)}</p>
          <p><strong>Status:</strong> <span class="status-${statusClass}">${statusText}</span></p>
          <p><strong>Created:</strong> ${this.formatDate(product.createdAt)}</p>
          <p><strong>Link:</strong> <a href="${this.escapeHtml(product.affiliateLink)}" target="_blank" rel="noopener noreferrer">View</a></p>
        </div>
        <div class="product-actions">
          <button class="btn-small btn-edit" onclick="adminPanel.editProduct(${product.id})" title="Edit product">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button class="btn-small btn-toggle ${product.enabled === false ? 'disabled' : ''}" 
                  onclick="adminPanel.toggleProductStatus(${product.id})" 
                  title="${product.enabled !== false ? 'Disable product' : 'Enable product'}">
            ${product.enabled !== false ? '⏸️ Disable' : '▶️ Enable'}
          </button>
          <button class="btn-small btn-delete" onclick="adminPanel.deleteProduct(${product.id})" title="Delete product">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `;
  }

  // Edit product
  editProduct(id) {
    const product = StorageManager.getProduct(id);
    if (!product) {
      this.showAlert('Product not found', 'error');
      return;
    }

    // Populate form
    document.getElementById('title').value = product.title || '';
    document.getElementById('description').value = product.description || '';
    document.getElementById('price').value = product.price || '';
    document.getElementById('category').value = product.category || '';
    document.getElementById('imageUrl').value = product.imageUrl || '';
    document.getElementById('affiliateLink').value = product.affiliateLink || '';

    // Update character counters
    this.updateCharacterCount(document.getElementById('title'), 100);
    this.updateCharacterCount(document.getElementById('description'), 500);

    // Show image preview if exists
    if (product.imageUrl) {
      this.showImagePreview(product.imageUrl);
    }

    // Update form state
    document.getElementById('submitBtn').querySelector('.btn-text').textContent = 'Update Product';
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    this.editingProductId = id;

    // Scroll to form
    document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('title').focus();

    this.showAlert('Product loaded for editing', 'success');
  }

  // Delete product
  deleteProduct(id) {
    const product = StorageManager.getProduct(id);
    if (!product) {
      this.showAlert('Product not found', 'error');
      return;
    }

    // Show confirmation dialog
    this.showConfirmDialog(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
      () => {
        StorageManager.deleteProduct(id);
        this.showAlert('Product deleted successfully!', 'success');
        this.loadProducts();
        this.updateStats();
        
        // Cancel edit if deleting currently edited product
        if (this.editingProductId === id) {
          this.cancelEdit();
        }
      }
    );
  }

  // Toggle product status
  toggleProductStatus(id) {
    const enabled = StorageManager.toggleProduct(id);
    const status = enabled ? 'enabled' : 'disabled';
    this.showAlert(`Product ${status} successfully!`, 'success');
    this.loadProducts();
    this.updateStats();
  }

  // Cancel edit
  cancelEdit() {
    this.editingProductId = null;
    this.resetForm();
    this.showAlert('Edit cancelled', 'success');
  }

  // Reset form
  resetForm() {
    const form = document.getElementById('productForm');
    form.reset();
    
    // Clear image preview
    document.getElementById('imagePreview').style.display = 'none';
    this.currentImageData = null;
    
    // Clear character counters
    this.updateCharacterCount(document.getElementById('title'), 100);
    this.updateCharacterCount(document.getElementById('description'), 500);
    
    // Clear field errors
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => this.clearFieldError(input));
    
    // Reset form state
    document.getElementById('submitBtn').querySelector('.btn-text').textContent = 'Add Product';
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('cancelBtn').style.display = 'none';
    this.editingProductId = null;
  }

  // Toggle form minimize
  toggleForm() {
    const form = document.querySelector('.product-form');
    const minimizeBtn = document.querySelector('.btn-minimize');
    
    this.isFormMinimized = !this.isFormMinimized;
    
    if (this.isFormMinimized) {
      form.style.display = 'none';
      minimizeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><line x1="12" y1="5" x2="12" y2="19"></line></svg>';
      minimizeBtn.title = 'Expand form';
    } else {
      form.style.display = 'block';
      minimizeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
      minimizeBtn.title = 'Minimize form';
    }
  }

  // Search admin products
  searchAdminProducts() {
    this.adminSearchTerm = document.getElementById('adminSearchInput').value.trim();
    this.applyAdminFilters();
  }

  // Filter admin products
  filterAdminProducts() {
    this.currentAdminCategory = document.getElementById('adminCategoryFilter').value;
    this.currentAdminStatus = document.getElementById('adminStatusFilter').value;
    this.applyAdminFilters();
  }

  // Update stats
  updateStats() {
    const allProducts = this.allProducts;
    const activeProducts = allProducts.filter(p => p.enabled !== false);
    const disabledProducts = allProducts.filter(p => p.enabled === false);
    const categories = new Set(allProducts.map(p => p.category).filter(Boolean));

    this.animateNumber(document.getElementById('totalProductsAdmin'), allProducts.length);
    this.animateNumber(document.getElementById('activeProducts'), activeProducts.length);
    this.animateNumber(document.getElementById('disabledProducts'), disabledProducts.length);
    this.animateNumber(document.getElementById('categoriesCount'), categories.size);
  }

  // Animate number counting
  animateNumber(element, target) {
    if (!element) return;
    
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

  // Show alert message
  showAlert(message, type = 'success') {
    const alert = document.getElementById('alert');
    const alertText = document.getElementById('alertText');
    const alertIcon = document.getElementById('alertIcon');
    
    // Set icon based on type
    alertIcon.textContent = type === 'success' ? '✅' : '❌';
    
    alert.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'} show`;
    alertText.textContent = message;

    // Auto hide after 4 seconds
    setTimeout(() => {
      this.hideAlert();
    }, 4000);
  }

  // Hide alert
  hideAlert() {
    const alert = document.getElementById('alert');
    alert.classList.remove('show');
  }

  // Show confirmation dialog
  showConfirmDialog(title, message, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-primary confirm-btn">Confirm</button>
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
        max-width: 500px;
        margin: 2rem;
        box-shadow: var(--shadow-lg);
      }
      .modal-header {
        padding: 1.5rem 1.5rem 0;
      }
      .modal-header h3 {
        margin: 0;
        color: var(--text-primary);
      }
      .modal-body {
        padding: 1rem 1.5rem;
      }
      .modal-body p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      .modal-footer {
        padding: 0 1.5rem 1.5rem;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }
      .modal-footer .btn {
        width: auto;
        padding: 0.5rem 1rem;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Add event listeners
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');

    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });

    confirmBtn.addEventListener('click', () => {
      modal.remove();
      onConfirm();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
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
    
    this.showAlert(`Switched to ${newTheme} mode`, 'success');
  }

  // Update theme icon
  updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Utility functions
  getCategoryDisplay(category) {
    const categories = {
      electronics: '📱 Electronics',
      fashion: '👕 Fashion',
      home: '🏠 Home & Garden',
      sports: '⚽ Sports',
      books: '📚 Books',
      beauty: '💄 Beauty',
      toys: '🧸 Toys',
      other: '📦 Other'
    };
    return categories[category] || '📦 Other';
  }

  formatPrice(price) {
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  }

  formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  // Save custom domain
  saveCustomDomain(domain) {
    localStorage.setItem('customDomain', domain);
    this.showAlert('Domain saved successfully! Product links will use this domain.', 'success');
  }

  // Load custom domain
  loadCustomDomain() {
    const domainInput = document.getElementById('customDomain');
    if (domainInput) {
      const saved = localStorage.getItem('customDomain') || '';
      domainInput.value = saved;
    }
  }
}

// Global functions for HTML onclick events
let adminPanel;function handleImageUpload(input) {
  adminPanel.handleImageUpload(input);
}

function removeImage() {
  adminPanel.removeImage();
}

function handleUrlChange() {
  adminPanel.handleUrlChange();
}

function testAffiliateLink() {
  adminPanel.testAffiliateLink();
}

function toggleForm() {
  adminPanel.toggleForm();
}

function resetForm() {
  adminPanel.resetForm();
}

function cancelEdit() {
  adminPanel.cancelEdit();
}

function searchAdminProducts() {
  adminPanel.searchAdminProducts();
}

function saveCustomDomain() {
  const domainInput = document.getElementById('customDomain');
  const domain = domainInput.value.trim();
  
  if (!domain) {
    adminPanel.showAlert('Please enter a domain or URL', 'error');
    return;
  }
  
  // Validate URL format
  try {
    new URL(domain);
    adminPanel.saveCustomDomain(domain);
  } catch (e) {
    adminPanel.showAlert('Please enter a valid URL (e.g., https://example.com)', 'error');
  }
}

function filterAdminProducts() {
  adminPanel.filterAdminProducts();
}

function toggleTheme() {
  adminPanel.toggleTheme();
}

function hideAlert() {
  adminPanel.hideAlert();
}

function logoutAdmin() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'admin.html';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    adminPanel.showAlert('Copied to clipboard!', 'success');
  }).catch(() => {
    adminPanel.showAlert('Failed to copy', 'error');
  });
}

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeOpen = document.querySelector('.eye-open');
  const eyeClosed = document.querySelector('.eye-closed');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeOpen.style.display = 'none';
    eyeClosed.style.display = 'block';
  } else {
    passwordInput.type = 'password';
    eyeOpen.style.display = 'block';
    eyeClosed.style.display = 'none';
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the admin page and logged in
  if (document.getElementById('adminSection')) {
    adminPanel = new AdminPanel();
  }
});

// Login handler
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = document.querySelector('.btn-login');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    // Show loading
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';

    // Simulate login delay for better UX
    setTimeout(() => {
      if (StorageManager.verifyAdmin(username, password)) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        document.getElementById('adminNav').style.display = 'block';
        document.getElementById('loginForm').reset();
        
        // Initialize admin panel
        adminPanel = new AdminPanel();
      } else {
        alert('Invalid username or password');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
      }

      // Hide loading
      submitBtn.disabled = false;
      btnText.style.display = 'block';
      btnSpinner.style.display = 'none';
    }, 1000);
  });
}

// Check if already logged in
if (sessionStorage.getItem('adminLoggedIn')) {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('adminSection').style.display = 'block';
  document.getElementById('adminNav').style.display = 'block';
}

// Handle logout query parameter
if (new URLSearchParams(window.location.search).get('logout') === 'true') {
  sessionStorage.removeItem('adminLoggedIn');
  window.history.replaceState({}, document.title, window.location.pathname);
}