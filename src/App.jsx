import { useMetaMask } from "metamask-react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ContractABI from "../abi.json";

function App() {
  const { status, connect, account, chainId, ethereum } = useMetaMask();
  const initialAmounts = [0, 0, 0, 0, 0, 0];
  const [amounts, setAmounts] = useState(initialAmounts);
  const [totalClaimed, setTotalClaimed] = useState(null);
  const [claimableAmount, setClaimableAmount] = useState(null);
  const contractAddress = "0x5624FD15Df313bbe6c481D06CC2FF681Aed60d51";

  let contract;

  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, ContractABI, signer);
  }

  const endDates = [
    new Date("July 2, 2023 15:40:41"),
    new Date("August 1, 2023 15:40:41"),
    new Date("August 31, 2023 15:40:41"),
    new Date("September 30, 2023 15:40:41"),
    new Date("October 30, 2023 15:40:41"),
    new Date("November 29, 2023 15:40:41"),
  ];

  const [tableData, setTableData] = useState(
    endDates.map((date, i) => ({
      phase: i + 1,
      amount: 0,
      status: "...",
      endDate: date,
    }))
  );

  const [timers, setTimers] = useState([]);

  const getTimeRemaining = (endDate) => {
    const total = Date.parse(endDate) - Date.parse(new Date());

    if (total <= 0) {
      return {
        total: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  const switchToHarmonyTestnet = async () => {
    if (ethereum && ethereum.isMetaMask) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x63564c40",
              chainName: "Harmony Mainnet Shard 0",
              nativeCurrency: {
                name: "ONE",
                symbol: "ONE",
                decimals: 18,
              },
              rpcUrls: ["https://api.s0.t.hmny.io"],
              blockExplorerUrls: ["https://explorer.harmony.one"],
            },
          ],
        });
        connect();
      } catch (error) {
        console.error("Failed to setup the network:", error);
      }
    } else {
      console.error("Please install MetaMask!");
    }
  };

  const fetchTotalClaimed = async () => {
    if (status === "connected") {
      try {
        // Call the getClaimedAmount() function from the smart contract
        const claimedAmount = await contract.getClaimedAmount();
        setTotalClaimed(claimedAmount.toString());
      } catch (error) {
        console.error("Failed to fetch total claimed amount:", error);
      }
    }
  };

  const claim = async (month) => {
    if (status !== "connected") {
      console.error("Not connected to the network");
      return;
    }
    try {
      // here, I'm assuming the contract has a claim() function
      const result = await contract.claim(month);
      // handle result, if needed
      console.log(`Claimed for month ${month}:`, result);
    } catch (error) {
      console.error(`Failed to claim for month ${month}:`, error);
    }
  };

  useEffect(() => {
    const fetchStatusAndClaimableAmounts = async () => {
      if (status === "connected") {
        try {
          let userVestingPeriod = 0;
          while (true) {
            const claimableAmount = await contract.checkExtraAmount(
              userVestingPeriod + 1
            );
            if (claimableAmount.toString() === "0") {
              break;
            }
            userVestingPeriod++;
          }

          const claimableAmounts = [];
          const newTableData = [];
          for (let month = 1; month <= userVestingPeriod; month++) {
            const extraAmount = await contract.checkExtraAmount(month);
            const claimableAmount = await contract.getClaimableAmount(month);

            // fetch status from contract
            const monthHasPassed = await contract.hasMonthPassed(month);
            const isClaimed = await contract.isClaimed(month);
            let currentStatus = "Locked";
            if (monthHasPassed) {
              if (isClaimed) {
                currentStatus = "Claimed";
              } else {
                currentStatus = "Claimable";
              }
            }

            let totalAmount;
            if (
              extraAmount.toString() !== claimableAmount.toString() &&
              claimableAmount.toString() !== "0"
            ) {
              totalAmount =
                extraAmount.toString() + " + " + claimableAmount.toString();
            } else {
              totalAmount = extraAmount.toString();
            }

            claimableAmounts.push(totalAmount);
            newTableData.push({
              phase: month,
              amount: totalAmount,
              status: currentStatus,
              endDate: endDates[month - 1],
            });
          }
          setAmounts(claimableAmounts);
          setTableData(newTableData);
          setTimers((prevTimers) => {
            const newTimers = [...prevTimers];
            for (let month = 1; month <= userVestingPeriod; month++) {
              newTimers[month - 1] = getTimeRemaining(endDates[month - 1]);
            }
            return newTimers;
          });
        } catch (error) {
          console.error("Failed to fetch claimable amounts:", error);
        }
      }
    };

    fetchStatusAndClaimableAmounts();
    fetchTotalClaimed();
  }, [status, contract]);

  useEffect(() => {
    // Create an array to hold the interval ids
    const intervals = [];

    // Create a separate interval for each timer
    for (let i = 0; i < tableData.length; i++) {
      intervals[i] = setInterval(() => {
        setTimers((prevTimers) => {
          const newTimers = [...prevTimers];
          newTimers[i] = getTimeRemaining(tableData[i].endDate);
          return newTimers;
        });
      }, 1000);
    }

    // Clear the intervals when the component unmounts
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [tableData]);

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
            Harmony Launcher Vesting
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
              return <Row data={row} timer={timers[i]} key={i} />;
            })}
          </div>
          <div className="flex flex-wrap justify-between overflow-auto mt-12">
            {tableData.map((row, i) => {
              return (
                <button
                  key={i}
                  onClick={() => claim(row.phase)}
                  className="blue-btn py-2 px-10 rounded text-center m-2"
                >
                  Claim Phase {row.phase} HARL
                </button>
              );
            })}
          </div>
          {totalClaimed !== null && (
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-white">Total Claimed:</p>
              <p className="text-xl font-bold text-white">{totalClaimed}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const Row = ({ data, timer }) => {
  return (
    <>
      <div className="col-span-3 border-b border-slate-400">
        <p className="text-slate-300 py-1">
          {timer
            ? `${timer.days}d ${timer.hours}h ${timer.minutes}m ${timer.seconds}s`
            : "..."}
        </p>
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
