import {

    initializeApp

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

    getDatabase,

    ref,

    onValue,

    set

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";



/* ================================
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



/* ================================
   INITIALIZE FIREBASE
================================ */

const app =
initializeApp(
    firebaseConfig
);


const database =
getDatabase(
    app
);



/* ================================
   VARIABLES
================================ */

let voiceEnabled =
true;


let demoMode =
false;


let levels = [

    75,

    45

];


let previousStatus = [

    "",

    ""

];


let notificationHistory = [];


let waterHistory = [];


let lastSensorUpdate = 0;


let sensorOfflineAlert =
false;


let isAdmin =
false;


let motorState =
"OFF";


let motorMode =
"AUTO";


let settings = {

    low: 25,

    warning: 60,

    motorOff: 90,

    height: 100

};



/* ================================
   LOAD SAVED SETTINGS
================================ */

const savedSettings =
localStorage.getItem(
    "waterSettings"
);


if (savedSettings) {

    settings =
    JSON.parse(
        savedSettings
    );

}


document
.getElementById(
    "lowThreshold"
)
.value =
settings.low;


document
.getElementById(
    "warningThreshold"
)
.value =
settings.warning;


document
.getElementById(
    "motorOffThreshold"
)
.value =
settings.motorOff;


document
.getElementById(
    "tankHeight"
)
.value =
settings.height;



/* ================================
   VOICE ALERT
================================ */

const voiceButton =
document.getElementById(
    "voiceButton"
);


voiceButton.addEventListener(

    "click",

    () => {

        voiceEnabled =
        !voiceEnabled;


        voiceButton.innerText =
        voiceEnabled

        ?

        "🔊 Voice ON"

        :

        "🔇 Voice OFF";

    }

);



function speak(message) {


    if (
        !voiceEnabled
    ) {

        return;

    }


    if (
        "speechSynthesis"
        in window
    ) {


        speechSynthesis.cancel();


        const speech =
        new SpeechSynthesisUtterance(
            message
        );


        speech.rate =
        0.9;


        speechSynthesis.speak(
            speech
        );

    }

}



/* ================================
   MOBILE / BROWSER NOTIFICATION
================================ */

const notificationButton =
document.getElementById(
    "enableNotificationButton"
);


notificationButton.addEventListener(

    "click",

    async () => {


        if (

            !(
                "Notification"
                in window
            )

        ) {


            document
            .getElementById(
                "notificationPermission"
            )
            .innerText =

            "❌ Notifications not supported";


            return;

        }


        const permission =
        await Notification.requestPermission();


        if (

            permission ===
            "granted"

        ) {


            document
            .getElementById(
                "notificationPermission"
            )
            .innerText =

            "🟢 Notifications Enabled";


        }


        else {


            document
            .getElementById(
                "notificationPermission"
            )
            .innerText =

            "🔴 Permission Denied";

        }


    }

);



function sendNotification(

    title,

    message

) {


    if (

        "Notification"
        in window

        &&

        Notification.permission ===
        "granted"

    ) {


        new Notification(

            title,

            {

                body:
                message

            }

        );

    }

}



/* ================================
   LOGIN
================================ */

const loginButton =
document.getElementById(
    "loginButton"
);


loginButton.addEventListener(

    "click",

    () => {


        const username =
        document
        .getElementById(
            "loginUser"
        )
        .value
        .trim();


        const password =
        document
        .getElementById(
            "loginPassword"
        )
        .value;


        if (

            username ===
            "admin"

            &&

            password ===
            "water123"

        ) {


            isAdmin =
            true;


            document
            .getElementById(
                "loginMessage"
            )
            .innerText =

            "🟢 Login Successful";


            document
            .getElementById(
                "loginSection"
            )
            .classList.add(
                "hidden"
            );


            document
            .getElementById(
                "adminBar"
            )
            .classList.remove(
                "hidden"
            );

        }


        else {


            document
            .getElementById(
                "loginMessage"
            )
            .innerText =

            "🔴 Invalid Username or Password";

        }


    }

);



document
.getElementById(
    "logoutButton"
)
.addEventListener(

    "click",

    () => {


        isAdmin =
        false;


        document
        .getElementById(
            "adminBar"
        )
        .classList.add(
            "hidden"
        );


        document
        .getElementById(
            "loginSection"
        )
        .classList.remove(
            "hidden"
        );


        document
        .getElementById(
            "loginPassword"
        )
        .value =
        "";

    }

);



/* ================================
   STATUS FUNCTION
================================ */

function getStatus(
    level
) {


    if (

        level <=
        settings.low

    ) {


        return {

            text:
            "🔴 LOW WATER",

            className:
            "danger-status",

            type:
            "low",

            alert:
            true

        };

    }



    if (

        level <=
        settings.warning

    ) {


        return {

            text:
            "🟡 WARNING",

            className:
            "warning-status",

            type:
            "warning",

            alert:
            false

        };

    }



    if (

        level <
        settings.motorOff

    ) {


        return {

            text:
            "🟢 SAFE",

            className:
            "safe-status",

            type:
            "safe",

            alert:
            false

        };

    }



    return {

        text:
        "🚨 OVERFLOW RISK",

        className:
        "overflow-status",

        type:
        "overflow",

        alert:
        true

    };

}



/* ================================
   UPDATE TANK
================================ */

function updateTank(

    tankNumber,

    level

) {


    const water =
    document.getElementById(

        "water" +
        tankNumber

    );


    const percent =
    document.getElementById(

        "percent" +
        tankNumber

    );


    const statusElement =
    document.getElementById(

        "status" +
        tankNumber

    );


    const info =
    document.getElementById(

        "tankInfo" +
        tankNumber

    );


    water.style.height =
    level + "%";


    percent.innerText =
    level.toFixed(1) +
    "%";


    info.innerText =
    "Current Level: " +
    level.toFixed(1) +
    "%";


    const status =
    getStatus(
        level
    );


    statusElement.innerText =
    status.text;


    statusElement.className =

    "status " +

    status.className;


    return status;

}



/* ================================
   ALERT HISTORY
================================ */

function addNotification(

    message

) {


    const time =
    new Date()
    .toLocaleTimeString();


    const item =

    time +

    " - " +

    message;


    notificationHistory.unshift(
        item
    );


    if (

        notificationHistory.length >
        20

    ) {


        notificationHistory.pop();

    }


    document
    .getElementById(
        "notificationHistory"
    )
    .innerHTML =

    notificationHistory
    .map(

        item =>
        "<div>" +
        item +
        "</div>"

    )
    .join(
        ""
    );

}



/* ================================
   CHART
================================ */

const chartContext =
document
.getElementById(
    "waterChart"
)
.getContext(
    "2d"
);



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

                }

            ]

        },


        options: {

            responsive:
            true,


            maintainAspectRatio:
            false,


            scales: {

                y: {

                    min:
                    0,


                    max:
                    100

                }

            }

        }

    }

);



