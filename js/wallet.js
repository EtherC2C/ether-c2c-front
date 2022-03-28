const etherC2CABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oType",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "info",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "CreateOrder",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_info",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_oType",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    name: "createOrder",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "orders",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "oType",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "info",
        type: "string",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "status",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_status",
        type: "uint256",
      },
    ],
    name: "setStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const networks = new Map([
  [
    "0x1",
    {
      rpcUrls: ["https://mainnet.infura.io/v3/"],
      chainName: "Ethereum Mainnet",
    },
  ],
  [
    "0x4",
    {
      rpcUrls: ["https://rinkeby.infura.io/v3/"],
      chainName: "Rinkeby Testnet",
    },
  ],
]);

Web3Modal = window.Web3Modal.default;

WalletConnectProvider = window.WalletConnectProvider.default;

let web3;

let ens;

let selectedAccount;

let etherC2C;

async function initWeb3() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "9aa3d95b3bc440fa88ea12eaa4456161",
      },
    },
  };
  web3Modal = new Web3Modal({
    cacheProvider: true, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });
  try {
    provider = await web3Modal.connect();
    provider.enable();
    flush();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
  // Subscribe to accounts change
  provider.on("accountsChanged", async (accounts) => {
    flush();
  });
  // Subscribe to chainId change
  provider.on("chainChanged", async (chainId) => {
    flush();
  });
  // Subscribe to networkId change
  provider.on("networkChanged", async (networkId) => {
    flush();
  });
}

async function flush() {
  web3 = new Web3(provider);
  ens = new ethers.providers.Web3Provider(web3.currentProvider);
  chainId = await web3.eth.getChainId();
  console.log("chainId:" + chainId);
  if (chainId == 1) {
    $(".network-a").attr("class", "btn btn-icon-split network-a btn-info");
    $(".network").html("Ethereum Mainnet");
  } else if (chainId == 4) {
    $(".network-a").attr("class", "btn btn-icon-split network-a btn-warning");
    $(".network").html("Rinkeby Testnet");
    etherC2C = new web3.eth.Contract(
      etherC2CABI,
      "0xe6d86a8a2e0f54B902Ac38aA9064F2D664513790"
    );
  } else {
    $(".network-a").attr("class", "btn btn-icon-split network-a btn-danger");
    $(".network").html("Invalid Network");
  }
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  console.log(selectedAccount);
  let ensName = await getEnsName(selectedAccount);
  $(".account").html(ensName);
  console.log(ensName);
  loadOrders();
}

async function loadOrders() {
  etherC2C.events
    .CreateOrder(
      {
        fromBlock: 0,
      },
      function (error, event) {}
    )
    .on("data", function (event) {
      let oType = event["returnValues"]["oType"];
      let info = event["returnValues"]["info"];
      let token = event["returnValues"]["token"];
      let owner = event["returnValues"]["owner"];
      let amount = event["returnValues"]["amount"];
      let id = event["returnValues"]["id"];
      console.log(id);
      let typeStr;
      let uint;
      amount = amount / 10 ** 18;
      if (oType == 3) {
        typeStr = "buy";
        uint = "ETH";
      } else if (oType == 1) {
        typeStr = "sell";
        uint = "ETH";
      }
      if (typeStr && uint) {
        content = $(
          '<div class="text-white-50 small">#' +
            id +
            " " +
            typeStr +
            " " +
            amount.toFixed(18) +
            " " +
            uint +
            " </br>" +
            info +
            " </div>"
        );
        $(".buy-body").append(content);
      }
    });
}

async function createOrder() {
  etherC2C.methods
    .createOrder(1, "hello", 3, selectedAccount)
    .send({ from: selectedAccount });
}

async function getEnsName(account) {
  try {
    let ensName = await ens.lookupAddress(account);
    if (ensName == null) return account;
    return ensName;
  } catch (e) {
    return account;
  }
}

async function changeNetwork(chainId) {
  chainId = web3.utils.toHex(chainId);
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      chain = networks.get(chainId);
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainId,
              chainName: chain.chainName,
              rpcUrls: chain.rpcUrls /* ... */,
            },
          ],
        });
        flush();
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
  }
}
