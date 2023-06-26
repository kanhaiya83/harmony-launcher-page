import { useMetaMask } from "metamask-react";
import { useEffect } from "react";

const tableData = [
  {
    phase: 1,
    amount: 0,
    status: "Claimable",
  },
  {
    phase: 2,
    amount: 0,
    status: "Claimable",
  },
  {
    phase: 3,
    amount: 0,
    status: "Claimable",
  },
  {
    phase: 4,
    amount: 0,
    status: "Claimable",
  },
  {
    phase: 5,
    amount: 0,
    status: "Claimable",
  },
  {
    phase: 6,
    amount: 0,
    status: "Claimable",
  },
];
function App() {
  const { status, connect, account, chainId, ethereum } = useMetaMask();

  const switchToHarmonyTestnet = async () => {
    if (ethereum && ethereum.isMetaMask) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x6357d2e0",
              chainName: "Harmony Testnet Shard 0",
              nativeCurrency: {
                name: "ONE",
                symbol: "ONE",
                decimals: 18,
              },
              rpcUrls: ["https://api.s0.b.hmny.io"],
              blockExplorerUrls: ["https://explorer.pops.one"],
            },
          ],
        });
        connect();
      } catch (error) {
        console.error("Failed to 4setup the network:", error);
      }
    } else {
      console.error("Please install MetaMask!");
    }
  };

  return (
    <div className="w-full bg-[#141718] inner-shadow min-h-screen lg:h-screen py-10 px-[2%]">
      <div className="flex h-full items-stretch flex-col lg:flex-row">
        <div className="flex-1 flex flex-col items-center py-4 lg:py-20 px-[5%]">
          <img
            src="https://harmonylauncher.io/images/logo.png"
            alt=""
            className="h-32 w-auto mb-10"
          />
          <p className="text-center text-[#929292] lg:text-xl">
            Harmony Launcher is the world’s first decentralized IDO + IGO
            launchpad and incubator with an integrated AMM DEX who’s primary
            focus is to provide all the necessary grounds for start-ups and
            projects based on the harmony network to build, raise funds & launch
            successfully.Harmony Launcher is the world’s first decentralized IDO
            + IGO launchpad and incubator with an integrated AMM DEX who’s
            primary focus is to provide all the necessary grounds for start-ups
            and projects based on the harmony network to build, raise funds &
            launch successfully.
          </p>
          <div className="flex gap-6 mt-10">
            <a
              href="https://twitter.com/harmonylauncher"
              target="_blank"
              rel="noreferrer"
              className="neo-btn rounded-md px-4 py-2 lg:px-6 lg:py-4 flex items-center justify-center"
            >
              <img src="/twitter.svg" alt="" className="w-8" />
            </a>
            <a
              href="https://harmonylauncher.medium.com/"
              target="_blank"
              rel="noreferrer"
              className="neo-btn rounded-md px-4 py-2 lg:px-6 lg:py-4 flex items-center justify-center"
            >
              <img src="/medium.svg" alt="" className="w-8" />
            </a>
            <a
              href="https://t.me/harmonylauncher"
              target="_blank"
              rel="noreferrer"
              className="neo-btn rounded-md px-4 py-2 lg:px-6 lg:py-4 flex items-center justify-center"
            >
              <img src="/telegram.svg" alt="" className="w-8" />
            </a>
            <a
              href="https://harmonylauncher.io/"
              target="_blank"
              rel="noreferrer"
              className="neo-btn rounded-md px-4 py-2 lg:px-6 lg:py-4 flex items-center justify-center"
            >
              <img src="/globe.svg" alt="" className="w-8" />
            </a>
          </div>
        </div>
        <div className="flex-1 shadow-black shadow-md rounded-lg py-6 px-[5%] text-white">
          <div className="flex mb-4 justify-center  lg:justify-end">
            <button
              className="bg-[#f96355] shadow-[#f96355] shadow rounded-md py-2 px-10 font-semibold"
              onClick={switchToHarmonyTestnet}
            >
              {status === "connected" ? "Connected" : "Connect"}
            </button>
          </div>
          <h1 className="font-semibold text-2xl mb-4">
            Harmony Launcher Advisor Vesting
          </h1>
          <div className="grid grid-cols-12 border-slate-200 border-[2px] text-center">
            <div className="col-span-3 border-b border-slate-400">
              <h1 className="font-semibold text-lg py-1">Phase</h1>
            </div>
            <div className="col-span-4 border-b border-x border-slate-400">
              <h1 className="font-semibold text-lg py-1">Amount</h1>
            </div>
            <div className="col-span-5 border-b border-slate-400">
              <h1 className="font-semibold text-lg py-1">Status</h1>
            </div>
            {tableData.map((row, i) => {
              return <Row data={row} key={i} />;
            })}
          </div>
          <div className="flex flex-col items-center gap-10 mt-12">
            <button className="blue-btn py-2 px-10 rounded text-center">
              Claim Phase 1 HARL
            </button>
            <button className="blue-btn py-2 px-10 rounded text-center">
              Claim Phase 2 HARL
            </button>
            <button className="blue-btn py-2 px-10 rounded text-center">
              Claim Phase 3 HARL
            </button>
            <button className="blue-btn py-2 px-10 rounded text-center">
              Claim Phase 4 HARL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
const Row = ({ data }) => {
  return (
    <>
      <div className="col-span-3 border-b border-slate-400">
        <p className="text-slate-300 py-1">{data.phase}</p>
      </div>
      <div className="col-span-4 border-b border-x border-slate-400">
        <p className="text-slate-300 py-1">{data.amount}</p>
      </div>
      <div className="col-span-5 border-b border-slate-400">
        <p className="text-slate-300 py-1">{data.status}</p>
      </div>
    </>
  );
};
export default App;
