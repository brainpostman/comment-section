const form = document.getElementById('comment-form');

const commentSection = document.querySelector('.comments__section');

let commentCount = 0;
let commentId = 0;

let commentCounter = document.getElementById('count');

let imgNotLikeSrc = './img/not-like.svg';
let imgLikeSrc = './img/like.svg';

form.date.max = new Date().toLocaleDateString('fr-ca');

form.addEventListener('keydown', submitOnEnter);
form.addEventListener('submit', validateForm);

form.sender.oninvalid = (event) => {
    let sender = event.target.value;
    if (sender.length === 0) {
        displayErrorMessage("Имя не может быть пустым или<br> состоять только из пробелов", "sender");
        return;
    }
    if (sender.length < 6 || sender.length > 30) {
        displayErrorMessage("Имя должно иметь длину от 6 до 30 символов", "sender");
        return;
    }
    let regex = /^[a-zA-Zа-яА-Я0-9\-_ ]{6,30}$/g;
    if (!regex.test(sender)) {
        displayErrorMessage("Имя может содержать:<br>- русский и латинский алфавит<br>- цифры (0 - 9)<br>- дефис и нижнее подчеркивание", "sender");
        return;
    }
};

form.date.oninvalid = (event) => {
    if (!checkDateInput()) {
        let currentDate = new Date();
        dateStr = event.target.value.trim();
        regex = /^(0[1-9]|[12][0-9]|3[01])[-](0[1-9]|1[012])[-](19|20)\d\d$/g;
        if (!regex.test(dateStr)) {
            displayErrorMessage("Дата должна быть в формате:<br>дд-мм-гггг", "date");
            return;
        }
        let [dateDay, dateMonth, dateYear] = dateStr.split("-");
        dateDay = +dateDay;
        dateMonth = dateMonth - 1;
        dateYear = +dateYear;
        if (dateYear < 1970 || dateYear > currentDate.getFullYear()) {
            displayErrorMessage(`Год должен быть между 1970 и ${currentDate.getFullYear()}`, "date");
            return;
        }
        let dateLastDay = new Date(dateYear, dateMonth + 1, 0).getDate();
        if (dateDay > dateLastDay) {
            displayErrorMessage('Введена некорректная дата', "date");
            return;
        }
    }
    displayErrorMessage('Введена некорректная дата', "date");
}

form.text.oninvalid = (event) => {
    let text = event.target.value;
    if (text.length === 0) {
        displayErrorMessage("Комментарий не может быть пустым или состоять только из пробелов", "text");
        return;
    }
}

form.sender.oninput = () => {
    let errorElem = document.querySelector('.error__sender');
    errorElem.innerHTML = '';
}

form.sender.onfocus = (event) => {
    event.target.placeholder = '';
}

form.sender.onblur = (event) => {
    if (event.target.value === '') {
        event.target.placeholder = 'Ваше имя';
    }
}

form.text.oninput = (event) => {
    let errorElem = document.querySelector('.error__text');
    errorElem.innerHTML = '';
    event.target.placeholder = '';
}

form.text.onfocus = (event) => {
    event.target.placeholder = '';
}

form.text.onblur = (event) => {
    if (event.target.value === '') {
        event.target.placeholder = 'Ваш комментарий...';
    }
}

form.date.onkeydown = () => {
    if (checkDateInput()) {
        let errorElem = document.querySelector('.error__date');
        errorElem.innerHTML = '';
    }
}

form.date.oninput = () => {
    if (!checkDateInput()) {
        let errorElem = document.querySelector('.error__date');
        errorElem.innerHTML = '';
    }
}

form.date.onchange = () => {
    let errorElem = document.querySelector('.error__date');
    errorElem.innerHTML = '';
}

form.date.onfocus = (event) => {
    event.target.placeholder = '';
}

form.date.onblur = (event) => {
    if (event.target.value === '' && !checkDateInput()) {
        event.target.placeholder = 'дд-мм-гггг';
    }
}

function submitOnEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        let form = event.target.closest('#comment-form');
        form.dispatchEvent(new Event('submit'));
    }
}

function validateForm(event) {
    event.preventDefault();
    let form = event.target;
    form.sender.value = form.sender.value.trim();
    form.text.value = form.text.value.trim();

    let senderValid = form.sender.checkValidity();
    let textValid = form.text.checkValidity();
    let dateValid = form.date.checkValidity();

    if (!senderValid || !dateValid || !textValid) {
        return;
    }
    let date;
    if (form.date.value === '') {
        date = form.date.max;
    } else {
        date = form.date.value;
    }

    let formData = {
        sender: form.sender.value,
        text: form.text.value,
        date
    }

    submitComment(formData);
}

//проверка на поддержку input type='date'
function checkDateInput() {
    var input = document.createElement('input');
    input.setAttribute('type', 'date');

    var notADateValue = 'not-a-date';
    input.setAttribute('value', notADateValue);

    return (input.value !== notADateValue);
}

function displayErrorMessage(message, elemClass) {
    let errorElem = document.querySelector(`.error__${elemClass}`);
    errorElem.innerHTML = message;
}

function submitComment({ sender, text, date }) {
    commentCount++;
    commentCounter.textContent = commentCount;
    let commentSection = document.querySelector('.comments__section');
    let comment = document.createElement('li');
    comment.className = 'comments__comment';
    comment.id = `comment-${commentId++}`;
    comment.dataset.like = "0";
    let commentTemplate = ` <div class="comment" tabindex="-1">
                            <div class="comment__info">
                            <div class="comment__sender"></div>
                            <div class="comment__datetime"></div></div>
                            <div class="comment__text"></div></div><div class="comment__options">
                            <div class="comment__like"><img src="./img/not-like.svg" alt="Мне нравится" title="Мне нравится"></div>
                            <div class="comment__delete"><img src="./img/trash.svg" alt="Удалить комментарий" title="Удалить комментарий"></div></div>`
    comment.insertAdjacentHTML('afterbegin', commentTemplate);
    comment.querySelector('.comment__sender').textContent = sender;
    comment.querySelector('.comment__text').textContent = text;
    let dateObj = buildDateObj(date.split('-'));
    comment.querySelector('.comment__datetime').textContent = dateObj.date;
    comment.dataset.date = dateObj.dateStr;
    comment.dataset.time = dateObj.timeStr;
    commentSection.prepend(comment);
}

function buildDateObj([year, month, day]) {
    let date = Date.parse(`${year}-${month}-${day}`);
    let currentDate = Date.parse(form.date.max);
    let prevDate = currentDate - 86400000;

    let timeStr = new Date().toLocaleTimeString().slice(0, 5);
    let dateStr = `${day}.${month}.${year}`;
    let dateObj = {
        timeStr,
        dateStr
    }

    if (date === currentDate) {
        dateObj.date = `сегодня, ${timeStr}`
    } else if (date === prevDate) {
        dateObj.date = `вчера, ${timeStr}`
    } else {
        dateObj.date = `${dateStr}, ${timeStr}`;
    }
    return dateObj;
}

commentSection.onclick = (event) => {
    let target = event.target;
    let comment = target.closest('.comments__comment') ?? null;
    if (target.closest('.comment__delete') && comment) {
        comment.remove();
        commentCount--;
        commentCounter.textContent = commentCount;
    }
    if (target.closest('.comment__like') && comment) {
        if (comment.dataset.like === "0") {
            comment.dataset.like = "1";
            target.src = imgLikeSrc;
            target.title = 'Мне не нравится';
            target.alt = 'Мне не нравится';
        } else {
            comment.dataset.like = "0";
            target.src = imgNotLikeSrc;
            target.title = 'Мне нравится';
            target.alt = 'Мне нравится';
        }
    }
}
