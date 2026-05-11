// /js/accessibility.js
// Shared accessibility center, adapted from the source implementation.

const ACCESSIBILITY_STORAGE_KEY = "eats-accessibility-settings-v1"

const LEGACY_ACCESSIBILITY_KEYS = {
  largeText: "a11y.textLg",
  highContrast: "a11y.contrast",
  underlineLinks: "a11y.links",
  reducedMotion: "a11y.reduce",
}

const ACCESSIBILITY_DEFAULTS = {
  largeText: false,
  highContrast: false,
  underlineLinks: false,
  readableFont: false,
  reducedMotion: false,
}

const ACCESSIBILITY_ROOT_CLASSES = {
  largeText: "a11y-large-text",
  highContrast: "a11y-high-contrast",
  underlineLinks: "a11y-underlined-links",
  readableFont: "a11y-readable-font",
  reducedMotion: "a11y-reduced-motion",
}

const ACCESSIBILITY_COPY = {
  skipLink: "Skip to main content",
  eyebrow: "Accessibility",
  openButton: "Open accessibility center",
  closeButton: "Close accessibility center",
  title: "Accessibility Center",
  description: "Adjust the site to suit your reading and navigation preferences.",
  reset: "Reset",
  statusDefault: "Standard site view",
  statusActive: "{count} accessibility adjustments active",
  options: {
    largeText: {
      label: "Larger text",
      description: "Increase font size across the site.",
    },
    highContrast: {
      label: "High contrast",
      description: "Strengthen contrast for text and interface.",
    },
    underlineLinks: {
      label: "Underline links",
      description: "Make links easier to identify.",
    },
    readableFont: {
      label: "Readable font",
      description: "Switch to a cleaner, more legible font.",
    },
    reducedMotion: {
      label: "Reduced motion",
      description: "Minimize animations and motion effects.",
    },
  },
  siteSupportTitle: "Built into this site",
  siteSupport: [
    "Keyboard-friendly navigation",
    "Clear focus indicators",
    "Responsive layout for mobile and desktop",
    "Saved preferences across visits",
  ],
}

let accessibilityState = { ...ACCESSIBILITY_DEFAULTS }
let accessibilityRefs = null
let accessibilityPanelOpen = false

function getAccessibilityCopy() {
  return ACCESSIBILITY_COPY
}

function getLegacyBoolean(key) {
  try {
    return localStorage.getItem(key) === "1"
  } catch (error) {
    return false
  }
}

function loadAccessibilitySettings() {
  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const nextState = { ...ACCESSIBILITY_DEFAULTS }

      Object.keys(ACCESSIBILITY_DEFAULTS).forEach((key) => {
        nextState[key] = Boolean(parsed?.[key])
      })

      return nextState
    }
  } catch (error) {
    // Fall back to defaults or migrated legacy settings.
  }

  return {
    ...ACCESSIBILITY_DEFAULTS,
    largeText: getLegacyBoolean(LEGACY_ACCESSIBILITY_KEYS.largeText),
    highContrast: getLegacyBoolean(LEGACY_ACCESSIBILITY_KEYS.highContrast),
    underlineLinks: getLegacyBoolean(LEGACY_ACCESSIBILITY_KEYS.underlineLinks),
    reducedMotion: getLegacyBoolean(LEGACY_ACCESSIBILITY_KEYS.reducedMotion),
  }
}

function saveAccessibilitySettings() {
  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(accessibilityState))
  } catch (error) {
    // Ignore storage failures.
  }
}

function isReducedMotionRequested() {
  const root = document.documentElement

  if (root.classList.contains(ACCESSIBILITY_ROOT_CLASSES.reducedMotion)) {
    return true
  }

  try {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  } catch (error) {
    return false
  }
}

function dispatchAccessibilityChange() {
  const reduce = isReducedMotionRequested()
  const detail = {
    settings: { ...accessibilityState },
    reducedMotion: reduce,
  }

  document.dispatchEvent(new CustomEvent("site-accessibility-change", { detail }))
  window.dispatchEvent(new CustomEvent("a11y:motion-changed", { detail: { reduce } }))
}

