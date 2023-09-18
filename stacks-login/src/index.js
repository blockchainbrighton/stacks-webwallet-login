import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { stringAsciiCV } from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksTestnet();
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

let ipfsURLGlobal = null;
let ipfsMintURL = null;
let isUploadComplete = false;

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
        const files = document.getElementById('audioFiles').files;
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
            console.log(`File uploaded to IPFS. URL: ${ipfsURL}`);
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
        console.log("Uploading file to IPFS...");

        const linksContainer = document.getElementById('ipfsLinks');
        const files = document.getElementById('audioFiles').files;
    
        if (files.length !== 1) {
            console.error("Expected only one file for upload.");
            return;
        }
    
        const file = files[0];
        console.log(`Uploading file to IPFS: ${file.name}`);
    
        if (file.size / 1024 > 350) {
            alert('File must be under 350kb');
            return;
        }
    
        try {
            const base64Data = await readFileAsDataURL(file);
            
            const forms = document.querySelectorAll('.audioForm');
            const form = forms[0]; // Since you're working with only one form
        
            const jsonData = {
                p: "audional",
                op: "deploy",
                audinal_id: "648e383daDbMUxq",
                fileName: form.querySelector('.fileName').value,
                instrumentClass: form.querySelector('.instrumentClass').value,
                instrumentType: form.querySelector('.instrumentType').value,
                creatorName: form.querySelector('.creatorName').value,
                audioData: base64Data
            };
            const ipfsURL = await uploadToIPFS(jsonData);
            console.log(`Inside uploadToIPFS, setting ipfsURLGlobal to ${ipfsURLGlobal, ipfsURL}`);
            console.log(`Inside uploadToIPFS, setting ipfsURLGlobal to ${ipfsURL}`);
            ipfsURLGlobal = ipfsURL;
            console.log(`Type of ipfsURLGlobal: ${typeof ipfsURLGlobal}`);
            console.log(`Value of ipfsURLGlobal: ${ipfsURLGlobal}`);            
            localStorage.setItem('ipfsMintURL', ipfsURLGlobal);
            console.log("ipfsURLGlobal set inside uploadToIPFS:", ipfsURLGlobal, ipfsURL);
            linksContainer.innerHTML = `<div>${jsonData.fileName}: ${ipfsURL}</div>`;
            console.log("File uploaded!");
            document.getElementById('mintButton').disabled = false;

            } catch (error) {
                console.error("Error uploading to IPFS:", error);
            }
        }

        async function mintAudionalNFT() {
            const retrievedURL = localStorage.getItem('ipfsMintURL');
            console.log("Retrieved IPFS URL from local storage:", retrievedURL);
            console.log("mintAudionalNFT function invoked.");
            console.log("ipfsURLGlobal at beginning of mintAudionalNFT:", ipfsURLGlobal);
            console.log("IPFS URL for transaction:", ipfsURLGlobal);
            console.log("IPFS MINT URL for transaction:", ipfsMintURL);
    
            if (!ipfsMintURL) {
                alert("IPFS URL not ready yet!");
                return;
            }
            console.log(`IPFS MINT URL: ${ipfsMintURL}`);
    
            console.log(window.stacks)
            const network = new window.stacks.transactions.StacksTestnet(); // Use window.stacks.transactions.StacksMainnet() for mainnet
            if (!network) {
                console.error("Error initializing Stacks network.");
                return;
            }
            console.log("Initialized Stacks network:", network);
            
            const contractAddress = 'ST16SYS65BZPZSGDSBANTAKDQD7HSTBZ9SXJSB47P.Audionals-V8'; // Replace with your contract's address
            const contractName = 'Audionals-V8';
        
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
                        console.log(`Transaction successful with ID: ${result.txId}`);
                        alert(`Minting successful! Transaction ID: ${result.txId}`);
                    } else {
                        console.log("Transaction failed. No transaction ID.");
                        alert('Minting failed. Please try again.');
                    }
                }
            };
            console.log("Transaction options set up:", txOptions);
        
            console.log("About to show Stacks connect popup.");
            await showConnect(txOptions);
            console.log("Stacks connect popup has been shown.");
        }
        
        // Event delegation for instrumentClass dropdowns
        document.getElementById('formsContainer').addEventListener('change', function(event) {
            if (event.target.classList.contains('instrumentClass')) {
                updateTypeDropdown(event.target.nextElementSibling, event.target.value);
            }
        });
        
        function handleLoginClick() {
            showConnect({
                userSession,
                appDetails: {
                    name: 'My Stacks Web-App',
                    icon: window.location.origin + '/my_logo.png',
                },
                onFinish: updateWalletStatus,
                onCancel: () => console.log('User cancelled login')
            });
        }
        
        function handleLogoutClick() {
            userSession.signUserOut();
            updateWalletStatus();
        }
        
        document.addEventListener('DOMContentLoaded', (event) => {
            updateWalletStatus();
        
            document.getElementById('loginBtn').addEventListener('click', handleLoginClick);
            document.getElementById('mintButton').addEventListener('click', mintAudionalNFT);
            document.getElementById('logoutBtn').addEventListener('click', handleLogoutClick);
        });
