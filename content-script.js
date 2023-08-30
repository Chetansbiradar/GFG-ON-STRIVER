// this defines where the gfg column should be added in the table
const colPos = -1; // add at the end of the table
let questions = []; // keep key value pairs of question id and question link

// url where all the data for questions are present
const url =
  "https://api.github.com/gists/3c963e85a7f5715f377db330c6bf5b87";

/**
 * fetch the question list and make {questionid: questionLink} pairs and add to the global variable
 * @returns {object} returns a dictionary with questionid: questionlink pairs
 */
const fetchData = async function () {
  const options = {
    method: "GET",
    headers: { "Content-type": "application/json;charset=UTF-8" },
  };
  const data = await fetch(url, options); // fetch data
  const json = await data.json(); // convert to json
  const mainData = JSON.parse(json.files['ques_list.json'].content)
  console.log(mainData);

  let ques_list = [];

  // add required data to the global variable
  mainData.forEach((ques) => {
    ques_list[ques["question-id"]] = ques["question-link"];
  });

  return ques_list;
};

var browser = browser || chrome;

// function to handle changes in the target class
function handleChildChanges() {
  console.log("GFG Extention: Child elements changed");
  // getting the toggle state
  chrome.storage.local.get("gfgExtensionState", result => {
    const toggle = result.gfgExtensionState;
    if (toggle) {
      console.log("GFG Extention: Toggle is turned on");
      fetchData().then((data) => {
        questions = data;
        activateExtension();
      });
    }else{
      console.log("GFG Extention: Toggle is turned off");
    }
  });
}

const observerConfig = { childList: true, subtree: true };

const targetClassname = "topics-container"; // Targetting this class because it is the parent of all the questions

let noChangesTimer;

// Callback function to handle mutations
function mutationCallback(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' && mutation.target.classList.contains(targetClassname)) {
      clearTimeout(noChangesTimer);
      noChangesTimer = setTimeout(handleChildChanges, 1000);
    }
  }
}

const observer = new MutationObserver(mutationCallback);

// Start observing the entire document and its descendants
observer.observe(document, observerConfig);

// add a listener for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.activate === true) {
    fetchData().then((data) => {
      questions = data;
      activateExtension();
    });
    sendResponse({ message: "initiated GFG activation" });
  } else {
    removeChanges();
    sendResponse({ message: "initiated GFG deactivation" });
  }
});

/**
 * adds the heading for the gfg PL. addes table heading
 * @param {table} table reference to the table tag of sub-section
 * @returns {void}
 */
const modifyTableHeader = (table) => {
  let thtr = table
    .getElementsByTagName("thead")
    .item(0)
    .getElementsByTagName("tr")
    .item(0);
  let gfgth = thtr.insertCell(colPos);
  gfgth.outerHTML = "<th class='gfg-extension'>PL-GFG</th>";
};

/**
 * modify the table body. addes gfg column in all rows
 * @param {table} table reference to the table tag of sub-section
 * @returns {void}
 */
const modifyTableBody = (table) => {
  let tb = table
    .getElementsByTagName("tbody")
    .item(0)
    .getElementsByTagName("tr");

  for (let tr of tb) {
    const quesId = tr.getElementsByTagName("select")[0].getAttribute("id");
    const quesLink = questions[quesId];

    let linkHTML = "";

    if (quesLink !== "")
      linkHTML = `<a target="_blank" href="${quesLink}">
       <img 
        class="aligncenter wp-image-1830 lazy-loaded" 
        src="https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/gallery/618a9417f3c00_geeksforgeeks.svg.png" 
        alt=""
        width="24" 
        height="24" 
        decoding="async" 
        loading="lazy" 
        data-lazy-type="image"          
        data-src="https://d8it4huxumps7.cloudfront.net/uploads/images/opportunity/gallery/618a9417f3c00_geeksforgeeks.svg.png"/>
    </a>`;

    let gfgtd = tr.insertCell(colPos);
    gfgtd.outerHTML = `<td title='GFG link' class='gfg-extension'>${linkHTML}</td>`;
  }
};

/**
 * process the table data. adds table heading and gfg column in all rows
 * @param {table} table reference to the table tag of sub-section
 * @returns {void}
 */
const processTableData = (table) => {
  modifyTableHeader(table);
  modifyTableBody(table);
};

/**
 * fetches all the sub-section details and returns the list of questions in all the sub-sections
 * @param {topLevelTag} topLevelTag reference to the detail tag of top-level
 * @returns {Array} list of questions in all subsections of a top level tag
 */
const processSubSectionTags = (topLevelTag) => {
  const sections = topLevelTag.getElementsByTagName("details");

  // access all the sub-sections
  for (let section of sections) {
    // process data of the tables in the sub-section
    const table = section.getElementsByTagName("table")[0];
    processTableData(table);
  }
};

/**
 * fetches all the top level tags and processes them
 */
const processTopLevelTags = () => {
  const topLevelTags = document
    .getElementById("render-questions")
    .getElementsByClassName("top-level");

  // access all the sections
  for (let topLevel of topLevelTags) {
    processSubSectionTags(topLevel);
  }
};

const isActivated = () => {
  const el = document.getElementsByClassName("gfg-extension");
  if (el.length === 0) return false;
  return true;
};

/**
 * start the extension and add links
 */
const activateExtension = () => {
  // call the first function of the chain
  if (!isActivated()) processTopLevelTags();
};

/**
 * remove all the changes by reloading site
 */
const removeChanges = () => {
  window.location.reload();
};
