/**
 * Dashboard page logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  attachCardActions();
  await loadDashboard();
});

async function loadDashboard() {
  const user = Storage.get('user');
  if (!user || !user.userId) {
    Navigation.navigate(Navigation.pages.login);
    return;
  }

  let profile = Storage.get('userProfile') || {};

  try {
    const result = await ApiService.getUserById(user.userId);
    if (result?.success && result.data) {
      profile = {
        name: result.data.username,
        email: result.data.email,
        age: result.data.age,
        height: result.data.heightCm,
        weight: result.data.weightKg,
        bmi: result.data.bmi,
        userImage: result.data.userImage || null
      };
      Storage.set('userProfile', profile);

      const updatedUser = {
        ...user,
        name: result.data.username,
        email: result.data.email,
        role: result.data.role || user.role
      };
      Storage.set('user', updatedUser);
    }
  } catch (error) {
    // Keep local profile if API fails
  }

  renderWelcome(profile);
}

function renderWelcome(profile) {
  const welcomeBox = document.querySelector('.welcome');
  if (!welcomeBox) {
    return;
  }

  const heading = welcomeBox.querySelector('h1');
  const description = welcomeBox.querySelector('p');
  const userName = profile?.name || 'bạn';

  if (heading) {
    heading.textContent = `Xin chào ${userName}` ;
  }

  if (!description) {
    return;
  }

  let bmi = null;
  if (profile?.bmi) {
    bmi = Number(profile.bmi);
  } else if (profile?.height && profile?.weight) {
    bmi = Number(BMICalculator.calculate(profile.weight, profile.height));
  }

  if (!bmi || Number.isNaN(bmi)) {
    description.innerHTML = 'Bạn chưa cập nhật thông tin BMI. Vào trang thông tin cá nhân để cập nhật.';
    return;
  }

  const status = BMICalculator.getStatus(bmi);

  description.innerHTML = `Chỉ số BMI hiện tại của bạn <b>${status.label} </b>. ${getHealthAdvice(status.class)}`;
}

function getHealthAdvice(bmiClass) {
  const advice = {
    under: 'Bạn nên bổ sung dinh dưỡng đầy đủ hơn.',
    normal: 'Hãy tiếp tục duy trì chế độ ăn uống khoa học.',
    over: 'Nên giảm calo và tăng cường vận động.'
  };
  return advice[bmiClass] || advice.normal;
}

function attachCardActions() {
  const buttons = document.querySelectorAll('.feature-card button');
  if (buttons.length < 2) {
    return;
  }

  buttons[0].addEventListener('click', () => {
    Navigation.navigate(Navigation.pages.myMeal);
  });

  buttons[1].addEventListener('click', () => {
    Navigation.navigate(Navigation.pages.mealPlans);
  });
}
