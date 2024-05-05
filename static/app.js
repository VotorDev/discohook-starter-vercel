const page_version = "0.8";
let address = '';
let isConnected = false;
const chainId = "stargaze-1";
let token = '';

function setVersion() {
  document.getElementById('version').innerText = `Version: ${page_version}`;
}

function sortedObject(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result = {};
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    result[key] = sortedObject(obj[key]);
  });
  console.log(result);
  return result;
}

/** Returns a JSON string with objects sorted by key */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function sortedJsonStringify(obj) {
  return JSON.stringify(sortedObject(obj));
}

/**
 * Takes a valid JSON document and performs the following escapings in string values:
 *
 * `&` -> `\u0026`
 * `<` -> `\u003c`
 * `>` -> `\u003e`
 *
 * Since those characters do not occur in other places of the JSON document, only
 * string values are affected.
 *
 * If the input is invalid JSON, the behaviour is undefined.
 */
function escapeCharacters(input) {
  // When we migrate to target es2021 or above, we can use replaceAll instead of global patterns.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll
  const amp = /&/g;
  const lt = /</g;
  const gt = />/g;
  return input.replace(amp, "\\u0026").replace(lt, "\\u003c").replace(gt, "\\u003e");
}

function toUtf8(str) {
  return new TextEncoder().encode(str);
}

function serializeSignDoc(signDoc) {
  const serialized = toUtf8(escapeCharacters(sortedJsonStringify(signDoc)));
  console.log(serialized);
  return serialized;
}

async function parseURL() {
    const params = new URLSearchParams(window.location.search);
    token = params.get('token');
    document.getElementById('token').innerText = token;
    console.log(token);
}

async function connectWallet() {
    if (window.keplr) {
        window.wallet = window.keplr;
        console.log("Using Keplr");
    } else if(window.leap){
        window.wallet = window.leap;
        console.log("Using Leap");
    }else {
        console.log("No wallet detected");
      document.getElementById('walletAddress').innerText = "No wallet detected";
    }
      window.wallet.defaultOptions = {
        sign: {
          preferNoSetFee: true,
        },
      };
        await window.wallet.enable(chainId);
        const offlineSigner = window.wallet.getOfflineSigner(chainId);
        const accounts = await offlineSigner.getAccounts();
        address = accounts[0].address;
        isConnected = true;

        document.getElementById('walletAddress').innerText = address;
        document.getElementById('signButton').removeAttribute('disabled');
}

async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function sendData(walletAddress, signed, signature) {
  try {
      const endpoint = '/api/verify'; // Replace with your actual endpoint
      const data = { walletAddress, signed, signature };
      const response = await postData(endpoint, data);

      console.log('Data sent:', response);
  } catch (error) {
      console.error('Error sending data:', error);
  }
}

async function signMessage() {
  try {
    const signDoc = {
      account_number: "0",
      chain_id: chainId,
      fee: {
        amount: [{
          denom: "ustars",
          amount: "0"
            }],
        gas: "0"
      },
      memo: "One small step for Van, but a giant leap for Vankind.",
      msgs: [{
        type: 'pixelvans-login',
        value: token,
      }],
      sequence: "0",
    };

    const {signed, signature} = await window.wallet.signAmino(chainId, address, signDoc);
    const serializedMessage = serializeSignDoc(signed);
    console.log(signed);
    console.log(signature);
    console.log(serializedMessage);
    document.getElementById('serializedMessage').innerText = `${serializedMessage}`;
    document.getElementById('pubKey').innerText = `${signature.pub_key.type}, ${signature.pub_key.value}`
    document.getElementById('signedAmino').innerText = signature.signature;

    sendData(address, signed, signature);
  } catch (error) {
      console.error('Error signing message:', error);
      document.getElementById('serializedMessage').innerText = `Error signing message: ${error}`;
  }
}

window.onload = async () => {
    setVersion();
    parseURL();
    connectWallet();
};