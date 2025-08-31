const age = document.querySelector("#age");
const pincode = document.querySelector("#pincode");

// Declare gender & symptom globally
let gender = "";
let symptom = "";

// Gender radios
document.querySelectorAll('input[name="gender"]').forEach(radio => {
  radio.addEventListener('change', () => {
    gender = radio.value;
  });
});

// Symptom checkboxes (multiple allowed)
document.querySelectorAll('input[name="symptoms"]').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    // Gather all checked symptoms
    const checked = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(cb => cb.value);
    symptom = checked.join(", ");
  });
});

const buttoncontrol = document.querySelector("form button[type='submit']");

// On form submit
buttoncontrol.addEventListener("click", (e) => {
  e.preventDefault(); // prevent actual form submission

  const otherSymptom = document.querySelector("#other").value;

  const data = {
    age: age.value,
    pincode: pincode.value,
    gender: gender,
    symptom: symptom + (otherSymptom ? `, ${otherSymptom}` : "")
  };

  // Generate PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("AirLytics - Health Report", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);
  doc.text(`Age: ${data.age}`, 14, 45);
  doc.text(`Gender: ${data.gender}`, 14, 55);
  doc.text(`Pincode: ${data.pincode}`, 14, 65);
  doc.text(`Symptoms: ${data.symptom || "None"}`, 14, 75);

  doc.setFontSize(10);
  doc.text("Thank you for using AirLytics!", 105, 100, { align: "center" });

  // Download PDF
  doc.save(`AirLytics_Report_${data.pincode || "user"}.pdf`);
});
