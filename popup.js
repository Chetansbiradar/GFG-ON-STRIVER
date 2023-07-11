/**
 * Called by the extension's index page.
 *
 * sends the message to the injected script to run the modification code
 */

// for compatibility between chrome and firefox
var browser = browser || chrome;

// on clicking activate button, send message to injected script for link activation
function onChange(state) {
  (async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        activate: state,
      });
      console.log(response);
    } catch (err) {
      const errMsg = `<strong>Error: </strong>${err.message}`;
      document.getElementById("error-display").innerHTML = errMsg;
    }
  })();
}

// called when checkbox is checked
const activateExtension = () => {
  onChange(true);
  window.localStorage.setItem("gfg-extension", "active");
};

// called when checkbox is unchecked
const deactivateExtension = () => {
  window.localStorage.removeItem("gfg-extension");
  onChange(false);
};

// bind the checkbox
const checkbox = document.getElementById("activate-extension-checkbox");
checkbox.addEventListener("change", function () {
  if (this.checked) activateExtension();
  else deactivateExtension();
});

// get previous state of the checkbox
const state = window.localStorage.getItem("gfg-extension");
if (state === "active") {
  checkbox.checked = true;
  onChange(true);
}
