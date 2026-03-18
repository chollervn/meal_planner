/**
 * Authentication page logic
 */

document.addEventListener('DOMContentLoaded', () => {
  bindLoginForm();
  bindSwitchActions();
});

function bindSwitchActions() {
  const switchToRegister = document.getElementById('switchToRegister');
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (event) => {
      event.preventDefault();
      renderRegisterForm();
    });
  }

  const switchToLogin = document.getElementById('switchToLogin');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', (event) => {
      event.preventDefault();
      renderLoginForm();
    });
  }
}

function bindLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value || '';
    const messages = document.getElementById('loginMessages');
    clearMessages(messages);

    if (!FormUtils.validateEmail(email || '')) {
      showMessage(messages, 'Email không hợp lệ', 'error');
      return;
    }

    if (!password) {
      showMessage(messages, 'Vui lòng nhập mật khẩu', 'error');
      return;
    }

    try {
      const result = await ApiService.login({ email, password });
      if (!result?.success || !result?.data) {
        renderApiErrors(messages, result);
        return;
      }

      const user = result.data;
      Storage.set('user', {
        userId: user.userId,
        email: user.email,
        name: user.username,
        role: user.role || 'USER'
      });

      Storage.set('userProfile', {
        name: user.username,
        email: user.email,
        age: user.age,
        height: user.heightCm,
        weight: user.weightKg,
        bmi: user.bmi,
        userImage: user.userImage || null
      });

      showMessage(messages, 'Đăng nhập thành công', 'success');

      setTimeout(() => {
        if ((user.role || '').toUpperCase() === 'ADMIN') {
          Navigation.navigate(Navigation.pages.admin);
        } else {
          Navigation.navigate(Navigation.pages.dashboard);
        }
      }, 500);
    } catch (error) {
      showMessage(messages, 'Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  });
}

function bindRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) {
    return;
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      username: document.getElementById('regName')?.value?.trim(),
      email: document.getElementById('regEmail')?.value?.trim(),
      password: document.getElementById('regPassword')?.value || '',
      confirmPassword: document.getElementById('regConfirmPassword')?.value || '',
      age: Number(document.getElementById('regAge')?.value),
      heightCm: Number(document.getElementById('regHeight')?.value),
      weightKg: Number(document.getElementById('regWeight')?.value)
    };

    const messages = document.getElementById('registerMessages');
    clearMessages(messages);

    if (!payload.username || payload.username.length < 2) {
      showMessage(messages, 'Tên người dùng phải từ 2 ký tự', 'error');
      return;
    }

    if (!FormUtils.validateEmail(payload.email || '')) {
      showMessage(messages, 'Email không hợp lệ', 'error');
      return;
    }

    if (payload.password.length < 8) {
      showMessage(messages, 'Mật khẩu tối thiểu 8 ký tự', 'error');
      return;
    }

    if (payload.password !== payload.confirmPassword) {
      showMessage(messages, 'Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    if (!payload.age || payload.age < 1 || payload.age > 120) {
      showMessage(messages, 'Tuổi không hợp lệ', 'error');
      return;
    }

    if (!payload.heightCm || payload.heightCm < 50 || payload.heightCm > 300) {
      showMessage(messages, 'Chiều cao không hợp lệ', 'error');
      return;
    }

    if (!payload.weightKg || payload.weightKg < 10 || payload.weightKg > 500) {
      showMessage(messages, 'Cân nặng không hợp lệ', 'error');
      return;
    }

    try {
      const result = await ApiService.register({
        username: payload.username,
        email: payload.email,
        password: payload.password,
        age: payload.age,
        heightCm: payload.heightCm,
        weightKg: payload.weightKg
      });

      if (!result?.success) {
        renderApiErrors(messages, result);
        return;
      }

      showMessage(messages, 'Đăng ký thành công. Vui lòng đăng nhập', 'success');
      setTimeout(renderLoginForm, 800);
    } catch (error) {
      showMessage(messages, 'Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  });
}

function renderLoginForm() {
  const card = document.querySelector('.auth-card');
  if (!card) {
    return;
  }

  card.innerHTML = `
    <h2>Đăng nhập</h2>
    <p>Chào mừng bạn quay lại</p>
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

  bindLoginForm();
  bindSwitchActions();
}

function renderRegisterForm() {
  const card = document.querySelector('.auth-card');
  if (!card) {
    return;
  }

  card.innerHTML = `
    <h2>Đăng ký</h2>
    <p>Tạo tài khoản mới để bắt đầu</p>
    <div id="registerMessages"></div>
    <form id="registerForm">
      <input type="text" id="regName" placeholder="Họ và tên" required>
      <input type="email" id="regEmail" placeholder="Email" required>
      <input type="password" id="regPassword" placeholder="Mật khẩu" required>
      <input type="password" id="regConfirmPassword" placeholder="Xác nhận mật khẩu" required>
      <input type="number" id="regAge" placeholder="Tuổi" required>
      <input type="number" id="regHeight" placeholder="Chiều cao (cm)" required>
      <input type="number" id="regWeight" placeholder="Cân nặng (kg)" required>
      <button type="submit">Đăng ký</button>
      <div class="switch">
        Đã có tài khoản?
        <a id="switchToLogin">Đăng nhập</a>
      </div>
    </form>
  `;

  bindRegisterForm();
  bindSwitchActions();
}

function clearMessages(container) {
  if (container) {
    container.innerHTML = '';
  }
}

function showMessage(container, message, type) {
  if (!container) {
    return;
  }
  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'error' ? 'error-message active' : 'success-message active';
  messageDiv.textContent = message;
  container.appendChild(messageDiv);
}

function renderApiErrors(container, payload) {
  const fields = ApiService.getFieldErrors(payload);
  if (fields) {
    Object.values(fields).forEach((errorText) => {
      showMessage(container, String(errorText), 'error');
    });
    return;
  }

  showMessage(container, ApiService.getErrorText(payload), 'error');
}
