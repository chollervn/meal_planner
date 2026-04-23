/**
 * Admin page data binding
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminDashboard();
});

const USERS_PER_PAGE = 5;
const TOP_FOODS_PER_PAGE = 10;
let currentUserPage = 1;
let currentTopFoodsPage = 1;
let adminUsersCache = [];
let filteredAdminUsers = [];
let adminSearchDebounceTimer = null;

async function loadAdminDashboard() {
  const user = Storage.get('user');
  const token = localStorage.getItem('authToken') || user?.accessToken;
  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') {
    Navigation.navigate(Navigation.pages.dashboard);
    return;
  }

  if (!token) {
    alert('Vui lòng đăng nhập lại để truy cập trang quản trị');
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  setupDetailModal();
  setupAdminSearchHandlers();

  const tasks = [];
  if (document.getElementById('statTotalUsers')) {
    tasks.push(loadStats());
  }
  if (document.getElementById('adminUsersBody')) {
    tasks.push(loadUsers());
  }
  if (document.getElementById('adminTopFoodsBody')) {
    currentTopFoodsPage = 1;
    tasks.push(loadTopFoodsStats(currentTopFoodsPage));
  }
  if (document.getElementById('adminFoodRequestsBody')) {
    tasks.push(loadFoodRequests());
  }

  if (tasks.length) {
    await Promise.all(tasks);
  }
}

function setupAdminSearchHandlers() {
  const searchInput = document.getElementById('adminUserSearchInput');
  if (!searchInput) {
    return;
  }

  searchInput.addEventListener('input', () => {
    if (adminSearchDebounceTimer) {
      clearTimeout(adminSearchDebounceTimer);
    }

    adminSearchDebounceTimer = setTimeout(() => {
      currentUserPage = 1;
      applyUserSearch(searchInput.value);
      renderUsersTable();
    }, 250);
  });
}

function setupDetailModal() {
  const closeBtn = document.getElementById('closeAdminDetailBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      Modal.close('adminUserDetailModal');
    });
  }

  Modal.closeOnOutsideClick('adminUserDetailModal');
}

async function loadStats() {
  const statEls = {
    totalUsers: document.getElementById('statTotalUsers'),
    totalApplied: document.getElementById('statAppliedMeals'),
    mostPopular: document.getElementById('statMostPopular'),
    activeUsers: document.getElementById('statActiveUsers')
  };

  try {
    const result = await ApiService.getAdminStats();
    if (!result?.success || !result.data) {
      setDefaultStats(statEls);
      return;
    }

    const stats = result.data;
    const mostUsedList = Array.isArray(stats.mostUsedMeals) ? stats.mostUsedMeals : [];
    const topMeal = mostUsedList[0];

    if (statEls.totalUsers) {
      statEls.totalUsers.textContent = String(stats.totalUsers ?? 0);
    }

    if (statEls.totalApplied) {
      statEls.totalApplied.textContent = String(stats.totalAppliedMeals ?? 0);
    }

    if (statEls.mostPopular) {
      statEls.mostPopular.textContent = topMeal ? `${topMeal[1]} (${topMeal[2]})` : '-';
    }

    if (statEls.activeUsers) {
      statEls.activeUsers.textContent = String(stats.activeUsersThisWeek ?? 0);
    }
  } catch (error) {
    setDefaultStats(statEls);
  }
}

async function loadUsers() {
  const tbody = document.getElementById('adminUsersBody');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Đang tải...</td></tr>';

  try {
    const result = await ApiService.getAdminUsers();
    if (!result?.success || !Array.isArray(result.data)) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Không có dữ liệu</td></tr>';
      adminUsersCache = [];
      filteredAdminUsers = [];
      clearUsersPagination();
      return;
    }

    const users = result.data.filter((u) => String(u.role || '').toUpperCase() !== 'ADMIN');
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Chưa có người dùng</td></tr>';
      adminUsersCache = [];
      filteredAdminUsers = [];
      clearUsersPagination();
      return;
    }

    adminUsersCache = users;
    const searchInput = document.getElementById('adminUserSearchInput');
    applyUserSearch(searchInput ? searchInput.value : '');
    renderUsersTable();
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Tải dữ liệu thất bại</td></tr>';
    adminUsersCache = [];
    filteredAdminUsers = [];
    clearUsersPagination();
  }
}

async function loadTopFoodsStats(page) {
  const tbody = document.getElementById('adminTopFoodsBody');
  if (!tbody) {
    return;
  }

  const targetPage = Math.max(1, Number(page || currentTopFoodsPage || 1));
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Đang tải...</td></tr>';

  try {
    const result = await ApiService.getAdminFoodStats(targetPage, TOP_FOODS_PER_PAGE, 3);
    const data = result?.success && result?.data ? result.data : null;
    const items = Array.isArray(data?.items) ? data.items : [];
    const pageNumber = Math.max(1, Number(data?.page || targetPage));
    const totalPages = Math.max(0, Number(data?.totalPages || 0));
    const totalItems = Math.max(0, Number(data?.totalItems || 0));
    currentTopFoodsPage = pageNumber;

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chưa có dữ liệu</td></tr>';
      clearTopFoodsPagination();
      return;
    }

    const rankStart = (pageNumber - 1) * TOP_FOODS_PER_PAGE;

    tbody.innerHTML = items.map((item, index) => {
      const topMeals = Array.isArray(item?.topMeals) ? item.topMeals : [];
      const topMealHtml = topMeals.length
        ? `<div class="meal-tags">${topMeals.map((meal) => {
            const mealName = meal?.mealName || `Meal #${meal?.mealId ?? '-'}`;
            const usageCount = Number(meal?.usageCount ?? 0);
            const mealId = Number(meal?.mealId || 0);
            if (!mealId) {
              return `<span class="meal-tag">${escapeHtml(mealName)} (${usageCount})</span>`;
            }
            return `<button type="button" class="meal-tag meal-tag-link" data-top-meal-id="${mealId}">${escapeHtml(mealName)} (${usageCount})</button>`;
          }).join('')}</div>`
        : '-';

      return `
        <tr>
          <td>${rankStart + index + 1}</td>
          <td>${escapeHtml(item?.foodName || '-')}</td>
          <td>${Number(item?.usageCount ?? 0)}</td>
          <td>${topMealHtml}</td>
        </tr>
      `;
    }).join('');

    bindTopMealDetailLinks(tbody);

    renderTopFoodsPagination(pageNumber, totalPages, totalItems);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tải dữ liệu thất bại</td></tr>';
    clearTopFoodsPagination();
  }
}

async function loadFoodRequests() {
  const tbody = document.getElementById('adminFoodRequestsBody');
  if (!tbody) {
    return;
  }

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Đang tải...</td></tr>';

  try {
    const result = await ApiService.getAdminFoodRequests();
    const requests = result?.success && Array.isArray(result.data) ? result.data : [];

    if (!requests.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Chưa có yêu cầu nào</td></tr>';
      return;
    }

    tbody.innerHTML = requests.map((item) => {
      const status = String(item.status || 'PENDING').toUpperCase();
      const nutrition = `${Math.round(Number(item.calories || 0))} kcal | P ${Math.round(Number(item.protein || 0))} | F ${Math.round(Number(item.fat || 0))} | C ${Math.round(Number(item.carb || 0))} | Fi ${Math.round(Number(item.fiber || 0))}`;
      const requestUser = `${escapeHtml(item.requestedByUsername || '-')}${item.requestedByEmail ? ` (${escapeHtml(item.requestedByEmail)})` : ''}`;
      const actionButtons = status === 'PENDING'
        ? `
            <button class="approve-btn" data-approve-id="${item.requestId}">Chấp nhận</button>
            <button class="reject-btn" data-reject-id="${item.requestId}">Từ chối</button>
          `
        : '-';

      return `
        <tr>
          <td>${item.requestId ?? '-'}</td>
          <td>${requestUser}</td>
          <td>${escapeHtml(item.foodName || '-')}</td>
          <td>${nutrition}</td>
          <td><span class="request-status request-status-${status.toLowerCase()}">${toStatusText(status)}</span></td>
          <td>${formatDateTime(item.requestedAt)}</td>
          <td>${actionButtons}</td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('button[data-approve-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const requestId = Number(btn.getAttribute('data-approve-id'));
        await approveFoodRequest(requestId);
      });
    });

    tbody.querySelectorAll('button[data-reject-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const requestId = Number(btn.getAttribute('data-reject-id'));
        await rejectFoodRequest(requestId);
      });
    });
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Tải yêu cầu thất bại</td></tr>';
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('adminUsersBody');
  if (!tbody) {
    return;
  }

  const users = filteredAdminUsers;
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Không tìm thấy người dùng phù hợp</td></tr>';
    clearUsersPagination();
    return;
  }

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  if (currentUserPage > totalPages) {
    currentUserPage = totalPages;
  }

  const start = (currentUserPage - 1) * USERS_PER_PAGE;
  const usersOnPage = users.slice(start, start + USERS_PER_PAGE);

  tbody.innerHTML = usersOnPage.map((u) => {
      const bmi = Number(u.bmi || 0);
      const bmiClass = getBmiBadgeClass(bmi);
      const bmiLabel = BMICalculator.getStatus(bmi).label;

      return `
        <tr>
          <td>${u.userId}</td>
          <td>${escapeHtml(u.username || '-')}</td>
          <td>${escapeHtml(u.email || '-')}</td>
          <td>${u.age ?? '-'}</td>
          <td><span class="badge ${bmiClass}">${bmi ? bmi.toFixed(1) : '-'} ${bmiLabel}</span></td>
          <td id="usedMeals-${u.userId}">Dang tai...</td>
          <td id="favoriteMeal-${u.userId}">Dang tai...</td>
          <td>
            <button class="view-btn" data-view-id="${u.userId}">Xem</button>
            <button class="view-btn" data-del-id="${u.userId}" style="background:#ef4444;margin-left:6px;">Xóa</button>
          </td>
        </tr>
      `;
  }).join('');

  hydrateUserMealUsage(usersOnPage);

  renderUsersPagination(users.length);

  tbody.querySelectorAll('button[data-view-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.getAttribute('data-view-id'));
      await viewUserDetail(id);
    });
  });

  tbody.querySelectorAll('button[data-del-id]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.getAttribute('data-del-id'));
      await deleteUser(id);
    });
  });
}

function applyUserSearch(keyword) {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    filteredAdminUsers = [...adminUsersCache];
    return;
  }

  filteredAdminUsers = adminUsersCache.filter((user) => {
    const username = normalizeText(user?.username || '');
    return username.includes(normalizedKeyword);
  });
}

function renderUsersPagination(totalItems) {
  const tableBox = document.querySelector('.table-box');
  if (!tableBox) {
    return;
  }

  let pagination = document.getElementById('adminUsersPagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'adminUsersPagination';
    pagination.className = 'pagination-bar';
    tableBox.appendChild(pagination);
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / USERS_PER_PAGE));
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  pagination.innerHTML = `
    <button type="button" class="page-btn" data-page="prev" ${currentUserPage === 1 ? 'disabled' : ''}>← Trước</button>
    <span class="page-info">Trang ${currentUserPage}/${totalPages}</span>
    <button type="button" class="page-btn" data-page="next" ${currentUserPage === totalPages ? 'disabled' : ''}>Sau →</button>
  `;

  const prevBtn = pagination.querySelector('[data-page="prev"]');
  const nextBtn = pagination.querySelector('[data-page="next"]');

  prevBtn?.addEventListener('click', async () => {
    if (currentUserPage > 1) {
      currentUserPage -= 1;
      renderUsersTable();
    }
  });

  nextBtn?.addEventListener('click', async () => {
    if (currentUserPage < totalPages) {
      currentUserPage += 1;
      renderUsersTable();
    }
  });
}

function clearUsersPagination() {
  const pagination = document.getElementById('adminUsersPagination');
  if (pagination) {
    pagination.innerHTML = '';
  }
}

function renderTopFoodsPagination(currentPage, totalPages, totalItems) {
  const tableBox = document.querySelector('.top-foods-box');
  if (!tableBox) {
    return;
  }

  let pagination = document.getElementById('adminTopFoodsPagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'adminTopFoodsPagination';
    pagination.className = 'pagination-bar';
    tableBox.appendChild(pagination);
  }

  if (totalPages <= 1 || totalItems <= TOP_FOODS_PER_PAGE) {
    pagination.innerHTML = '';
    return;
  }

  pagination.innerHTML = `
    <button type="button" class="page-btn" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>← Trước</button>
    <span class="page-info">Trang ${currentPage}/${totalPages}</span>
    <button type="button" class="page-btn" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>Sau →</button>
  `;

  const prevBtn = pagination.querySelector('[data-page="prev"]');
  const nextBtn = pagination.querySelector('[data-page="next"]');

  prevBtn?.addEventListener('click', async () => {
    if (currentPage > 1) {
      await loadTopFoodsStats(currentPage - 1);
    }
  });

  nextBtn?.addEventListener('click', async () => {
    if (currentPage < totalPages) {
      await loadTopFoodsStats(currentPage + 1);
    }
  });
}

function clearTopFoodsPagination() {
  const pagination = document.getElementById('adminTopFoodsPagination');
  if (pagination) {
    pagination.innerHTML = '';
  }
}

function bindTopMealDetailLinks(container) {
  container.querySelectorAll('button[data-top-meal-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const mealId = Number(button.getAttribute('data-top-meal-id'));
      if (!mealId) {
        return;
      }

      Storage.set('selectedMealId', mealId);
      Navigation.navigate(`${Navigation.pages.mealDetail}?mealId=${mealId}`);
    });
  });
}

async function hydrateUserMealUsage(users) {
  if (!Array.isArray(users) || !users.length) {
    return;
  }

  await Promise.all(users.map(async (user) => {
    const usedEl = document.getElementById(`usedMeals-${user.userId}`);
    const favoriteEl = document.getElementById(`favoriteMeal-${user.userId}`);

    if (!usedEl || !favoriteEl) {
      return;
    }

    try {
      const result = await ApiService.getUserSchedule(user.userId);
      const items = result?.success && Array.isArray(result.data) ? result.data : [];

      usedEl.textContent = String(items.length);

      if (!items.length) {
        favoriteEl.textContent = '-';
        return;
      }

      const mealCounter = new Map();
      items.forEach((item) => {
        const mealName = item?.mealTemplate?.mealName || item?.mealTemplate?.idmf || 'Meal';
        mealCounter.set(mealName, (mealCounter.get(mealName) || 0) + 1);
      });

      let topMealName = '-';
      let topCount = 0;

      mealCounter.forEach((count, mealName) => {
        if (count > topCount) {
          topCount = count;
          topMealName = mealName;
        }
      });

      favoriteEl.textContent = topCount > 0 ? `${topMealName} (${topCount})` : '-';
    } catch (error) {
      usedEl.textContent = '-';
      favoriteEl.textContent = '-';
    }
  }));
}

async function deleteUser(userId) {
  if (!confirm(`Xóa user #${userId}?`)) {
    return;
  }

  const result = await ApiService.deleteAdminUser(userId);
  if (!result?.success) {
    alert(ApiService.getErrorText(result));
    return;
  }

  await Promise.all([loadStats(), loadUsers()]);
}

async function approveFoodRequest(requestId) {
  if (!confirm(`Duyệt yêu cầu #${requestId}?`)) {
    return;
  }

  const result = await ApiService.approveFoodRequest(requestId);
  if (!result?.success) {
    alert(ApiService.getErrorText(result));
    return;
  }

  await loadFoodRequests();
}

async function rejectFoodRequest(requestId) {
  if (!confirm(`Từ chối yêu cầu #${requestId}?`)) {
    return;
  }

  const result = await ApiService.rejectFoodRequest(requestId);
  if (!result?.success) {
    alert(ApiService.getErrorText(result));
    return;
  }

  await loadFoodRequests();
}

async function viewUserDetail(userId) {
  const result = await ApiService.getAdminUserById(userId);
  if (!result?.success || !result.data) {
    alert(ApiService.getErrorText(result));
    return;
  }

  const user = result.data;
  const bmi = Number(user.bmi || 0);
  const bmiText = bmi ? `${bmi.toFixed(1)} (${BMICalculator.getStatus(bmi).label})` : '-';

  setDetailValue('detailUserId', user.userId ?? '-');
  setDetailValue('detailUsername', user.username || '-');
  setDetailValue('detailEmail', user.email || '-');
  setDetailValue('detailAge', user.age ?? '-');
  setDetailValue('detailHeight', user.heightCm !== undefined && user.heightCm !== null ? `${user.heightCm} cm` : '-');
  setDetailValue('detailWeight', user.weightKg !== undefined && user.weightKg !== null ? `${user.weightKg} kg` : '-');
  setDetailValue('detailBmi', bmiText);
  setDetailValue('detailRole', user.role || '-');

  Modal.open('adminUserDetailModal');
}

function setDetailValue(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = String(value);
  }
}

function setDefaultStats(statEls) {
  if (statEls.totalUsers) statEls.totalUsers.textContent = '-';
  if (statEls.totalApplied) statEls.totalApplied.textContent = '-';
  if (statEls.mostPopular) statEls.mostPopular.textContent = '-';
  if (statEls.activeUsers) statEls.activeUsers.textContent = '-';
}

function getBmiBadgeClass(bmi) {
  if (!bmi || Number.isNaN(bmi)) return 'badge-normal';
  if (bmi < 18.5) return 'badge-under';
  if (bmi < 25) return 'badge-normal';
  return 'badge-over';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toStatusText(status) {
  if (status === 'APPROVED') return 'Đã duyệt';
  if (status === 'REJECTED') return 'Từ chối';
  return 'Chờ duyệt';
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('vi-VN');
}
