const browser = chrome;

console.log = function () {
  var args = Array.from(arguments); // ES5
  args.unshift('Alseta\'s Passage Log:' + ": ");
  log.apply(console, args);
}

// Ensure toast.js and toast.css are included
const css = document.createElement("link");
css.href = browser.runtime.getURL("toast.css");
css.rel = "stylesheet";
document.head.appendChild(css);

const script = document.createElement("script");
script.src = browser.runtime.getURL("toast.js");
document.head.appendChild(script);

// Function to show toast notification
function showToast(message, duration = 3000) {
  // Ensure the toast container exists
  let toastContainer = document.getElementById("alseta-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "alseta-toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create the toast element
  const toast = document.createElement("div");
  toast.className = "alseta-toast";

  // Create the message text node
  const messageNode = document.createTextNode(message);
  toast.appendChild(messageNode);

  // Create the close button
  const closeButton = document.createElement("span");
  closeButton.className = "close-btn";
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  });

  toast.appendChild(closeButton);

  // Append the toast to the container
  toastContainer.appendChild(toast);

  // Show the toast
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove the toast after the specified duration
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Event listener registry
const eventListenerRegistry = new WeakMap();

// Function to format listview details
function formatListViewDetails(details) {
  return details.replace(/\n+/g, "\n> ").trim();
}

// Function to convert HTML to Markdown
function convertHtmlToMarkdown(htmlContent) {
  let markdown = htmlContent;

  // Replace bold tags with **
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, "**$1**");

  // Replace italic tags with *
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, "*$1*");

  // Replace line breaks with new lines
  markdown = markdown.replace(/<br\s*\/?>/g, "\n");

  // Remove any remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, "\n");

  return markdown.trim();
}

// Function to create the export button
function createExportButton() {
  const button = document.createElement("button");
  button.textContent = "Send To Discord";
  button.className = "discord-export-button";
  button.style.fontSize = "12px"; // Make the font smaller
  button.style.marginBottom = "10px"; // Add some margin for spacing
  button.style.padding = "2px 5px"; // Adjust padding for a smaller button
  button.style.display = "inline-block"; // Ensure the button is inline
  button.style.verticalAlign = "middle"; // Align button vertically
  button.style.backgroundColor = "#4CAF50"; // Background color for button
  button.style.color = "white"; // Text color for button
  button.style.border = "none"; // Remove border
  button.style.borderRadius = "4px"; // Rounded corners
  button.style.cursor = "pointer"; // Pointer cursor on hover
  button.style.width = "auto"; // Make sure the button is not wide
  return button;
}

// Function to extract and format traits
function extractAndFormatTraits(detailDiv) {
  const traitDivs = detailDiv.querySelectorAll(".trait");
  const traits = Array.from(
    new Set(Array.from(traitDivs).map((trait) => `**${trait.innerText}**`))
  ).join(" ");
  return { traits, traitDivs };
}

// Function to remove elements from HTML content
function removeElementsFromHtml(contentHtml, elements) {
  elements.forEach((element) => {
    contentHtml = contentHtml.replace(element.outerHTML, "");
  });
  return contentHtml;
}

// Function to prepare the message to send to Discord
function prepareMessage(title, traits, contentMarkdown) {
  const formattedDetails = formatListViewDetails(contentMarkdown);
  return traits
    ? `**${title}**\n> **Traits:** ${traits}\n> ${formattedDetails}`
    : `**${title}**\n> ${formattedDetails}`;
}

// Function to handle button click event
function handleButtonClick(event, div) {
  // console.log("Button Clicked:", div);
  event.stopPropagation(); // Prevent the click from propagating to parent divs

  let detailDiv = div.querySelector(".listview-detail");
  if (!detailDiv || detailDiv.innerHTML.trim() === "") {
    detailDiv = detailDiv.nextElementSibling;
  }
  if (!detailDiv) {
    console.error("No detailDiv found for", div);
    return;
  }

  // Get the title
  const titleDiv = div.querySelector(".listview-title");
  const title = titleDiv ? titleDiv.innerText : "";
  // console.log("Title:", title);

  // Extract and format traits
  const { traits, traitDivs } = extractAndFormatTraits(detailDiv);
  // console.log("Traits:", traits);

  // Get the remaining content without the button and traits
  let contentHtml = detailDiv.innerHTML;
  contentHtml = removeElementsFromHtml(contentHtml, traitDivs);
  const button = div.querySelector(".discord-export-button");
  if (button) {
    contentHtml = removeElementsFromHtml(contentHtml, [button]);
  }

  const contentMarkdown = convertHtmlToMarkdown(contentHtml);
  const message = prepareMessage(title, traits, contentMarkdown);

  // console.log("Detail export button clicked for:", detailDiv);
  // // console.log("Message to send:", message);

  // Send message to background script to send to Discord
  browser.runtime
    .sendMessage({
      action: "sendToDiscord",
      message: message,
    })
    .then((response) => {
      if (response && response.status === "ok") {
        console.log("Message sent to background script");
        // No action needed on success
      } else {
        showToast("Error going to Discord");
        console.error("Failed to send message to background script");
      }
    })
    .catch((error) => {
      showToast("Error going to Discord");
      console.error("Error sending message to background script:", error);
    });
}

