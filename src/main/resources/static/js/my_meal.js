/**
 * Weekly meal schedule page
 */

let weekStart = getWeekStart(new Date());
let availableMeals = [];
let yearSelect = null;
let monthSelect = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = Storage.get('user');
  if (user && String(user.role || '').toUpperCase() === 'ADMIN') {
    alert('Tài khoản admin không sử dụng lịch áp thực đơn. Đang quay về trang quản trị.');
    Navigation.navigate(Navigation.pages.admin);
    return;
  }

  resetToCurrentWeek();
  setupControls();
  await loadMeals();
  await renderCalendar();
});

window.addEventListener('pageshow', async () => {
  resetToCurrentWeek();
  syncControlsWithWeek();
  await renderCalendar();
});

function resetToCurrentWeek() {
  weekStart = getWeekStart(new Date());
}

function setupControls() {
  yearSelect = document.getElementById('yearSelect');
  monthSelect = document.getElementById('monthSelect');

  const prevBtn = document.getElementById('prevWeekBtn');
  const nextBtn = document.getElementById('nextWeekBtn');

  setupDateSelectors();

  if (prevBtn) {
    prevBtn.addEventListener('click', async () => {
      weekStart = addDays(weekStart, -7);
      syncControlsWithWeek();
      await renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      weekStart = addDays(weekStart, 7);
      syncControlsWithWeek();
      await renderCalendar();
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', jumpToSelectedMonthYear);
  }

  if (monthSelect) {
    monthSelect.addEventListener('change', jumpToSelectedMonthYear);
  }
}

function setupDateSelectors() {
  if (monthSelect) {
    monthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month += 1) {
      const option = document.createElement('option');
      option.value = String(month);
      option.textContent = `Tháng ${month}`;
      monthSelect.appendChild(option);
    }
  }

  if (yearSelect) {
    yearSelect.innerHTML = '';
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 5; year <= currentYear + 5; year += 1) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    }
  }

  syncControlsWithWeek();
}

function syncControlsWithWeek() {
  const focusDate = getWeekFocusDate(weekStart);

  if (yearSelect) {
    const yearValue = String(focusDate.getFullYear());
    if (!yearSelect.querySelector(`option[value="${yearValue}"]`)) {
      const option = document.createElement('option');
      option.value = yearValue;
      option.textContent = yearValue;
      yearSelect.appendChild(option);
    }
    yearSelect.value = yearValue;
  }
  if (monthSelect) {
    monthSelect.value = String(focusDate.getMonth() + 1);
  }
}

async function jumpToSelectedMonthYear() {
  if (!yearSelect || !monthSelect) {
    return;
  }

  const year = Number(yearSelect.value);
  const month = Number(monthSelect.value);
  if (!year || !month) {
    return;
  }

  weekStart = getWeekStartInSelectedMonth(year, month);
  syncControlsWithWeek();
  await renderCalendar();
}

async function loadMeals() {
  try {
    const result = await ApiService.getMeals();
    if (result?.success && Array.isArray(result.data)) {
      availableMeals = await enrichMealsForSelector(result.data);
    }
  } catch (error) {
    availableMeals = [];
  }
}

async function enrichMealsForSelector(meals) {
  const tasks = (meals || []).map(async (meal) => {
    const normalizedMeal = {
      ...meal,
      calo: Number(meal?.calo ?? meal?.totalCalo ?? 0)
    };

    try {
      const nutritionResult = await ApiService.getMealNutrition(normalizedMeal.idmf);
      if (nutritionResult?.success && nutritionResult.data) {
        return {
          ...normalizedMeal,
          calo: Number(nutritionResult.data.calories || 0)
        };
      }
    } catch (error) {
      // Keep fallback calories from meal payload
    }

    return normalizedMeal;
  });

  return Promise.all(tasks);
}

async function renderCalendar() {
  const calendar = document.querySelector('.calendar');
  if (!calendar) {
    return;
  }

  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const startDate = formatDateKey(weekDates[0]);
  const endDate = formatDateKey(weekDates[6]);

  calendar.innerHTML = '<div style="text-align:center;padding:20px;">Đang tải...</div>';

  let scheduleMap = {};
  try {
    const result = await ApiService.getUserScheduleWeek(user.userId, startDate, endDate);
    if (result?.success && Array.isArray(result.data)) {
      scheduleMap = mapSchedule(result.data);
    }
  } catch (error) {
    scheduleMap = {};
  }

  calendar.innerHTML = '';
  syncControlsWithWeek();
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  weekDates.forEach((date, index) => {
    const key = formatDateKey(date);
    const meal = scheduleMap[key];

    const day = document.createElement('div');
    day.className = `day ${meal ? 'has-meal' : ''}`;
    day.innerHTML = `<h3>${dayNames[index]}<br><small>${formatDisplayDate(date)}</small></h3>`;

    if (meal) {
      day.innerHTML += createMealCard(meal, key);
    } else {
      const addBox = document.createElement('div');
      addBox.className = 'add-meal';
      addBox.textContent = '+';
      addBox.addEventListener('click', () => openMealSelector(key));
      day.appendChild(addBox);
    }

    calendar.appendChild(day);
  });
}

