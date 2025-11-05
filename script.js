const actionType = document.getElementById('action-type');
const imageLoader = document.getElementById('image-loader');
const textToType = document.getElementById('text-to-type');
const waitTime = document.getElementById('wait-time');
const duration = document.getElementById('duration-selection');
const clickAmount = document.getElementById('click-amount');
const clickOptions = document.getElementById('click-options');
const addActionButton = document.getElementById('add-action');
const interval = document.getElementById('interval');
const checkInterval = document.getElementById('check-interval');
const generateJsonButton = document.getElementById('generate-json');
const jsonResult = document.getElementById('json-result');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let actions = [];
let currentImage = null;
let coords = null;
let pixel = null;

imageLoader.addEventListener('change', e => {
    const reader = new FileReader();
    reader.onload = event => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            currentImage = img;
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});

canvas.addEventListener('click', e => {
    if (currentImage) {

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        coords = { x, y };
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, 0, 0);
        pixel = ctx.getImageData(coords.x, coords.y, 1, 1).data;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
});

actionType.addEventListener('change', e => {
    imageLoader.style.display = "none";
    clickOptions.style.display = "none";
    waitTime.style.display = 'none';
    textToType.style.display = 'none';
    duration.style.display = "none";
    clickAmount.style.display = "none";
    interval.style.display = "none"
    checkInterval.style.display = "none"

    if (e.target.value === 'TYPE') {
        textToType.style.display = 'block';
        interval.style.display = "block"
    } else if (e.target.value === 'WAIT_SECS') {
        waitTime.style.display = 'block';
    } else if (e.target.value === 'MOVE_TO') {
        imageLoader.style.display = "block";
        duration.style.display = "block";
    } else if (e.target.value === 'CLICK') {
        clickOptions.style.display = "block";
        clickAmount.style.display = "block";
    } else {
        imageLoader.style.display = "block";
        checkInterval.style.display = "block"
    }
});

addActionButton.addEventListener('click', () => {
    const action = { action: actionType.value };
    if (action.action === 'MOVE_TO') {
        if (coords) {
            action.x = parseInt(coords.x);
            action.y = parseInt(coords.y);
            action.duration = parseInt(duration.value) === 0 ? parseInt(duration.value) : 1
        } else {
            alert('Please select coordinates on the image.');
            return;
        }
    }
    if (action.action === 'TYPE') {
        action.text = textToType.value;
        action.interval = parseFloat(interval.value)
    }
    if (action.action === "CLICK") {
        action.button = clickOptions.value
        action.clicks = parseInt(clickAmount.value)
    }
    if (action.action === 'WAIT_SECS') {
        action.seconds = parseInt(waitTime.value);
    }

    if (action.action === "WAIT_UNTIL_COLOR") {
        if (coords) {
            action.color = `(${pixel[0]},${pixel[1]},${pixel[2]})`;
            action.check_x = parseInt(coords.x);
            action.check_y = parseInt(coords.y);
            action.check_interval = parseFloat(checkInterval.value) === 0 ? parseFloat(checkInterval.value) : 1;
        } else {
            alert('Selecione um ponto na imagem para capturar a cor.');
            return;
        }
    }

    actions.push(action);
    alert('Action added!');
    // Clear for next action
    currentImage = null;
    coords = null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    imageLoader.value = '';
    textToType.value = '';
    waitTime.value = '';
    canvas.width = 100;
    canvas.height = 100;
    const json = JSON.stringify({ actions }, null, 2);
    jsonResult.innerHTML = json
});

generateJsonButton.addEventListener('click', () => {
    const json = JSON.stringify({ actions: actions }, null, 2);
    console.log(json)
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'actions.json';
    a.click();
    canvas.width = 100;
    canvas.height = 100;
    URL.revokeObjectURL(url);
});