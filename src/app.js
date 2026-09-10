/* ===============================
   FIREBASE IMPORTS
================================ */

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

const app =
initializeApp(firebaseConfig);


const database =
getDatabase(app);



/* ===============================
   VARIABLES
================================ */

let voiceEnabled =
true;


let demoMode =
false;


let loggedIn =
false;


let motorMode =
"AUTO";


let motorState =
false;


let demoLevels =
[50, 50];


let currentLevels =
[0, 0];


let previousStatus =
["", ""];


let alertHistory =
JSON.parse(
    localStorage.getItem(
        "waterAlertHistory"
    )
) || [];


let settings =
JSON.parse(
    localStorage.getItem(
        "waterSettings"
    )
)
||
{

    lowLevel: 25,

    warningLevel: 60,

    motorOffLevel: 90,

    tankHeight: 100

};



/* ===============================
   DOM ELEMENTS
================================ */

const loginButton =
document.getElementById(
    "loginButton"
);


const logoutButton =
document.getElementById(
    "logoutButton"
);


const usernameInput =
document.getElementById(
    "username"
);


const passwordInput =
document.getElementById(
    "password"
);


const loginMessage =
document.getElementById(
    "loginMessage"
);


const loginSection =
document.getElementById(
    "loginSection"
);


const userPanel =
document.getElementById(
    "userPanel"
);


const voiceButton =
document.getElementById(
    "voiceButton"
);


const modeButton =
document.getElementById(
    "modeButton"
);



/* ===============================
   LOAD SETTINGS
================================ */

document.getElementById(
    "lowLevelInput"
).value =
settings.lowLevel;


document.getElementById(
    "warningLevelInput"
).value =
settings.warningLevel;


document.getElementById(
    "motorOffLevelInput"
).value =
settings.motorOffLevel;


document.getElementById(
    "tankHeightInput"
).value =
settings.tankHeight;



/* ===============================
   LOGIN
================================ */

loginButton.addEventListener(

    "click",

    function () {


        const username =
        usernameInput.value.trim();


        const password =
        passwordInput.value.trim();



        if (

            username === "admin"

            &&

            password === "water123"

        ) {


            loggedIn =
            true;


            loginMessage.innerText =
            "🟢 Login Successful!";


            loginMessage.style.color =
            "green";



            setTimeout(

                function () {


                    loginSection.style.display =
                    "none";


                    userPanel.style.display =
                    "flex";


                    alert(
                        "Welcome Admin!"
                    );


                },

                500

            );


        }


        else {


            loginMessage.innerText =
            "🔴 Invalid Username or Password";


            loginMessage.style.color =
            "red";


        }


    }

);



/* ===============================
   LOGIN USING ENTER KEY
================================ */

passwordInput.addEventListener(

    "keypress",

    function (event) {


        if (
            event.key === "Enter"
        ) {


            loginButton.click();


        }


    }

);



/* ===============================
   LOGOUT
================================ */

logoutButton.addEventListener(

    "click",

    function () {


        loggedIn =
        false;


        loginSection.style.display =
        "block";


        userPanel.style.display =
        "none";


        usernameInput.value =
        "";


        passwordInput.value =
        "";


        loginMessage.innerText =
        "";


    }

);



/* ===============================
   VOICE ALERT
================================ */

voiceButton.addEventListener(

    "click",

    function () {


        voiceEnabled =
        !voiceEnabled;


        if (
            voiceEnabled
        ) {


            voiceButton.innerHTML =
            "🔊 Voice ON";


        }


        else {


            voiceButton.innerHTML =
            "🔇 Voice OFF";


            speechSynthesis.cancel();


        }


    }

);



/* ===============================
   SPEAK FUNCTION
================================ */

function speak(
    message
) {


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


        speech.pitch =
        1;


        speechSynthesis.speak(
            speech
        );


    }


}



/* ===============================
   NOTIFICATION
================================ */

const notificationButton =
document.getElementById(
    "notificationButton"
);


