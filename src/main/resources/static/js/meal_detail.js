/**
 * Meal detail page binding
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadMealDetail();
});

async function loadMealDetail() {
  const mealId = getMealIdFromContext();
  const container = document.querySelector('.container');
  if (!container) {
    return;
  }

  if (!mealId) {
    container.innerHTML = '<p>Không tìm thấy thực đơn để hiển thị.</p>';
    return;
  }

  container.innerHTML = '<p>Đang tải chi tiết thực đơn...</p>';

  try {
    const [mealResult, detailsResult, nutritionResult] = await Promise.all([
      ApiService.getMealById(mealId),
      ApiService.getMealDetails(mealId),
      ApiService.getMealNutrition(mealId)
    ]);

    if (!mealResult?.success || !detailsResult?.success || !nutritionResult?.success) {
      const failed = !mealResult?.success ? mealResult : (!detailsResult?.success ? detailsResult : nutritionResult);
      container.innerHTML = `<p>${ApiService.getErrorText(failed)}</p>`;
      return;
    }

    const meal = mealResult.data || {};
    const details = Array.isArray(detailsResult.data) ? detailsResult.data : [];
    const totalNutrition = nutritionResult.data || null;
    renderMealDetail(container, meal, details, totalNutrition);
  } catch (error) {
    container.innerHTML = '<p>Không thể tải chi tiết thực đơn.</p>';
  }
}

function renderMealDetail(container, meal, details, totalNutrition) {
  const grouped = {
    BREAKFAST: [],
    LUNCH: [],
    DINNER: []
  };

  const enrichedDetails = enrichDetailsFromDetails(details);

  enrichedDetails.forEach((detail) => {
    const time = String(detail.mealTime || '').toUpperCase();
    if (!grouped[time]) {
      return;
    }

    const food = detail.food;
    const quantity = detail.quantity;

    grouped[time].push({
      name: food.foodName || '-',
      quantity,
      calo: Number(detail.nutrition.calories || 0),
      protein: Number(detail.nutrition.protein || 0),
      fat: Number(detail.nutrition.fat || 0),
      carb: Number(detail.nutrition.carb || 0)
    });
  });

  const breakfastBlock = buildMealBlock('Bữa sáng', grouped.BREAKFAST);
  const lunchBlock = buildMealBlock('Bữa trưa', grouped.LUNCH);
  const dinnerBlock = buildMealBlock('Bữa tối', grouped.DINNER);

  const computedTotals = computeTotals(enrichedDetails);
  const totals = computedTotals;

  container.innerHTML = `
    <div class="meal-detail-actions" style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:12px;">
      <button type="button" class="detail-btn" id="editMealBtn">Chỉnh sửa</button>
      <button type="button" class="detail-btn" id="deleteMealBtn">Xóa</button>
    </div>
    <h1 style="margin-bottom:16px;">${escapeHtml(meal.mealName || 'Chi tiết thực đơn')}</h1>
    ${details.length === 0 ? '<p>Thực đơn này chưa có chi tiết món ăn.</p>' : ''}
    ${breakfastBlock}
    ${lunchBlock}
    ${dinnerBlock}
    <div class="summary">
      <h2>Tổng kết dinh dưỡng trong ngày</h2>
      <div class="macro">
        <span>🔥 ${Math.round(totals.calo)} kcal</span>
        <span>🥩 Đạm: ${Math.round(totals.protein)}g</span>
        <span>🥑 Béo: ${Math.round(totals.fat)}g</span>
        <span>🍚 Carb: ${Math.round(totals.carb)}g</span>
      </div>
    </div>
  `;

  bindMealDetailActions(meal);
}

function buildMealBlock(title, items) {
  const totals = items.reduce((acc, item) => {
    acc.calo += item.calo;
    acc.protein += item.protein;
    acc.fat += item.fat;
    acc.carb += item.carb;
    return acc;
  }, { calo: 0, protein: 0, fat: 0, carb: 0 });

  const rows = items.length
    ? items.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${formatQuantityLabel(item.quantity)}</td>
        <td>${Math.round(item.calo)}</td>
        <td>${Math.round(item.protein)}</td>
        <td>${Math.round(item.fat)}</td>
        <td>${Math.round(item.carb)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="6">Không có dữ liệu</td></tr>';

  return `
    <div class="meal-block">
      <div>
        <h2 class="meal-title">${title}</h2>
        <div class="meal-summary">
          <span>🔥 ${Math.round(totals.calo)} kcal</span>
          <span>🥩 Đạm: ${Math.round(totals.protein)}g</span>
          <span>🥑 Béo: ${Math.round(totals.fat)}g</span>
          <span>🍚 Carb: ${Math.round(totals.carb)}g</span>
        </div>
        <table>
          <tr>
            <th>Thực phẩm</th><th>ĐL</th><th>Calo</th><th>Đạm</th><th>Béo</th><th>Carb</th>
          </tr>
          ${rows}
        </table>
      </div>
    </div>
  `;
}

function computeTotals(details) {
  return details.reduce((acc, detail) => {
    acc.calo += Number(detail.nutrition.calories || 0);
    acc.protein += Number(detail.nutrition.protein || 0);
    acc.fat += Number(detail.nutrition.fat || 0);
    acc.carb += Number(detail.nutrition.carb || 0);
    return acc;
  }, { calo: 0, protein: 0, fat: 0, carb: 0 });
}

function enrichDetailsFromDetails(details) {
  return details.map((detail) => {
    const food = detail.food || {};
    const foodId = Number(food.foodId || detail?.id?.foodId);
    const quantity = Number(detail.quantity || 0);
    const grams = toGrams(quantity);

    if (!foodId || grams <= 0) {
      return {
        ...detail,
        food,
        quantity,
        nutrition: {
          calories: 0,
          protein: 0,
          fat: 0,
          carb: 0,
          fiber: 0
        }
      };
    }

    const ratio = grams / 100;
    const nutrition = {
      calories: Number(food.calories || 0) * ratio,
      protein: Number(food.protein || 0) * ratio,
      fat: Number(food.fat || 0) * ratio,
      carb: Number(food.carb || 0) * ratio,
      fiber: Number(food.fiber || 0) * ratio
    };

    return {
      ...detail,
      food,
      quantity,
      nutrition
    };
  });
}

function getMealIdFromContext() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = Number(params.get('mealId'));
  if (fromQuery) {
    return fromQuery;
  }

  const selected = Number(Storage.get('selectedMealId'));
  if (selected) {
    return selected;
  }

  const legacySelected = Storage.get('selectedMeal');
  if (legacySelected && typeof legacySelected === 'object' && Number(legacySelected.idmf)) {
    return Number(legacySelected.idmf);
  }

  return null;
}

function toGrams(quantity) {
  if (!quantity || Number.isNaN(quantity)) {
    return 0;
  }

  if (quantity > 0 && quantity <= 20) {
    return quantity * 100;
  }

  return quantity;
}

function formatQuantityLabel(quantity) {
  const grams = toGrams(Number(quantity));
  if (!grams) {
    return '0g';
  }

  return `${Math.round(grams)}g`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function bindMealDetailActions(meal) {
  const mealId = Number(meal?.idmf || getMealIdFromContext());
  const editBtn = document.getElementById('editMealBtn');
  const deleteBtn = document.getElementById('deleteMealBtn');

  editBtn?.addEventListener('click', () => {
    if (!mealId) {
      return;
    }
    Navigation.navigate(`${Navigation.pages.createMeal}?editMealId=${mealId}`);
  });

  deleteBtn?.addEventListener('click', async () => {
    if (!mealId) {
      return;
    }

    const mealName = String(meal?.mealName || 'thực đơn');
    if (!confirm(`Bạn có chắc muốn xóa "${mealName}"?`)) {
      return;
    }

    try {
      const result = await ApiService.deleteMeal(mealId);
      if (!result?.success) {
        alert(ApiService.getErrorText(result));
        return;
      }

      Navigation.navigate(Navigation.pages.mealPlans);
    } catch (error) {
      alert('Không thể xóa thực đơn. Vui lòng thử lại.');
    }
  });
}
