const API_BASE = "http://127.0.0.1:8000";
// Form handling for userForm
const age = document.querySelector("#age");
const pincode = document.querySelector("#pincode");
const name = document.querySelector("#name");
const buttoncontrol = document.querySelector("#sub");

// declare globally
let gender = "";
let symptoms = [];

// Gender radios
document.querySelectorAll('input[name="gender"]').forEach(radio => {
  radio.addEventListener('change', () => {
    gender = radio.value;
    console.log("Selected gender:", gender);
  });
});

// Note: HTML checkboxes use name="symptom" — select that
document.querySelectorAll('input[name="symptom"]').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    // collect all checked
    symptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked'))
      .map(cb => cb.value);
    console.log("Selected symptoms:", symptoms);
  });
});

// Handle Submit
buttoncontrol.addEventListener("click", (e) => {
  e.preventDefault(); // prevent page refresh

  const data = {
    name: name.value,
    age: age.value,
    pincode: pincode.value,
    gender: gender,
    symptoms: symptoms
  };

  console.log("Sending data:", data);

  fetch("/user/rsave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(res => {
      // backend returns { id, risk, advice }
      alert(`Risk: ${res.risk}\nAdvice: ${res.advice}`);
    })
    .catch(err => {
      console.error("Error:", err);
      alert("Failed to save assessment. See console for details.");
    });
});



// === Fetch Air & Water Quality from FastAPI Backend ===
fetch("/api/quality")
  .then(response => response.json())
  .then(data => {
    console.log("Backend Data:", data);

    const pm25El = document.getElementById("pm25");
    if (pm25El) pm25El.innerText = (data.pm25 ?? "-") + " µg/m³";
    const pm10El = document.getElementById("pm10");
    if (pm10El) pm10El.innerText = (data.pm10 ?? "-") + " µg/m³";
    const no2El = document.getElementById("no2");
    if (no2El) no2El.innerText = (data.no2 ?? "-") + " ppm";
    const o3El = document.getElementById("o3");
    if (o3El) o3El.innerText = (data.o3 ?? "-") + " ppb";
    const tdsEl = document.getElementById("tds");
    if (tdsEl) tdsEl.innerText = (data.tds ?? "-") + " ppm";
    const phEl = document.getElementById("ph");
    if (phEl) phEl.innerText = (data.ph ?? "-");
  })
  .catch(error => console.error("Error fetching /api/quality:", error));