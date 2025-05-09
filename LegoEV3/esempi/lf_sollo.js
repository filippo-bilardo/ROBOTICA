let grigio_max = 0
let grigio_min = 0
let tolleranza = 0
let grigio = 0
let luminosita = 0

grigio = 50
//maggiore la tolleranza, minore la sensibilita al nero o bianco
tolleranza = 35
grigio_min = 50 - tolleranza
grigio_max = 50 + tolleranza

forever(function () {
    luminosita = sensors.color1.light(LightIntensityMode.Reflected);

    console.sendToScreen()
    console.log("" + luminosita.toString())

    if (luminosita < grigio_min) {
        motors.largeAB.tank(-20, 30, tolleranza + luminosita, MoveUnit.MilliSeconds)
        //motors.largeAB.pauseUntilReady()
        //motors.largeA.run(5)

    } else if (luminosita > grigio_max) {

        motors.largeAB.tank(30, -20, luminosita, MoveUnit.MilliSeconds)
        //motors.largeAB.pauseUntilReady()
        //motors.largeB.run(5)

    } else {
        motors.largeAB.run(30)
    }
})

//TODO: routine di calibratura
let calibra = function () {
    console.log("Calibra il sensore")
    console.log("Premi il tasto centrale per confermare")
    while (true) {
        if (buttons.center.isPressed()) {
            grigio = sensors.color1.light(LightIntensityMode.Reflected);
            grigio_min = grigio - tolleranza
            grigio_max = grigio + tolleranza
            break
        }
    }
}


