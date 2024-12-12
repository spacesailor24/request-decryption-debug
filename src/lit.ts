import { generateAuthSig } from "@lit-protocol/auth-helpers";
import { createSiweMessage } from "@lit-protocol/auth-helpers";
import { LitAccessControlConditionResource } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AccessControlConditions } from "@lit-protocol/types";
import { ethers } from "ethers";

const ADDRESS_B = "0x600DC16993EA1AbdA674A20d432F93041cDa2ef4";
const ADDRESS_C = "0xbA5CbC771c0A9aC33b02ba46e8D88CaDefB5342B";

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    console.log("Connected account:", await ethersSigner.getAddress());

    litNodeClient = new LitNodeClient({
      litNetwork: "datil-dev",
      debug: false,
    });
    await litNodeClient.connect();

    const accessControlConditionsA: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: await ethersSigner.getAddress(),
        },
      },
      { operator: "or" },
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: ADDRESS_B,
        },
      },
    ];

    const { ciphertext: ciphertextA, dataToEncryptHash: dataToEncryptHashA } =
      await litNodeClient.encrypt({
        dataToEncrypt: new TextEncoder().encode(
          "The answer to life, the universe, and everything is 42."
        ),
        accessControlConditions: accessControlConditionsA,
      });

    console.log(`ℹ️  ciphertext A: ${ciphertextA}`);
    console.log(`ℹ️  dataToEncryptHash A: ${dataToEncryptHashA}`);

    const sessionSignatures = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LIT_ABILITY.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });

    const decryptionResponseA = await litNodeClient.decrypt({
      chain: "ethereum",
      sessionSigs: sessionSignatures,
      ciphertext: ciphertextA,
      dataToEncryptHash: dataToEncryptHashA,
      accessControlConditions: accessControlConditionsA,
    });

    const decryptedStringA = new TextDecoder().decode(
      decryptionResponseA.decryptedData
    );
    console.log(`ℹ️  decryptedString: ${decryptedStringA}`);

    const accessControlConditionsB: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: ADDRESS_C,
        },
      },
      { operator: "or" },
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: await ethersSigner.getAddress(),
        },
      },
    ];

    const { ciphertext: ciphertextB, dataToEncryptHash: dataToEncryptHashB } =
      await litNodeClient.encrypt({
        dataToEncrypt: new TextEncoder().encode(
          "The question is more profound than the answer."
        ),
        accessControlConditions: accessControlConditionsB,
      });

    console.log(`ℹ️  ciphertext B: ${ciphertextB}`);
    console.log(`ℹ️  dataToEncryptHash B: ${dataToEncryptHashB}`);

    const decryptionResponseB = await litNodeClient.decrypt({
      chain: "ethereum",
      sessionSigs: sessionSignatures,
      ciphertext: ciphertextB,
      dataToEncryptHash: dataToEncryptHashB,
      accessControlConditions: accessControlConditionsB,
    });

    const decryptedStringB = new TextDecoder().decode(
      decryptionResponseB.decryptedData
    );
    console.log(`ℹ️  decryptedString B: ${decryptedStringB}`);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
