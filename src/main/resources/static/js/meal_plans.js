/**
 * Meal plans listing
 */

let availableMeals = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupMealPlansHandlers();
  await loadMeals();
});

function setupMealPlansHandlers() {
  const createBtn = document.querySelector('.custom-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      Navigation.navigate(Navigation.pages.createMeal);
    });
  }
}

async function loadMeals() {
  const container = document.querySelector('.container');
  if (container) {
    container.querySelectorAll('.meal-row').forEach((row) => row.remove());
    const loading = document.createElement('p');
    loading.id = 'mealPlansLoading';
    loading.textContent = 'Đang tải danh sách thực đơn...';
    container.appendChild(loading);
  }

  try {
    const result = await ApiService.getMeals();
    if (!result?.success || !Array.isArray(result.data)) {
      renderError('Không tải được danh sách thực đơn từ backend.');
      return;
    }

    availableMeals = await enrichMealNutrition((result.data || []).map(normalizeMeal));
    renderMealRows(availableMeals);
  } catch (error) {
    renderError('Không tải được danh sách thực đơn từ backend.');
  }
}

function renderMealRows(meals) {
  const container = document.querySelector('.container');
  if (!container) {
    return;
  }

  const headerRow = container.querySelector('.header-row');
  if (!headerRow) {
    return;
  }

  const loading = document.getElementById('mealPlansLoading');
  if (loading) {
    loading.remove();
  }

  const error = document.getElementById('mealPlansError');
  if (error) {
    error.remove();
  }

  container.querySelectorAll('.meal-row').forEach((row) => row.remove());

  if (!meals.length) {
    renderError('Chưa có thực đơn nào.');
    return;
  }

  meals.forEach((meal) => {
    const row = document.createElement('div');
    row.className = 'meal-row';

    row.innerHTML = `
      <div class="meal-info">
        <h2>${meal.mealName || 'Thực đơn'}</h2>
        <p><b>Loại:</b> ${formatMealType(meal.type)}</p>
        <p><b>BMI áp dụng:</b> ${formatBmiRange(meal.bmiMin, meal.bmiMax)}</p>
        <p><b>Tổng calo:</b> ~${Math.round(meal.calo || 0)} kcal/ngày</p>
        <div class="macro">
          <span>🥩 Đạm: ${Math.round(meal.protein || 0)}g</span>
          <span>🥑 Béo: ${Math.round(meal.fat || 0)}g</span>
          <span>🍚 Carb: ${Math.round(meal.carb || 0)}g</span>
        </div>
        <button class="view-btn" data-meal-id="${meal.idmf}">Xem chi tiết</button>
      </div>
      <div class="meal-image">
        <img src="${meal.mealImage || '/images/anh1.jpg'}" alt="${meal.mealName || 'Meal'}">
      </div>
    `;

    const button = row.querySelector('.view-btn');
    button.addEventListener('click', () => {
      Storage.set('selectedMealId', meal.idmf);
      Navigation.navigate(`${Navigation.pages.mealDetail}?mealId=${meal.idmf}`);
    });

    container.appendChild(row);
  });
}

function formatMealType(type) {
  if (type === 'weight_loss') return 'Giảm cân';
  if (type === 'weight_gain') return 'Tăng cân';
  if (type === 'maintain') return 'Duy trì';
  return type || 'Khác';
}

function formatBmiRange(min, max) {
  const low = Number(min);
  const high = Number(max);
  if (Number.isNaN(low) || Number.isNaN(high)) {
    return '-';
  }
  return `${low.toFixed(1)} - ${high.toFixed(1)}`;
}

function renderError(message) {
  const container = document.querySelector('.container');
  if (!container) {
    return;
  }

  const loading = document.getElementById('mealPlansLoading');
  if (loading) {
    loading.remove();
  }

  container.querySelectorAll('.meal-row').forEach((row) => row.remove());

  let error = document.getElementById('mealPlansError');
  if (!error) {
    error = document.createElement('p');
    error.id = 'mealPlansError';
    container.appendChild(error);
  }

  error.textContent = message;
}

async function enrichMealNutrition(meals) {
  const tasks = (meals || []).map(async (meal) => {
    try {
      const detailsResult = await ApiService.getMealDetails(meal.idmf);
      if (detailsResult?.success && Array.isArray(detailsResult.data) && detailsResult.data.length > 0) {
        const totals = computeTotalsFromDetails(detailsResult.data);
        return {
          ...meal,
          calo: totals.calo,
          protein: totals.protein,
          fat: totals.fat,
          carb: totals.carb
        };
      }
    } catch (error) {
      // Ignore and try nutrition endpoint fallback
    }

    try {
      const nutritionResult = await ApiService.getMealNutrition(meal.idmf);
      if (nutritionResult?.success && nutritionResult.data) {
        return {
          ...meal,
          calo: nutritionResult.data.calories,
          protein: nutritionResult.data.protein,
          fat: nutritionResult.data.fat,
          carb: nutritionResult.data.carb
        };
      }
    } catch (error) {
      // Ignore and keep original meal data
    }

    return meal;
  });

  return Promise.all(tasks);
}

function normalizeMeal(meal) {
  return {
    ...meal,
    calo: Number(meal?.calo ?? meal?.totalCalo ?? 0),
    protein: Number(meal?.protein ?? meal?.totalProtein ?? 0),
    fat: Number(meal?.fat ?? meal?.totalFat ?? 0),
    carb: Number(meal?.carb ?? meal?.totalCarb ?? 0)
  };
}

function computeTotalsFromDetails(details) {
  const toGrams = (quantity) => {
    const q = Number(quantity || 0);
    if (!q || Number.isNaN(q)) return 0;
    if (q > 0 && q <= 20) return q * 100;
    return q;
  };

  return (details || []).reduce((acc, detail) => {
    const food = detail?.food || {};
    const grams = toGrams(detail?.quantity);
    const ratio = grams / 100;

    acc.calo += Number(food.calories || 0) * ratio;
    acc.protein += Number(food.protein || 0) * ratio;
    acc.fat += Number(food.fat || 0) * ratio;
    acc.carb += Number(food.carb || 0) * ratio;
    return acc;
  }, { calo: 0, protein: 0, fat: 0, carb: 0 });
}
