Web3Modal = window.Web3Modal.default;

WalletConnectProvider = window.WalletConnectProvider.default;

let web3;

let ens;

let selectedAccount;

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
    $(".network-a").attr("class","btn btn-icon-split network-a btn-info")
    $(".network").html("Ethereum Mainnet");
  } else if (chainId == 4) {
    $(".network-a").attr("class","btn btn-icon-split network-a btn-warning")
    $(".network").html("Rinkeby Testnet");
  }else{
    $(".network-a").attr("class","btn btn-icon-split network-a btn-danger")
    $(".network").html("Invalid Network");
  }
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  console.log(selectedAccount);
  let ensName = await getEnsName(selectedAccount);
  $(".account").html(ensName);
  console.log(ensName);
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