/* ================================
   ADD WATER HISTORY
================================ */

function addHistory(
    currentLevels
) {


    const time =
    new Date()
    .toLocaleTimeString();


    waterChart
    .data
    .labels
    .push(
        time
    );


    waterChart
    .data
    .datasets[0]
    .data
    .push(
        currentLevels[0]
    );


    waterChart
    .data
    .datasets[1]
    .data
    .push(
        currentLevels[1]
    );


    waterHistory.push({

        time:
        new Date()
        .toLocaleString(),

        tank1:
        currentLevels[0],

        tank2:
        currentLevels[1]

    });



    if (

        waterChart
        .data
        .labels
        .length >
        20

    ) {


        waterChart
        .data
        .labels
        .shift();


        waterChart
        .data
        .datasets
        .forEach(

            dataset =>

            dataset
            .data
            .shift()

        );

    }



    if (

        waterHistory.length >
        50

    ) {


        waterHistory.shift();

    }


    waterChart.update();


    updateAnalytics();

}



/* ================================
   WATER ANALYTICS
================================ */

function updateAnalytics() {


    if (

        waterHistory.length ===
        0

    ) {

        return;

    }


    const allLevels =
    waterHistory.flatMap(

        item => [

            item.tank1,

            item.tank2

        ]

    );


    const total =
    allLevels.reduce(

        (

            a,

            b

        )

        =>

        a + b,

        0

    );


    const average =
    total /
    allLevels.length;


    const highest =
    Math.max(
        ...allLevels
    );


    const lowest =
    Math.min(
        ...allLevels
    );


    const change =

    Math.abs(

        allLevels[
            allLevels.length - 1
        ]

        -

        allLevels[0]

    );


    document
    .getElementById(
        "averageLevel"
    )
    .innerText =

    "📊 Average Level: " +

    average.toFixed(1) +

    "%";


    document
    .getElementById(
        "highestLevel"
    )
    .innerText =

    "⬆️ Highest: " +

    highest.toFixed(1) +

    "%";


    document
    .getElementById(
        "lowestLevel"
    )
    .innerText =

    "⬇️ Lowest: " +

    lowest.toFixed(1) +

    "%";


    document
    .getElementById(
        "usageEstimate"
    )
    .innerText =

    "💧 Estimated Change: " +

    change.toFixed(1) +

    "%";


    updateRecommendation();

}



