/**
 * Meal plans listing
 */

let availableMeals = [];
let searchDebounceTimer = null;
const MEALS_PER_PAGE = 5;
let currentMealPage = 1;
let currentMealList = [];

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

  const searchInput = document.getElementById('mealSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      searchDebounceTimer = setTimeout(async () => {
        await searchMealsByKeyword(searchInput.value);
      }, 300);
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
    currentMealPage = 1;
    renderMealRows(availableMeals);
  } catch (error) {
    renderError('Không tải được danh sách thực đơn từ backend.');
  }
}

async function searchMealsByKeyword(keyword) {
  const normalizedKeyword = normalizeText(keyword).trim();

  if (!normalizedKeyword) {
    renderMealRows(availableMeals);
    return;
  }

  try {
    const result = await ApiService.searchMealsByName(keyword);
    if (!result?.success || !Array.isArray(result.data)) {
      renderError('Không tìm được thực đơn phù hợp.');
      return;
    }

    const searchedMeals = await enrichMealNutrition((result.data || []).map(normalizeMeal));
    if (!searchedMeals.length) {
      renderError('Không tìm thấy thực đơn gần đúng với từ khóa.');
      return;
    }

    currentMealPage = 1;
    renderMealRows(searchedMeals);
  } catch (error) {
    renderError('Không tìm được thực đơn phù hợp.');
  }
}

function renderMealRows(meals) {
  currentMealList = Array.isArray(meals) ? meals : [];

  const totalPages = Math.max(1, Math.ceil(currentMealList.length / MEALS_PER_PAGE));
  if (currentMealPage > totalPages) {
    currentMealPage = totalPages;
  }

  const start = (currentMealPage - 1) * MEALS_PER_PAGE;
  const pageMeals = currentMealList.slice(start, start + MEALS_PER_PAGE);

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

  if (!currentMealList.length) {
    clearMealPagination();
    renderError('Chưa có thực đơn nào.');
    return;
  }

  pageMeals.forEach((meal) => {
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
        <div class="meal-actions">
          <button class="view-btn" data-meal-id="${meal.idmf}">Xem chi tiết</button>
          <button class="view-btn" data-edit-meal-id="${meal.idmf}">Chỉnh sửa</button>
          <button class="view-btn" data-delete-meal-id="${meal.idmf}">Xóa</button>
        </div>
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

    const editButton = row.querySelector('[data-edit-meal-id]');
    editButton?.addEventListener('click', () => {
      Navigation.navigate(`${Navigation.pages.createMeal}?editMealId=${meal.idmf}`);
    });

    const deleteButton = row.querySelector('[data-delete-meal-id]');
    deleteButton?.addEventListener('click', async () => {
      await deleteMealFromList(meal.idmf, meal.mealName || 'thực đơn');
    });

    container.appendChild(row);
  });

  renderMealPagination(currentMealList.length);
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
  clearMealPagination();
}

function renderMealPagination(totalItems) {
  const container = document.querySelector('.container');
  if (!container) {
    return;
  }

  let pagination = document.getElementById('mealPlansPagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'mealPlansPagination';
    pagination.className = 'pagination-bar';
    container.appendChild(pagination);
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / MEALS_PER_PAGE));
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  pagination.innerHTML = `
    <button type="button" class="page-btn" data-page="prev" ${currentMealPage === 1 ? 'disabled' : ''}>← Trước</button>
    <span class="page-info">Trang ${currentMealPage}/${totalPages}</span>
    <button type="button" class="page-btn" data-page="next" ${currentMealPage === totalPages ? 'disabled' : ''}>Sau →</button>
  `;

  const prevBtn = pagination.querySelector('[data-page="prev"]');
  const nextBtn = pagination.querySelector('[data-page="next"]');

  prevBtn?.addEventListener('click', () => {
    if (currentMealPage > 1) {
      currentMealPage -= 1;
      renderMealRows(currentMealList);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentMealPage < totalPages) {
      currentMealPage += 1;
      renderMealRows(currentMealList);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function clearMealPagination() {
  const pagination = document.getElementById('mealPlansPagination');
  if (pagination) {
    pagination.innerHTML = '';
  }
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

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function deleteMealFromList(mealId, mealName) {
  if (!mealId) {
    return;
  }

  if (!confirm(`Bạn có chắc muốn xóa "${mealName}"?`)) {
    return;
  }

  try {
    const result = await ApiService.deleteMeal(mealId);
    if (!result?.success) {
      renderError(ApiService.getErrorText(result));
      return;
    }

    availableMeals = (availableMeals || []).filter((meal) => Number(meal?.idmf) !== Number(mealId));
    currentMealList = (currentMealList || []).filter((meal) => Number(meal?.idmf) !== Number(mealId));

    if (!currentMealList.length && availableMeals.length) {
      currentMealList = [...availableMeals];
    }

    renderMealRows(currentMealList);
  } catch (error) {
    renderError('Không thể xóa thực đơn. Vui lòng thử lại.');
  }
}
