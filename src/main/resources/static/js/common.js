/**
 * ============================================
 * COMMON JAVASCRIPT - Utilities & Navigation
 * ============================================
 */

// Navigation manager
const Navigation = {
  pages: {
    login: '/login',
    dashboard: '/dashboard',
    userProfile: '/user_profile',
    myMeal: '/my_meals',
    mealPlans: '/meal_plans',
    createMeal: '/create_meal',
    mealDetail: '/meal_detail',
    admin: '/admin'
  },

  navigate(page) {
    const user = Storage.get('user');
    const isAdmin = user && String(user.role || '').toUpperCase() === 'ADMIN';

    if (isAdmin && page === this.pages.myMeal) {
      window.location.href = this.pages.admin;
      return;
    }

    window.location.href = page;
  },

  setActive(pageName) {
    const links = document.querySelectorAll('.nav-menu a');
    links.forEach(link => {
      link.classList.remove('active');
      if (link.textContent.includes(pageName)) {
        link.classList.add('active');
      }
    });
  },

  setupNavigation() {
    this.applyRoleBasedNav();

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const text = e.target.textContent;

        if (text.includes('Thông tin cá nhân')) {
          this.navigate(this.pages.userProfile);
        } else if (text.includes('Thực đơn của tôi')) {
          this.navigate(this.pages.myMeal);
        } else if (text.includes('Thực đơn mẫu')) {
          this.navigate(this.pages.mealPlans);
        } else if (text.includes('Dashboard')) {
          this.navigate(this.pages.dashboard);
        } else if (text.includes('Người dùng') || text.includes('Quản lý người dùng') || text.includes('Quản lí người dùng')) {
          this.navigate(this.pages.admin);
        } else if (text.trim() === 'Thực đơn') {
          this.navigate(this.pages.mealPlans);
        }
      });
    });

    // Logout
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
          this.logout();
        }
      });
    }

    // Logo click
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', () => {
        const user = Storage.get('user');
        const isAdmin = user && String(user.role || '').toUpperCase() === 'ADMIN';
        this.navigate(isAdmin ? this.pages.admin : this.pages.dashboard);
      });
    }
  },

  applyRoleBasedNav() {
    const user = Storage.get('user');
    const isAdmin = user && String(user.role || '').toUpperCase() === 'ADMIN';
    if (!isAdmin) {
      return;
    }

    const links = Array.from(document.querySelectorAll('.nav-menu a:not(.logout)'));
    if (!links.length) {
      return;
    }

    if (links[0]) {
      links[0].textContent = 'Quản lý người dùng';
    }

    if (links[1]) {
      links[1].textContent = 'Thực đơn mẫu';
    }

    for (let i = links.length - 1; i >= 2; i -= 1) {
      links[i].remove();
    }
  },

  async logout() {
    try {
      if (window.ApiService && typeof window.ApiService.logout === 'function') {
        await window.ApiService.logout();
      }
    } catch (error) {
      // Ignore API logout failure and still clear client session
    }

    localStorage.clear();
    sessionStorage.clear();
    this.navigate(this.pages.login);
  }
};

// Modal utilities
const Modal = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  },

  closeOnOutsideClick(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close(modalId);
        }
      });
    }
  }
};

// Form utilities
const FormUtils = {
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  showError(element, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message active';
    errorDiv.textContent = message;
    element.parentElement.insertBefore(errorDiv, element);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  },

  showSuccess(element, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message active';
    successDiv.textContent = message;
    element.parentElement.insertBefore(successDiv, element);

    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }
};

// Storage utilities
const Storage = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  }
};

// BMI Calculator
const BMICalculator = {
  calculate(weight, height) {
    // height in cm, weight in kg
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  },

  getStatus(bmi) {
    if (bmi < 18.5) return { label: 'Thiếu cân', class: 'under' };
    if (bmi < 25) return { label: 'Bình thường', class: 'normal' };
    if (bmi < 30) return { label: 'Thừa cân', class: 'over' };
    return { label: 'Béo phì', class: 'over' };
  },

  getEmoji(bmi) {
    if (bmi < 18.5) return '😟';
    if (bmi < 25) return '😎';
    if (bmi < 30) return '😅';
    return '😰';
  }
};

// Initialize common features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  Navigation.setupNavigation();
});
