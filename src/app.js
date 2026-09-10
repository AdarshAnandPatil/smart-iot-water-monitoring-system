
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



/* FIREBASE CONFIGURATION */

const firebaseConfig = {

    apiKey:
    "PASTE_YOUR_API_KEY_HERE",

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
    "PASTE_YOUR_APP_ID_HERE"

};


/* INITIALIZE FIREBASE */

const app =
initializeApp(firebaseConfig);


const database =
getDatabase(app);



/* VOICE CONTROL */

let voiceEnabled = true;


const voiceButton =
document.getElementById(
    "voiceButton"
);


voiceButton.addEventListener(
    "click",

    () => {

        voiceEnabled =
        !voiceEnabled;


        if (voiceEnabled) {

            voiceButton.innerHTML =
            "🔊 Voice ON";

        }

        else {

            voiceButton.innerHTML =
            "🔇 Voice OFF";

        }

    }

);



/* SPEAK FUNCTION */

function speak(message) {

    if (!voiceEnabled)
    return;


    if (
        "speechSynthesis"
        in window
    ) {

        speechSynthesis.cancel();


        const speech =
        new SpeechSynthesisUtterance(
            message
        );


        speech.rate = 0.9;


        speechSynthesis.speak(
            speech
        );

    }

}



/* WATER STATUS */

function getStatus(level) {

    if (level <= 25) {

        return {

            text:
            "🔴 LOW WATER",

            className:
            "danger-status",

            alert:
            true

        };

    }


    if (level <= 60) {

        return {

            text:
            "🟡 WARNING",

            className:
            "warning-status",

            alert:
            false

        };

    }


    return {

        text:
        "🟢 SAFE",

        className:
        "safe-status",

        alert:
        false

    };

}



/* UPDATE TANK */

function updateTank(
    tankNumber,
    level
) {

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


    water.style.height =
    level + "%";


    percent.innerText =
    level + "%";


    const status =
    getStatus(level);


    statusElement.innerText =
    status.text;


    statusElement.className =
    "status " +
    status.className;


    return status;

}



/* CHART */

const chartContext =
document
.getElementById(
    "waterChart"
)
.getContext("2d");


const waterChart =
new Chart(
    chartContext,

    {

        type:
        "line",


        data: {

            labels: [],


            datasets: [

                {

                    label:
                    "Tank 1",

                    data: [],

                    tension:
                    0.4

                },


                {

                    label:
                    "Tank 2",

                    data: [],

                    tension:
                    0.4

                },


                {

                    label:
                    "Tank 3",

                    data: [],

                    tension:
                    0.4

                },


                {

                    label:
                    "Tank 4",

                    data: [],

                    tension:
                    0.4

                }

            ]

        },


        options: {

            responsive:
            true,


            animation:
            true,


            scales: {

                y: {

                    min: 0,

                    max: 100

                }

            }

        }

    }

);



/* ADD HISTORY */

function addHistory(
    levels
) {

    const time =
    new Date()
    .toLocaleTimeString();


    waterChart.data.labels.push(
        time
    );


    waterChart.data.datasets[0]
    .data.push(
        levels[0]
    );


    waterChart.data.datasets[1]
    .data.push(
        levels[1]
    );


    waterChart.data.datasets[2]
    .data.push(
        levels[2]
    );


    waterChart.data.datasets[3]
    .data.push(
        levels[3]
    );


    if (
        waterChart.data.labels.length
        > 10
    ) {

        waterChart.data.labels.shift();


        waterChart.data.datasets
        .forEach(

            dataset =>
            dataset.data.shift()

        );

    }


    waterChart.update();

}



/* PREVIOUS ALERT STATUS */

let previousStatus = [
    "",
    "",
    "",
    ""
];



/* READ FIREBASE DATA */

const waterRef =
ref(
    database,
    "/waterLevels"
);



onValue(

    waterRef,

    (snapshot) => {

        const data =
        snapshot.val();


        if (!data) {

            document
            .getElementById(
                "connectionText"
            )
            .innerText =
            "Waiting for sensor";


            return;

        }


        const levels = [

            Number(
                data.tank1 || 0
            ),

            Number(
                data.tank2 || 0
            ),

            Number(
                data.tank3 || 0
            ),

            Number(
                data.tank4 || 0
            )

        ];


        document
        .getElementById(
            "connectionDot"
        )
        .style.background =
        "green";


        document
        .getElementById(
            "connectionText"
        )
        .innerText =
        "Firebase Connected";


        const alerts = [];


        levels.forEach(

            (level,index) => {


                const tankNumber =
                index + 1;


                const status =
                updateTank(
                    tankNumber,
                    level
                );


                if (
                    previousStatus[index]
                    !==
                    status.text
                ) {


                    if (
                        previousStatus[index]
                        !== ""
                    ) {


                        if (
                            status.text.includes(
                                "LOW"
                            )
                        ) {


                            speak(

                                "Alert. Tank "
                                +
                                tankNumber
                                +
                                " water level is low. Current level is "
                                +
                                level
                                +
                                " percent."

                            );

                        }

                    }


                    previousStatus[index] =
                    status.text;

                }


                if (
                    status.alert
                ) {

                    alerts.push(

                        "Tank "
                        +
                        tankNumber
                        +
                        " is critically low at "
                        +
                        level
                        +
                        " percent."

                    );

                }

            }

        );


        if (
            alerts.length > 0
        ) {

            document
            .getElementById(
                "alertBox"
            )
            .innerHTML =

            "🔔 "
            +
            alerts.join(
                "<br>"
            );

        }


        else {

            document
            .getElementById(
                "alertBox"
            )
            .innerHTML =

            "🟢 All tanks are operating normally.";

        }


        addHistory(
            levels
        );


        document
        .getElementById(
            "lastUpdated"
        )
        .innerText =

        new Date()
        .toLocaleString();

    },

    (error) => {

        console.error(error);


        document
        .getElementById(
            "connectionText"
        )
        .innerText =
        "Firebase Error";

    }

);
