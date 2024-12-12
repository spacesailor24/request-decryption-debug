This example demonstrates:

1. Initializing an Ethers signer using `window.ethereum` (i.e. MetaMask)
2. Creating Access Control Conditions (ACCs) to allow decryption for the Ethers signer and a random address (`ADDRESS_B`)
3. Encrypting a message with the ACCs
4. Generating Session Sigs using the Ethers signer
5. Making a decryption request using the Session Sigs to decrypt the message
6. Creating a new set of ACCs to allow decryption for the Ethers signer and the random address (`ADDRESS_C`)
7. Encrypting a new message with the new ACCs
8. Making a decryption request using the same Session Sigs to decrypt the new message
