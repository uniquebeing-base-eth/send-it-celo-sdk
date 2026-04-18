import type { PublicClient, WalletClient } from "viem";

export type Address = `0x${string}`;

export interface SendTipParams {
  /** Sender wallet address (must match walletClient account). */
  from: Address;
  /** Recipient wallet address. */
  to: Address;
  /** ERC20 token contract address being tipped. */
  tokenAddress: Address;
  /** Human-readable amount, e.g. "1.5". Will be parsed using `decimals`. */
  amount: string;
  /** Token decimals (defaults to 18). */
  decimals?: number;
  /** Optional message / cast hash stored with the tip. */
  message?: string;
  /** Interaction type label (defaults to "tip"). */
  interactionType?: string;
  /**
   * URL of the relayer endpoint that submits the on-chain `sendTip` call
   * (the senditwithcelo app uses a Supabase Edge Function called `send-tip`).
   * Required because the CeloTip contract's `sendTip` is called by a relayer.
   */
  relayerUrl: string;
  /** viem WalletClient used to approve the token spend on behalf of `from`. */
  walletClient: WalletClient;
  /** viem PublicClient used to read allowance / wait for receipts. */
  publicClient: PublicClient;
}

export interface SendTipResult {
  /** On-chain transaction hash returned by the relayer. */
  hash: string;
  /** Whether an ERC20 approval transaction was submitted as part of this call. */
  approved: boolean;
  /** Approval tx hash if one was submitted. */
  approvalHash?: string;
}

export interface GetBalanceParams {
  /** Wallet address whose balance is being queried. */
  address: Address;
  /** ERC20 token contract address. */
  tokenAddress: Address;
  /** Token decimals (defaults to 18). */
  decimals?: number;
  /** viem PublicClient used to read the contract. */
  publicClient: PublicClient;
}

export interface GetBalanceResult {
  /** Raw on-chain balance as bigint (in token base units). */
  raw: bigint;
  /** Human-readable formatted balance string. */
  formatted: string;
  /** Decimals used for formatting. */
  decimals: number;
}
