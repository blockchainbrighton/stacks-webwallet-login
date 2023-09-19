import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { stringAsciiCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet();
let walletLoaded = false; 

// Declare a global flag at the start of your index.js
window.walletInitCompleted = window.walletInitCompleted || false;

function updateWalletStatus() {
    if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        document.getElementById('walletStatus').textContent = `Logged in as: ${userData.profile.stxAddress.mainnet}`;
        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        document.getElementById('walletStatus').textContent = "Not logged in";
        document.getElementById('logoutBtn').style.display = 'none';
    }
}

function debounce(fn, delay) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, arguments), delay);
    };
}

function loadWallet() {
    if (walletLoaded) return; 

    setTimeout(() => {
        showConnect({
            userSession,
            appDetails: {
                name: 'My Stacks Web-App',
                icon: window.location.origin + '/my_logo.png',
            },
            onFinish: () => {
                walletLoaded = true;
                updateWalletStatus();
            },
            onCancel: () => {
                console.log('User cancelled login');
                walletLoaded = false;
            }
        });
    }, 0);

    document.getElementById('loginBtn').disabled = true;
    setTimeout(() => {
        document.getElementById('loginBtn').disabled = false;
    }, 1000);
}

const ipfs = IpfsHttpClient.create({ host: '127.0.0.1', port: '5001', protocol: 'http' });
const instrumentClasses = {
    "Select Class": ["Select Type"],
    "Drums": ["Drum Loop", "Bass Drum", "Snare Drum", "Tom-Tom", "Cymbal", "Hi-Hat", "Floor Tom", "Ride Cymbal", "Crash Cymbal"],
    "Bass": ["Acoustic Bass", "Electric Bass", "Synth Bass", "Fretless Bass", "Upright Bass", "5-String Bass"],
    "Guitar": ["Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Classical Guitar", "12-String Guitar", "Resonator Guitar", "Pedal Steel Guitar"],
    "Vocals": ["Lead Vocals", "Backing Vocals", "Chorus", "Harmony", "Whisper", "Shout", "Speech", "Sounds"],
    "Percussion": ["Bongo", "Conga", "Tambourine", "Maracas", "Timpani", "Xylophone", "Triangle", "Djembe", "Cajon", "Tabla"],
    "Strings": ["Violin", "Viola", "Cello", "Double Bass", "Harp", "Mandolin", "Banjo", "Ukulele", "Sitar"],
    "Keys": ["Piano", "Analog Synth", "Digital Synth", "Modular Synth", "Wavetable Synth", "FM Synthesis", "Granular Synth", "Additive Synth"],
    "Sound Effects": ["Ambient", "Nature", "Industrial", "Electronic", "Urban", "Animals", "Weather", "Mechanical", "Sci-Fi"],
    "Brass": ["Trumpet", "Trombone", "Tuba", "French Horn", "Cornet", "Bugle", "Euphonium"],
    "Woodwinds": ["Flute", "Clarinet", "Oboe", "Bassoon", "Saxophone", "Recorder", "Piccolo", "English Horn"],
    "Keyboards": ["Piano", "Organ", "Harpsichord", "Accordion", "Mellotron", "Clavinet", "Celesta"],
    "Electronic": ["Sampler", "Drum Machine", "Sequencer", "Looper", "Effect Processor"]
};
console.log("Initial setup complete. IPFS client initialized.");


let isUploadComplete = false;
localStorage.removeItem('ipfsMintURLs');


function getFileSizeColorClass(fileSizeKB) {
    console.log(`File Size: ${fileSizeKB} KB - Color Class: [Your return value]`);
    if (fileSizeKB < 1) return 'bright-green';
    if (fileSizeKB < 5) return 'yellow';
    if (fileSizeKB < 20) return 'orange';
    if (fileSizeKB < 100) return 'pink';
    if (fileSizeKB <= 350) return 'red';
    return 'black';
    }