// Function to check if the button already has an event listener
function hasEventListener(element, eventName) {
  return (
    eventListenerRegistry.has(element) &&
    eventListenerRegistry.get(element).includes(eventName)
  );
}

// Function to add a detail export button to a div
function addDetailExportButton(div) {
  let detailDiv = div.querySelector(".listview-detail");
  if (detailDiv && detailDiv.innerHTML.trim() === "") {
    detailDiv = detailDiv.nextElementSibling;
  }

  if (detailDiv) {
    let button = detailDiv.querySelector(".discord-export-button");
    if (button && hasEventListener(button, "click")) {
      // console.log("Button with event listener already exists for", detailDiv);
      return;
    }

    if (!button) {
      button = createExportButton();
      detailDiv.insertBefore(button, detailDiv.firstChild);
      // console.log("Created and added button to", detailDiv);
    }

    if (!hasEventListener(button, "click")) {
      button.addEventListener("click", (event) =>
        handleButtonClick(event, div)
      );

      // Update event listener registry
      if (!eventListenerRegistry.has(button)) {
        eventListenerRegistry.set(button, []);
      }
      eventListenerRegistry.get(button).push("click");

      // console.log("Attached event listener to button for", detailDiv);
    }
  }
}

// Function to handle dynamically loaded content and attach buttons
function handleDynamicContent() {
  const containers = document.querySelectorAll(
    ".listview-item, .div-info-lm-box"
  );
  containers.forEach((div) => {
    addDetailExportButton(div);

    // Add click event listener to reveal hidden details and reattach button if needed
    div.addEventListener("click", () => {
      setTimeout(() => {
        let hiddenDetailDiv = div.querySelector(".listview-detail.hidden");
        if (hiddenDetailDiv && hiddenDetailDiv.innerHTML.trim() === "") {
          hiddenDetailDiv = hiddenDetailDiv.nextElementSibling;
        }
        if (hiddenDetailDiv) {
          hiddenDetailDiv.classList.remove("hidden");
          addDetailExportButton(div);
        }
      }, 500); // Adjust the timeout as needed
    });
  });
}

// Observe the document for added nodes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Ensure it's an element node
        if (node.matches(".listview-item, .div-info-lm-box")) {
          addDetailExportButton(node);
          node.addEventListener("click", () => {
            setTimeout(() => {
              let detailDiv = node.querySelector(".listview-detail");
              if (detailDiv && detailDiv.innerHTML.trim() === "") {
                detailDiv = detailDiv.nextElementSibling;
              }
              if (detailDiv && !detailDiv.classList.contains("hidden")) {
                // console.log("Detail content If:", detailDiv.innerHTML);
              }
            }, 500); // Adjust the timeout as needed
          });
        } else {
          // Check for any child .listview-item elements in the newly added node
          node
            .querySelectorAll(".listview-item, .div-info-lm-box")
            .forEach((child) => {
              addDetailExportButton(child);
              child.addEventListener("click", () => {
                setTimeout(() => {
                  let detailDiv = child.querySelector(".listview-detail");
                  if (detailDiv && detailDiv.innerHTML.trim() === "") {
                    detailDiv = detailDiv.nextElementSibling;
                  }
                  if (detailDiv && !detailDiv.classList.contains("hidden")) {
                    // console.log("Detail content Else:", detailDiv.innerHTML);
                  }
                }, 500); // Adjust the timeout as needed
              });
            });
        }
      }
    });
  });
});

// Start observing the body for added child nodes
observer.observe(document.body, { childList: true, subtree: true });

// Initial call to add buttons to already existing items
document.addEventListener("DOMContentLoaded", () => {
  // console.log("DOM fully loaded and parsed");
  handleDynamicContent();
});

let characterName = "";
let diceTitle = "";