function mapSchedule(scheduleItems) {
  const map = {};
  scheduleItems.forEach((item) => {
    const dateKey = item.date;
    const meal = item.mealTemplate;
    if (!dateKey || !meal) {
      return;
    }

    const enrichedMeal = (availableMeals || []).find((candidate) => Number(candidate?.idmf) === Number(meal.idmf));

    map[dateKey] = {
      mealId: meal.idmf,
      name: meal.mealName,
      type: meal.type,
      totalCalo: Math.round(Number(enrichedMeal?.calo ?? meal.calo ?? 0)),
      breakfast: 'Xem chi tiết để xem danh sách món',
      lunch: 'Xem chi tiết để xem danh sách món',
      dinner: 'Xem chi tiết để xem danh sách món'
    };
  });
  return map;
}

function createMealCard(meal, dateKey) {
  return `
    <div class="meal-card">
      <span class="meal-calories">🔥 ${meal.totalCalo || 0} kcal</span>
      <span class="remove-btn" onclick="removeMeal('${dateKey}')">✕</span>
      <h4>${meal.name || 'Thực đơn'}</h4>
      <div class="meal-section"><strong>🍳 Bữa sáng</strong><br>${meal.breakfast || '-'}</div>
      <div class="meal-section"><strong>🍛 Bữa trưa</strong><br>${meal.lunch || '-'}</div>
      <div class="meal-section"><strong>🥗 Bữa tối</strong><br>${meal.dinner || '-'}</div>
      <div class="meal-footer">
        <button class="detail-btn" onclick="viewMealDetail(${meal.mealId || 'null'})">Xem chi tiết</button>
      </div>
    </div>
  `;
}

function openMealSelector(dateKey) {
  if (!availableMeals.length) {
    alert('Chưa có thực đơn để áp dụng');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'mealSelectorModal';

  modal.innerHTML = `
    <div class="modal-content">
      <h3>Chọn thực đơn cho ngày ${dateKey}</h3>
      <div id="mealSelectorList"></div>
      <button class="btn btn-primary" style="width:100%;" onclick="closeModal('mealSelectorModal')">Đóng</button>
    </div>
  `;

  document.body.appendChild(modal);

  const list = modal.querySelector('#mealSelectorList');
  list.innerHTML = availableMeals.map((meal) => `
    <button class="btn btn-secondary" style="width:100%; margin-bottom:8px;" data-id="${meal.idmf}">
      ${meal.mealName} (${Math.round(meal.calo || 0)} kcal)
    </button>
  `).join('');

  list.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      await assignMeal(dateKey, Number(button.getAttribute('data-id')));
    });
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal('mealSelectorModal');
    }
  });
}

async function assignMeal(dateKey, mealId) {
  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  try {
    const result = await ApiService.applyMealToSchedule({
      userId: user.userId,
      mealId,
      date: dateKey
    });

    if (!result?.success) {
      showApiAlert(result);
      return;
    }

    closeModal('mealSelectorModal');
    await renderCalendar();
  } catch (error) {
    alert('Có lỗi khi áp dụng thực đơn');
  }
}

async function removeMeal(dateKey) {
  if (!confirm('Bạn chắc chắn muốn xóa thực đơn ngày này?')) {
    return;
  }

  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  try {
    const result = await ApiService.removeMealFromSchedule(user.userId, dateKey);
    if (!result?.success) {
      showApiAlert(result);
      return;
    }
    await renderCalendar();
  } catch (error) {
    alert('Có lỗi khi xóa thực đơn');
  }
}

function viewMealDetail(mealId) {
  if (mealId) {
    Storage.set('selectedMealId', mealId);
    Navigation.navigate(`${Navigation.pages.mealDetail}?mealId=${mealId}`);
    return;
  }
  Navigation.navigate(Navigation.pages.mealDetail);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
  }
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setHours(0, 0, 0, 0);
  return new Date(d.setDate(diff));
}

function getWeekFocusDate(startDate) {
  return addDays(startDate, 3);
}

function getWeekStartInSelectedMonth(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  firstDay.setHours(0, 0, 0, 0);

  const day = firstDay.getDay();
  const offsetToMonday = day === 0 ? 1 : (8 - day) % 7;
  const firstMonday = addDays(firstDay, offsetToMonday);

  return getWeekStart(firstMonday);
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function showApiAlert(payload) {
  const fields = ApiService.getFieldErrors(payload);
  if (fields) {
    alert(Object.values(fields).join('\n'));
    return;
  }
  alert(ApiService.getErrorText(payload));
}
