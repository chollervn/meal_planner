/**
 * ============================================
 * CREATE MEAL - Meal creation functionality
 * ============================================
 */

let currentMealType = 'breakfast';
let foods = [
  { name: 'Ức gà', calo: 240, protein: 45, fat: 5, carb: 0, serving: 150 },
  { name: 'Cá hồi', calo: 240, protein: 25, fat: 14, carb: 0, serving: 120 },
  { name: 'Gạo lứt', calo: 130, protein: 3, fat: 1, carb: 28, serving: 100 },
  { name: 'Yến mạch', calo: 190, protein: 6, fat: 4, carb: 32, serving: 50 },
  { name: 'Trứng gà', calo: 70, protein: 6, fat: 5, carb: 1, serving: 1 },
  { name: 'Chuối', calo: 90, protein: 1, fat: 0, carb: 23, serving: 1 },
  { name: 'Bông cải xanh', calo: 35, protein: 3, fat: 0, carb: 7, serving: 100 },
  { name: 'Khoai lang', calo: 90, protein: 2, fat: 0, carb: 21, serving: 100 },
  { name: 'Sữa chua Hy Lạp', calo: 100, protein: 10, fat: 0, carb: 6, serving: 170 },
  { name: 'Cơm trắng', calo: 130, protein: 2, fat: 0, carb: 28, serving: 100 }
];

document.addEventListener('DOMContentLoaded', () => {
  setupMealTabs();
  setupModal();
  populateFoodSelect();
});

function setupMealTabs() {
  const tabs = document.querySelectorAll('.meal-tabs button');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all
      tabs.forEach(t => t.classList.remove('active'));
      // Add active to clicked
      tab.classList.add('active');

      // Update current meal type
      if (tab.textContent.includes('Sáng')) {
        currentMealType = 'breakfast';
      } else if (tab.textContent.includes('Trưa')) {
        currentMealType = 'lunch';
      } else if (tab.textContent.includes('Tối')) {
        currentMealType = 'dinner';
      }

      // Clear table for new meal
      clearMealTable();
    });
  });
}

function setupModal() {
  const modal = document.getElementById('foodModal');
  const addBtn = document.querySelector('.add-row button');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      Modal.open('foodModal');
    });
  }

  // Close on outside click
  Modal.closeOnOutsideClick('foodModal');

  // Add food button in modal
  const addFoodBtn = document.getElementById('addFoodBtn');
  if (addFoodBtn) {
    addFoodBtn.addEventListener('click', addFood);
  }
}

function populateFoodSelect() {
  const select = document.getElementById('foodSelect');
  if (!select) return;

  select.innerHTML = '';
  foods.forEach((food, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${food.name} (${food.calo} kcal / ${food.serving}${typeof food.serving === 'number' ? 'g' : ' quả'})`;
    select.appendChild(option);
  });
}

function addFood() {
  const select = document.getElementById('foodSelect');
  const quantityInput = document.getElementById('quantity');

  const foodIndex = parseInt(select.value);
  const food = foods[foodIndex];
  const quantity = parseFloat(quantityInput.value);

  if (!quantity || quantity <= 0) {
    alert('Vui lòng nhập định lượng hợp lệ!');
    return;
  }

  // Calculate based on quantity
  const ratio = quantity / food.serving;
  const calculatedCalo = Math.round(food.calo * ratio);

  // Add to table
  const table = document.getElementById('mealTable');
  const row = table.insertRow();
  row.innerHTML = `
    <td>${food.name}</td>
    <td>${quantity}${typeof food.serving === 'number' ? 'g' : ' quả'}</td>
    <td>${calculatedCalo}</td>
    <td><button class="delete-btn" onclick="deleteRow(this)">Xóa</button></td>
  `;

  // Update total calories
  updateTotalCalories();

  // Close modal and reset
  Modal.close('foodModal');
  quantityInput.value = '';
}

function deleteRow(btn) {
  const row = btn.closest('tr');
  row.remove();
  updateTotalCalories();
}

function updateTotalCalories() {
  const table = document.getElementById('mealTable');
  const rows = table.querySelectorAll('tr');
  let total = 0;

  rows.forEach((row, index) => {
    if (index === 0) return; // Skip header
    const cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      total += parseInt(cells[2].textContent) || 0;
    }
  });

  // Update target input display
  const targetInput = document.querySelector('.calo-input input');
  if (targetInput && !targetInput.value) {
    targetInput.value = total;
  }
}

function clearMealTable() {
  const table = document.getElementById('mealTable');
  // Keep only the header row
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }
}

// Save meal template
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.querySelector('.save-template button');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveMealTemplate);
  }
});

function saveMealTemplate() {
  const table = document.getElementById('mealTable');
  const rows = table.querySelectorAll('tr');

  if (rows.length <= 1) {
    alert('Vui lòng thêm ít nhất một thực phẩm!');
    return;
  }

  const mealData = [];
  let totalCalo = 0;

  rows.forEach((row, index) => {
    if (index === 0) return; // Skip header
    const cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      const food = {
        name: cells[0].textContent,
        quantity: cells[1].textContent,
        calo: parseInt(cells[2].textContent)
      };
      mealData.push(food);
      totalCalo += food.calo;
    }
  });

  // Get existing meals or create new array
  const meals = Storage.get('customMeals') || [];

  const newMeal = {
    id: Date.now(),
    type: currentMealType,
    name: `Thực đơn ${currentMealType === 'breakfast' ? 'sáng' : currentMealType === 'lunch' ? 'trưa' : 'tối'} tự tạo`,
    foods: mealData,
    totalCalo: totalCalo,
    createdAt: new Date().toISOString()
  };

  meals.push(newMeal);
  Storage.set('customMeals', meals);

  // Show success
  const btn = saveBtn;
  const originalText = btn.textContent;
  btn.textContent = '✓ Đã lưu!';
  btn.style.background = '#22c55e';

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';

    if (confirm('Thực đơn đã được lưu! Bạn có muốn xem danh sách thực đơn của mình không?')) {
      Navigation.navigate(Navigation.pages.myMeal);
    }
  }, 2000);
}
