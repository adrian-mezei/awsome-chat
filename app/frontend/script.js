let websocket;
let newLineIsPressed = false;
let profileImageTimeout = null;
initWebSocket();

document.getElementById('message').addEventListener('keyup', event => {
    if (event.key === 'Enter' || event.keyIdentifier === 13 || event.keyCode === 13) {
        if (!newLineIsPressed) {
            btnSend();
        }
    }

    if (event.key === 'Shift' || event.keyIdentifier === 16 || event.keyCode === 16) {
        newLineIsPressed = false;
    }
});

document.getElementById('message').addEventListener('keydown', event => {
    if (event.key === 'Shift' || event.keyIdentifier === 16 || event.keyCode === 16) {
        newLineIsPressed = true;
    }
});

document.getElementById('gravatar').addEventListener('keyup', e => {
    clearTimeout(profileImageTimeout);
    profileImageTimeout = setTimeout(() => {
        let name = document.getElementById('gravatar').value;
        let nameMD5 = CryptoJS.MD5(name).toString();
        document.getElementById('profile-image').src = `http://www.gravatar.com/avatar/${nameMD5}?d=mp`;
    }, 1000);
});

function manualConnectDisconnect() {
    if (websocket.readyState === websocket.OPEN) {
        websocket.close();
    } else if (websocket.readyState === websocket.CLOSED) {
        initWebSocket();
    }
}

async function initWebSocket() {
    websocket = new WebSocket(webSocketUri);
    websocket.onopen = evt => {
        onOpen(evt);
    };
    websocket.onclose = evt => {
        onClose(evt);
    };
    websocket.onmessage = evt => {
        onMessage(evt);
    };
    websocket.onerror = evt => {
        onError(evt);
    };
}

function btnSend() {
    const messageField = document.getElementById('message');

    doSend(messageField.value);
    messageField.value = '';
}

function onOpen(evt) {
    document.getElementById('button-connect').innerHTML = 'Disconnect';
    writeSystemMessage('connected');
}

function onClose(evt) {
    document.getElementById('button-connect').innerHTML = 'Connect';
    writeSystemMessage('disconnected');
}

function onMessage(evt) {
    let parsedData = tryParseJSON(evt.data);
    let message = parsedData ? parsedData.message : evt.data;
    let senderName = parsedData ? parsedData.senderName : '';
    let senderGravatar = parsedData ? parsedData.senderGravatar : '';

    writeToScreenLeft(message, senderGravatar, senderName);
}

function onError(evt) {
    writeSystemMessage('<span class="system-message-error-text">error: ' + evt.data + '</span>');
}

function doSend(message) {
    waitForSocketConnection(() => {
        let senderGravatar = document.getElementById('gravatar').value;
        let senderName = document.getElementById('name').value;

        const stringified = JSON.stringify({ message, senderName, senderGravatar });

        writeToScreenRight(message, senderGravatar);
        websocket.send(stringified);
    });
}

function waitForSocketConnection(callback) {
    setTimeout(() => {
        if (websocket.readyState === websocket.OPEN) {
            if (callback != null) {
                callback();
            }
        } else if (websocket.readyState === websocket.CLOSED) {
            initWebSocket();
            waitForSocketConnection(callback);
        } else {
            console.log('wait for connection...');
            waitForSocketConnection(callback);
        }
    }, 50);
}

function writeSystemMessage(message) {
    let pre = document.createElement('p');
    pre.classList.add('system-message-text');
    pre.innerHTML = 'SYSTEM: ' + message;

    let div = document.createElement('div');
    div.appendChild(pre);

    addToOutput(div);
}

function writeToScreenLeft(message, senderGravatar, senderName) {
    let imgGravatar = getLeftImage(senderGravatar);

    let preMessage = document.createElement('p');
    preMessage.classList.add('left-message-text');
    preMessage.innerHTML = message;

    let preSenderName = document.createElement('p');
    preSenderName.classList.add('left-message-sender');
    preSenderName.innerHTML = senderName;

    let div = document.createElement('div');
    div.classList.add('left-message-box');
    div.appendChild(imgGravatar);
    div.appendChild(preMessage);
    div.appendChild(preSenderName);

    addToOutput(div);
}

function writeToScreenRight(message, senderGravatar) {
    let imgGravatar = getRightImage(senderGravatar);

    let preMessage = document.createElement('p');
    preMessage.classList.add('right-message-text');
    preMessage.innerHTML = message;

    let div = document.createElement('div');
    div.classList.add('right-message-box');
    div.appendChild(preMessage);
    div.appendChild(imgGravatar);

    addToOutput(div);
}

function addToOutput(element) {
    let output = document.getElementById('output');
    output.appendChild(element);
    output.scrollTop = output.scrollHeight;
}

function getLeftImage(name) {
    let img = document.createElement('img');
    img.classList.add('left-image');

    let nameMD5 = CryptoJS.MD5(name).toString();
    img.src = `http://www.gravatar.com/avatar/${nameMD5}?d=mp`;

    return img;
}

function getRightImage(name) {
    let img = document.createElement('img');
    img.classList.add('right-image');

    let nameMD5 = CryptoJS.MD5(name).toString();
    img.src = `http://www.gravatar.com/avatar/${nameMD5}?d=mp`;

    return img;
}

function tryParseJSON(jsonString) {
    try {
        const o = JSON.parse(jsonString);
        if (o && typeof o === 'object') {
            return o;
        }
    } catch (e) {
        console.log(jsonString + ' could not be parsed to JSON');
    }

    return undefined;
}
