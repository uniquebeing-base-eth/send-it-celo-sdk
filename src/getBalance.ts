import { formatUnits } from "viem";
import { ERC20_ABI } from "./contract";
import type { GetBalanceParams, GetBalanceResult } from "./types";

/**
 * Read an ERC20 token balance for an address on Celo .
 * Wraps the same `balanceOf` call used by the senditwithcelo app.
 * checks balance before sending tips.
 */
export async function getBalance(
  params: GetBalanceParams
): Promise<GetBalanceResult> {
  const { address, tokenAddress, publicClient } = params;
  const decimals = params.decimals ?? 18;

  if (!publicClient) {
    throw new Error("getBalance: `publicClient` is required");
  }
  if (!address) {
    throw new Error("getBalance: `address` is required");
  }
  if (!tokenAddress) {
    throw new Error("getBalance: `tokenAddress` is required");
  }

  const raw = (await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  })) as bigint;

  return {
    raw,
    formatted: formatUnits(raw, decimals),
    decimals,
  };
}
