# stacks-webwallet-login


The application allows users to interact with the Stacks blockchain, upload audio files to IPFS (InterPlanetary File System), and mint audio NFTs on the Stacks blockchain.

Key Components & Data Flows:
Imports & Configurations:

Importing necessary libraries and tools from Stacks SDK.
Initializing the Stacks app configuration, user session, and network.
Initializing an IPFS client.
Defining different classes and types of musical instruments.
Wallet Status:

The function updateWalletStatus checks if the user is signed in using the Stacks session and updates the UI accordingly.
File Size & Pricing:

getFileSizeColorClass determines the color class based on the file size.
getPrice fetches the price of a specific cryptocurrency (either 'blockstack' or 'bitcoin') using the Coingecko API.
Loading and Displaying Files:

loadFiles loads the selected audio files, fetches cryptocurrency prices, calculates minting costs, and populates the UI with forms for each audio file.
attachClassDropdownListeners and updateTypeDropdown are used to manage the instrument class and type dropdowns in the UI.
IPFS Interactions:

readFileAsDataURL reads a given file as a Data URL (Base64 encoded).
uploadToIPFS prepares the data for an audio file and uploads it to IPFS. It then updates a global URL variable and stores the URL in local storage.
Blockchain Interactions:

mintAudionalNFT retrieves the IPFS URL from local storage, prepares transaction options, and prompts the user with a Stacks Connect popup to mint an Audional NFT on the Stacks blockchain.
Event Listeners:

After the DOM is fully loaded:
The wallet status is updated.
Event listeners for login, minting, and logout buttons are attached.
The login button opens the Stacks Connect popup for signing in.
The mint button triggers the NFT minting process.
The logout button signs the user out of their Stacks session.

Notable Points:
The application uses IPFS to store audio data. IPFS is a peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open.

The application uses the Stacks blockchain to mint audio NFTs. Stacks allows for smart contracts and decentralized apps (dApps) to be built alongside Bitcoin.

Users can interact with the application through a series of buttons (login, logout, mint) and forms (for uploading and detailing audio files).

The user's wallet status (logged in or not) is dynamically displayed.

There are several checks and feedback mechanisms in place, like ensuring the file size is under a certain limit before uploading to IPFS.

Potential Improvements or Points of Confusion:
There's a discrepancy in the way ipfsURLGlobal and ipfsMintURL are used in the mintAudionalNFT function. While ipfsURLGlobal is set in the uploadToIPFS function, it's not clear where or if ipfsMintURL is set anywhere.

Some hardcoded values (like the contract address) might be better suited in a configuration file or as constants at the beginning of the script.


