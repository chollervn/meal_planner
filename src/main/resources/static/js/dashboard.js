/**
 * ============================================
 * DASHBOARD - Main dashboard functionality
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
  setupDashboardHandlers();
});

function loadDashboard() {
  const user = Storage.get('user');
  const profile = Storage.get('userProfile');

  // Update welcome message with user name
  const welcomeBox = document.querySelector('.welcome');
  if (welcomeBox && user) {
    const userName = profile?.name || user.name || 'bạn';
    welcomeBox.querySelector('h1').textContent = `Xin chào ${userName} 👋`;

    // Update BMI status
    if (profile?.height && profile?.weight) {
      const bmi = BMICalculator.calculate(profile.weight, profile.height);
      const status = BMICalculator.getStatus(parseFloat(bmi));
      const emoji = BMICalculator.getEmoji(parseFloat(bmi));

      welcomeBox.querySelector('p').innerHTML = `
        Chỉ số BMI hiện tại của bạn đang ở mức <b>${status.label} ${emoji}</b>.
        ${getHealthAdvice(status.class)}
      `;
    }
  }
}

function setupDashboardHandlers() {
  // My Meals button
  const myMealsBtn = document.querySelector('.cards .card:first-child button');
  if (myMealsBtn) {
    myMealsBtn.addEventListener('click', () => {
      Navigation.navigate(Navigation.pages.myMeal);
    });
  }

  // Sample Meals button
  const sampleMealsBtn = document.querySelector('.cards .card:last-child button');
  if (sampleMealsBtn) {
    sampleMealsBtn.addEventListener('click', () => {
      Navigation.navigate(Navigation.pages.mealPlans);
    });
  }
}

function getHealthAdvice(bmiClass) {
  const advice = {
    'under': 'Bạn nên tăng cường dinh dưỡng và ăn uống đầy đủ hơn.',
    'normal': 'Hãy tiếp tục duy trì chế độ ăn uống khoa học nhé!',
    'over': 'Nên giảm lượng calo nạp vào và tăng cường vận động.'
  };

  return advice[bmiClass] || advice['normal'];
}
