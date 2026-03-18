/**
 * User profile page logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  setupProfileHandlers();
  await loadUserProfile();
});

async function loadUserProfile() {
  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  let profile = Storage.get('userProfile') || {};

  try {
    const result = await ApiService.getUserById(user.userId);
    if (result?.success && result.data) {
      profile = {
        name: result.data.username,
        email: result.data.email,
        age: result.data.age,
        height: result.data.heightCm,
        weight: result.data.weightKg,
        bmi: result.data.bmi,
        userImage: result.data.userImage || null
      };
      Storage.set('userProfile', profile);
    }
  } catch (error) {
    // Keep local data if API not available
  }

  fillProfile(profile);
}

function fillProfile(profile) {
  if (profile.email) document.getElementById('userEmail').value = profile.email;
  if (profile.name) document.getElementById('userName').value = profile.name;
  if (profile.age !== undefined && profile.age !== null) document.getElementById('userAge').value = profile.age;
  if (profile.height !== undefined && profile.height !== null) document.getElementById('userHeight').value = profile.height;
  if (profile.weight !== undefined && profile.weight !== null) document.getElementById('userWeight').value = profile.weight;

  const bmiValue = profile.bmi || (profile.weight && profile.height ? BMICalculator.calculate(profile.weight, profile.height) : null);
  if (bmiValue) {
    renderBMI(bmiValue);
  }

  if (profile.userImage) {
    const avatar = document.querySelector('.avatar');
    if (avatar) {
      avatar.innerHTML = `<img src="${profile.userImage}" alt="Avatar">`;
    }
  }
}

function setupProfileHandlers() {
  const saveBtn = document.querySelector('.save-btn');
  const uploadBtn = document.querySelector('.upload-btn');
  const heightInput = document.getElementById('userHeight');
  const weightInput = document.getElementById('userWeight');

  if (saveBtn) {
    saveBtn.addEventListener('click', saveProfile);
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg';
      input.onchange = handleAvatarUpload;
      input.click();
    });
  }

  const onPhysicalInputChanged = () => {
    const height = parseFloat(heightInput?.value);
    const weight = parseFloat(weightInput?.value);
    if (height > 0 && weight > 0) {
      renderBMI(BMICalculator.calculate(weight, height));
    }
  };

  if (heightInput) heightInput.addEventListener('input', onPhysicalInputChanged);
  if (weightInput) weightInput.addEventListener('input', onPhysicalInputChanged);
}

async function saveProfile() {
  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  const payload = {
    username: document.getElementById('userName').value.trim(),
    age: toNullableNumber(document.getElementById('userAge').value),
    heightCm: toNullableNumber(document.getElementById('userHeight').value),
    weightKg: toNullableNumber(document.getElementById('userWeight').value),
    userImage: Storage.get('userAvatar') || null
  };

  if (!payload.username || payload.username.length < 2) {
    alert('Tên người dùng phải từ 2 ký tự');
    return;
  }

  if (payload.age !== null && (payload.age < 1 || payload.age > 120)) {
    alert('Tuổi không hợp lệ');
    return;
  }

  if (payload.heightCm !== null && (payload.heightCm < 50 || payload.heightCm > 300)) {
    alert('Chiều cao không hợp lệ');
    return;
  }

  if (payload.weightKg !== null && (payload.weightKg < 10 || payload.weightKg > 500)) {
    alert('Cân nặng không hợp lệ');
    return;
  }

  try {
    const result = await ApiService.updateUser(user.userId, payload);
    if (!result?.success || !result.data) {
      showApiAlert(result);
      return;
    }

    const profile = {
      name: result.data.username,
      email: result.data.email,
      age: result.data.age,
      height: result.data.heightCm,
      weight: result.data.weightKg,
      bmi: result.data.bmi,
      userImage: result.data.userImage || null
    };

    Storage.set('userProfile', profile);
    Storage.set('user', {
      ...Storage.get('user'),
      name: result.data.username,
      email: result.data.email,
      role: result.data.role || Storage.get('user')?.role
    });

    renderBMI(result.data.bmi);
    flashSavedState();
  } catch (error) {
    alert('Có lỗi xảy ra, vui lòng thử lại');
  }
}

function renderBMI(bmiValue) {
  const bmiInput = document.getElementById('userBMI');
  if (!bmiInput) {
    return;
  }

  const bmi = Number(bmiValue);
  if (!bmi || Number.isNaN(bmi)) {
    bmiInput.value = 'Chưa đủ dữ liệu';
    return;
  }

  const status = BMICalculator.getStatus(bmi);
  const emoji = BMICalculator.getEmoji(bmi);
  bmiInput.value = `${bmi.toFixed(1)} - ${status.label} ${emoji}`;
}

function flashSavedState() {
  const saveBtn = document.querySelector('.save-btn');
  if (!saveBtn) {
    return;
  }

  const originalText = saveBtn.textContent;
  const originalColor = saveBtn.style.background;

  saveBtn.textContent = 'Đã lưu';
  saveBtn.style.background = '#22c55e';

  setTimeout(() => {
    saveBtn.textContent = originalText;
    saveBtn.style.background = originalColor;
  }, 1200);
}

function handleAvatarUpload(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Kích thước file quá lớn, tối đa 5MB');
    return;
  }

  if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
    alert('Chỉ chấp nhận PNG hoặc JPG');
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const base64 = loadEvent.target.result;
    const avatar = document.querySelector('.avatar');
    if (avatar) {
      avatar.innerHTML = `<img src="${base64}" alt="Avatar">`;
    }
    Storage.set('userAvatar', base64);
  };
  reader.readAsDataURL(file);
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function showApiAlert(payload) {
  const fields = ApiService.getFieldErrors(payload);
  if (fields) {
    alert(Object.values(fields).join('\n'));
    return;
  }
  alert(ApiService.getErrorText(payload));
}
