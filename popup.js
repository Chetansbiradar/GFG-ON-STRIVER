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

// bind the buttons with the function
const activateBtnClicked = () => onChange(true);
const deactivateBtnClicked = () => onChange(false);

document
  .getElementById("activate-extension-btn")
  .addEventListener("click", activateBtnClicked);

document
  .getElementById("deactivate-extension-btn")
  .addEventListener("click", deactivateBtnClicked);