/**
 * Create custom meal template
 */

let currentMealType = 'breakfast';
let foods = [];
let foodsLoaded = false;
const mealFoods = {
  breakfast: [],
  lunch: [],
  dinner: []
};

document.addEventListener('DOMContentLoaded', async () => {
  setupMealNameInput();
  setupMealTabs();
  setupModal();
  setupFoodLibrary();
  setupSaveButton();
  await loadFoods();
  updateTargetCalories();
});

function setupMealNameInput() {
  const mealNameInput = document.getElementById('mealNameInput');
  if (!mealNameInput) {
    return;
  }

  if (!mealNameInput.value.trim()) {
    mealNameInput.value = `Thực đơn tùy chỉnh ${new Date().toLocaleDateString('vi-VN')}`;
  }
}

async function loadFoods(showFailureAlert = true) {
  try {
    const result = await ApiService.getFoods();
    if (result?.success && Array.isArray(result.data)) {
      foods = result.data.map((food) => ({
        id: food.foodId,
        name: food.foodName,
        calo: Number(food.calories || 0),
        protein: Number(food.protein || 0),
        fat: Number(food.fat || 0),
        carb: Number(food.carb || 0),
        fiber: Number(food.fiber || 0)
      }));
    }
  } catch (error) {
    foods = [];
  }

  foodsLoaded = foods.length > 0;
  populateFoodSelect();

  if (!foodsLoaded && showFailureAlert) {
    alert('Không tải được danh sách thực phẩm từ backend. Vui lòng thử lại sau.');
  }

  renderFoodLibrary(foods);
}

function setupMealTabs() {
  const tabs = document.querySelectorAll('.meal-tabs button');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');

      const text = normalizeText(tab.textContent);
      if (text.includes('sang')) currentMealType = 'breakfast';
      else if (text.includes('trua')) currentMealType = 'lunch';
      else currentMealType = 'dinner';

      renderCurrentMealRows();
      updateTargetCalories();
    });
  });
}

function setupModal() {
  const addBtn = document.querySelector('.add-row button');
  if (addBtn) {
    addBtn.addEventListener('click', () => Modal.open('foodModal'));
    addBtn.addEventListener('click', () => updateSelectedFoodCaloriesPreview());
  }

  Modal.closeOnOutsideClick('foodModal');

  const addFoodBtn = document.getElementById('addFoodBtn');
  const select = document.getElementById('foodSelect');
  const quantityInput = document.getElementById('quantity');

  if (addFoodBtn) {
    addFoodBtn.addEventListener('click', async () => {
      await addFood();
    });
  }

  if (select) {
    select.addEventListener('change', updateSelectedFoodCaloriesPreview);
  }

  if (quantityInput) {
    quantityInput.addEventListener('input', updateSelectedFoodCaloriesPreview);
  }
}

function setupSaveButton() {
  const saveBtn = document.querySelector('.save-template button');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveMealTemplate();
    });
  }
}

function setupFoodLibrary() {
  const manageBtn = document.getElementById('manageFoodsBtn');
  const saveFoodBtn = document.getElementById('saveFoodBtn');
  const searchInput = document.getElementById('foodSearchInput');

  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      renderFoodLibrary(foods);
      Modal.open('foodLibraryModal');
    });
  }

  Modal.closeOnOutsideClick('foodLibraryModal');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const keyword = normalizeText(searchInput.value);
      const filtered = (foods || []).filter((food) => normalizeText(food.name).includes(keyword));
      renderFoodLibrary(filtered);
    });
  }

  if (saveFoodBtn) {
    saveFoodBtn.addEventListener('click', async () => {
      await createFoodFromLibrary();
    });
  }
}

