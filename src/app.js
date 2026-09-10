import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* ===============================
   FIREBASE CONFIGURATION
================================ */

const firebaseConfig = {

    apiKey:
    "AIzaSyDVArU4b5-NiY861C48pK2ioCWxZvn8veY",

    authDomain:
    "smart-water-monitoring-s-bad82.firebaseapp.com",

    databaseURL:
    "https://smart-water-monitoring-s-bad82-default-rtdb.firebaseio.com",

    projectId:
    "smart-water-monitoring-s-bad82",

    storageBucket:
    "smart-water-monitoring-s-bad82.firebasestorage.app",

    messagingSenderId:
    "236717542324",

    appId:
    "1:236717542324:web:5ce4d5126f26d5cf8400e1"

};


/* ===============================
   INITIALIZE FIREBASE
================================ */

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);


/* ===============================
   VOICE CONTROL
================================ */

let voiceEnabled = true;

const voiceButton =
document.getElementById("voiceButton");


voiceButton.addEventListener("click", () => {

    voiceEnabled = !voiceEnabled;

    if (voiceEnabled) {

        voiceButton.innerHTML =
        "🔊 Voice ON";

    } else {

        voiceButton.innerHTML =
        "🔇 Voice OFF";

    }

});


/* ===============================
   SPEAK FUNCTION
================================ */

function speak(message) {

    if (!voiceEnabled) return;

    if ("speechSynthesis" in window) {

        speechSynthesis.cancel();

        const speech =
        new SpeechSynthesisUtterance(message);

        speech.rate = 0.9;

        speechSynthesis.speak(speech);

    }

}


/* ===============================
   WATER STATUS
================================ */

function getStatus(level) {

    if (level <= 25) {

        return {

            text: "🔴 LOW WATER",
            className: "danger-status",
            alert: true

        };

    }

    if (level <= 60) {

        return {

            text: "🟡 WARNING",
            className: "warning-status",
            alert: false

        };

    }

    return {

        text: "🟢 SAFE",
        className: "safe-status",
        alert: false

    };

}


/* ===============================
   UPDATE TANK
================================ */

function updateTank(tankNumber, level) {

    const water =
    document.getElementById(
        "water" + tankNumber
    );

    const percent =
    document.getElementById(
        "percent" + tankNumber
    );

    const statusElement =
    document.getElementById(
        "status" + tankNumber
    );


    if (water) {

        water.style.height =
        level + "%";

    }


    if (percent) {

        percent.innerText =
        level.toFixed(1) + "%";

    }


    const status =
    getStatus(level);


    if (statusElement) {

        statusElement.innerText =
        status.text;

        statusElement.className =
        "status " + status.className;

    }


    return status;

}


/* ===============================
   WATER HISTORY CHART
================================ */

const chartElement =
document.getElementById("waterChart");


const chartContext =
chartElement.getContext("2d");


const waterChart =
new Chart(chartContext, {

    type: "line",

    data: {

        labels: [],

        datasets: [

            {

                label: "Tank 1",

                data: [],

                tension: 0.4

            },

            {

                label: "Tank 2",

                data: [],

                tension: 0.4

            }

        ]

    },


    options: {

        responsive: true,

        animation: true,

        scales: {

            y: {

                min: 0,

                max: 100

            }

        }

    }

});


/* ===============================
   ADD HISTORY
================================ */

function addHistory(level1, level2) {

    const time =
    new Date().toLocaleTimeString();


    waterChart.data.labels.push(time);


    waterChart.data.datasets[0]
    .data.push(level1);


    waterChart.data.datasets[1]
    .data.push(level2);


    /* Keep only last 10 readings */

    if (
        waterChart.data.labels.length > 10
    ) {

        waterChart.data.labels.shift();


        waterChart.data.datasets
        .forEach(dataset => {

            dataset.data.shift();

        });

    }


    waterChart.update();

}


/* ===============================
   PREVIOUS STATUS
================================ */

let previousStatus = [

    "",
    ""

];


/* ===============================
   FIREBASE DATABASE REFERENCE
================================ */

const waterRef =
ref(
    database,
    "/waterLevels"
);


/* ===============================
   READ REAL-TIME FIREBASE DATA
================================ */

onValue(

    waterRef,

    (snapshot) => {

        const data =
        snapshot.val();


        /* No sensor data */

        if (!data) {

            document
            .getElementById("connectionText")
            .innerText =
            "Waiting for sensor";

            return;

        }


        /* ===========================
           READ TWO TANKS
        =========================== */

        const tank1Level =
        Number(data.tank1 || 0);


        const tank2Level =
        Number(data.tank2 || 0);


        /* Firebase Connected */

        document
        .getElementById("connectionDot")
        .style.background =
        "green";


        document
        .getElementById("connectionText")
        .innerText =
        "Firebase Connected";


        /* ===========================
           UPDATE TANK 1
        =========================== */

        const status1 =
        updateTank(

            1,

            tank1Level

        );


        /* ===========================
           UPDATE TANK 2
        =========================== */

        const status2 =
        updateTank(

            2,

            tank2Level

        );


        /* ===========================
           VOICE ALERT - TANK 1
        =========================== */

        if (

            previousStatus[0] !==
            status1.text

        ) {

            if (

                previousStatus[0] !== ""

            ) {

                if (

                    status1.text.includes("LOW")

                ) {

                    speak(

                        "Alert. Tank 1 water level is low. Current level is "
                        +
                        tank1Level.toFixed(1)
                        +
                        " percent."

                    );

                }

            }


            previousStatus[0] =
            status1.text;

        }


        /* ===========================
           VOICE ALERT - TANK 2
        =========================== */

        if (

            previousStatus[1] !==
            status2.text

        ) {

            if (

                previousStatus[1] !== ""

            ) {

                if (

                    status2.text.includes("LOW")

                ) {

                    speak(

                        "Alert. Tank 2 water level is low. Current level is "
                        +
                        tank2Level.toFixed(1)
                        +
                        " percent."

                    );

                }

            }


            previousStatus[1] =
            status2.text;

        }


        /* ===========================
           ALERT BOX
        =========================== */

        const alerts = [];


        if (status1.alert) {

            alerts.push(

                "Tank 1 is critically low at "
                +
                tank1Level.toFixed(1)
                +
                "%"

            );

        }


        if (status2.alert) {

            alerts.push(

                "Tank 2 is critically low at "
                +
                tank2Level.toFixed(1)
                +
                "%"

            );

        }


        if (alerts.length > 0) {

            document
            .getElementById("alertBox")
            .innerHTML =

            "🔔 "
            +
            alerts.join("<br>");

        }

        else {

            document
            .getElementById("alertBox")
            .innerHTML =

            "🟢 Both tanks are operating normally.";

        }


        /* ===========================
           UPDATE HISTORY CHART
        =========================== */

        addHistory(

            tank1Level,

            tank2Level

        );


        /* ===========================
           LAST UPDATED
        =========================== */

        document
        .getElementById("lastUpdated")
        .innerText =

        new Date()
        .toLocaleString();

    },


    /* ===============================
       FIREBASE ERROR
    ================================ */

    (error) => {

        console.error(error);


        document
        .getElementById("connectionText")
        .innerText =
        "Firebase Error";

    }

);
