#include <ESP8266WiFi.h>

#include <FirebaseESP8266.h>


/* WIFI */

#define WIFI_SSID "YOUR_WIFI_NAME"

#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"



/* FIREBASE */

/*
Use the database host/name and credentials
required by the FirebaseESP8266 library
version you install.

Do NOT upload your Wi-Fi password or
private credentials to public GitHub.
*/

#define FIREBASE_HOST "YOUR_FIREBASE_HOST"

#define FIREBASE_AUTH "YOUR_FIREBASE_AUTH"



/* FIREBASE OBJECT */

FirebaseData firebaseData;



/* SENSOR PINS */

/*
NodeMCU Pins

Tank 1 → D1
Tank 2 → D2
Tank 3 → D5
Tank 4 → D6

Buzzer → D7
*/


#define TANK1_SENSOR D1

#define TANK2_SENSOR D2

#define TANK3_SENSOR D5

#define TANK4_SENSOR D6


#define BUZZER D7



void setup() {

    Serial.begin(115200);


    pinMode(
        TANK1_SENSOR,
        INPUT
    );


    pinMode(
        TANK2_SENSOR,
        INPUT
    );


    pinMode(
        TANK3_SENSOR,
        INPUT
    );


    pinMode(
        TANK4_SENSOR,
        INPUT
    );


    pinMode(
        BUZZER,
        OUTPUT
    );


    digitalWrite(
        BUZZER,
        LOW
    );



    /* WIFI CONNECTION */


    WiFi.begin(
        WIFI_SSID,
        WIFI_PASSWORD
    );


    Serial.println(
        "Connecting to WiFi..."
    );


    while (

        WiFi.status()
        != WL_CONNECTED

    ) {

        delay(500);

        Serial.print(
            "."
        );

    }


    Serial.println();


    Serial.println(
        "WiFi Connected!"
    );


    Serial.println(
        WiFi.localIP()
    );



    /* FIREBASE */


    Firebase.begin(
        FIREBASE_HOST,
        FIREBASE_AUTH
    );


    Firebase.reconnectWiFi(
        true
    );

}



int readWaterSensor(
    int sensorPin
) {

    int value =
    digitalRead(
        sensorPin
    );


    /*
    Sensor result

    HIGH → Water detected

    LOW → No water
    */


    if (value == HIGH) {

        return 100;

    }


    else {

        return 0;

    }

}



void sendData(
    int tankNumber,
    int level
) {

    String path =

    "/waterLevels/tank"
    +
    String(
        tankNumber
    );


    Firebase.setInt(

        firebaseData,

        path,

        level

    );

}



void buzzerAlert(
    int level
) {

    if (

        level <= 25

    ) {

        digitalWrite(
            BUZZER,
            HIGH
        );


        delay(300);


        digitalWrite(
            BUZZER,
            LOW
        );

    }

}



void loop() {


    int tank1 =
    readWaterSensor(
        TANK1_SENSOR
    );


    int tank2 =
    readWaterSensor(
        TANK2_SENSOR
    );


    int tank3 =
    readWaterSensor(
        TANK3_SENSOR
    );


    int tank4 =
    readWaterSensor(
        TANK4_SENSOR
    );



    sendData(
        1,
        tank1
    );


    sendData(
        2,
        tank2
    );


    sendData(
        3,
        tank3
    );


    sendData(
        4,
        tank4
    );



    Serial.println(
        "----------------"
    );


    Serial.print(
        "Tank 1: "
    );

    Serial.println(
        tank1
    );


    Serial.print(
        "Tank 2: "
    );

    Serial.println(
        tank2
    );


    Serial.print(
        "Tank 3: "
    );

    Serial.println(
        tank3
    );


    Serial.print(
        "Tank 4: "
    );

    Serial.println(
        tank4
    );



    if (

        tank1 <= 25
        ||
        tank2 <= 25
        ||
        tank3 <= 25
        ||
        tank4 <= 25

    ) {

        buzzerAlert(
            0
        );

    }



    delay(3000);

}
