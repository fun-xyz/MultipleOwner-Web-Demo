import {
  convertToValidUserId,
  useConnectors,
  useCreateFun,
  MetamaskConnector,
  CoinbaseWalletConnector,
  WalletConnectConnector,
  Goerli,
  configureNewFunStore,
  usePrimaryAuth,
} from "@funkit/react";
import { useMemo } from "react";
import { useState } from "react";
import ConnectorButton from "./components/ConnectorButton"

//Step 1: Initialize the FunStore. This action configures your environment based on your apikey, chain, and the authentication methods of your choosing. 
const DEFAULT_FUN_WALLET_CONFIG = {
  apiKey: "hnHevQR0y394nBprGrvNx4HgoZHUwMet5mXTOBhf",
  chain: Goerli,
  gasSponsor: {
    sponsorAddress: "0xCB5D0b4569A39C217c243a436AC3feEe5dFeb9Ad", //Gasless payments on Goerli. Please switch to another gas sponsor method, or prefund your wallet on mainnet!
  }
};
const DEFAULT_CONNECTORS = [
  MetamaskConnector(),
  CoinbaseWalletConnector("FUN EXAMPLE APP NAME"),
  WalletConnectConnector(),
];
configureNewFunStore({
  config: DEFAULT_FUN_WALLET_CONFIG,
  connectors: DEFAULT_CONNECTORS,
});

window.Buffer = window.Buffer || require("buffer").Buffer;

export default function App() {
  const [receiptTxId, setReceiptTxId] = useState("")
  const [loading, setLoading] = useState(false)

  //Step 2: Use the initializeFunAccount method to create your funWallet object
  const { connectors, activeConnectors } = useConnectors();
  const { account, initializeFunAccount, funWallet } = useCreateFun()
  const [auth] = usePrimaryAuth()

  const activeConnections = useMemo(() => {
    return activeConnectors.filter((connector) => connector.active);
  }, [activeConnectors]);

  const initializeGroupAuthWallet = () => {
    if (activeConnections.length <= 1) {
      alert("Less than 2 authentication methods are used. Please follow the steps.")
      return
    }
    initializeFunAccount({
      users: activeConnections.map((connection) => ({ userId: convertToValidUserId(connection.account) })),
      index: parseInt(Math.random() * 10000000) //random number
    }).catch()

  }

  const createWallet = async () => {
    if (!funWallet) {
      alert("FunWallet not initialized. Please follow the steps.")
      return
    }

    // Add your custom action code here!
    setLoading(true)

    //Step 3: Create the operation
    const op = await funWallet.create(auth, await auth.getAddress())

    //Step 4: Execute the operation.
    const receipt = await funWallet.executeOperation(auth, op)
    setReceiptTxId(receipt.txId)
    setLoading(false)

    // FINAL STEP: Add your custom action logic here (swap, transfer, etc)
  }

  return (
    <div className="App">
      <h1>Create FunWallet with multiple owners</h1>
      1.&ensp;
      {connectors && connectors.map((_, index) => (
        index === 3 || index === 2 ?
          null
          :
          <>
            <ConnectorButton key={index} index={index} />&ensp;
          </>
      ))
      }
      {
        <div>
          {activeConnections.length} connectors are currently connected.
        </div>
      }
      <br></br>
      <br></br>

      2.&ensp;
      <button onClick={initializeGroupAuthWallet}>Create group auth wallet</button>
      {account ?
        <div>
          Success! FunWallet address: {account}
        </div>
        : <></>
      }
      <br></br>
      <br></br>

      3.&ensp;
      <button onClick={createWallet}>Create FunWallet</button>
      {loading ?
        <div>
          Loading...
        </div>
        : <></>
      }
      {receiptTxId ?
        <div>
          <a href={`https://goerli.etherscan.io/tx/${receiptTxId}`} target="_blank" rel="noreferrer">Transaction submitted!</a> View wallet on <a href={`https://goerli.etherscan.io/address/${account}`} target="_blank" rel="noreferrer"> block explorer. </a>
        </div>
        : <></>
      }
      <br></br>
      <br></br>
    </div>
  );
}