function renderFoodLibrary(list) {
  const table = document.getElementById('foodLibraryTable');
  if (!table) {
    return;
  }

  table.querySelectorAll('tr:not(:first-child)').forEach((row) => row.remove());
  const rows = Array.isArray(list) ? list : [];

  if (!rows.length) {
    const row = table.insertRow();
    row.innerHTML = '<td colspan="5" style="text-align:center;">Không có thực phẩm</td>';
    return;
  }

  rows.forEach((food) => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${food.name}</td>
      <td>${Math.round(food.calo || 0)}</td>
      <td>${Math.round(food.protein || 0)}</td>
      <td>${Math.round(food.fat || 0)}</td>
      <td>${Math.round(food.carb || 0)}</td>
    `;
  });
}

async function createFoodFromLibrary() {
  const payload = {
    foodName: document.getElementById('newFoodName')?.value?.trim(),
    calories: getNumberInputValue('newFoodCalories'),
    protein: getNumberInputValue('newFoodProtein'),
    fat: getNumberInputValue('newFoodFat'),
    carb: getNumberInputValue('newFoodCarb'),
    fiber: getNumberInputValue('newFoodFiber')
  };

  if (!payload.foodName) {
    alert('Vui lòng nhập tên thực phẩm');
    return;
  }

  if (payload.calories === null || payload.calories < 0) {
    alert('Calories phải lớn hơn hoặc bằng 0');
    return;
  }

  try {
    const result = await ApiService.createFood(payload);
    if (!result?.success) {
      showApiAlert(result);
      return;
    }

    clearFoodLibraryForm();
    await loadFoods(false);
    renderFoodLibrary(foods);
    alert('Đã thêm thực phẩm mới');
  } catch (error) {
    alert('Có lỗi khi thêm thực phẩm');
  }
}

function clearFoodLibraryForm() {
  [
    'newFoodName',
    'newFoodCalories',
    'newFoodProtein',
    'newFoodFat',
    'newFoodCarb',
    'newFoodFiber'
  ].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = '';
    }
  });
}

function getNumberInputValue(inputId) {
  const raw = document.getElementById(inputId)?.value;
  if (raw === undefined || raw === null || raw === '') {
    return 0;
  }
  const value = Number(raw);
  return Number.isNaN(value) ? null : value;
}

function populateFoodSelect() {
  const select = document.getElementById('foodSelect');
  if (!select) return;

  select.innerHTML = '';
  if (!foods.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Không có thực phẩm';
    select.appendChild(option);
    return;
  }

  foods.forEach((food, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${food.name} (${food.calo} kcal / 100g)`;
    select.appendChild(option);
  });

  updateSelectedFoodCaloriesPreview();
}

async function addFood() {
  if (!foodsLoaded) {
    alert('Chưa có dữ liệu thực phẩm từ backend.');
    return;
  }

  const select = document.getElementById('foodSelect');
  const quantityInput = document.getElementById('quantity');
  if (!select || !quantityInput) {
    return;
  }

  const selectedIndex = Number(select.value);
  const food = foods[selectedIndex];
  const quantityStep = Number(quantityInput.value);

  if (!food) {
    alert('Không tìm thấy thực phẩm');
    return;
  }

  if (!quantityStep || quantityStep <= 0) {
    alert('Vui lòng nhập định lượng hợp lệ (1 = 100g, 2 = 200g,...)');
    return;
  }

  const quantity = quantityStep * 100;

  let nutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carb: 0,
    fiber: 0
  };

  try {
    const nutritionResult = await ApiService.getFoodNutrition(food.id, quantity);
    if (!nutritionResult?.success || !nutritionResult.data) {
      showApiAlert(nutritionResult);
      return;
    }

    nutrition = {
      calories: Number(nutritionResult.data.calories || 0),
      protein: Number(nutritionResult.data.protein || 0),
      fat: Number(nutritionResult.data.fat || 0),
      carb: Number(nutritionResult.data.carb || 0),
      fiber: Number(nutritionResult.data.fiber || 0)
    };
  } catch (error) {
    alert('Không tính được dinh dưỡng. Vui lòng thử lại.');
    return;
  }

  mealFoods[currentMealType].push({
    foodId: food.id,
    name: food.name,
    quantity: quantityStep,
    grams: quantity,
    calories: Math.round(nutrition.calories),
    protein: nutrition.protein,
    fat: nutrition.fat,
    carb: nutrition.carb,
    fiber: nutrition.fiber,
    mealTime: currentMealType.toUpperCase()
  });

  quantityInput.value = '';
  Modal.close('foodModal');
  renderCurrentMealRows();
  updateTargetCalories();
}

