import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { stringAsciiCV } from '@stacks/transactions';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
if (userSession.isUserSignedIn()) {
    console.log("User is already signed in.");
    const userData = userSession.loadUserData();
    document.getElementById('walletStatus').textContent = `Logged in as: ${userData.profile.stxAddress.mainnet}`;
    document.getElementById('logoutBtn').style.display = 'block';
} else {
    console.log("User is not signed in.");
    document.getElementById('walletStatus').textContent = "Not logged in";
    document.getElementById('logoutBtn').style.display = 'none';
}

let ipfsURLGlobal = null;


// All Stacks-related initialization code goes here


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


    const ipfs = IpfsHttpClient.create({ host: '127.0.0.1', port: '5001', protocol: 'http' });


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

    function getFileSizeColorClass(fileSizeKB) {
    console.log(`File Size: ${fileSizeKB} KB - Color Class: [Your return value]`);
    if (fileSizeKB < 1) return 'bright-green';
    if (fileSizeKB < 5) return 'yellow';
    if (fileSizeKB < 20) return 'orange';
    if (fileSizeKB < 100) return 'pink';
    if (fileSizeKB <= 350) return 'red';
    return 'black';
    }

    window.uploadAllToIPFS = async function() {
        console.log("Uploading all files to IPFS...");
        const forms = document.querySelectorAll('.audioForm');
        const files = document.getElementById('audioFiles').files;
        const linksContainer = document.getElementById('ipfsLinks');
        linksContainer.innerHTML = '';
    
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Uploading file to IPFS: ${file.name}`);
            
            if (file.size / 1024 > 350) {
                alert('Files must be under 350kb per file');
                return;
            }
    
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async function () {
                const base64Data = reader.result;
                const form = forms[i];
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
                linksContainer.innerHTML += `<div>${jsonData.fileName}: ${ipfsURL}</div>`;
            };
        }
    }

    async function uploadToIPFS(data) {
        try {
            const file = { path: 'audio.json', content: new TextEncoder().encode(JSON.stringify(data)) };
            const result = await ipfs.add(file);
            const ipfsURL = `https://ipfs.io/ipfs/${result.cid.toString()}`;
            ipfsURLGlobal = ipfsURL; // Update the global variable
            console.log(`File uploaded to IPFS. URL: ${ipfsURL}`);  // Moved this line here.
            return ipfsURL;
        } catch (error) {
            console.error("Error in IPFS upload:", error);
            throw error;
        }
    }
    

    const myAppName = 'My Stacks Web-App';
    const myAppIcon = window.location.origin + '/my_logo.png';

    


    

async function mintAudionalNFT() {
    console.log("mintAudionalNFT function invoked.");

    if (!ipfsURLGlobal) {
        alert("IPFS URL not ready yet!");
        return;
    }
    console.log(`IPFS URL: ${ipfsURLGlobal}`);

    const network = new window.stacks.transactions.StacksTestnet(); // Use window.stacks.transactions.StacksMainnet() for mainnet
    console.log("Initialized Stacks network:", network);
    
    const contractAddress = 'ST16SYS65BZPZSGDSBANTAKDQD7HSTBZ9SXJSB47P.Audionals-V8'; // Replace with your contract's address
    const contractName = 'Audionals-V8';

    const txOptions = {
        contractAddress,
        contractName,
        functionName: 'claim',
        functionArgs: [stringAsciiCV(ipfsURLGlobal)],
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


document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM fully loaded and parsed");

    // Check if the user is already logged in
    if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        document.getElementById('walletStatus').textContent = `Logged in as: ${userData.profile.stxAddress.mainnet}`; // or '.testnet' for testnet address
        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        document.getElementById('walletStatus').textContent = "Not logged in";
        document.getElementById('logoutBtn').style.display = 'none';
    }

    // Login button event listener
    document.getElementById('loginBtn').addEventListener('click', () => {
        console.log("Login button clicked. Preparing to show Stacks authentication pop-up.");

        const myAppName = 'My Stacks Web-App';
        const myAppIcon = window.location.origin + '/my_logo.png';

        showConnect({
            userSession,
            appDetails: {
                name: myAppName,
                icon: myAppIcon,
            },
            onFinish: () => {
                if (userSession.isUserSignedIn()) {
                    const userData = userSession.loadUserData();
                    document.getElementById('walletStatus').textContent = `Logged in as: ${userData.profile.stxAddress.mainnet}`; // or '.testnet' for testnet address
                    document.getElementById('logoutBtn').style.display = 'block';
                }
                window.location.reload();
            },
            
            onCancel: () => {
                console.log('User cancelled login');
            }
        });
    });

    // Mint button event listener
    document.getElementById('mintButton').addEventListener('click', function() {
        console.log("Mint button clicked.");
        if (typeof mintAudionalNFT === "function") {
            mintAudionalNFT();
        } else {
            console.error("mintAudionalNFT function is not yet available.");
        }
    });

    // Logout button event listener
    document.getElementById('logoutBtn').addEventListener('click', () => {
        userSession.signUserOut();
        document.getElementById('walletStatus').textContent = "Not logged in";
        document.getElementById('logoutBtn').style.display = 'none';
    });
});

