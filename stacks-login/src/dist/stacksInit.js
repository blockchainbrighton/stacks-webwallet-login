// All Stacks-related initialization code goes here

// For example:

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

export { mintAudionalNFT };
