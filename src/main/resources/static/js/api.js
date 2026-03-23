/**
 * API service layer
 */
(function () {
  const API_BASE_URL = window.API_BASE_URL || window.location.origin;

  function normalizeToken(value) {
    if (!value) {
      return null;
    }

    let token = String(value).trim();

    if (token.toLowerCase().startsWith('bearer ')) {
      token = token.slice(7).trim();
    }

    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    return token || null;
  }

  function getAccessToken() {
    const token = normalizeToken(localStorage.getItem('authToken'));
    if (token && token !== 'null' && token !== 'undefined') {
      return token;
    }

    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        return null;
      }

      const user = JSON.parse(rawUser);
      return normalizeToken(user?.accessToken || null);
    } catch (error) {
      return null;
    }
  }

  async function request(path, options) {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options && options.headers ? options.headers : {})
      },
      ...options
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = {
        success: false,
        message: response.status === 401 || response.status === 403
          ? 'Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập'
          : 'Phản hồi không hợp lệ từ server'
      };
    }

    if (!response.ok && payload && payload.success === undefined) {
      payload.success = false;
    }

    return payload;
  }

  function getErrorText(payload) {
    if (!payload) {
      return 'Có lỗi xảy ra';
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    return 'Yêu cầu thất bại';
  }

  function getFieldErrors(payload) {
    if (!payload || !payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
      return null;
    }
    return payload.data;
  }

  function toQuery(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  function normalizeNutrition(data) {
    const source = data || {};
    return {
      calories: Number(source.calories ?? source.totalCalo ?? 0),
      protein: Number(source.protein ?? source.totalProtein ?? 0),
      fat: Number(source.fat ?? source.totalFat ?? 0),
      fiber: Number(source.fiber ?? source.totalFiber ?? 0),
      carb: Number(source.carb ?? source.totalCarb ?? 0)
    };
  }

  window.ApiService = {
    login(data) {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    register(data) {
      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    logout() {
      return request('/auth/logout', { method: 'POST' });
    },

    getUserById(userId) {
      return request(`/users/${userId}`);
    },

    updateUser(userId, data) {
      return request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    getFoods() {
      return request('/foods');
    },

    createFood(data) {
      return request('/foods', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async getFoodNutrition(foodId, quantity) {
      const result = await request(`/foods/${foodId}/nutrition${toQuery({ quantity })}`);
      if (result?.success) {
        result.data = normalizeNutrition(result.data);
      }
      return result;
    },

    getMeals() {
      return request('/meals');
    },

    getMealByType(type) {
      return request(`/meals/type/${encodeURIComponent(type)}`);
    },

    createMeal(data) {
      return request('/meals', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    applyMealToSchedule(data) {
      return request('/schedules/apply', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    removeMealFromSchedule(userId, date) {
      return request(`/schedules/remove${toQuery({ userId, date })}`, {
        method: 'DELETE'
      });
    },

    getUserScheduleWeek(userId, startDate, endDate) {
      return request(`/schedules/user/${userId}/week${toQuery({ startDate, endDate })}`);
    },

    getUserSchedule(userId) {
      return request(`/schedules/user/${userId}`);
    },

    getMealDetails(mealId) {
      return request(`/meals/${mealId}/details`);
    },

    async getMealNutrition(mealId) {
      const result = await request(`/meals/${mealId}/nutrition`);
      if (result?.success) {
        result.data = normalizeNutrition(result.data);
      }
      return result;
    },

    getMealById(mealId) {
      return request(`/meals/${mealId}`);
    },

    getAdminUsers() {
      return request('/admin/users');
    },

    getAdminUserById(userId) {
      return request(`/admin/users/${userId}`);
    },

    getAdminStats() {
      return request('/admin/stats');
    },

    deleteAdminUser(userId) {
      return request(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
    },

    getErrorText,
    getFieldErrors
  };
})();
