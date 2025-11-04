const actionType = document.getElementById('action-type');
const imageLoader = document.getElementById('image-loader');
const textToType = document.getElementById('text-to-type');
const waitTime = document.getElementById('wait-time');
const addActionButton = document.getElementById('add-action');
const generateJsonButton = document.getElementById('generate-json');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let actions = [];
let currentImage = null;
let coords = null;

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
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
});

actionType.addEventListener('change', e => {
    if (e.target.value === 'TYPE') {
        textToType.style.display = 'block';
        waitTime.style.display = 'none';
    } else if (e.target.value === 'WAIT_SECS') {
        textToType.style.display = 'none';
        waitTime.style.display = 'block';
    } else {
        textToType.style.display = 'none';
        waitTime.style.display = 'none';
    }
});

addActionButton.addEventListener('click', () => {
    const action = { action: actionType.value };
    if (action.type === 'MOVE_TO') {
        if (coords) {
            action.coords = coords;
        } else {
            alert('Please select coordinates on the image.');
            return;
        }
    }
    if (action.type === 'TYPE') {
        action.text = textToType.value;
    }
    if (action.type === 'WAIT') {
        action.seconds = parseInt(waitTime.value);
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
});

generateJsonButton.addEventListener('click', () => {
    const json = JSON.stringify(actions, null, 2);
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