async function getPrice(id) {
        console.log(`Fetching price for ${id}...`);
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
        const data = await response.json();
        console.log(`Price for ${id}: ${data[id].usd}`);
        return data[id].usd;
    }

    window.loadFiles = async function loadFiles() {
        console.log("Loading files...");
        const [stxPrice, btcPrice] = await Promise.all([getPrice('blockstack'), getPrice('bitcoin')]);
        let files = document.getElementById('audioFiles').files;
    
        // Check if more than 8 files are selected
        if (files.length > 8) {
            alert("Only the first 8 files have been accepted, please add more files in a subsequent transaction.");
            files = Array.from(files).slice(0, 8); // Accept only the first 8 files
        }
        const formContainer = document.getElementById('formsContainer');
        formContainer.innerHTML = '';
    
        let totalBtcCost = 0, totalUsdCost = 0, totalStxCost = files.length;
    
        for (let file of files) {
            console.log(`Processing file: ${file.name}`);
            const fileSizeKB = file.size / 1024;
            const btcCost = (file.size * 6) / 100000000; 
            totalBtcCost += btcCost;
            totalUsdCost += btcCost * btcPrice;
    
            console.log('About to create new form for file:', file.name);
            const newForm = document.createElement('div');
            newForm.className = 'audioForm';
            newForm.innerHTML = `
                <input type="text" placeholder="File Name" class="fileName" value="${file.name}">
                <select class="instrumentClass" name="instrumentClass">
                    ${Object.keys(instrumentClasses).map(className => `<option value="${className}">${className}</option>`).join('')}
                </select>
                <select class="instrumentType"></select>
                <input type="text" placeholder="Creator Name" class="creatorName">
                <div class="${getFileSizeColorClass(fileSizeKB)}">File Size: ${fileSizeKB.toFixed(2)} KB</div>
                <div class="orange">Estimated Lowest Bitcoin Inscription Cost: ${btcCost.toFixed(8)} BTC ($${(btcCost * btcPrice).toFixed(2)})</div>
                <div class="green">Cost to mint STX Audional NFT: 1 STX / $${stxPrice.toFixed(2)}</div>
            `;
            formContainer.appendChild(newForm);
            console.log('Form appended to container for file:', file.name);
            console.log('About to update type dropdown for file:', file.name);
    
            setTimeout(() => {
                const instrumentClassElement = newForm.querySelector('.instrumentClass');
                if (instrumentClassElement) {
                    updateTypeDropdown(newForm.querySelector('.instrumentType'), instrumentClassElement.value);
                    console.log(`Instrument class dropdown changed to: ${instrumentClassElement.value}`);
                } else {
                    console.warn("Couldn't find .instrumentClass element");
                }
            }, 0);
        }
    
        document.getElementById('btcTotal').innerHTML = `<span class="orange">Total Bitcoin Inscription Cost: ${totalBtcCost.toFixed(8)} BTC ($${totalUsdCost.toFixed(2)})</span>`;
        document.getElementById('stxTotal').innerHTML = `<span class="green">Total STX Minting Cost: ${totalStxCost} STX ($${(totalStxCost * stxPrice).toFixed(2)})</span>`;
        attachClassDropdownListeners();
    }

function attachClassDropdownListeners() {
        document.querySelectorAll('.instrumentClass').forEach(dropdown => {
            dropdown.addEventListener('change', function() {
                updateTypeDropdown(this.nextElementSibling, this.value);
            });
        });
    }

