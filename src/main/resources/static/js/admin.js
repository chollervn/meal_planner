/**
 * Admin page data binding
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminDashboard();
});

async function loadAdminDashboard() {
  const user = Storage.get('user');
  if (!user || String(user.role || '').toUpperCase() !== 'ADMIN') {
    Navigation.navigate(Navigation.pages.dashboard);
    return;
  }

  setupDetailModal();

  await Promise.all([loadStats(), loadUsers()]);
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
      return;
    }

    const users = result.data.filter((u) => String(u.role || '').toUpperCase() !== 'ADMIN');
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Chưa có người dùng</td></tr>';
      return;
    }

    tbody.innerHTML = users.map((u) => {
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
          <td>-</td>
          <td>-</td>
          <td>
            <button class="view-btn" data-view-id="${u.userId}">Xem</button>
            <button class="view-btn" data-del-id="${u.userId}" style="background:#ef4444;margin-left:6px;">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');

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
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Tải dữ liệu thất bại</td></tr>';
  }
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
