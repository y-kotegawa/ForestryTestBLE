const DEVICE_NAME = "FORESTRYm5-stack";
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

let device = null;
let server = null;
let characteristic = null;

// ログを画面に表示する関数
function logMessage(message) {
    const logDiv = document.getElementById("log");
    const timestamp = new Date().toLocaleTimeString();
    logDiv.innerHTML += `[${timestamp}] ${message}<br>`;
    logDiv.scrollTop = logDiv.scrollHeight; // 最新メッセージにスクロール
}

// デバイスへの接続
async function connectToDevice() {
    try {
        logMessage("Scanning for devices...");
        device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: false,
            filters: [{ name: DEVICE_NAME }],
            optionalServices: [SERVICE_UUID],
        });

        logMessage(`Connecting to device: ${device.name}`);
        server = await device.gatt.connect();
        logMessage("Connected to device.");

        const service = await server.getPrimaryService(SERVICE_UUID);
        characteristic = await service.getCharacteristic(CHAR_UUID);

        logMessage("Characteristic obtained.");
        startNotifications(); // 自動で通知を開始
    } catch (error) {
        logMessage(`Failed to connect to device: ${error}`);
    }
}

// デバイスからの切断
async function disconnectFromDevice() {
    if (device && device.gatt.connected) {
        await device.gatt.disconnect();
        logMessage("Disconnected from device.");
    } else {
        logMessage("No device is currently connected.");
    }
}

// メッセージの送信
async function sendMessage() {
    if (characteristic) {
        try {
            const message = new TextEncoder().encode("hi!");
            await characteristic.writeValue(message);
            logMessage("Message sent to the device.");
        } catch (error) {
            logMessage(`Failed to send message: ${error}`);
        }
    } else {
        logMessage("Device is not connected.");
    }
}

// 通知の購読
async function startNotifications() {
    if (characteristic) {
        try {
            await characteristic.startNotifications();
            characteristic.addEventListener("characteristicvaluechanged", (event) => {
                const value = new TextDecoder().decode(event.target.value);
                logMessage(`Notification received: ${value}`);
            });
            logMessage("Subscribed to notifications.");
        } catch (error) {
            logMessage(`Failed to subscribe to notifications: ${error}`);
        }
    } else {
        logMessage("Device is not connected.");
    }
}

// ユーザーインターフェース (HTML ボタンのイベントリスナー)
document.getElementById("connect").addEventListener("click", connectToDevice);
document.getElementById("disconnect").addEventListener("click", disconnectFromDevice);
document.getElementById("send").addEventListener("click", sendMessage);
document.getElementById("notify").addEventListener("click", startNotifications);
