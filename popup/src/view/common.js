export const showAlert = (selector) => {
    fadeOut('.alert');
    fadeIn(selector);
    global.alert = selector;
}

export const fadeIn = (selector) => {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].classList.remove('fadeout');
    }
    return els;
}

export const fadeOut = (selector) => {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].classList.add('fadeout');
    }
    return els;
}