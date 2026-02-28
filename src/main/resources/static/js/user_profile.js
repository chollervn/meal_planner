/**
 * ============================================
 * USER PROFILE - User information management
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  setupProfileHandlers();
});

function loadUserProfile() {
  const user = Storage.get('user');
  if (user) {
    // Load saved profile data
    const profile = Storage.get('userProfile') || {};

    if (profile.name) document.getElementById('userName').value = profile.name;
    if (profile.age) document.getElementById('userAge').value = profile.age;
    if (profile.height) document.getElementById('userHeight').value = profile.height;
    if (profile.weight) document.getElementById('userWeight').value = profile.weight;
    if (profile.email) document.getElementById('userEmail').value = profile.email;

    // Calculate and display BMI
    if (profile.height && profile.weight) {
      updateBMI(profile.weight, profile.height);
    }
  }
}

function setupProfileHandlers() {
  const saveBtn = document.querySelector('.save-btn');
  const uploadBtn = document.querySelector('.upload-btn');
  const heightInput = document.getElementById('userHeight');
  const weightInput = document.getElementById('userWeight');

  // Save profile
  if (saveBtn) {
    saveBtn.addEventListener('click', saveProfile);
  }

  // Upload avatar
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg';
      input.onchange = handleAvatarUpload;
      input.click();
    });
  }

  // Auto-calculate BMI when height/weight change
  if (heightInput && weightInput) {
    heightInput.addEventListener('input', () => {
      const height = parseFloat(heightInput.value);
      const weight = parseFloat(weightInput.value);
      if (height && weight) {
        updateBMI(weight, height);
      }
    });

    weightInput.addEventListener('input', () => {
      const height = parseFloat(heightInput.value);
      const weight = parseFloat(weightInput.value);
      if (height && weight) {
        updateBMI(weight, height);
      }
    });
  }
}

function saveProfile() {
  const profile = {
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    age: document.getElementById('userAge').value,
    height: document.getElementById('userHeight').value,
    weight: document.getElementById('userWeight').value
  };

  // Validate
  if (!profile.name || profile.name.length < 2) {
    alert('Vui lòng nhập họ tên hợp lệ!');
    return;
  }

  if (profile.age && (profile.age < 10 || profile.age > 120)) {
    alert('Tuổi không hợp lệ!');
    return;
  }

  if (profile.height && (profile.height < 100 || profile.height > 250)) {
    alert('Chiều cao không hợp lệ!');
    return;
  }

  if (profile.weight && (profile.weight < 30 || profile.weight > 300)) {
    alert('Cân nặng không hợp lệ!');
    return;
  }

  // Save to storage
  Storage.set('userProfile', profile);

  // Update user in storage
  const user = Storage.get('user');
  user.name = profile.name;
  Storage.set('user', user);

  // Show success message
  const saveBtn = document.querySelector('.save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '✓ Đã lưu!';
  saveBtn.style.background = '#22c55e';

  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = '';
  }, 2000);
}

function updateBMI(weight, height) {
  const bmi = BMICalculator.calculate(weight, height);
  const status = BMICalculator.getStatus(parseFloat(bmi));
  const emoji = BMICalculator.getEmoji(parseFloat(bmi));

  const bmiInput = document.getElementById('userBMI');
  if (bmiInput) {
    bmiInput.value = `${bmi} (${status.label}) ${emoji}`;
  }

  // Update BMI display if exists
  const bmiDisplay = document.querySelector('.bmi-status');
  if (bmiDisplay) {
    bmiDisplay.innerHTML = `
      <h3>Chỉ số BMI của bạn</h3>
      <div class="bmi-value">${bmi}</div>
      <div class="bmi-label">
        <span class="badge badge-${status.class}">${status.label}</span>
        ${emoji}
      </div>
    `;
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files[0];

  if (!file) return;

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('Kích thước file quá lớn! Vui lòng chọn file dưới 5MB.');
    return;
  }

  // Check file type
  if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
    alert('Chỉ chấp nhận file PNG hoặc JPG!');
    return;
  }

  // Read and display image
  const reader = new FileReader();
  reader.onload = (event) => {
    const avatar = document.querySelector('.avatar');
    avatar.innerHTML = `<img src="${event.target.result}" alt="Avatar">`;

    // Save to storage
    Storage.set('userAvatar', event.target.result);
  };
  reader.readAsDataURL(file);
}
