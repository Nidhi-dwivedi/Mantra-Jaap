let count = 0;

const mantraSelect = document.getElementById("mantraSelect");
const customMantra = document.getElementById("customMantra");
const saveBtn = document.getElementById("saveBtn");
const mantraDisplay = document.getElementById("mantraDisplay");
const countDisplay = document.getElementById("count");
const chantBtn = document.getElementById("chantBtn");
const resetBtn = document.getElementById("resetBtn");

const mantras = {
  gayatri: `ॐ भूर्भुवः स्वः
तत्सवितुर्वरेण्यं
भर्गो देवस्य धीमहि
धियो यो नः प्रचोदयात् ॥`,

  krishna: `हरे कृष्ण हरे कृष्ण
कृष्ण कृष्ण हरे हरे
हरे राम हरे राम
राम राम हरे हरे`
};

// Load saved custom mantra
const savedMantra = localStorage.getItem("customMantra");
if (savedMantra) customMantra.value = savedMantra;

mantraSelect.addEventListener("change", () => {
  resetCount();

  if (mantraSelect.value === "custom") {
    customMantra.hidden = false;
    saveBtn.hidden = false;
    mantraDisplay.innerText =
      savedMantra || "Write and save your mantra";
  } else {
    customMantra.hidden = true;
    saveBtn.hidden = true;
    mantraDisplay.innerText =
      mantras[mantraSelect.value] || "Choose a mantra";
  }
});

saveBtn.addEventListener("click", () => {
  const text = customMantra.value.trim();
  if (!text) {
    alert("Please write a mantra first");
    return;
  }
  localStorage.setItem("customMantra", text);
  mantraDisplay.innerText = text;
  alert("🕉️ Mantra saved");
});

chantBtn.addEventListener("click", () => {
  if (!mantraSelect.value) {
    alert("Select a mantra first");
    return;
  }

  if (
    mantraSelect.value === "custom" &&
    !localStorage.getItem("customMantra")
  ) {
    alert("Save your mantra first");
    return;
  }

  if (count < 108) {
    count++;
    countDisplay.innerText = count;

    if (count === 108) {
      alert("🕉️ 108 Jaap Completed");
    }
  }
});

resetBtn.addEventListener("click", resetCount);

function resetCount() {
  count = 0;
  countDisplay.innerText = "0";
}
