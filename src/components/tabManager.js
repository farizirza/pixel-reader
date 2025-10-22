/**
 * TabManager Component
 * Handles tab switching functionality
 */
export class TabManager {
  constructor() {
    this.tabButtons = document.querySelectorAll(".tab-button");
    this.tabPanes = document.querySelectorAll(".tab-pane");
    this.init();
  }

  init() {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () =>
        this.switchTab(button.dataset.tab)
      );
    });
  }

  switchTab(tabId) {
    // Remove active class dari semua buttons dan panes
    this.tabButtons.forEach((btn) => btn.classList.remove("active"));
    this.tabPanes.forEach((pane) => pane.classList.remove("active"));

    // Add active class ke selected tab
    const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);
    const selectedPane = document.getElementById(tabId);

    if (selectedButton) selectedButton.classList.add("active");
    if (selectedPane) selectedPane.classList.add("active");
  }
}