function renderCurrentMealRows() {
  const table = document.getElementById('mealTable');
  if (!table) {
    return;
  }

  table.querySelectorAll('tr:not(:first-child)').forEach((row) => row.remove());

  mealFoods[currentMealType].forEach((item, index) => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${formatQuantityStep(item.quantity)}</td>
      <td>${item.calories}</td>
      <td><button class="delete-btn" data-index="${index}">Xóa</button></td>
    `;

    row.querySelector('.delete-btn').addEventListener('click', () => {
      mealFoods[currentMealType].splice(index, 1);
      renderCurrentMealRows();
      updateTargetCalories();
    });
  });
}

function updateTargetCalories() {
  const currentMealCaloriesEl = document.getElementById('currentMealCalories');
  const totalMealCaloriesEl = document.getElementById('totalMealCalories');

  const currentMealTotal = mealFoods[currentMealType].reduce((sum, item) => sum + item.calories, 0);
  const fullTotal = Object.values(mealFoods)
    .flat()
    .reduce((sum, item) => sum + Number(item.calories || 0), 0);

  if (currentMealCaloriesEl) {
    currentMealCaloriesEl.textContent = `${Math.round(currentMealTotal)} kcal`;
  }

  if (totalMealCaloriesEl) {
    totalMealCaloriesEl.textContent = `${Math.round(fullTotal)} kcal`;
  }
}

function updateSelectedFoodCaloriesPreview() {
  const select = document.getElementById('foodSelect');
  const quantityInput = document.getElementById('quantity');
  const preview = document.getElementById('selectedFoodCalories');
  if (!select || !quantityInput || !preview) {
    return;
  }

  const selectedIndex = Number(select.value);
  const food = foods[selectedIndex];
  const quantityStep = Number(quantityInput.value || 0);

  if (!food || !quantityStep || quantityStep <= 0) {
    preview.textContent = 'Ước tính: 0 kcal';
    return;
  }

  const estimate = Number(food.calo || 0) * quantityStep;
  preview.textContent = `Ước tính: ${Math.round(estimate)} kcal`;
}

async function saveMealTemplate() {
  if (!foodsLoaded) {
    alert('Dữ liệu thực phẩm chưa sẵn sàng. Không thể lưu thực đơn.');
    return;
  }

  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  const details = [
    ...mealFoods.breakfast,
    ...mealFoods.lunch,
    ...mealFoods.dinner
  ];

  if (!details.length) {
    alert('Vui lòng thêm ít nhất một thực phẩm');
    return;
  }

  const totalCalo = details.reduce((sum, item) => sum + item.calories, 0);
  const mealType = inferMealTypeFromTotal(totalCalo);
  const mealName = getMealNameValue();

  if (!mealName) {
    alert('Vui lòng nhập tên thực đơn');
    return;
  }

  const payload = {
    mealName,
    type: mealType,
    bmiMin: 0,
    bmiMax: 100,
    mealImage: null,
    mealDetails: details.map((item) => ({
      foodId: item.foodId,
      quantity: item.grams,
      mealTime: item.mealTime
    }))
  };

  try {
    const result = await ApiService.createMeal(payload);
    if (!result?.success) {
      showApiAlert(result);
      return;
    }

    const savedMeals = Storage.get('customMeals') || [];
    savedMeals.push({
      id: result.data?.idmf,
      name: result.data?.mealName || payload.mealName,
      totalCalo: Math.round(result.data?.calo || totalCalo),
      foods: details,
      createdAt: new Date().toISOString()
    });
    Storage.set('customMeals', savedMeals);

    alert('Lưu thực đơn thành công');
    Navigation.navigate(Navigation.pages.myMeal);
  } catch (error) {
    alert('Có lỗi khi lưu thực đơn');
  }
}

function getMealNameValue() {
  const mealNameInput = document.getElementById('mealNameInput');
  return mealNameInput ? mealNameInput.value.trim() : '';
}

function inferMealTypeFromTotal(totalCalo) {
  if (totalCalo < 1800) return 'weight_loss';
  if (totalCalo > 2500) return 'weight_gain';
  return 'maintain';
}

function formatQuantityStep(quantityStep) {
  const grams = Number(quantityStep || 0) * 100;
  return `${grams}g`;
}

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function showApiAlert(payload) {
  const fields = ApiService.getFieldErrors(payload);
  if (fields) {
    alert(Object.values(fields).join('\n'));
    return;
  }
  alert(ApiService.getErrorText(payload));
}
