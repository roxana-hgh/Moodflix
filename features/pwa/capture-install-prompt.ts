export const INSTALL_PROMPT_READY_EVENT = "moodflix:install-prompt-ready";

// Inlined in <head> because beforeinstallprompt can fire before React hydrates.
// preventDefault stops Android's own mini-infobar; the browser menu's install
// option stays available.
export const captureInstallPromptScript = `window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__moodflixInstallPrompt=e;window.dispatchEvent(new Event("${INSTALL_PROMPT_READY_EVENT}"))})`;
