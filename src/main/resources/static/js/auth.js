/**
 * ============================================
 * AUTHENTICATION - Login & Register
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');

  // Switch between login and register
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterForm();
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }

  // Handle login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();
    });
  }

  // Handle register
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleRegister();
    });
  }
});

function showRegisterForm() {
  const card = document.querySelector('.auth-card');
  card.innerHTML = `
    <h2>Đăng ký</h2>
    <p>Tạo tài khoản mới để bắt đầu</p>

    <div id="registerMessages"></div>

    <form id="registerForm">
      <input type="text" id="regName" placeholder="Họ và tên" required>
      <input type="email" id="regEmail" placeholder="Email" required>
      <input type="password" id="regPassword" placeholder="Mật khẩu" required>
      <input type="password" id="regConfirmPassword" placeholder="Xác nhận mật khẩu" required>

      <button type="submit">Đăng ký</button>

      <div class="switch">
        Đã có tài khoản?
        <a id="switchToLogin">Đăng nhập</a>
      </div>
    </form>
  `;

  // Re-attach event listeners
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleRegister();
  });

  document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
  });
}

function showLoginForm() {
  const card = document.querySelector('.auth-card');
  card.innerHTML = `
    <h2>Đăng nhập</h2>
    <p>Chào mừng bạn quay lại!</p>

    <div id="loginMessages"></div>

    <form id="loginForm">
      <input type="email" id="loginEmail" placeholder="Email" required>
      <input type="password" id="loginPassword" placeholder="Mật khẩu" required>

      <button type="submit">Đăng nhập</button>

      <div class="switch">
        Chưa có tài khoản?
        <a id="switchToRegister">Đăng ký</a>
      </div>
    </form>
  `;

  // Re-attach event listeners
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
  });

  document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
  });
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const messagesDiv = document.getElementById('loginMessages');

  // Clear previous messages
  messagesDiv.innerHTML = '';

  // Validate
  if (!FormUtils.validateEmail(email)) {
    showMessage(messagesDiv, 'Email không hợp lệ!', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage(messagesDiv, 'Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    return;
  }

  // TODO: Call API để đăng nhập
  // Giả lập đăng nhập thành công
  setTimeout(() => {
    showMessage(messagesDiv, 'Đăng nhập thành công!', 'success');

    // Save user data
    Storage.set('user', {
      email: email,
      name: 'Người dùng',
      role: email.includes('admin') ? 'admin' : 'user'
    });

    // Redirect
    setTimeout(() => {
      const user = Storage.get('user');
      if (user.role === 'admin') {
        Navigation.navigate(Navigation.pages.admin);
      } else {
        Navigation.navigate(Navigation.pages.dashboard);
      }
    }, 1000);
  }, 500);
}

function handleRegister() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const messagesDiv = document.getElementById('registerMessages');

  // Clear previous messages
  messagesDiv.innerHTML = '';

  // Validate
  if (!name || name.length < 2) {
    showMessage(messagesDiv, 'Vui lòng nhập họ tên hợp lệ!', 'error');
    return;
  }

  if (!FormUtils.validateEmail(email)) {
    showMessage(messagesDiv, 'Email không hợp lệ!', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage(messagesDiv, 'Mật khẩu phải có ít nhất 6 ký tự!', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage(messagesDiv, 'Mật khẩu xác nhận không khớp!', 'error');
    return;
  }

  // TODO: Call API để đăng ký
  // Giả lập đăng ký thành công
  setTimeout(() => {
    showMessage(messagesDiv, 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');

    setTimeout(() => {
      showLoginForm();
    }, 1500);
  }, 500);
}

function showMessage(container, message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'error' ? 'error-message active' : 'success-message active';
  messageDiv.textContent = message;
  container.appendChild(messageDiv);
}
