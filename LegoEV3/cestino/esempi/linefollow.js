let correction = 0
let newColor = ""
let oldColor = ""
let threshold = 0
let lightLevel = 0
let speed = 0
// Costanti
speed = 30
threshold = 20
correction = 20
oldColor = "white"
newColor = "white"
// Loop principale
loops.forever(function () {

    if (oldColor != newColor) {
        brick.showString(newColor, 1)
        oldColor=newColor
    }
    lightLevel = sensors.color3.light(LightIntensityMode.Reflected)
    if (lightLevel < threshold) {
        newColor = "black"
        // Sopra la linea nera - gira a sinistra
        motors.largeB.run(speed - correction)
        motors.largeC.run(speed + correction)
    } else {
        newColor = "white"
        // Sopra lo sfondo bianco - gira a destra
        motors.largeB.run(speed + correction)
        motors.largeC.run(speed - correction)
    }
})