function updateTypeDropdown(typeDropdown, selectedClass) {
        const types = instrumentClasses[selectedClass];
        if (!types) {
            console.warn(`No instrument types found for class: ${selectedClass}`);
            typeDropdown.innerHTML = ""; // Clearing dropdown if no types found
            return;
        }
        console.log('selectedClass value:', selectedClass, 'instrumentClasses[selectedClass]:', types);
        typeDropdown.innerHTML = types.concat("User Defined").map(type => `<option value="${type}">${type}</option>`).join('');
    }

    async function uploadToIPFS(data) {
        try {
            const file = { path: 'audio.json', content: new TextEncoder().encode(JSON.stringify(data)) };
            const result = await ipfs.add(file);
            const ipfsURL = `https://ipfs.io/ipfs/${result.cid.toString()}`;

            let ipfsURLs = JSON.parse(localStorage.getItem('ipfsMintURLs') || "[]");
            ipfsURLs.push(ipfsURL);
            localStorage.setItem('ipfsMintURLs', JSON.stringify(ipfsURLs));

            console.log(`File(s) uploaded to IPFS. URL: ${ipfsURL}`);
            return ipfsURL;
        } catch (error) {
            console.error("Error in IPFS upload:", error);
            throw error;
        }
    }
    
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    }
    
    window.uploadToIPFS = async function() {
        console.log("Convert to audional JSON file button clicked");
        console.log("Uploading files to IPFS...");
        const forms = document.querySelectorAll('.audioForm');

        const linksContainer = document.getElementById('ipfsLinks');
        const files = document.getElementById('audioFiles').files;
        let ipfsURLs = []; // Array to store all the IPFS URLs
    
        if (files.length > 8) {
            console.error("Expected up to 8 files for upload.");
            return;
        }
    
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
                    console.log(`Uploading file to IPFS: ${file.name}`);
    
            if (file.size / 1024 > 350) {
                alert(`File ${file.name} must be under 350kb`);
                continue; // Skip the current file and move to the next one
            }
    
            try {
                const base64Data = await readFileAsDataURL(file);
                
                const form = forms[i];
                const jsonData = {
                    fileName: form.querySelector('.fileName').value || file.name,
                    audioData: base64Data
                };
    
                const ipfsURL = await uploadToIPFS(jsonData);
                ipfsURLs.push(ipfsURL);  // Add the URL to the array
                linksContainer.innerHTML += `<div>${jsonData.fileName}: ${ipfsURL}</div>`; // Append each URL to the links container
                console.log("File uploaded!");
    
            } catch (error) {
                console.error(`Error uploading ${file.name} to IPFS:`, error);
            }
        }
    
        // Save the array of IPFS URLs to local storage
        localStorage.setItem('ipfsMintURLs', JSON.stringify(ipfsURLs));
    
        document.getElementById('mintButton').disabled = false; // Enable the mint button once all files are uploaded
    }
    
    

    async function mintAudionalNFT() {
        console.log("Mint button clicked");

        const retrievedURLs = JSON.parse(localStorage.getItem('ipfsMintURLs') || "[]");
        console.log("Retrieved IPFS URLs from local storage:", retrievedURLs);
    
        if (!retrievedURLs.length) {
            alert("No IPFS URLs available for minting!");
            return;
        }
    
        console.log(window.stacks);
        const network = new StacksTestnet();
        if (!network) {
            console.error("Error initializing Stacks network.");
            return;
        }
        console.log("Initialized Stacks network:", network);
    
        const contractAddress = 'ST16SYS65BZPZSGDSBANTAKDQD7HSTBZ9SXJSB47P.Audionals-V8'; // Replace with your contract's address
        const contractName = 'Audionals-V8';
    
        for (let ipfsMintURL of retrievedURLs) {
            console.log(`Minting NFT for IPFS URL: ${ipfsMintURL}`);
    
            const txOptions = {
                contractAddress,
                contractName,
                functionName: 'claim',
                functionArgs: [stringAsciiCV(ipfsMintURL)],
                appDetails: {
                    name: "Your App Name",
                    icon: "URL to your app's icon"
                },
                postConditionMode: 0x01, // Post condition mode: Allow
                network,
                onFinish: (result) => {
                    if (result.txId) {
                        console.log(`Transaction successful for ${ipfsMintURL} with ID: ${result.txId}`);
                    } else {
                        console.log(`Transaction failed for ${ipfsMintURL}. No transaction ID.`);
                    }
                }
            };
    
            console.log("Transaction options set up:", txOptions);
    
            console.log("About to show Stacks connect popup.");
            await showConnect(txOptions);
            console.log("Stacks connect popup has been shown.");
        }
    }
    
    
        
    document.addEventListener('DOMContentLoaded', (event) => {
        // Only run the initialization if it hasn't run before
        if (!window.walletInitCompleted) {
            updateWalletStatus();
    
            document.getElementById('loginBtn').addEventListener('click', debounce(loadWallet, 300));
    
            document.getElementById('mintButton').addEventListener('click', mintAudionalNFT);
    
            document.getElementById('logoutBtn').addEventListener('click', () => {
                userSession.signUserOut();
                walletLoaded = false;
                updateWalletStatus();
            });
    
            // Set the flag to true after initialization
            window.walletInitCompleted = true;
        }
    });
