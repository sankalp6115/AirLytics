/*age=document.querySelector("#age")
pincode=document.querySelector("#pincode")


  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', () => {
      console.log("Selected:", radio.value)
     var gender=radio.value
    });
  });

 document.querySelectorAll('input[name="symptom"]').forEach(radio => {
    radio.addEventListener('change', () => {
      console.log("Selected symptom:", radio.value);
    var symptom=radio.value
    });
  });
data={age:age.value,pincode:pincode.value,gender:gender,symptom:symptom}
console.log(data)
buttoncontrol=document.querySelectorAll("#sub")
buttoncontrol.addEventListener("click",()=>{
fetch("http://localhost:8000/user/save",{method:"post",headers:
        { "Content-Type": "application/json"},body:JSON.stringify(user)
    })
    .then(response=>response.json())
    .then(data=>{
        alert(data.message)

    })
})      
*/

const age = document.querySelector("#age");
const pincode = document.querySelector("#pincode");

//declare gender & symptom OUTSIDE listeners
let gender = "";
let symptom = "";

// gender radios
document.querySelectorAll('input[name="gender"]').forEach(radio => {
  radio.addEventListener('change', () => {
    gender = radio.value;  //store globally
    console.log("Selected gender:", gender);
  });
});

//symptom radios
document.querySelectorAll('input[name="symptom"]').forEach(radio => {
  radio.addEventListener('change', () => {
    symptom = radio.value; //store globally
    console.log("Selected symptom:", symptom);
  });
});

//correct selector: querySelector instead of querySelectorAll
const buttoncontrol = document.querySelector("#sub");

// build "data" object INSIDE click handler, not before
buttoncontrol.addEventListener("click", () => {
  const data = {
    age: age.value,
    pincode: pincode.value,
    gender: gender,
    symptom: symptom
  };

  console.log("Sending data:", data);

  fetch("http://localhost:8000/user/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)   //send "data", not "user"
  })
    .then(response => response.json())
    .then(res => {
      alert(res.message);
    })
    .catch(err => {
      console.error("Error:", err);
    });
});