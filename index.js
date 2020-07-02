document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#howSaltyButtons").onclick = function () {
    document.getElementById("output").scrollIntoView({ behavior: "smooth" });
  };
  // BEGIN FEEDBACK FORM CODE
  // Gets the data from user's previous session
  lastResult = JSON.parse(localStorage.getItem("lastResult"));

  if (lastResult != null) {
    document.getElementById("feedback").style.display = "block";
    // Closes feedback form

    document.getElementById("closeFeedback").onclick = function () {
      event.preventDefault();
      document.querySelector("#feedback").style.display = "none";
    };

    // To account for "fish" vs "fish meat"
    let meatSelectionText;
    if (lastResult["meatSelection"] == "fish") {
      meatSelectionText = "fish";
    } else {
      meatSelectionText = `${lastResult["meatSelection"]} meat`;
    }

    // Populates feedback form with saved data
    document.getElementById("feedbackLastResult").innerHTML = `${lastResult[
      "saltWeightGrams"
    ].toFixed(2)} grams // ${lastResult["saltWeightTbsp"].toFixed(
      2
    )} tbsp // ${lastResult["saltWeightTsp"].toFixed(2)} tsp of ${
      lastResult["saltSelection"]
    } for ${lastResult["meatWeight"]} ${
      lastResult["meatWeightSelection"]
    } of ${meatSelectionText}. This was:`;
    // Fills hidden metadata inputs
    document.getElementById(
      "hidden-meatSelection"
    ).value = `${lastResult["meatSelection"]}`;
    document.getElementById(
      "hidden-meatWeight"
    ).value = `${lastResult["meatWeight"]}`;
    document.getElementById(
      "hidden-meatWeightSelection"
    ).value = `${lastResult["meatWeightSelection"]}`;
    document.getElementById(
      "hidden-saltSelection"
    ).value = `${lastResult["saltSelection"]}`;
    document.getElementById(
      "hidden-saltPreference"
    ).value = `${lastResult["saltPreference"]}`;
    document.getElementById(
      "hidden-saltWeightGrams"
    ).value = `${lastResult["saltWeightGrams"]}`;
    document.getElementById(
      "hidden-saltWeightTbsp"
    ).value = `${lastResult["saltWeightTbsp"]}`;
    document.getElementById(
      "hidden-saltWeightTsp"
    ).value = `${lastResult["saltWeightTsp"]}`;

    // Process feedback form
    const processForm = (form) => {
      const data = new FormData(form);
      data.append("form-name", "feedback");
      fetch("/", {
        method: "POST",
        body: data,
      })
        .then(() => {
          form.innerHTML = `<p class="form--success">Thanks for the feedback! Your response will be used to help adjust these guidelines.</p>`;
        })
        .catch((error) => {
          form.innerHTML = `<p class="form--error">Error: ${error}</p>`;
        });
    };

    // Prevents redirect
    const feedbackForm = document.querySelector("#feedback");
    if (feedbackForm) {
      feedbackForm.addEventListener("submit", (e) => {
        e.preventDefault();
        processForm(feedbackForm);
      });
    }
  }

  // END FEEDBACK FORM~

  // Shows an alert if a user forgets to click lbs or kgs
  document.getElementById("inputs").onclick = function () {
    // if lbs or kgs is not selected when a user clicks saltSelection, display the alert
    document.getElementById("saltSelection").onclick = function () {
      if (
        (document.getElementById("meatWeightLb").checked ||
          document.getElementById("meatWeightKg").checked) == false
      ) {
        let alert = document.getElementById("weightSelectionAlert");
        alert.style.display = "block";
      }
    };
    // Hide the alert once the user fixes the error by selecting lbs or kgs
    document.getElementById("meatWeightContainer").onclick = function () {
      // if lbs or kgs is not selected when a user clicks saltSelection, display the alert
      if (
        (document.getElementById("meatWeightLb").checked ||
          document.getElementById("meatWeightKg").checked) == true
      ) {
        let alert = document.getElementById("weightSelectionAlert");
        alert.style.display = "none";
      }
    };

    // Get user inputs
    let meatSelection = document.querySelector(
      'input[name="meatSelection"]:checked'
    ).value;
    let meatWeight = Number(document.getElementById("meatWeight").value);
    let meatWeightSelection = document.querySelector(
      'input[name="meatWeightSelection"]:checked'
    ).value;
    let saltSelection = document.querySelector(
      'input[name="saltSelection"]:checked'
    ).value;
    let saltPreference = document.querySelector(
      'input[name="saltPreference"]:checked'
    ).value;
    // Convert meatWeight into grams
    if (meatWeightSelection === "lbs") {
      // 453.592 grams per lb
      meatWeightGrams = meatWeight * 453.592;
    } else if (meatWeightSelection === "kgs") {
      // 1000 grams per kg
      meatWeightGrams = meatWeight * 1000;
    }

    // Find salt weight in grams, depending on meat type
    bonelessSaltByWeight = 0.01;
    boneinSaltByWeight = 0.0125;
    fishSaltByWeight = 0.0055;
    groundSaltByWeight = 0.008;
    if (meatSelection === "boneless") {
      saltWeightGrams = meatWeightGrams * bonelessSaltByWeight;
    } else if (meatSelection === "bonein") {
      saltWeightGrams = meatWeightGrams * boneinSaltByWeight;
    } else if (meatSelection === "fish") {
      saltWeightGrams = meatWeightGrams * fishSaltByWeight;
    } else if (meatSelection === "ground") {
      saltWeightGrams = meatWeightGrams * groundSaltByWeight;
    }

    // If the user prefers their food to be more/less salty, reduce/increase salt by 15% respectively
    if (saltPreference == "lessSalty") {
      saltWeightGrams = saltWeightGrams * 0.85;
    } else if (saltPreference == "moreSalty") {
      saltWeightGrams = saltWeightGrams * 1.15;
    }

    // saltGramsPerTbsp conversions
    let saltGramsPerTbspConversions = {
      "Fine salt": 14.6,
      "Sel gris": 13,
      "Table salt": 18.6,
      "Morton's kosher": 14.75,
      "Diamond kosher": 9.75,
      Maldon: 8.4,
      "Sea salt": 14.75,
    };
    // convert to tbsp
    saltWeightTbsp =
      saltWeightGrams / saltGramsPerTbspConversions[saltSelection];
    // convert to tsp
    saltWeightTsp = saltWeightTbsp * 3;

    // OUTPUT
    document.querySelector(
      "#outputDescription"
    ).innerHTML = `For <span id="outputNumber"></span> <span id="outputWeightMeasurment"></span> of <span id="meatType"></span><span id="meatOrFish"></span>, use <span id="saltWeightGrams"></span ><span id="saltWeightTbsp"></span><span id="saltWeightTsp"></span>. Salt <span id="brineMin"></span> before or up to <span id="brineMax">24 hours</span> before cooking.</p>`;

    document.querySelector("#outputNumber").innerHTML = `${meatWeight}`;
    // If meat weight = 1, display lb/kg, otherwise display lbs/kgs
    if (meatWeight === 1) {
      if (meatWeightSelection == "lbs") {
        document.querySelector("#outputWeightMeasurment").innerHTML = `lb`;
      } else if (meatWeightSelection == "kgs") {
        document.querySelector("#outputWeightMeasurment").innerHTML = `kg`;
      }
    } else {
      document.querySelector(
        "#outputWeightMeasurment"
      ).innerHTML = `${meatWeightSelection}`;
    }
    document.querySelector("#meatType").innerHTML = `${meatSelection}`;
    // If fish is selected, don't display "meat". So we get "ground meat" but not "fish meat"
    if (meatSelection != "fish") {
      document.querySelector("#meatOrFish").innerHTML = ` meat`;
    }
    // Displays amount of salt
    document.querySelector(
      "#saltWeightGrams"
    ).innerHTML = `${saltWeightGrams.toFixed(2)} grams // `;
    document.querySelector(
      "#saltWeightTbsp"
    ).innerHTML = `${saltWeightTbsp.toFixed(2)} tablespoons // `;
    document.querySelector(
      "#saltWeightTsp"
    ).innerHTML = `${saltWeightTsp.toFixed(2)} teaspoons of ${saltSelection}`;
    // Outputs the amount of time you should salt
    if (meatSelection == "bonein" || meatSelection == "boneless") {
      document.querySelector("#brineMin").innerHTML = `at least 40 minutes`;
      document.querySelector("#brineMax").innerHTML = `24 hours`;
    } else if (meatSelection == "ground" || meatSelection == "fish") {
      document.querySelector("#brineMin").innerHTML = `right`;
      document.querySelector("#brineMax").innerHTML = `10 minutes`;
    }
    document.querySelector("#outputNote").innerHTML =
      "<i><p>Please note that <b>this calculator spits out general guidelines</b>. Everyone's preferences for salt intake are different, and the amount of salt you're using will likely vary depending on the dish you are using. This suggestion is meant to be a starting point. </p><p>Additionally, this suggestion will be saved. The next time you visit this site, we'll pull it up and you can tell us how it worked out for you if you'd like. Your feedback will help improve calculations in the future!</p></i>";

    let result = {
      meatSelection: meatSelection,
      meatWeight: meatWeight,
      meatWeightSelection: meatWeightSelection,
      saltSelection: saltSelection,
      saltPreference: saltPreference,
      saltWeightGrams: saltWeightGrams,
      saltWeightTbsp: saltWeightTbsp,
      saltWeightTsp: saltWeightTsp,
    };
    localStorage.setItem("lastResult", JSON.stringify(result));
  };
});
