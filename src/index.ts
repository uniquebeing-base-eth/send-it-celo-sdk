// senditwithcelo-sdk — minimal SDK for the senditwithcelo app.
// Exports only the core functions actually used by the app:
//   - sendTip
//   - getBalance
//
// Note: the current senditwithcelo app does not implement a `claimReward`
// flow, so it is intentionally omitted from this SDK.

export { sendTip } from "./sendTip";
export { getBalance } from "./getBalance";

export {
  CELOTIP_ADDRESS,
  CELOTIP_ABI,
  ERC20_ABI,
  CELO_TOKENS,
  CELO_CHAIN_ID,
  CELO_RPC_URL,
} from "./contract";

export type {
  Address,
  SendTipParams,
  SendTipResult,
  GetBalanceParams,
  GetBalanceResult,
} from "./types";
