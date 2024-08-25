const browser = chrome;
document.addEventListener("DOMContentLoaded", function () {
  const webhookNameInput = document.getElementById("webhookName");
  const webhookUrlInput = document.getElementById("webhookUrl");
  const addWebhookButton = document.getElementById("addWebhook");

  function validateInputs() {
    addWebhookButton.disabled = !webhookNameInput.value || !webhookUrlInput.value;
  }

  webhookNameInput.addEventListener("input", validateInputs);
  webhookUrlInput.addEventListener("input", validateInputs);

  document.getElementById("addWebhook").addEventListener("click", function () {
    const webhookName = document.getElementById("webhookName").value;
    const webhookUrl = document.getElementById("webhookUrl").value;

    if (webhookName && webhookUrl) {
      browser.storage.sync.get("webhooks").then((result) => {
        const webhooks = result.webhooks || [];
        webhooks.push({ name: webhookName, url: webhookUrl });
        return browser.storage.sync.set({ webhooks: webhooks });
      })
        .then(() => {
          document.getElementById("addSuccess").style.display = "block";
          setTimeout(() => {
            document.getElementById("addSuccess").style.display = "none";
          }, 3000);
          displayWebhooks();
        })
        .catch((error) => {
          console.error("Error saving webhooks:", error);
        });
    } else {
      alert("Please provide both a name and a URL.");
    }
  });

  document.getElementById("saveActiveWebhook").addEventListener("click", function () {
    const activeWebhook = document.getElementById("activeWebhook").value;
    if (activeWebhook) {
      browser.storage.sync.set({ activeWebhook: activeWebhook }).then(() => {
        document.getElementById("saveSuccess").style.display = "block";
        setTimeout(() => {
          document.getElementById("saveSuccess").style.display = "none";
        }, 3000);
      })
        .catch((error) => {
          console.error("Error saving active webhook:", error);
        });
    } else {
      alert("Please select a webhook.");
    }
  });

  function displayWebhooks() {
    browser.storage.sync
      .get(["webhooks", "activeWebhook"])
      .then((result) => {
        const webhooks = result.webhooks || [];
        const activeWebhook = result.activeWebhook || "";
        const webhookList = document.getElementById("webhookList");
        const activeWebhookSelect = document.getElementById("activeWebhook");

        webhookList.innerHTML = "";
        activeWebhookSelect.innerHTML = "";
        webhooks.forEach((webhook, index) => {
          const li = document.createElement("li");
          li.textContent = webhook.name;
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", function () {
            webhooks.splice(index, 1);
            browser.storage.sync
              .set({ webhooks: webhooks })
              .then(displayWebhooks);
          });
          li.appendChild(deleteButton);
          webhookList.appendChild(li);

          const option = document.createElement("option");
          option.value = webhook.name;
          option.textContent = webhook.name;
          if (webhook.name === activeWebhook) {
            option.selected = true;
          }
          activeWebhookSelect.appendChild(option);
        });
      })
      .catch((error) => {
        console.error("Error retrieving webhooks:", error);
      });
  }

  // Load and display webhooks when the popup is opened
  displayWebhooks();
  validateInputs();
});
