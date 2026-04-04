// Function 1

const person = {
    fullName: function() {
    return this.firstName + " " + this.lastName;
    }
}
const person1 = {
    firstName:"John",
    lastName: "Doe"
}
const person2 = {
    firstName:"Mary",
    lastName "Doe"
}

person.fullName.call(person1);

//Function 2

const animal = {
    animalSound: "Muuuuuu",

    sound: function() {
    return "This animal says: " this.animalSound;
    }

};

const animalSays = animal.sound;
animalSays();

// Function 3

const cars = ["Volvo, "Ferrari", "Audi"];
let txt = "";
cars.forEach(myFunction);

function myFunction(value) {
    txt += value + "<br>";
}