// Function to fetch the character name
function fetchCharacterName() {
  const characterNameDiv = Array.from(
    document.querySelectorAll(".small-text.grey-text.button-text")
  ).find((div) => div.textContent.trim() === "Character Name");
  if (characterNameDiv) {
    const nextSiblingDiv = characterNameDiv.nextElementSibling;
    if (
      nextSiblingDiv &&
      nextSiblingDiv.classList.contains("button-selection")
    ) {
      return nextSiblingDiv.textContent;
    }
  }
  return null;
}

// Function to fetch the dice title
function fetchDiceTitle() {
  const diceTitleDiv = document.getElementById("dice-title");
  if (diceTitleDiv) {
    return diceTitleDiv.textContent;
  }
  return "";
}

// Function to log the latest dice history
function logDiceHistory() {
  try {
    const diceHistoryDiv = document.getElementById("dice-history");
    if (!diceHistoryDiv) {
      console.log("Dice history div not found");
      return;
    }

    const latestHistory = diceHistoryDiv.firstElementChild;
    if (!latestHistory) {
      //   console.log("No dice history found");
      throw new Error('No History Found');
    }
    //   console.log(`Dice history: ${latestHistory.innerHTML}`);
    const diceTitle = fetchDiceTitle();
    if (isBetaPage()) {
      browser.runtime.sendMessage({
        action: "logCharacterName",
        data: characterName,
        history: latestHistory.innerHTML,
        title: diceTitle,
      });
    } else {
      // Handle logging for the main page
      let characterName = fetchCharacterName();
      if (characterName) {
        browser.runtime.sendMessage({
          action: "logCharacterName",
          data: characterName,
          history: latestHistory.innerHTML,
          title: diceTitle,
        });
      } else {
        console.error("Dice Hist")

        browser.runtime.sendMessage({
          action: "logDiceHistory",
          data: latestHistory.innerHTML,
          title: diceTitle,
        });
      }
    }
  } catch (error) {
    console.error("Error logging dice history:", error);
  }
}

// Function to format listview details
function formatListViewDetails(details) {
  // console.log(details);
  let formattedDetails = details.replace(/\n+/g, "\n> ").trim();
  return formattedDetails;
}


function sanitizeHTML(str) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = str;

  // Remove script elements
  const scripts = tempDiv.getElementsByTagName('script');
  while (scripts.length > 0) {
    scripts[0].parentNode.removeChild(scripts[0]);
  }

  // Remove event attributes like onclick, onmouseover, etc.
  const elements = tempDiv.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const attrs = elements[i].attributes;
    for (let j = attrs.length - 1; j >= 0; j--) {
      if (attrs[j].name.startsWith('on')) {
        elements[i].removeAttribute(attrs[j].name);
      }
    }
  }

  return tempDiv.innerHTML;
}

// Function to fetch the current page URL
function isBetaPage() {
  return window.location.href.includes("/beta/")
}

