function validateSignUp() {
    const username = document.querySelector("#signup_username");
    const passwords = document.querySelectorAll(".signup_pwd")
    
    if (username.value == "") {
        username.style.borderColor = "#f0223a"
        window.alert("Please Enter a Username");
        return
    }

    if (passwords[0].value == "") {
        passwords[0].style.borderColor = "#f0223a"
        return
    }

    if (passwords[1].value == "") {
        passwords[1].style.borderColor = "#f0223a"
        return
    }

    if (!(passwords[0].value === passwords[1].value)) {
        window.alert("passwords do not match")
        passwords[0].style.borderColor = "#f0223a"
        passwords[1].style.borderColor = "#f0223a"
        return
    }

    // PASSES ALL THE TEST
    console.log(username.value);
    console.log(passwords[0].value);
}

function signup()
{
    document.querySelector(".login-form-container").style.cssText = "display: none;";
    document.querySelector(".signup-form-container").style.cssText = "display: block;";
    document.querySelector(".container").style.cssText = "background: linear-gradient(to bottom, rgb(56, 189, 149),  rgb(28, 139, 106));";
    document.querySelector(".button-1").style.cssText = "display: none";
    document.querySelector(".button-2").style.cssText = "display: block";

};

function login()
{
    document.querySelector(".signup-form-container").style.cssText = "display: none;";
    document.querySelector(".login-form-container").style.cssText = "display: block;";
    document.querySelector(".container").style.cssText = "background: linear-gradient(to bottom, rgb(6, 108, 224),  rgb(14, 48, 122));";
    document.querySelector(".button-2").style.cssText = "display: none";
    document.querySelector(".button-1").style.cssText = "display: block";

}