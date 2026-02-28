/**
 * ============================================
 * MY MEAL CALENDAR - Meal calendar management
 * ============================================
 */

let currentDate = new Date();
let weekStart = getWeekStart(currentDate);

document.addEventListener('DOMContentLoaded', () => {
  setupControls();
  renderCalendar();
});

function setupControls() {
  const prevBtn = document.querySelector('.controls button:nth-child(3)');
  const nextBtn = document.querySelector('.controls button:nth-child(4)');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      weekStart.setDate(weekStart.getDate() - 7);
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      weekStart.setDate(weekStart.getDate() + 7);
      renderCalendar();
    });
  }
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function renderCalendar() {
  const calendar = document.querySelector('.calendar');
  if (!calendar) return;

  calendar.innerHTML = '';

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const mealSchedule = Storage.get('mealSchedule') || {};

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekStart);
    currentDay.setDate(weekStart.getDate() + i);
    const dateKey = formatDateKey(currentDay);

    const dayElement = createDayElement(
      days[i],
      currentDay,
      mealSchedule[dateKey]
    );

    calendar.appendChild(dayElement);
  }
}

function createDayElement(dayName, date, meal) {
  const div = document.createElement('div');
  div.className = meal ? 'day has-meal' : 'day';

  const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

  div.innerHTML = `
    <h3>${dayName}<br><small>${dateStr}</small></h3>
  `;

  if (meal) {
    div.innerHTML += createMealCard(meal, formatDateKey(date));
  } else {
    const addMeal = document.createElement('div');
    addMeal.className = 'add-meal';
    addMeal.textContent = '+';
    addMeal.addEventListener('click', () => openMealSelector(formatDateKey(date)));
    div.appendChild(addMeal);
  }

  return div;
}

function createMealCard(meal, dateKey) {
  return `
    <div class="meal-card">
      <span class="meal-calories">🔥 ${meal.totalCalo || 1500} kcal</span>
      <span class="remove-btn" onclick="removeMeal('${dateKey}')">✕</span>

      <h4>${meal.name || '🥗 Thực đơn tùy chỉnh'}</h4>

      <div class="meal-section">
        <strong>🍳 Bữa sáng</strong><br>
        ${meal.breakfast || 'Chưa có thông tin'}
      </div>

      <div class="meal-section">
        <strong>🍛 Bữa trưa</strong><br>
        ${meal.lunch || 'Chưa có thông tin'}
      </div>

      <div class="meal-section">
        <strong>🥗 Bữa tối</strong><br>
        ${meal.dinner || 'Chưa có thông tin'}
      </div>

      <div class="meal-footer">
        <button class="detail-btn" onclick="viewMealDetail('${dateKey}')">Xem chi tiết</button>
      </div>
    </div>
  `;
}

function openMealSelector(dateKey) {
  // Create modal for meal selection
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'mealSelectorModal';

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Chọn thực đơn cho ngày này</h3>

      <div style="margin: 20px 0;">
        <h4 style="color: #be123c; margin-bottom: 12px;">Thực đơn mẫu</h4>
        <button class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;"
          onclick="assignMeal('${dateKey}', 'diet')">
          🥗 Thực đơn giảm cân (1500 kcal)
        </button>
        <button class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;"
          onclick="assignMeal('${dateKey}', 'gain')">
          🍱 Thực đơn tăng cân (2800 kcal)
        </button>
        <button class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;"
          onclick="assignMeal('${dateKey}', 'maintain')">
          🥙 Thực đơn duy trì (2200 kcal)
        </button>
      </div>

      <div style="margin: 20px 0;">
        <h4 style="color: #be123c; margin-bottom: 12px;">Thực đơn của tôi</h4>
        <div id="customMealsList"></div>
      </div>

      <button class="btn btn-primary" onclick="closeModal('mealSelectorModal')" style="width: 100%;">
        Đóng
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Load custom meals
  loadCustomMeals(dateKey);

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal('mealSelectorModal');
    }
  });
}

function loadCustomMeals(dateKey) {
  const customMeals = Storage.get('customMeals') || [];
  const container = document.getElementById('customMealsList');

  if (customMeals.length === 0) {
    container.innerHTML = '<p style="color: #999; font-size: 14px;">Chưa có thực đơn tùy chỉnh</p>';
    return;
  }

  container.innerHTML = customMeals.map(meal => `
    <button class="btn btn-secondary" style="width: 100%; margin-bottom: 10px;"
      onclick="assignCustomMeal('${dateKey}', ${meal.id})">
      ${meal.name} (${meal.totalCalo} kcal)
    </button>
  `).join('');
}

function assignMeal(dateKey, type) {
  const meals = {
    diet: {
      name: '🥗 Thực đơn giảm cân',
      totalCalo: 1500,
      breakfast: 'Yến mạch + Trứng luộc + Chuối',
      lunch: 'Ức gà áp chảo + Gạo lứt + Rau xanh',
      dinner: 'Cá hấp + Salad dầu oliu'
    },
    gain: {
      name: '🍱 Thực đơn tăng cân',
      totalCalo: 2800,
      breakfast: 'Bánh mì sandwich + Sữa + Chuối',
      lunch: 'Thịt bò + Cơm trắng + Rau củ',
      dinner: 'Cá hồi + Khoai lang + Bơ'
    },
    maintain: {
      name: '🥙 Thực đơn duy trì',
      totalCalo: 2200,
      breakfast: 'Yến mạch + Sữa chua + Quả mọng',
      lunch: 'Gà nướng + Cơm lứt + Salad',
      dinner: 'Cá + Khoai tây + Rau luộc'
    }
  };

  const schedule = Storage.get('mealSchedule') || {};
  schedule[dateKey] = meals[type];
  Storage.set('mealSchedule', schedule);

  closeModal('mealSelectorModal');
  renderCalendar();
}

function assignCustomMeal(dateKey, mealId) {
  const customMeals = Storage.get('customMeals') || [];
  const meal = customMeals.find(m => m.id === mealId);

  if (meal) {
    const schedule = Storage.get('mealSchedule') || {};
    schedule[dateKey] = {
      name: meal.name,
      totalCalo: meal.totalCalo,
      breakfast: meal.type === 'breakfast' ? meal.foods.map(f => f.name).join(', ') : '',
      lunch: meal.type === 'lunch' ? meal.foods.map(f => f.name).join(', ') : '',
      dinner: meal.type === 'dinner' ? meal.foods.map(f => f.name).join(', ') : ''
    };
    Storage.set('mealSchedule', schedule);
  }

  closeModal('mealSelectorModal');
  renderCalendar();
}

function removeMeal(dateKey) {
  if (confirm('Bạn có chắc muốn xóa thực đơn này?')) {
    const schedule = Storage.get('mealSchedule') || {};
    delete schedule[dateKey];
    Storage.set('mealSchedule', schedule);
    renderCalendar();
  }
}

function viewMealDetail(dateKey) {
  // Navigate to detail page with date parameter
  Navigation.navigate(Navigation.pages.mealDetail + '?date=' + dateKey);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
