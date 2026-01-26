/**
 * Scrolls to the first field with an error and applies highlight animation
 */
export function scrollToFirstError(errors: Record<string, unknown>): void {
  // Get first error field name
  const firstErrorKey = Object.keys(errors)[0];
  if (!firstErrorKey) return;

  // Find the element (try multiple selectors)
  const element =
    document.getElementById(firstErrorKey) ||
    document.querySelector(`[name="${firstErrorKey}"]`) ||
    document.querySelector(`[data-field-name="${firstErrorKey}"]`);

  if (!element) return;

  // Get the form field wrapper (parent with error styling)
  const wrapper =
    element.closest(".flex.flex-col.gap-2") || element.parentElement;

  // Scroll to element with offset for header
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset + rect.top - 150; // 150px offset for header + padding

  window.scrollTo({
    top: scrollTop,
    behavior: "smooth",
  });

  // Add highlight animation after scroll completes
  setTimeout(() => {
    element.classList.add("error-highlight");
    wrapper?.classList.add("error-highlight");

    // Focus the element
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLButtonElement
    ) {
      element.focus();
    }

    // Remove animation class after it completes
    setTimeout(() => {
      element.classList.remove("error-highlight");
      wrapper?.classList.remove("error-highlight");
    }, 1000);
  }, 500); // Wait for scroll to complete
}