function ensureMainContentTarget() {
  let mainTarget =
    document.getElementById("main-content") ||
    document.getElementById("main") ||
    document.querySelector("main") ||
    document.querySelector('[role="main"]')

  if (!mainTarget) {
    mainTarget =
      document.querySelector(
        ".founders-section, .idea-to-product-section, .specialties-content-section, .systems-content-section, .legal-hero, .video-section, .about-section"
      ) || document.querySelector("section")
  }

  if (!mainTarget) {
    return null
  }

  if (!mainTarget.id) {
    mainTarget.id = "main-content"
  }

  if (!mainTarget.hasAttribute("tabindex")) {
    mainTarget.setAttribute("tabindex", "-1")
  }

  return mainTarget
}

function removeLegacyAccessibilityMarkup() {
  document.querySelectorAll(".a11y-toolbar, .a11y-icon, #a11y-status, #btn-font, #btn-motion, #btn-links, #btn-reset, .skip-link").forEach((node) => {
    node.remove()
  })
}

function getAccessibilityMarkup(mainTargetId) {
  const copy = getAccessibilityCopy()

  return `
    <a class="skip-link" href="#${mainTargetId}">${copy.skipLink}</a>

    <button class="a11y-fab" id="a11y-fab" type="button" aria-controls="a11y-panel" aria-expanded="false" aria-label="${copy.openButton}">
      <span class="a11y-fab__pulse" aria-hidden="true"></span>
      <span class="a11y-fab__icon-wrap" aria-hidden="true">
        <svg class="a11y-fab__icon" viewBox="0 0 24 24" focusable="false">
          <path fill="currentColor" d="M12 2.25a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6.75 5.5a.75.75 0 0 1-.75.75h-3.64l1.54 2.89c.21.39.25.86.1 1.29l-1.5 4.49a.75.75 0 1 1-1.42-.48l1.34-3.98-1.51-2.82v8.21a.75.75 0 0 1-1.5 0v-8.17l-1.38 2.57 1.29 3.33a.75.75 0 0 1-1.4.54L8 16.39a1.88 1.88 0 0 1 .1-1.55l1.64-3.07H6a.75.75 0 0 1 0-1.5h4.09l.99-1.85A2.24 2.24 0 0 1 13.04 7H18a.75.75 0 0 1 .75.75z" />
        </svg>
      </span>
    </button>

    <div class="a11y-backdrop" id="a11y-backdrop" aria-hidden="true"></div>

    <aside class="a11y-panel" id="a11y-panel" aria-hidden="true" aria-labelledby="a11y-title" tabindex="-1">
      <div class="a11y-panel__header">
        <p class="a11y-panel__eyebrow" id="a11y-eyebrow">${copy.eyebrow}</p>
        <button class="a11y-panel__close" id="a11y-close" type="button" aria-label="${copy.closeButton}">
          <span aria-hidden="true">&#10005;</span>
        </button>
      </div>

      <h2 class="a11y-panel__title" id="a11y-title">${copy.title}</h2>
      <p class="a11y-panel__description" id="a11y-description">${copy.description}</p>

      <div class="a11y-panel__status-row">
        <span class="a11y-panel__status" id="a11y-status" aria-live="polite">${copy.statusDefault}</span>
        <button class="a11y-panel__reset" id="a11y-reset" type="button">${copy.reset}</button>
      </div>

      <div class="a11y-options">
        <button class="a11y-option" type="button" data-a11y-setting="largeText" aria-pressed="false">
          <span class="a11y-option__copy">
            <span class="a11y-option__title">${copy.options.largeText.label}</span>
            <span class="a11y-option__description">${copy.options.largeText.description}</span>
          </span>
          <span class="a11y-option__switch" aria-hidden="true"></span>
        </button>

        <button class="a11y-option" type="button" data-a11y-setting="highContrast" aria-pressed="false">
          <span class="a11y-option__copy">
            <span class="a11y-option__title">${copy.options.highContrast.label}</span>
            <span class="a11y-option__description">${copy.options.highContrast.description}</span>
          </span>
          <span class="a11y-option__switch" aria-hidden="true"></span>
        </button>

        <button class="a11y-option" type="button" data-a11y-setting="underlineLinks" aria-pressed="false">
          <span class="a11y-option__copy">
            <span class="a11y-option__title">${copy.options.underlineLinks.label}</span>
            <span class="a11y-option__description">${copy.options.underlineLinks.description}</span>
          </span>
          <span class="a11y-option__switch" aria-hidden="true"></span>
        </button>

        <button class="a11y-option" type="button" data-a11y-setting="readableFont" aria-pressed="false">
          <span class="a11y-option__copy">
            <span class="a11y-option__title">${copy.options.readableFont.label}</span>
            <span class="a11y-option__description">${copy.options.readableFont.description}</span>
          </span>
          <span class="a11y-option__switch" aria-hidden="true"></span>
        </button>

        <button class="a11y-option" type="button" data-a11y-setting="reducedMotion" aria-pressed="false">
          <span class="a11y-option__copy">
            <span class="a11y-option__title">${copy.options.reducedMotion.label}</span>
            <span class="a11y-option__description">${copy.options.reducedMotion.description}</span>
          </span>
          <span class="a11y-option__switch" aria-hidden="true"></span>
        </button>
      </div>

      <div class="a11y-support">
        <h3 class="a11y-support__title" id="a11y-support-title">${copy.siteSupportTitle}</h3>
        <div class="a11y-support__list">
          <p class="a11y-support__item">${copy.siteSupport[0]}</p>
          <p class="a11y-support__item">${copy.siteSupport[1]}</p>
          <p class="a11y-support__item">${copy.siteSupport[2]}</p>
          <p class="a11y-support__item">${copy.siteSupport[3]}</p>
        </div>
      </div>
    </aside>
  `
}

