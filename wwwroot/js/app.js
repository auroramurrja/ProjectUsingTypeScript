function TSButton() {
    let name = "Aurora";
    document.getElementById("ts-example").innerHTML = greeter(user);
}
class Student {
    constructor(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}
function greeter(person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}
let user = new Student("Aurora", "Sh.", "Murrja");
//# sourceMappingURL=app.js.map