/* ================================
   SMART RECOMMENDATION
================================ */

function updateRecommendation() {


    if (

        waterHistory.length <
        3

    ) {

        return;

    }


    let overflowCount =
    0;


    let lowCount =
    0;


    waterHistory.forEach(

        item => {


            if (

                item.tank1 >=
                settings.motorOff

                ||

                item.tank2 >=
                settings.motorOff

            ) {


                overflowCount++;

            }


            if (

                item.tank1 <=
                settings.low

                ||

                item.tank2 <=
                settings.low

            ) {


                lowCount++;

            }

        }

    );


    const recommendation =
    document.getElementById(
        "recommendationBox"
    );


    if (

        overflowCount >=
        2

    ) {


        recommendation.innerHTML =

        "⚠️ <b>Overflow pattern detected.</b>" +

        "<br>" +

        "Recommendation: Reduce motor running time " +

        "or check automatic motor control.";

    }


    else if (

        lowCount >=
        2

    ) {


        recommendation.innerHTML =

        "💧 <b>Frequent low-water pattern detected.</b>" +

        "<br>" +

        "Recommendation: Check water supply " +

        "and refill schedule.";

    }


    else {


        recommendation.innerHTML =

        "🟢 <b>Water usage is stable.</b>" +

        "<br>" +

        "No repeated low-water or overflow " +

        "pattern detected.";

    }

}



/* ================================
   MOTOR UI
================================ */

function updateMotorUI() {


    const motorStatus =
    document.getElementById(
        "motorStatus"
    );


    if (

        motorState ===
        "ON"

    ) {


        motorStatus.innerText =
        "🟢 MOTOR ON";

    }


    else {


        motorStatus.innerText =
        "🔴 MOTOR OFF";

    }


    document
    .getElementById(
        "motorDescription"
    )
    .innerText =

    motorMode ===
    "AUTO"

    ?

    "Automatic mode: Motor turns ON at low water and OFF at configured motor level."

    :

    "Manual mode: Command selected from dashboard.";

}



/* ================================
   SAVE MOTOR TO FIREBASE
================================ */

function saveMotorState() {


    if (

        demoMode

    ) {

        return;

    }


    set(

        ref(

            database,

            "/control"

        ),

        {

            motorState:
            motorState,


            motorMode:
            motorMode,


            updatedAt:
            Date.now()

        }

    );

}



/* ================================
   AUTOMATIC MOTOR
================================ */

function automaticMotorControl() {


    if (

        motorMode !==
        "AUTO"

    ) {

        return;

    }


    const minimumLevel =
    Math.min(
        ...levels
    );


    const maximumLevel =
    Math.max(
        ...levels
    );


    if (

        minimumLevel <=
        settings.low

    ) {


        if (

            motorState !==
            "ON"

        ) {


            motorState =
            "ON";


            addNotification(

                "🚰 Automatic Motor ON - Low water detected"

            );


            updateMotorUI();


            saveMotorState();

        }

    }


    if (

        maximumLevel >=
        settings.motorOff

    ) {


        if (

            motorState !==
            "OFF"

        ) {


            motorState =
            "OFF";


            addNotification(

                "🚰 Automatic Motor OFF - Tank level reached limit"

            );


            updateMotorUI();


            saveMotorState();

        }

    }

}



