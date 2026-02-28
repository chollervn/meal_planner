/**
 * ============================================
 * MEAL PLANS - Sample meal plans listing
 * ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
  setupMealPlansHandlers();
});

function setupMealPlansHandlers() {
  // Create custom meal button
  const createBtn = document.querySelector('.custom-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      Navigation.navigate(Navigation.pages.createMeal);
    });
  }

  // View detail buttons
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealRow = e.target.closest('.meal-row');
      const mealTitle = mealRow.querySelector('h2').textContent;

      // Store selected meal for detail view
      Storage.set('selectedMeal', mealTitle);
      Navigation.navigate(Navigation.pages.mealDetail);
    });
  });
}
