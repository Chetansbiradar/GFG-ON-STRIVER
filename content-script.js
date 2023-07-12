// this defines where the gfg column should be added in the table
const colPos = -1; // add at the end of the table
let questions = []; // keep key value pairs of question id and question link

// url where all the data for questions are present
const url =
  "https://gist.githubusercontent.com/charitra1022/3c963e85a7f5715f377db330c6bf5b87/raw/35fc3393f094cebc10e95fdd7c3222de5d10c88e/ques_list.json";

/**
 * fetch the question list and make {questionid: questionLink} pairs and add to the global variable
 * @returns {object} returns a dictionary with questionid: questionlink pairs
 */
const fetchData = async function () {
  const data = await fetch(url); // fetch data
  const json = await data.json(); // convert to json

  let ques_list = [];

  // add required data to the global variable
  json.forEach((ques) => {
    ques_list[ques["question-id"]] = ques["question-link"];
  });

  return ques_list;
};

var browser = browser || chrome;

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