function injectAccessibilityMarkup() {
  if (document.getElementById("a11y-fab")) {
    return true
  }

  const mainTarget = ensureMainContentTarget()
  if (!mainTarget) {
    return false
  }

  removeLegacyAccessibilityMarkup()
  document.body.insertAdjacentHTML("afterbegin", getAccessibilityMarkup(mainTarget.id))
  return true
}

function updateAccessibilityToggleLabel() {
  if (!accessibilityRefs) return

  const copy = getAccessibilityCopy()
  const label = accessibilityPanelOpen ? copy.closeButton : copy.openButton

  accessibilityRefs.fab.setAttribute("aria-label", label)
  accessibilityRefs.fab.setAttribute("title", label)
  accessibilityRefs.closeButton.setAttribute("aria-label", copy.closeButton)
}

function updateAccessibilityStatus() {
  if (!accessibilityRefs) return

  const copy = getAccessibilityCopy()
  const activeCount = Object.values(accessibilityState).filter(Boolean).length

  accessibilityRefs.status.textContent = activeCount
    ? copy.statusActive.replace("{count}", activeCount)
    : copy.statusDefault
}

function updateAccessibilityOptionStates() {
  if (!accessibilityRefs) return

  accessibilityRefs.optionButtons.forEach((button) => {
    const key = button.dataset.a11ySetting
    const enabled = Boolean(accessibilityState[key])

    button.classList.toggle("is-active", enabled)
    button.setAttribute("aria-pressed", String(enabled))
  })
}

function applyAccessibilitySettings() {
  const root = document.documentElement

  Object.entries(ACCESSIBILITY_ROOT_CLASSES).forEach(([key, className]) => {
    root.classList.toggle(className, Boolean(accessibilityState[key]))
  })

  updateAccessibilityOptionStates()
  updateAccessibilityStatus()
  dispatchAccessibilityChange()
}

function updateAccessibilityCopy() {
  if (!accessibilityRefs) return

  const copy = getAccessibilityCopy()

  accessibilityRefs.skipLink.textContent = copy.skipLink
  accessibilityRefs.eyebrow.textContent = copy.eyebrow
  accessibilityRefs.title.textContent = copy.title
  accessibilityRefs.description.textContent = copy.description
  accessibilityRefs.resetButton.textContent = copy.reset
  accessibilityRefs.supportTitle.textContent = copy.siteSupportTitle

  accessibilityRefs.optionButtons.forEach((button) => {
    const key = button.dataset.a11ySetting
    const optionCopy = copy.options[key]
    if (!optionCopy) return

    const titleEl = button.querySelector(".a11y-option__title")
    const descriptionEl = button.querySelector(".a11y-option__description")

    if (titleEl) titleEl.textContent = optionCopy.label
    if (descriptionEl) descriptionEl.textContent = optionCopy.description
  })

  accessibilityRefs.supportItems.forEach((item, index) => {
    item.textContent = copy.siteSupport[index] || ""
  })

  accessibilityRefs.panel.setAttribute("dir", document.documentElement.getAttribute("dir") || "ltr")

  updateAccessibilityStatus()
  updateAccessibilityToggleLabel()
}