/* ================================
   MOTOR BUTTONS
================================ */

document
.getElementById(
    "motorAutoButton"
)
.addEventListener(

    "click",

    () => {


        if (

            !isAdmin

        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }


        motorMode =
        "AUTO";


        automaticMotorControl();


        updateMotorUI();


        saveMotorState();

    }

);



document
.getElementById(
    "motorOnButton"
)
.addEventListener(

    "click",

    () => {


        if (

            !isAdmin

        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }


        motorMode =
        "MANUAL";


        motorState =
        "ON";


        updateMotorUI();


        saveMotorState();

    }

);



document
.getElementById(
    "motorOffButton"
)
.addEventListener(

    "click",

    () => {


        if (

            !isAdmin

        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }


        motorMode =
        "MANUAL";


        motorState =
        "OFF";


        updateMotorUI();


        saveMotorState();

    }

);



/* ================================
   SAVE SETTINGS
================================ */

document
.getElementById(
    "saveSettingsButton"
)
.addEventListener(

    "click",

    () => {


        if (

            !isAdmin

        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }


        const low =
        Number(

            document
            .getElementById(
                "lowThreshold"
            )
            .value

        );


        const warning =
        Number(

            document
            .getElementById(
                "warningThreshold"
            )
            .value

        );


        const motorOff =
        Number(

            document
            .getElementById(
                "motorOffThreshold"
            )
            .value

        );


        const height =
        Number(

            document
            .getElementById(
                "tankHeight"
            )
            .value

        );


        if (

            !(

                low >= 0

                &&

                low < warning

                &&

                warning < motorOff

                &&

                motorOff <= 100

                &&

                height > 0

            )

        ) {


            document
            .getElementById(
                "settingsMessage"
            )
            .innerText =

            "❌ Low < Warning < Motor OFF ≤ 100";


            return;

        }


        settings = {

            low:
            low,


            warning:
            warning,


            motorOff:
            motorOff,


            height:
            height

        };


        localStorage.setItem(

            "waterSettings",

            JSON.stringify(
                settings
            )

        );


        document
        .getElementById(
            "settingsMessage"
        )
        .innerText =

        "🟢 Settings Saved Successfully";


        previousStatus = [

            "",

            ""

        ];

    }

);



/* ================================
   PROCESS WATER LEVELS
================================ */