notificationButton.addEventListener(

    "click",

    async function () {


        if (
            !(
                "Notification"
                in window
            )
        ) {


            alert(
                "Notifications are not supported by this browser."
            );


            return;

        }


        const permission =
        await Notification.requestPermission();



        if (
            permission === "granted"
        ) {


            notificationButton.innerHTML =
            "🟢 Notifications Enabled";


        }


        else {


            notificationButton.innerHTML =
            "🔴 Notifications Blocked";


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

        Notification.permission
        === "granted"

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



/* ===============================
   STATUS FUNCTION
================================ */

function getStatus(
    level
) {


    if (

        level >=
        settings.motorOffLevel

    ) {


        return {

            text:
            "🚨 OVERFLOW RISK",


            className:
            "overflow-status",


            type:
            "OVERFLOW",


            alert:
            true

        };


    }



    if (

        level <=
        settings.lowLevel

    ) {


        return {

            text:
            "🔴 LOW WATER",


            className:
            "danger-status",


            type:
            "LOW",


            alert:
            true

        };


    }



    if (

        level <=
        settings.warningLevel

    ) {


        return {

            text:
            "🟡 WARNING",


            className:
            "warning-status",


            type:
            "WARNING",


            alert:
            true

        };


    }



    return {


        text:
        "🟢 SAFE",


        className:
        "safe-status",


        type:
        "SAFE",


        alert:
        false

    };


}



/* ===============================
   UPDATE TANK
================================ */

function updateTank(
    tankNumber,
    level
) {


    level =
    Math.max(

        0,

        Math.min(
            100,
            Number(level)
        )

    );



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



/* ===============================
   ALERT HISTORY
================================ */

function addAlertHistory(
    message,
    type
) {


    const time =
    new Date()
    .toLocaleTimeString();


    const item =
    {

        time:
        time,


        message:
        message,


        type:
        type

    };



    alertHistory.unshift(
        item
    );



    if (
        alertHistory.length > 30
    ) {


        alertHistory.pop();


    }



    localStorage.setItem(

        "waterAlertHistory",

        JSON.stringify(
            alertHistory
        )

    );



    renderAlertHistory();


}



/* ===============================
   RENDER ALERT HISTORY
================================ */

function renderAlertHistory() {


    const historyContainer =
    document.getElementById(
        "alertHistory"
    );


    historyContainer.innerHTML =
    "";



    if (
        alertHistory.length === 0
    ) {


        historyContainer.innerHTML =

        `
        <p class="empty-history">
            No alerts yet.
        </p>
        `;


        return;

    }



    alertHistory.forEach(

        function (
            alert
        ) {


            const div =
            document.createElement(
                "div"
            );


            div.className =
            "alert-item";


            div.innerHTML =

            `
            <b>
                ${alert.message}
            </b>

            <br>

            <span class="alert-time">

                🕒 ${alert.time}

            </span>
            `;


            historyContainer.appendChild(
                div
            );


        }

    );


}



/* ===============================
   CLEAR HISTORY
================================ */

document
.getElementById(
    "clearHistoryButton"
)
.addEventListener(

    "click",

    function () {


        alertHistory =
        [];


        localStorage.removeItem(
            "waterAlertHistory"
        );


        renderAlertHistory();


    }

);



renderAlertHistory();



/* ===============================
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


        data:
        {


            labels:
            [],


            datasets:
            [

                {

                    label:
                    "Tank 1 (%)",


                    data:
                    [],


                    tension:
                    0.4,


                    borderWidth:
                    3

                },


                {

                    label:
                    "Tank 2 (%)",


                    data:
                    [],


                    tension:
                    0.4,


                    borderWidth:
                    3

                }

            ]

        },


        options:
        {


            responsive:
            true,


            maintainAspectRatio:
            false,


            animation:
            true,


            scales:
            {


                y:
                {


                    min:
                    0,


                    max:
                    100

                }

            }


        }


    }

);



/* ===============================
   ADD HISTORY
================================ */

function addHistory(
    levels
) {


    const time =
    new Date()
    .toLocaleTimeString();



    waterChart.data.labels.push(
        time
    );


    waterChart
    .data
    .datasets[0]
    .data
    .push(
        levels[0]
    );


    waterChart
    .data
    .datasets[1]
    .data
    .push(
        levels[1]
    );



    if (

        waterChart
        .data
        .labels
        .length

        >

        15

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
            {


                dataset.data.shift();


            }

        );


    }



    waterChart.update();


}



/* ===============================
   UPDATE ALL SYSTEM
================================ */

function updateSystem(
    levels,
    source
) {


    currentLevels =
    levels;



    const alerts =
    [];



    levels.forEach(

        function (
            level,
            index
        ) {


            const tankNumber =
            index + 1;


            const status =
            updateTank(

                tankNumber,

                level

            );



            /* STATUS CHANGED */

            if (

                previousStatus[index]
                !==
                status.type

            ) {


                if (

                    previousStatus[index]
                    !== ""

                ) {


                    let message =
                    "";



                    if (

                        status.type
                        ===
                        "LOW"

                    ) {


                        message =

                        "🔴 Tank "
                        +
                        tankNumber
                        +
                        " water level is low ("
                        +
                        level
                        +
                        "%)";


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



                    if (

                        status.type
                        ===
                        "WARNING"

                    ) {


                        message =

                        "🟡 Tank "
                        +
                        tankNumber
                        +
                        " is in warning level ("
                        +
                        level
                        +
                        "%)";


                    }



                    if (

                        status.type
                        ===
                        "OVERFLOW"

                    ) {


                        message =

                        "🚨 Tank "
                        +
                        tankNumber
                        +
                        " overflow risk detected ("
                        +
                        level
                        +
                        "%)";


                        speak(

                            "Warning. Tank "
                            +
                            tankNumber
                            +
                            " water level is critically high. Overflow risk detected."

                        );


                    }



                    if (

                        message !== ""

                    ) {


                        addAlertHistory(

                            message,

                            status.type

                        );


                        sendNotification(

                            "Smart Water Monitoring",

                            message

                        );


                    }


                }



                previousStatus[index] =
                status.type;


            }



            if (

                status.type
                ===
                "LOW"

            ) {


                alerts.push(

                    "🔴 Tank "
                    +
                    tankNumber
                    +
                    " is LOW at "
                    +
                    level
                    +
                    "%"

                );


            }



            if (

                status.type
                ===
                "WARNING"

            ) {


                alerts.push(

                    "🟡 Tank "
                    +
                    tankNumber
                    +
                    " is at WARNING level "
                    +
                    level
                    +
                    "%"

                );


            }



            if (

                status.type
                ===
                "OVERFLOW"

            ) {


                alerts.push(

                    "🚨 Tank "
                    +
                    tankNumber
                    +
                    " has OVERFLOW RISK at "
                    +
                    level
                    +
                    "%"

                );


            }


        }

    );



    /* ALERT BOX */

    const alertBox =
    document.getElementById(
        "alertBox"
    );



    if (
        alerts.length > 0
    ) {


        alertBox.innerHTML =
        alerts.join(
            "<br>"
        );


    }


    else {


        alertBox.innerHTML =
        "🟢 All tanks are operating normally.";


    }



    /* HISTORY */

    addHistory(
        levels
    );



    /* MOTOR AUTO CONTROL */

    if (

        motorMode ===
        "AUTO"

    ) {


        automaticMotorControl(
            levels
        );


    }



    /* SMART RECOMMENDATION */

    updateRecommendation(
        levels
    );


}



/* ===============================
   AUTOMATIC MOTOR
================================ */

function automaticMotorControl(
    levels
) {


    const lowTankExists =
    levels.some(

        level =>

        level <=
        settings.lowLevel

    );



    const highTankExists =
    levels.every(

        level =>

        level >=
        settings.motorOffLevel

    );



    if (
        lowTankExists
    ) {


        motorState =
        true;


    }



    if (
        highTankExists
    ) {


        motorState =
        false;


    }



    updateMotorUI();


}



/* ===============================
   MOTOR UI
================================ */

function updateMotorUI() {


    const motorStatus =
    document.getElementById(
        "motorStatus"
    );


    if (
        motorState
    ) {


        motorStatus.innerHTML =
        "🟢 MOTOR ON";


        motorStatus.className =
        "motor-status motor-on";


    }


    else {


        motorStatus.innerHTML =
        "🔴 MOTOR OFF";


        motorStatus.className =
        "motor-status motor-off";


    }



    document
    .getElementById(
        "motorModeText"
    )
    .innerText =

    "Current Mode: "
    +
    motorMode;


}



/* ===============================
   MOTOR FIREBASE COMMAND
================================ */

function sendMotorCommand() {


    set(

        ref(
            database,
            "/motorControl"
        ),

        {

            mode:
            motorMode,


            state:
            motorState
            ?
            "ON"
            :
            "OFF",


            timestamp:
            Date.now()

        }

    )
    .catch(

        error => {

            console.log(
                error
            );

        }

    );


}



/* ===============================
   AUTO BUTTON
================================ */

document
.getElementById(
    "autoButton"
)
.addEventListener(

    "click",

    function () {


        if (
            !loggedIn
        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }



        motorMode =
        "AUTO";


        automaticMotorControl(
            currentLevels
        );


        updateMotorUI();


        sendMotorCommand();


    }

);



/* ===============================
   MOTOR ON
================================ */

document
.getElementById(
    "motorOnButton"
)
.addEventListener(

    "click",

    function () {


        if (
            !loggedIn
        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }


        motorMode =
        "MANUAL";


        motorState =
        true;


        updateMotorUI();


        sendMotorCommand();


    }

);



/* ===============================
   MOTOR OFF
================================ */

document
.getElementById(
    "motorOffButton"
)
.addEventListener(

    "click",

    function () {


        if (
            !loggedIn
        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }


        motorMode =
        "MANUAL";


        motorState =
        false;


        updateMotorUI();


        sendMotorCommand();


    }

);



updateMotorUI();



/* ===============================
   SETTINGS
================================ */

document
.getElementById(
    "saveSettingsButton"
)
.addEventListener(

    "click",

    function () {


        if (
            !loggedIn
        ) {


            alert(
                "Please login as Admin first."
            );


            return;

        }



        settings.lowLevel =
        Number(

            document
            .getElementById(
                "lowLevelInput"
            )
            .value

        );


        settings.warningLevel =
        Number(

            document
            .getElementById(
                "warningLevelInput"
            )
            .value

        );


        settings.motorOffLevel =
        Number(

            document
            .getElementById(
                "motorOffLevelInput"
            )
            .value

        );


        settings.tankHeight =
        Number(

            document
            .getElementById(
                "tankHeightInput"
            )
            .value

        );



        if (

            settings.lowLevel
            >=
            settings.warningLevel

            ||

            settings.warningLevel
            >=
            settings.motorOffLevel

        ) {


            alert(

                "Please use correct values:\n\n"
                +
                "Low < Warning < Motor OFF"

            );


            return;

        }



        localStorage.setItem(

            "waterSettings",

            JSON.stringify(
                settings
            )

        );


        alert(
            "Settings Saved Successfully!"
        );


        updateSystem(
            currentLevels,
            "settings"
        );


    }

);



/* ===============================
   RECOMMENDATION
================================ */

function updateRecommendation(
    levels
) {


    const box =
    document.getElementById(
        "recommendationBox"
    );


    const overflowTank =
    levels.findIndex(

        level =>

        level >=
        settings.motorOffLevel

    );



    const lowTank =
    levels.findIndex(

        level =>

        level <=
        settings.lowLevel

    );



    if (

        overflowTank !==
        -1

    ) {


        box.innerHTML =

        `
        💡 <b>Recommendation</b>

        <br><br>

        Tank ${overflowTank + 1}
        is frequently reaching a high water level.

        <br><br>

        ✅ Consider reducing
        motor running time.

        <br>

        ✅ Check the automatic
        motor OFF threshold.

        `;


        return;

    }



    if (

        lowTank !==
        -1

    ) {


        box.innerHTML =

        `
        💡 <b>Recommendation</b>

        <br><br>

        Tank ${lowTank + 1}
        has a low water level.

        <br><br>

        ✅ Check the water supply.

        <br>

        ✅ Enable automatic
        pump control.

        `;


        return;

    }



    box.innerHTML =

    `
    💡 <b>Smart Recommendation</b>

    <br><br>

    🟢 Water levels are normal.

    <br>

    Continue monitoring
    water consumption
    to avoid unnecessary
    water wastage.
    `;


}



/* ===============================
   LIVE / DEMO MODE
================================ */

modeButton.addEventListener(

    "click",

    function () {


        demoMode =
        !demoMode;



        const demoSection =
        document.getElementById(
            "demoSection"
        );



        const modeText =
        document.getElementById(
            "modeText"
        );


        const modeDescription =
        document.getElementById(
            "modeDescription"
        );



        if (
            demoMode
        ) {


            demoSection.classList.remove(
                "hidden"
            );


            modeText.innerText =
            "🎮 DEMO MODE";


            modeDescription.innerText =
            "Manually controlling water levels for demonstration.";


            modeButton.innerText =
            "📡 Switch to Live Mode";


            updateSystem(
                demoLevels,
                "demo"
            );


        }


        else {


            demoSection.classList.add(
                "hidden"
            );


            modeText.innerText =
            "📡 LIVE MODE";


            modeDescription.innerText =
            "Reading real sensor data from Firebase.";


            modeButton.innerText =
            "🎮 Switch to Demo Mode";


        }


    }

);



/* ===============================
   DEMO CONTROLS
================================ */

function updateDemo() {


    document
    .getElementById(
        "demoTank1Value"
    )
    .innerText =
    demoLevels[0] + "%";


    document
    .getElementById(
        "demoTank2Value"
    )
    .innerText =
    demoLevels[1] + "%";


    if (
        demoMode
    ) {


        updateSystem(
            demoLevels,
            "demo"
        );


    }


}



/* TANK 1 MINUS */

document
.getElementById(
    "tank1Minus"
)
.addEventListener(

    "click",

    function () {


        demoLevels[0] =
        Math.max(

            0,

            demoLevels[0] - 5

        );


        updateDemo();


    }

);



/* TANK 1 PLUS */

document
.getElementById(
    "tank1Plus"
)
.addEventListener(

    "click",

    function () {


        demoLevels[0] =
        Math.min(

            100,

            demoLevels[0] + 5

        );


        updateDemo();


    }

);



/* TANK 2 MINUS */

document
.getElementById(
    "tank2Minus"
)
.addEventListener(

    "click",

    function () {


        demoLevels[1] =
        Math.max(

            0,

            demoLevels[1] - 5

        );


        updateDemo();


    }

);



/* TANK 2 PLUS */

document
.getElementById(
    "tank2Plus"
)
.addEventListener(

    "click",

    function () {


        demoLevels[1] =
        Math.min(

            100,

            demoLevels[1] + 5

        );


        updateDemo();


    }

);



/* ===============================
   SENSOR STATUS
================================ */

let lastFirebaseDataTime =
0;



function updateSensorStatus(
    online
) {


    const sensorStatus =
    document.getElementById(
        "sensorStatus"
    );


    if (
        online
    ) {


        sensorStatus.innerText =
        "🟢 Sensor Online";


        sensorStatus.className =
        "online-text";


    }


    else {


        sensorStatus.innerText =
        "🔴 Sensor Offline";


        sensorStatus.className =
        "offline-text";


    }


}



/* ===============================
   EQUIPMENT STATUS
================================ */

function setEquipmentOnline() {


    document
    .getElementById(
        "arduinoStatus"
    )
    .innerText =
    "🟢 Connected";


    document
    .getElementById(
        "arduinoStatus"
    )
    .className =
    "equipment-online";



    document
    .getElementById(
        "espStatus"
    )
    .innerText =
    "🟢 Wi-Fi Connected";


    document
    .getElementById(
        "espStatus"
    )
    .className =
    "equipment-online";



    document
    .getElementById(
        "firebaseStatus"
    )
    .innerText =
    "🟢 Connected";


    document
    .getElementById(
        "firebaseStatus"
    )
    .className =
    "equipment-online";



    document
    .getElementById(
        "tank1SensorStatus"
    )
    .innerText =
    "🟢 Active";


    document
    .getElementById(
        "tank1SensorStatus"
    )
    .className =
    "equipment-online";



    document
    .getElementById(
        "tank2SensorStatus"
    )
    .innerText =
    "🟢 Active";


    document
    .getElementById(
        "tank2SensorStatus"
    )
    .className =
    "equipment-online";


}



/* ===============================
   EQUIPMENT OFFLINE
================================ */

function setEquipmentOffline() {


    document
    .getElementById(
        "arduinoStatus"
    )
    .innerText =
    "🔴 Offline";


    document
    .getElementById(
        "espStatus"
    )
    .innerText =
    "🔴 Offline";


    document
    .getElementById(
        "tank1SensorStatus"
    )
    .innerText =
    "🔴 Offline";


    document
    .getElementById(
        "tank2SensorStatus"
    )
    .innerText =
    "🔴 Offline";


}



/* ===============================
   FIREBASE WATER LEVELS
================================ */

const waterRef =
ref(

    database,

    "/waterLevels"

);



onValue(

    waterRef,


    function (
        snapshot
    ) {


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
            "Waiting for sensor...";


            document
            .getElementById(
                "firebaseStatus"
            )
            .innerText =
            "🟢 Connected";


            updateSensorStatus(
                false
            );


            return;

        }



        const levels =
        [


            Number(
                data.tank1 || 0
            ),


            Number(
                data.tank2 || 0
            )


        ];



        /* FIREBASE CONNECTED */

        document
        .getElementById(
            "connectionDot"
        )
        .className =
        "online-dot";


        document
        .getElementById(
            "connectionText"
        )
        .innerText =
        "🟢 Firebase Connected";



        lastFirebaseDataTime =
        Date.now();



        if (
            !demoMode
        ) {


            updateSystem(
                levels,
                "firebase"
            );


        }



        currentLevels =
        levels;



        /* LAST UPDATED */

        document
        .getElementById(
            "lastUpdated"
        )
        .innerText =

        new Date()
        .toLocaleString();



        updateSensorStatus(
            true
        );


        setEquipmentOnline();


    },


    function (
        error
    ) {


        console.error(
            error
        );


        document
        .getElementById(
            "connectionText"
        )
        .innerText =
        "🔴 Firebase Error";


        document
        .getElementById(
            "connectionDot"
        )
        .className =
        "offline-dot";


        document
        .getElementById(
            "firebaseStatus"
        )
        .innerText =
        "🔴 Firebase Error";


        updateSensorStatus(
            false
        );


        setEquipmentOffline();


    }

);



/* ===============================
   CHECK SENSOR OFFLINE
================================ */

setInterval(

    function () {


        if (

            lastFirebaseDataTime === 0

        ) {

            return;

        }



        const seconds =
        (

            Date.now()

            -

            lastFirebaseDataTime

        )

        / 1000;



        if (

            seconds > 30

            &&

            !demoMode

        ) {


            updateSensorStatus(
                false
            );


            document
            .getElementById(
                "connectionText"
            )
            .innerText =
            "🔴 Sensor Offline";


            setEquipmentOffline();


        }


        else {


            if (
                !demoMode
            ) {


                updateSensorStatus(
                    true
                );


            }


        }


    },


    5000

);



/* ===============================
   DOWNLOAD REPORT
================================ */

document
.getElementById(
    "downloadReportButton"
)
.addEventListener(

    "click",

    function () {


        let csv =
        "SMART WATER MONITORING REPORT\n\n";


        csv +=
        "Current Tank Levels\n";


        csv +=
        "Tank 1,"
        +
        currentLevels[0]
        +
        "%\n";


        csv +=
        "Tank 2,"
        +
        currentLevels[1]
        +
        "%\n\n";


        csv +=
        "Motor Status,"
        +
        (
            motorState
            ?
            "ON"
            :
            "OFF"
        )
        +
        "\n";


        csv +=
        "Motor Mode,"
        +
        motorMode
        +
        "\n\n";


        csv +=
        "Settings\n";


        csv +=
        "Low Level,"
        +
        settings.lowLevel
        +
        "%\n";


        csv +=
        "Warning Level,"
        +
        settings.warningLevel
        +
        "%\n";


        csv +=
        "Motor OFF Level,"
        +
        settings.motorOffLevel
        +
        "%\n";


        csv +=
        "Tank Height,"
        +
        settings.tankHeight
        +
        " cm\n\n";


        csv +=
        "Alert History\n";


        csv +=
        "Time,Alert\n";


        alertHistory.forEach(

            function (
                alert
            ) {


                csv +=

                `"${alert.time}","${alert.message}"\n`;


            }

        );



        const blob =
        new Blob(

            [csv],

            {

                type:
                "text/csv"

            }

        );



        const url =
        URL.createObjectURL(
            blob
        );


        const link =
        document.createElement(
            "a"
        );


        link.href =
        url;


        link.download =
        "Smart_Water_Report.csv";


        link.click();


        URL.revokeObjectURL(
            url
        );


    }

);



/* ===============================
   INITIAL UI
================================ */

updateDemo();


updateRecommendation(
    [0, 0]
);