function openAccessibilityPanel() {
  if (!accessibilityRefs || accessibilityPanelOpen) return

  accessibilityPanelOpen = true

  accessibilityRefs.fab.setAttribute("aria-expanded", "true")
  accessibilityRefs.panel.setAttribute("aria-hidden", "false")
  accessibilityRefs.backdrop.classList.add("is-visible")
  accessibilityRefs.panel.classList.add("is-open")
  document.body.classList.add("a11y-panel-open")

  updateAccessibilityToggleLabel()

  requestAnimationFrame(() => {
    accessibilityRefs.closeButton.focus()
  })
}

function closeAccessibilityPanel(restoreFocus = true) {
  if (!accessibilityRefs || !accessibilityPanelOpen) return

  accessibilityPanelOpen = false

  accessibilityRefs.fab.setAttribute("aria-expanded", "false")
  accessibilityRefs.panel.setAttribute("aria-hidden", "true")
  accessibilityRefs.backdrop.classList.remove("is-visible")
  accessibilityRefs.panel.classList.remove("is-open")
  document.body.classList.remove("a11y-panel-open")

  updateAccessibilityToggleLabel()

  if (restoreFocus) {
    accessibilityRefs.fab.focus()
  }
}

function toggleAccessibilitySetting(key) {
  if (!(key in ACCESSIBILITY_DEFAULTS)) return

  accessibilityState[key] = !accessibilityState[key]
  applyAccessibilitySettings()
  saveAccessibilitySettings()
}

function resetAccessibilitySettings() {
  accessibilityState = { ...ACCESSIBILITY_DEFAULTS }
  applyAccessibilitySettings()
  saveAccessibilitySettings()
}

function handleAccessibilityEscape(event) {
  if (event.key === "Escape") {
    closeAccessibilityPanel()
  }
}

function handleAccessibilityMotionPreferenceChange() {
  dispatchAccessibilityChange()
}

function setupAccessibilityWidget() {
  if (accessibilityRefs) return
  if (!injectAccessibilityMarkup()) return

  const fab = document.getElementById("a11y-fab")
  const panel = document.getElementById("a11y-panel")
  const backdrop = document.getElementById("a11y-backdrop")
  const closeButton = document.getElementById("a11y-close")
  const resetButton = document.getElementById("a11y-reset")
  const status = document.getElementById("a11y-status")
  const title = document.getElementById("a11y-title")
  const description = document.getElementById("a11y-description")
  const eyebrow = document.getElementById("a11y-eyebrow")
  const supportTitle = document.getElementById("a11y-support-title")
  const skipLink = document.querySelector(".skip-link")
  const optionButtons = Array.from(document.querySelectorAll(".a11y-option"))
  const supportItems = Array.from(document.querySelectorAll(".a11y-support__item"))

  if (
    !fab ||
    !panel ||
    !backdrop ||
    !closeButton ||
    !resetButton ||
    !status ||
    !title ||
    !description ||
    !eyebrow ||
    !supportTitle ||
    !skipLink ||
    !optionButtons.length
  ) {
    return
  }

  accessibilityRefs = {
    fab,
    panel,
    backdrop,
    closeButton,
    resetButton,
    status,
    title,
    description,
    eyebrow,
    supportTitle,
    skipLink,
    optionButtons,
    supportItems,
  }

  accessibilityState = loadAccessibilitySettings()

  fab.addEventListener("click", () => {
    if (accessibilityPanelOpen) {
      closeAccessibilityPanel()
      return
    }

    openAccessibilityPanel()
  })

  closeButton.addEventListener("click", () => closeAccessibilityPanel())
  backdrop.addEventListener("click", () => closeAccessibilityPanel())
  resetButton.addEventListener("click", () => resetAccessibilitySettings())
  skipLink.addEventListener("click", () => {
    const mainTarget = ensureMainContentTarget()
    setTimeout(() => mainTarget?.focus(), 0)
  })

  optionButtons.forEach((button) => {
    button.addEventListener("click", () => toggleAccessibilitySetting(button.dataset.a11ySetting))
  })

  document.addEventListener("keydown", handleAccessibilityEscape)

  if (window.matchMedia) {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", handleAccessibilityMotionPreferenceChange)
    } else if (motionQuery.addListener) {
      motionQuery.addListener(handleAccessibilityMotionPreferenceChange)
    }
  }

  updateAccessibilityCopy()
  applyAccessibilitySettings()
}

window.siteAccessibility = {
  close: closeAccessibilityPanel,
  getSettings: () => ({ ...accessibilityState }),
  isReducedMotionRequested,
  open: openAccessibilityPanel,
  reset: resetAccessibilitySettings,
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupAccessibilityWidget)
} else {
  setupAccessibilityWidget()
}