function processLevels(
    newLevels
) {


    levels =
    newLevels;


    const statuses = [

        updateTank(

            1,

            levels[0]

        ),


        updateTank(

            2,

            levels[1]

        )

    ];


    const alerts = [];


    statuses.forEach(

        (

            status,

            index

        ) => {


            const tank =
            index + 1;


            const level =
            levels[index];


            if (

                previousStatus[index]
                !==
                status.text

            ) {


                if (

                    previousStatus[index]
                    !==
                    ""

                ) {


                    if (

                        status.type ===
                        "low"

                    ) {


                        const message =

                        "Tank " +

                        tank +

                        " water level is low (" +

                        level.toFixed(1) +

                        "%)";


                        addNotification(

                            "🔴 " +

                            message

                        );


                        speak(

                            "Alert. Tank " +

                            tank +

                            " water level is low. Current level is " +

                            level.toFixed(1) +

                            " percent."

                        );


                        sendNotification(

                            "Low Water Alert",

                            message

                        );

                    }



                    if (

                        status.type ===
                        "warning"

                    ) {


                        addNotification(

                            "🟡 Tank " +

                            tank +

                            " warning level (" +

                            level.toFixed(1) +

                            "%)"

                        );

                    }



                    if (

                        status.type ===
                        "overflow"

                    ) {


                        const message =

                        "Tank " +

                        tank +

                        " overflow risk (" +

                        level.toFixed(1) +

                        "%)";


                        addNotification(

                            "🚨 " +

                            message

                        );


                        speak(

                            "Warning. Tank " +

                            tank +

                            " water level is critically high. Overflow risk detected."

                        );


                        sendNotification(

                            "Overflow Risk",

                            message

                        );

                    }



                    if (

                        status.type ===
                        "safe"

                    ) {


                        addNotification(

                            "🟢 Tank " +

                            tank +

                            " returned to safe level"

                        );

                    }

                }


                previousStatus[index] =
                status.text;

            }


            if (

                status.type ===
                "low"

            ) {


                alerts.push(

                    "🔴 Tank " +

                    tank +

                    " is critically low at " +

                    level.toFixed(1) +

                    "%"

                );

            }


            if (

                status.type ===
                "overflow"

            ) {


                alerts.push(

                    "🚨 Tank " +

                    tank +

                    " overflow risk at " +

                    level.toFixed(1) +

                    "%"

                );

            }

        }

    );


    if (

        alerts.length >
        0

    ) {


        document
        .getElementById(
            "alertBox"
        )
        .innerHTML =

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


    automaticMotorControl();


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

}



/* ================================
   DEMO MODE
================================ */

document
.getElementById(
    "modeButton"
)
.addEventListener(

    "click",

    () => {


        demoMode =
        !demoMode;


        if (

            demoMode

        ) {


            document
            .getElementById(
                "modeTitle"
            )
            .innerText =

            "🎮 DEMO MODE";


            document
            .getElementById(
                "modeDescription"
            )
            .innerText =

            "Use + and − buttons to demonstrate water levels.";


            document
            .getElementById(
                "modeButton"
            )
            .innerText =

            "📡 Switch to Live Mode";


            document
            .getElementById(
                "connectionText"
            )
            .innerText =

            "Demo Mode Active";


            processLevels(
                levels
            );

        }


        else {


            document
            .getElementById(
                "modeTitle"
            )
            .innerText =

            "📡 LIVE MODE";


            document
            .getElementById(
                "modeDescription"
            )
            .innerText =

            "Reading real sensor data from Firebase.";


            document
            .getElementById(
                "modeButton"
            )
            .innerText =

            "🎮 Switch to Demo Mode";

        }

    }

);



/* ================================
   DEMO BUTTONS
================================ */

document
.querySelectorAll(
    ".plus"
)
.forEach(

    button => {


        button.addEventListener(

            "click",

            () => {


                if (

                    !demoMode

                ) {

                    return;

                }


                const index =

                Number(
                    button.dataset.tank
                )

                -

                1;


                levels[index] =
                Math.min(

                    100,

                    levels[index] + 5

                );


                processLevels(
                    levels
                );

            }

        );

    }

);



document
.querySelectorAll(
    ".minus"
)
.forEach(

    button => {


        button.addEventListener(

            "click",

            () => {


                if (

                    !demoMode

                ) {

                    return;

                }


                const index =

                Number(
                    button.dataset.tank
                )

                -

                1;


                levels[index] =
                Math.max(

                    0,

                    levels[index] - 5

                );


                processLevels(
                    levels
                );

            }

        );

    }

);



/* ================================
   SENSOR ONLINE / OFFLINE
================================ */

function updateSensorStatus() {


    if (

        !lastSensorUpdate

    ) {

        return;

    }


    const seconds =

    Math.floor(

        (

            Date.now()

            -

            lastSensorUpdate

        )

        /

        1000

    );


    if (

        seconds <=
        30

    ) {


        document
        .getElementById(
            "sensorStatus"
        )
        .innerText =

        "🟢 Sensor Online • Live Data";


        document
        .getElementById(
            "sensorTime"
        )
        .innerText =

        "Last update: " +

        seconds +

        " seconds ago";


        sensorOfflineAlert =
        false;

    }


    else {


        document
        .getElementById(
            "sensorStatus"
        )
        .innerText =

        "🔴 Sensor Offline";


        document
        .getElementById(
            "sensorTime"
        )
        .innerText =

        "Last update: " +

        seconds +

        " seconds ago";


        if (

            !sensorOfflineAlert

        ) {


            sensorOfflineAlert =
            true;


            addNotification(

                "📡 Sensor Offline"

            );


            sendNotification(

                "Sensor Offline",

                "No sensor data received recently."

            );

        }

    }

}


setInterval(

    () => {


        if (

            !demoMode

        ) {


            updateSensorStatus();

        }

    },

    1000

);



/* ================================
   FIREBASE WATER DATA
================================ */

const waterRef =

ref(

    database,

    "/waterLevels"

);


onValue(

    waterRef,

    snapshot => {


        if (

            demoMode

        ) {

            return;

        }


        const data =
        snapshot.val();


        if (

            !data

        ) {


            document
            .getElementById(
                "connectionText"
            )
            .innerText =

            "Waiting for Sensor";


            return;

        }


        const tank1 =

        Number(
            data.tank1 || 0
        );


        const tank2 =

        Number(
            data.tank2 || 0
        );


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


        document
        .getElementById(
            "firebaseStatus"
        )
        .innerText =

        "🟢 Connected";


        document
        .getElementById(
            "arduinoStatus"
        )
        .innerText =

        "🟢 Connected";


        document
        .getElementById(
            "espStatus"
        )
        .innerText =

        "🟢 Wi-Fi Connected";


        document
        .getElementById(
            "sensor1Status"
        )
        .innerText =

        "🟢 Active";


        document
        .getElementById(
            "sensor2Status"
        )
        .innerText =

        "🟢 Active";


        lastSensorUpdate =
        Date.now();


        processLevels(

            [

                tank1,

                tank2

            ]

        );

    },


    error => {


        console.error(
            error
        );


        document
        .getElementById(
            "connectionText"
        )
        .innerText =

        "Firebase Error";


        document
        .getElementById(
            "firebaseStatus"
        )
        .innerText =

        "🔴 Error";

    }

);



/* ================================
   POWER STATUS FROM FIREBASE
================================ */

onValue(

    ref(

        database,

        "/powerStatus"

    ),

    snapshot => {


        const data =
        snapshot.val();


        if (

            !data

        ) {

            return;

        }


        if (

            data.main !==
            undefined

        ) {


            document
            .getElementById(
                "mainPower"
            )
            .innerText =

            data.main

            ?

            "🔌 Main Power: 🟢 ON"

            :

            "🔌 Main Power: 🔴 OFF";

        }


        if (

            data.backup !==
            undefined

        ) {


            document
            .getElementById(
                "backupPower"
            )
            .innerText =

            data.backup

            ?

            "🔋 Backup Power: 🟢 Available"

            :

            "🔋 Backup Power: 🔴 Not Available";

        }

    }

);



/* ================================
   DOWNLOAD REPORT
================================ */

document
.getElementById(
    "downloadReportButton"
)
.addEventListener(

    "click",

    () => {


        let report =

`SMART WATER MONITORING SYSTEM REPORT

Generated:
${new Date().toLocaleString()}


CURRENT WATER LEVELS

Tank 1:
${levels[0].toFixed(1)}%

Tank 2:
${levels[1].toFixed(1)}%


MOTOR STATUS

State:
${motorState}

Mode:
${motorMode}


TANK SETTINGS

Low Alert:
${settings.low}%

Warning:
${settings.warning}%

Motor OFF:
${settings.motorOff}%

Tank Height:
${settings.height} cm


ANALYTICS

${document.getElementById("averageLevel").innerText}

${document.getElementById("highestLevel").innerText}

${document.getElementById("lowestLevel").innerText}

${document.getElementById("usageEstimate").innerText}


SMART RECOMMENDATION

${document.getElementById("recommendationBox").innerText}


ALERT HISTORY

${notificationHistory.join("\n")}


WATER LEVEL HISTORY

${waterHistory.map(

item =>

item.time +

" | Tank 1: " +

item.tank1 +

"% | Tank 2: " +

item.tank2 +

"%"

).join("\n")}

`;


        const blob =

        new Blob(

            [

                report

            ],

            {

                type:
                "text/plain"

            }

        );


        const link =
        document.createElement(
            "a"
        );


        link.href =

        URL.createObjectURL(
            blob
        );


        link.download =

        "water-monitoring-report.txt";


        link.click();


        URL.revokeObjectURL(
            link.href
        );

    }

);



/* ================================
   INITIAL STATUS
================================ */

updateMotorUI();