function extractCharacterData(htmlContent) {
  const sanitizedContent = sanitizeHTML(htmlContent);

  // Create a temporary DOM element to parse the HTML content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedContent;

  // Helper function to safely extract text content
  function safeExtract(selector, index = 0, defaultValue = "") {
    const elements = tempDiv.querySelectorAll(selector);
    return elements.length > index ? elements[index].innerText.trim() : defaultValue;
  }

  // Extract the character's name
  characterName = safeExtract('.subtitle', 0, "");

  // Extract the level
  const level = safeExtract('.item-level-box', 0, "");

  // Extract Recall Knowledge DC values
  const recallKnowledge = tempDiv.querySelectorAll('b')[0]?.nextSibling?.nodeValue?.trim() || "";
  const unspecificLore = tempDiv.querySelectorAll('b')[1]?.nextSibling?.nodeValue?.trim() || "";
  const specificLore = tempDiv.querySelectorAll('b')[2]?.nextSibling?.nodeValue?.trim() || "";

  // Extract traits
  const traits = Array.from(tempDiv.querySelectorAll('.trait')).map(trait => trait.innerText.trim());

  // Extract skills
  const skills = Array.from(tempDiv.querySelectorAll('.button-mystery')).map(skill => {
    const skillName = skill.querySelector('b') ? skill.querySelector('b').innerText : '';
    const skillValue = skill.querySelector('span') ? skill.querySelector('span').innerText : '';
    return `${skillName} ${skillValue}`.trim();
  });

  // Extract abilities
  const abilitiesMatch = tempDiv.innerText.match(/Str\s[+-]\d,\sDex\s[+-]\d,\sCon\s[+-]\d,\sInt\s[+-]\d,\sWis\s[+-]\d,\sCha\s[+-]\d/);
  const abilities = abilitiesMatch ? abilitiesMatch[0] : "";

  // Extract items
  const itemsNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Items");
  const items = itemsNode ? itemsNode.nextSibling.nodeValue.trim() : "";

  // Extract AC, Fortitude, Reflex, Will, HP
  const acNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "AC");
  const ac = acNode ? acNode.nextElementSibling.innerText.trim() : "";
  const fortNode = Array.from(tempDiv.querySelectorAll('.button-mystery')).find(b => b.innerText.includes("Fort"));
  const fort = fortNode ? fortNode.querySelector('span').innerText.trim() : "";
  const refNode = Array.from(tempDiv.querySelectorAll('.button-mystery')).find(b => b.innerText.includes("Ref"));
  const ref = refNode ? refNode.querySelector('span').innerText.trim() : "";
  const willNode = Array.from(tempDiv.querySelectorAll('.button-mystery')).find(b => b.innerText.includes("Will"));
  const will = willNode ? willNode.querySelector('span').innerText.trim() : "";
  const hpNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "HP");
  const hp = hpNode ? hpNode.nextElementSibling.innerText.trim() : "";

  // Extract Speed
  const speedNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Speed");
  const speed = speedNode ? speedNode.nextSibling.nodeValue.trim() : "";

  // Extract Melee and Ranged attacks
  const meleeNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Melee");
  const melee = meleeNode ? meleeNode.parentNode.innerText.replace("Melee", "").trim() : "";
  const rangedNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Ranged");
  const ranged = rangedNode ? rangedNode.parentNode.innerText.replace("Ranged", "").trim() : "";

  // Extract Spells
  const spellsNode = Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText.includes("Spells"));
  const spells = spellsNode ? spellsNode.parentNode.innerText.replace(spellsNode.innerText, "").trim() : "";

  // Format the extracted data
  const characterData = {
    name: characterName,
    level: level,
    recallKnowledge: recallKnowledge,
    unspecificLore: unspecificLore,
    specificLore: specificLore,
    traits: traits,
    skills: skills,
    abilities: abilities,
    items: items,
    ac: ac,
    fort: fort,
    ref: ref,
    will: will,
    hp: hp,
    speed: speed,
    melee: melee,
    ranged: ranged,
    spells: spells,
  };

  return characterData;
}


function observeStatblock() {
  //   console.log("Stat");

  const statblock = document.querySelector(".div-statblock");
  if (statblock) {
    //   console.log("Statblock found");

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          //   console.log("Statblock updated");
          let stats = undefined;
          let diceTitle = undefined; // Declare diceTitle

          if (isBetaPage()) {
            //   console.log("Getting stats for beta page");
            const htmlContent = statblock.innerHTML;
            stats = extractCharacterData(htmlContent);
            //   console.log(stats);
            characterName = stats.name; // Set characterName from stats
            diceTitle = fetchDiceTitle();
          } else {
            //   console.log("Not a beta page");
          }
        }
      }
    });

    // Observe the statblock for changes
    observer.observe(statblock, { childList: true, subtree: true });

  } else {
    //   console.log("Stat block not found");
  }
}

function observePageForStatblock() {
  const observer = new MutationObserver(() => {
    const statblock = document.querySelector(".div-statblock");
    if (statblock) {
      //   console.log("Statblock found during page observation");
      observeStatblock();
      observer.disconnect(); // Stop observing once the statblock is found and observed
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Observe changes in the dice history div
function observeDiceHistory() {
  const diceHistoryDiv = document.getElementById("dice-history");
  if (diceHistoryDiv) {
    const observer = new MutationObserver(() => {
      logDiceHistory();
    });

    observer.observe(diceHistoryDiv, { childList: true });
  } else {
    // console.log("Dice history div not found");
  }
}

// Observe changes in the sidebar to fetch the title
function observeSidebar() {
  const sidebar = document.querySelector(".dice-tray"); // Correct sidebar selector
  if (sidebar) {
    const observer = new MutationObserver(() => {
      diceTitle = fetchDiceTitle();
      characterName = fetchCharacterName()
      // console.log(`Dice title updated: ${diceTitle}`);
    });

    observer.observe(sidebar, { childList: true, subtree: true });
  } else {
    // console.log("Sidebar not found");
  }
}

// Initialize the script
function init() {
  observeDiceHistory();
  observeSidebar(); // Add sidebar observation
  observePageForStatblock(); // Ensure statblock is observed when dynamically added
}

// Run init on page load
window.addEventListener("load", init);
