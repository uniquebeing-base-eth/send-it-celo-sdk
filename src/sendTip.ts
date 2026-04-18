import { parseUnits } from "viem";
import { CELOTIP_ADDRESS, ERC20_ABI } from "./contract";
import type { SendTipParams, SendTipResult } from "./types";

/**
 * Send a tip using the senditwithcelo CeloTip contract.
 *
 * Flow (matches the app's TipForm):
 *   1. Parse the human-readable amount with the token's decimals.
 *   2. Check the current ERC20 allowance for the CeloTip contract.
 *   3. If the allowance is insufficient, submit an `approve` tx via the wallet.
 *   4. POST the tip payload to the relayer URL — the relayer submits
 *      `sendTip(from, to, tokenAddress, amount, interactionType, castHash)`
 *      on chain and returns the resulting tx hash.
 */
export async function sendTip(params: SendTipParams): Promise<SendTipResult> {
  const {
    from,
    to,
    tokenAddress,
    amount,
    message,
    relayerUrl,
    walletClient,
    publicClient,
  } = params;
  const decimals = params.decimals ?? 18;
  const interactionType = params.interactionType ?? "tip";

  if (!from) throw new Error("sendTip: `from` is required");
  if (!to) throw new Error("sendTip: `to` is required");
  if (!tokenAddress) throw new Error("sendTip: `tokenAddress` is required");
  if (!amount) throw new Error("sendTip: `amount` is required");
  if (!relayerUrl) throw new Error("sendTip: `relayerUrl` is required");
  if (!walletClient) throw new Error("sendTip: `walletClient` is required");
  if (!publicClient) throw new Error("sendTip: `publicClient` is required");

  const parsedAmount = parseUnits(amount, decimals);

  // 1. Check current allowance.
  let needsApproval = true;
  try {
    const currentAllowance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [from, CELOTIP_ADDRESS],
    })) as bigint;
    needsApproval = currentAllowance < parsedAmount;
  } catch {
    needsApproval = true;
  }

  // 2. Approve if needed.
  let approvalHash: string | undefined;
  if (needsApproval) {
    approvalHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CELOTIP_ADDRESS, parsedAmount],
      account: from,
      chain: walletClient.chain,
    });
    await publicClient.waitForTransactionReceipt({
      hash: approvalHash as `0x${string}`,
    });
  }

  // 3. Send to the relayer.
  const response = await fetch(relayerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      tokenAddress,
      amount: parsedAmount.toString(),
      interactionType,
      castHash: message ?? "sent via senditwithcelo-sdk",
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `sendTip: relayer responded ${response.status} ${response.statusText}${
        text ? ` — ${text}` : ""
      }`
    );
  }

  const data = (await response.json()) as { hash?: string; error?: string };
  if (data.error) {
    throw new Error(`sendTip: relayer error — ${data.error}`);
  }
  if (!data.hash) {
    throw new Error("sendTip: relayer did not return a transaction hash");
  }

  return {
    hash: data.hash,
    approved: needsApproval,
    approvalHash,
  };
}
